import OpenAI from 'openai';
import fs from 'fs/promises';
import path from 'path';
import { config } from '@/lib/config';
import { TranscriptSegment } from '@/types';

const openai = new OpenAI({
  apiKey: config.openai.apiKey,
});

export async function transcribeAudio(audioPath: string, jobId: number): Promise<TranscriptSegment[]> {
  try {
    // Use OpenAI Whisper API
    const audioFile = await fs.readFile(audioPath);
    const audioBlob = new File([audioFile], 'audio.mp3', { type: 'audio/mpeg' });

    const response = await openai.audio.transcriptions.create({
      file: audioBlob,
      model: 'whisper-1',
      response_format: 'verbose_json',
      timestamp_granularities: ['segment'],
    });

    // Convert to our format
    const segments: TranscriptSegment[] = (response as any).segments?.map((seg: any, idx: number) => ({
      id: idx + 1,
      start: seg.start,
      end: seg.end,
      text: seg.text.trim(),
    })) || [];

    // Save transcript JSON
    const jobDir = path.join(config.app.mediaDir, jobId.toString());
    const transcriptPath = path.join(jobDir, 'transcript.json');
    await fs.writeFile(transcriptPath, JSON.stringify(segments, null, 2));

    return segments;
  } catch (error) {
    console.error('ASR error:', error);
    throw new Error(`Failed to transcribe audio: ${error}`);
  }
}

