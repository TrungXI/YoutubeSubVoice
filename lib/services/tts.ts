import * as sdk from 'microsoft-cognitiveservices-speech-sdk';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import fs from 'fs/promises';
import path from 'path';
import { config } from '@/lib/config';
import { TranscriptSegment } from '@/types';

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

const VOICE_PROFILES: Record<string, Record<string, string>> = {
  vi: {
    female_soft: 'vi-VN-HoaiMyNeural',
    male_warm: 'vi-VN-NamMinhNeural',
  },
  en: {
    female_soft: 'en-US-JennyNeural',
    male_warm: 'en-US-GuyNeural',
  },
};

async function generateTTSSegment(
  text: string,
  voiceName: string,
  outputPath: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!config.azure.ttsKey) {
      reject(new Error('Azure TTS key not configured'));
      return;
    }

    const speechConfig = sdk.SpeechConfig.fromSubscription(
      config.azure.ttsKey,
      config.azure.ttsRegion || 'eastus'
    );
    speechConfig.speechSynthesisVoiceName = voiceName;

    const audioConfig = sdk.AudioConfig.fromAudioFileOutput(outputPath);
    const synthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig);

    synthesizer.speakTextAsync(
      text,
      (result) => {
        if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
          synthesizer.close();
          resolve();
        } else {
          synthesizer.close();
          reject(new Error(`TTS failed: ${result.errorDetails}`));
        }
      },
      (error) => {
        synthesizer.close();
        reject(error);
      }
    );
  });
}

async function timeStretchAudio(
  inputPath: string,
  outputPath: string,
  targetDuration: number,
  actualDuration: number
): Promise<void> {
  return new Promise((resolve, reject) => {
    const tempo = actualDuration / targetDuration;
    const clampedTempo = Math.max(0.5, Math.min(2.0, tempo)); // Clamp between 0.5x and 2.0x

    ffmpeg(inputPath)
      .audioFilters(`atempo=${clampedTempo}`)
      .output(outputPath)
      .on('end', () => resolve())
      .on('error', (err) => reject(err))
      .run();
  });
}

interface VoiceoverResult {
  dubAudioPath: string;
  dubVideoPath: string;
}

export async function generateVoiceover(
  segments: TranscriptSegment[],
  videoPath: string,
  audioPath: string,
  jobId: number,
  language: string,
  voiceId: string
): Promise<VoiceoverResult> {
  const jobDir = path.join(config.app.mediaDir, jobId.toString());
  const tempDir = path.join(jobDir, 'temp');
  await fs.mkdir(tempDir, { recursive: true });

  // Get voice name
  const voiceName = VOICE_PROFILES[language]?.[voiceId] || VOICE_PROFILES['en']['female_soft'];

  // Generate TTS for each segment
  const segmentFiles: string[] = [];
  
  for (const seg of segments) {
    const segmentPath = path.join(tempDir, `segment_${seg.id}.wav`);
    await generateTTSSegment(seg.text, voiceName, segmentPath);
    
    // Time-stretch to match original duration
    const targetDuration = seg.end - seg.start;
    const stretchedPath = path.join(tempDir, `stretched_${seg.id}.wav`);
    
    // Get actual duration (simplified - you might need a better way)
    const actualDuration = targetDuration; // Placeholder
    
    if (Math.abs(actualDuration - targetDuration) > 0.5) {
      await timeStretchAudio(segmentPath, stretchedPath, targetDuration, actualDuration);
      segmentFiles.push(stretchedPath);
    } else {
      segmentFiles.push(segmentPath);
    }
  }

  // Concatenate all segments with proper timing
  const dubAudioPath = path.join(jobDir, 'dub_audio.mp3');
  
  await new Promise<void>((resolve, reject) => {
    const command = ffmpeg();
    
    // Add silence and segments
    segments.forEach((seg, idx) => {
      command.input(segmentFiles[idx]);
    });

    // Create complex filter for timing
    let filterComplex = '';
    segments.forEach((seg, idx) => {
      const delay = seg.start * 1000; // Convert to ms
      filterComplex += `[${idx}]adelay=${delay}|${delay}[a${idx}];`;
    });
    filterComplex += segments.map((_, idx) => `[a${idx}]`).join('') + `amix=inputs=${segments.length}[out]`;

    command
      .complexFilter(filterComplex)
      .map('[out]')
      .output(dubAudioPath)
      .on('end', () => resolve())
      .on('error', (err) => reject(err))
      .run();
  });

  // Mix with original video (with ducking)
  const dubVideoPath = path.join(jobDir, 'dub_video.mp4');
  
  await new Promise<void>((resolve, reject) => {
    ffmpeg()
      .input(videoPath)
      .input(dubAudioPath)
      .complexFilter([
        '[0:a]volume=0.2[a0]', // Duck original audio to 20%
        '[1:a]volume=1.0[a1]', // Voiceover at full volume
        '[a0][a1]amix=inputs=2:duration=longest[aout]'
      ])
      .outputOptions(['-map', '0:v', '-map', '[aout]', '-c:v', 'copy'])
      .output(dubVideoPath)
      .on('end', () => resolve())
      .on('error', (err) => reject(err))
      .run();
  });

  // Cleanup temp files
  await fs.rm(tempDir, { recursive: true, force: true });

  return {
    dubAudioPath,
    dubVideoPath,
  };
}

