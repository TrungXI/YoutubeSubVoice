import type { Language, VoiceProfile } from '@/types';

export const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'vi', name: 'Vietnamese (Tiếng Việt)' },
  { code: 'en', name: 'English' },
  { code: 'zh', name: 'Chinese (中文)' },
  { code: 'ja', name: 'Japanese (日本語)' },
  { code: 'ko', name: 'Korean (한국어)' },
  { code: 'es', name: 'Spanish (Español)' },
  { code: 'fr', name: 'French (Français)' },
  { code: 'de', name: 'German (Deutsch)' },
  { code: 'ru', name: 'Russian (Русский)' },
  { code: 'pt', name: 'Portuguese (Português)' },
  { code: 'th', name: 'Thai (ไทย)' },
];

export const VOICE_PROFILES: VoiceProfile[] = [
  { id: 'female_soft', name: 'Female Voice (Soft & Natural)' },
  { id: 'male_warm', name: 'Male Voice (Warm & Professional)' },
];

export const JOB_STATUS_COLORS = {
  queued: {
    bg: 'bg-gray-100',
    text: 'text-gray-800',
    icon: 'text-gray-600',
  },
  running: {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    icon: 'text-blue-600',
  },
  done: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    icon: 'text-green-600',
  },
  error: {
    bg: 'bg-red-100',
    text: 'text-red-800',
    icon: 'text-red-600',
  },
} as const;

export const PROCESSING_STEPS = [
  {
    key: 'ingest',
    label: 'Download & Extract Video',
    description: 'Downloading video from YouTube using yt-dlp',
    progress: 20,
  },
  {
    key: 'transcribe',
    label: 'Transcribe Audio',
    description: 'Converting speech to text using Whisper AI',
    progress: 40,
  },
  {
    key: 'translate',
    label: 'Translate Content',
    description: 'Translating to target language using GPT-4',
    progress: 60,
  },
  {
    key: 'subtitles',
    label: 'Generate Subtitles',
    description: 'Creating SRT and WebVTT subtitle files',
    progress: 70,
  },
  {
    key: 'voiceover',
    label: 'Generate Voiceover',
    description: 'Creating AI voiceover with Azure TTS',
    progress: 90,
  },
] as const;

export const API_ENDPOINTS = {
  jobs: {
    list: '/api/jobs',
    create: '/api/jobs',
    get: (id: number | string) => `/api/jobs/${id}`,
  },
  assets: {
    get: (jobId: number | string) => `/api/assets/${jobId}`,
  },
} as const;

export const DEFAULT_POLLING_INTERVAL = 3000; // 3 seconds
export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
export const SUBTITLE_MAX_LINE_LENGTH = 42;
export const SUBTITLE_MIN_DURATION = 1.0; // seconds
export const SUBTITLE_MAX_DURATION = 6.0; // seconds

