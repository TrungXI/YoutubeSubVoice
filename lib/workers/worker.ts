import { Worker, Job } from 'bullmq';
import { connection } from '@/lib/queue';
import { ProcessJobData } from '@/types';
import { db } from '@/lib/db';
import { jobs, assets } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { ingestVideo } from '@/lib/services/ingest';
import { transcribeAudio } from '@/lib/services/asr';
import { translateTranscript } from '@/lib/services/translate';
import { generateSubtitles } from '@/lib/services/subtitles';
import { generateVoiceover } from '@/lib/services/tts';

async function updateJobStatus(
  jobId: number,
  status: string,
  progress: number,
  errorMessage?: string
) {
  await db
    .update(jobs)
    .set({
      status,
      progress,
      errorMessage,
      updatedAt: new Date(),
      ...(status === 'done' && { completedAt: new Date() }),
    })
    .where(eq(jobs.id, jobId));
}

async function processVideo(job: Job<ProcessJobData>) {
  const { jobId, youtubeUrl, targetLang, enableDub, voiceId } = job.data;

  try {
    console.log(`[Worker] Processing job ${jobId}...`);
    
    // Step 1: Ingest video from YouTube (20%)
    await updateJobStatus(jobId, 'running', 10);
    console.log('[Worker] Step 1: Ingesting video...');
    const { videoPath, audioPath, videoInfo } = await ingestVideo(youtubeUrl, jobId);
    
    await updateJobStatus(jobId, 'running', 20);
    
    // Save video asset
    await db.insert(assets).values({
      jobId,
      assetType: 'original_video',
      filePath: videoPath,
      fileUrl: `/media/${jobId}/video.mp4`,
    });

    // Update job with video metadata
    await db
      .update(jobs)
      .set({
        videoTitle: videoInfo.title,
        videoDuration: videoInfo.duration,
        originalLang: videoInfo.language,
      })
      .where(eq(jobs.id, jobId));

    // Step 2: Transcribe audio (40%)
    console.log('[Worker] Step 2: Transcribing audio...');
    const transcript = await transcribeAudio(audioPath, jobId);
    await updateJobStatus(jobId, 'running', 40);

    // Save transcript
    await db.insert(assets).values({
      jobId,
      assetType: 'transcript_json',
      filePath: `./public/media/${jobId}/transcript.json`,
      fileUrl: `/media/${jobId}/transcript.json`,
      language: videoInfo.language,
    });

    // Step 3: Translate transcript (60%)
    console.log('[Worker] Step 3: Translating transcript...');
    const translatedTranscript = await translateTranscript(
      transcript,
      videoInfo.language || 'en',
      targetLang,
      jobId
    );
    await updateJobStatus(jobId, 'running', 60);

    // Step 4: Generate subtitles (70%)
    console.log('[Worker] Step 4: Generating subtitles...');
    const { srtPath, vttPath } = await generateSubtitles(
      translatedTranscript,
      jobId,
      targetLang
    );
    await updateJobStatus(jobId, 'running', 70);

    // Save subtitle assets
    await db.insert(assets).values([
      {
        jobId,
        assetType: 'srt',
        filePath: srtPath,
        fileUrl: `/media/${jobId}/subtitles.srt`,
        language: targetLang,
      },
      {
        jobId,
        assetType: 'vtt',
        filePath: vttPath,
        fileUrl: `/media/${jobId}/subtitles.vtt`,
        language: targetLang,
      },
    ]);

    // Step 5: Generate voiceover if enabled (90%)
    if (enableDub && voiceId) {
      console.log('[Worker] Step 5: Generating voiceover...');
      const { dubAudioPath, dubVideoPath } = await generateVoiceover(
        translatedTranscript,
        videoPath,
        audioPath,
        jobId,
        targetLang,
        voiceId
      );
      await updateJobStatus(jobId, 'running', 90);

      // Save voiceover assets
      await db.insert(assets).values([
        {
          jobId,
          assetType: 'dub_audio',
          filePath: dubAudioPath,
          fileUrl: `/media/${jobId}/dub_audio.mp3`,
          language: targetLang,
        },
        {
          jobId,
          assetType: 'dub_video',
          filePath: dubVideoPath,
          fileUrl: `/media/${jobId}/dub_video.mp4`,
          language: targetLang,
        },
      ]);
    }

    // Complete
    await updateJobStatus(jobId, 'done', 100);
    console.log(`[Worker] Job ${jobId} completed successfully!`);
  } catch (error) {
    console.error(`[Worker] Job ${jobId} failed:`, error);
    await updateJobStatus(
      jobId,
      'error',
      0,
      error instanceof Error ? error.message : 'Unknown error'
    );
    throw error;
  }
}

// Create worker
const worker = new Worker<ProcessJobData>('video-processing', processVideo, {
  connection,
  concurrency: 2,
  limiter: {
    max: 5,
    duration: 60000, // 5 jobs per minute
  },
});

worker.on('completed', (job) => {
  console.log(`✅ Job ${job.id} completed!`);
});

worker.on('failed', (job, err) => {
  console.error(`❌ Job ${job?.id} failed:`, err);
});

worker.on('error', (err) => {
  console.error('Worker error:', err);
});

console.log('🚀 Worker started and listening for jobs...');

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down worker...');
  await worker.close();
  await connection.quit();
  process.exit(0);
});

