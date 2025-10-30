import YTDlpWrap from 'yt-dlp-wrap';
import path from 'path';
import fs from 'fs/promises';
import { config } from '@/lib/config';
import { VideoInfo } from '@/types';

const ytDlp = new YTDlpWrap();

interface IngestResult {
  videoPath: string;
  audioPath: string;
  videoInfo: VideoInfo;
}

export async function ingestVideo(
  youtubeUrl: string,
  jobId: number
): Promise<IngestResult> {
  const jobDir = path.join(config.app.mediaDir, jobId.toString());
  await fs.mkdir(jobDir, { recursive: true });

  const videoPath = path.join(jobDir, 'video.mp4');
  const audioPath = path.join(jobDir, 'audio.mp3');

  // Get video info
  const info: any = await ytDlp.getVideoInfo(youtubeUrl);
  
  const videoInfo: VideoInfo = {
    title: info.title || 'Unknown',
    duration: info.duration || 0,
    language: info.language || 'en',
  };

  // Download video
  await ytDlp.execPromise([
    youtubeUrl,
    '-f',
    'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best',
    '-o',
    videoPath,
    '--merge-output-format',
    'mp4',
  ]);

  // Extract audio
  await ytDlp.execPromise([
    youtubeUrl,
    '-f',
    'bestaudio/best',
    '-x',
    '--audio-format',
    'mp3',
    '-o',
    audioPath,
  ]);

  return {
    videoPath,
    audioPath,
    videoInfo,
  };
}

