import fs from 'fs/promises';
import path from 'path';
import { config } from '@/lib/config';
import { TranscriptSegment } from '@/types';

function formatTimestamp(seconds: number, format: 'srt' | 'vtt'): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);

  const separator = format === 'srt' ? ',' : '.';
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}${separator}${ms.toString().padStart(3, '0')}`;
}

function generateSRT(segments: TranscriptSegment[]): string {
  let srt = '';
  
  segments.forEach((seg) => {
    srt += `${seg.id}\n`;
    srt += `${formatTimestamp(seg.start, 'srt')} --> ${formatTimestamp(seg.end, 'srt')}\n`;
    srt += `${seg.text}\n\n`;
  });

  return srt;
}

function generateVTT(segments: TranscriptSegment[]): string {
  let vtt = 'WEBVTT\n\n';
  
  segments.forEach((seg) => {
    vtt += `${seg.id}\n`;
    vtt += `${formatTimestamp(seg.start, 'vtt')} --> ${formatTimestamp(seg.end, 'vtt')}\n`;
    vtt += `${seg.text}\n\n`;
  });

  return vtt;
}

interface SubtitleResult {
  srtPath: string;
  vttPath: string;
}

export async function generateSubtitles(
  segments: TranscriptSegment[],
  jobId: number,
  language: string
): Promise<SubtitleResult> {
  const jobDir = path.join(config.app.mediaDir, jobId.toString());
  
  // Generate SRT
  const srtContent = generateSRT(segments);
  const srtPath = path.join(jobDir, 'subtitles.srt');
  await fs.writeFile(srtPath, srtContent, 'utf-8');

  // Generate VTT
  const vttContent = generateVTT(segments);
  const vttPath = path.join(jobDir, 'subtitles.vtt');
  await fs.writeFile(vttPath, vttContent, 'utf-8');

  return {
    srtPath,
    vttPath,
  };
}

