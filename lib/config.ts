export const config = {
  database: {
    url: process.env.DATABASE_URL || 'postgresql://admin:admin123@localhost:5432/youtube_sub_voice',
  },
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379/0',
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
  },
  azure: {
    ttsKey: process.env.AZURE_TTS_KEY,
    ttsRegion: process.env.AZURE_TTS_REGION || 'eastus',
  },
  app: {
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    mediaDir: './public/media',
  },
  languages: {
    supported: ['vi', 'en', 'zh', 'ja', 'ko', 'es', 'fr', 'de', 'ru', 'pt', 'th'],
    default: 'vi',
  },
} as const;

