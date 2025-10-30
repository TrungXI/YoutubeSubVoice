// Core types for the application

export interface Job {
  id: number;
  youtubeUrl: string;
  status: JobStatus;
  targetLang: string;
  enableDub: boolean;
  voiceId: string | null;
  videoTitle: string | null;
  videoDuration: number | null;
  originalLang: string | null;
  errorMessage: string | null;
  progress: number;
  createdAt: Date | string;
  updatedAt: Date | string;
  completedAt: Date | string | null;
}

export type JobStatus = 'queued' | 'running' | 'done' | 'error';

export interface Asset {
  id: number;
  jobId: number;
  assetType: AssetType;
  filePath: string;
  fileUrl: string | null;
  fileSize: number | null;
  language: string | null;
  createdAt: Date | string;
}

export type AssetType =
  | 'original_video'
  | 'original_audio'
  | 'transcript_json'
  | 'srt'
  | 'vtt'
  | 'dub_audio'
  | 'dub_video';

export interface JobWithAssets extends Job {
  assets: Asset[];
}

export interface CreateJobRequest {
  youtubeUrl: string;
  targetLang: string;
  enableDub: boolean;
  voiceId?: string;
}

export interface CreateJobResponse extends Job {}

export interface TranscriptSegment {
  id: number;
  start: number;
  end: number;
  text: string;
}

export interface VideoInfo {
  title: string;
  duration: number;
  language?: string;
}

export interface ProcessJobData {
  jobId: number;
  youtubeUrl: string;
  targetLang: string;
  enableDub: boolean;
  voiceId?: string;
}

export interface Language {
  code: string;
  name: string;
}

export interface VoiceProfile {
  id: string;
  name: string;
}

export interface APIError {
  error: string;
  message?: string;
}

