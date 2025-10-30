# 🎬 YouTube Sub/Voice

Transform YouTube videos into subtitles and AI-powered voiceovers in multiple languages.

## 📋 Features

### MVP (Core Features)
- ✅ Download YouTube videos
- ✅ Extract and transcribe audio using Whisper AI
- ✅ Translate transcripts to multiple languages
- ✅ Generate SRT and WebVTT subtitle files
- ✅ Web player with selectable subtitle tracks
- ✅ Real-time job processing status

### Pro (Advanced Features)
- ✅ AI voiceover generation (Azure TTS)
- ✅ Audio ducking (mix voiceover with original audio)
- ✅ Time-stretching to match original timing
- ✅ Export dubbed video files
- ✅ Multiple voice profiles

## 🏗️ Architecture

**Frontend:** Next.js 14 (App Router) + React + TypeScript + Tailwind CSS

**Backend:** Next.js API Routes + Node.js

**Queue:** BullMQ + Redis

**Database:** PostgreSQL (Drizzle ORM)

**AI/ML:**
- OpenAI Whisper (ASR)
- OpenAI GPT-4 (Translation)
- Azure Cognitive Services (TTS)

**Media Processing:** ffmpeg, yt-dlp

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- Docker & Docker Compose
- OpenAI API Key
- Azure TTS Key (optional, for voiceover features)

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd youtube-sub-voice
```

2. **Set up environment variables**
```bash
cp .env.example .env
```

Edit `.env` and add your API keys:
```env
OPENAI_API_KEY=your_openai_api_key_here
AZURE_TTS_KEY=your_azure_tts_key_here  # Optional
AZURE_TTS_REGION=eastus                 # Optional
```

3. **Start services with Docker Compose**
```bash
docker-compose up -d
```

This will start:
- PostgreSQL (port 5432)
- Redis (port 6379)
- Next.js app (port 3000)
- BullMQ worker

4. **Access the application**

Open your browser and navigate to: http://localhost:3000

## 💻 Development Setup (Without Docker)

### 1. Install dependencies

```bash
npm install
```

### 2. Start PostgreSQL and Redis

```bash
# Using Docker for databases only
docker run -d -p 5432:5432 -e POSTGRES_DB=youtube_sub_voice -e POSTGRES_USER=admin -e POSTGRES_PASSWORD=admin123 postgres:15-alpine

docker run -d -p 6379:6379 redis:7-alpine
```

### 3. Install system dependencies

**macOS:**
```bash
brew install ffmpeg
brew install yt-dlp
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install ffmpeg python3 python3-pip
pip3 install yt-dlp
```

**Windows:**
- Download ffmpeg from https://ffmpeg.org/download.html
- Download yt-dlp from https://github.com/yt-dlp/yt-dlp/releases

### 4. Run database migrations

```bash
npm run db:generate
npm run db:push
```

### 5. Start the development servers

**Terminal 1 - Next.js app:**
```bash
npm run dev
```

**Terminal 2 - Worker:**
```bash
npm run worker
```

### 6. Access the application

Open http://localhost:3000 in your browser.

## 📁 Project Structure

```
youtube-sub-voice/
├── app/                        # Next.js App Router
│   ├── api/                   # API routes
│   │   ├── jobs/             # Job endpoints
│   │   └── assets/           # Asset endpoints
│   ├── jobs/[id]/            # Job detail page
│   ├── layout.tsx            # Root layout
│   ├── page.tsx              # Home page
│   └── globals.css           # Global styles
├── components/                # React components
│   ├── JobForm.tsx           # Create job form
│   ├── JobList.tsx           # Jobs list
│   ├── JobStatus.tsx         # Job status display
│   └── VideoPlayer.tsx       # Video player with subtitles
├── lib/                       # Core logic
│   ├── db/                   # Database
│   │   ├── schema.ts         # Drizzle schema
│   │   ├── index.ts          # DB connection
│   │   └── migrate.ts        # Migration runner
│   ├── queue/                # Job queue
│   │   └── index.ts          # BullMQ setup
│   ├── services/             # Business logic
│   │   ├── ingest.ts         # YouTube download
│   │   ├── asr.ts            # Audio transcription
│   │   ├── translate.ts      # Translation
│   │   ├── subtitles.ts      # Subtitle generation
│   │   └── tts.ts            # Text-to-speech
│   ├── workers/              # Background workers
│   │   └── worker.ts         # Main worker
│   ├── config.ts             # Configuration
│   └── utils.ts              # Utilities
├── public/                    # Static files
│   └── media/                # Generated media files
├── docker-compose.yml        # Docker services
├── Dockerfile                # App container
├── package.json              # Dependencies
├── tsconfig.json             # TypeScript config
├── next.config.js            # Next.js config
├── tailwind.config.ts        # Tailwind config
└── drizzle.config.ts         # Drizzle config
```

## 🔄 Processing Flow

1. **Ingest (20%)**
   - Download video/audio from YouTube using yt-dlp
   - Extract metadata (title, duration, language)

2. **Transcribe (40%)**
   - Transcribe audio using OpenAI Whisper
   - Generate timestamped segments

3. **Translate (60%)**
   - Translate transcript to target language
   - Use GPT-4 for natural translation

4. **Generate Subtitles (70%)**
   - Create SRT and WebVTT files
   - Format with proper timing

5. **Generate Voiceover (90%)** - Pro only
   - Text-to-speech for each segment
   - Time-stretch to match original
   - Mix with original audio (ducking)
   - Mux into final video

## 🌍 Supported Languages

- Vietnamese (vi)
- English (en)
- Chinese (zh)
- Japanese (ja)
- Korean (ko)
- Spanish (es)
- French (fr)
- German (de)
- Russian (ru)
- Portuguese (pt)
- Thai (th)

## 📡 API Endpoints

### Create Job
```http
POST /api/jobs
Content-Type: application/json

{
  "youtubeUrl": "https://www.youtube.com/watch?v=...",
  "targetLang": "vi",
  "enableDub": true,
  "voiceId": "female_soft"
}
```

### Get Job Status
```http
GET /api/jobs/{id}
```

Response:
```json
{
  "id": 1,
  "youtubeUrl": "...",
  "status": "running",
  "progress": 65,
  "videoTitle": "Example Video",
  "targetLang": "vi",
  "assets": [...]
}
```

### List Jobs
```http
GET /api/jobs
```

### Get Job Assets
```http
GET /api/assets/{jobId}
```

## 🎯 Usage

1. **Enter YouTube URL**
   - Paste any valid YouTube video URL

2. **Select Target Language**
   - Choose from 11+ supported languages

3. **Enable Voiceover (Optional)**
   - Toggle AI voiceover for Pro features
   - Select voice profile

4. **Start Processing**
   - Job is queued and processed in background
   - Monitor real-time progress

5. **Download Results**
   - SRT subtitles
   - WebVTT subtitles
   - Dubbed audio (if enabled)
   - Dubbed video (if enabled)

## 🔧 Configuration

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `REDIS_URL` | Yes | Redis connection string |
| `OPENAI_API_KEY` | Yes | OpenAI API key for Whisper & GPT |
| `AZURE_TTS_KEY` | No | Azure TTS key for voiceover |
| `AZURE_TTS_REGION` | No | Azure region (default: eastus) |
| `NEXT_PUBLIC_APP_URL` | No | App URL (default: http://localhost:3000) |

### Voice Profiles

Add custom voice profiles in `lib/services/tts.ts`:

```typescript
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
```

See [Azure TTS voices](https://learn.microsoft.com/en-us/azure/cognitive-services/speech-service/language-support?tabs=tts) for available voices.

## 🛠️ Troubleshooting

### Worker not processing jobs
```bash
# Check worker logs
docker-compose logs worker

# Restart worker
docker-compose restart worker
```

### Database connection error
```bash
# Check PostgreSQL
docker-compose logs postgres

# Reset database
docker-compose down -v
docker-compose up -d
```

### FFmpeg errors
```bash
# Verify ffmpeg installation
ffmpeg -version

# Check ffmpeg path in code
which ffmpeg
```

### yt-dlp errors
```bash
# Update yt-dlp
pip3 install -U yt-dlp

# Test download
yt-dlp "https://www.youtube.com/watch?v=..."
```

## 📊 Database Schema

### Jobs Table
- `id` - Primary key
- `youtube_url` - Source video URL
- `status` - queued | running | done | error
- `target_lang` - Target language code
- `enable_dub` - Enable voiceover
- `voice_id` - Voice profile
- `video_title` - Video title
- `video_duration` - Duration in seconds
- `original_lang` - Detected language
- `error_message` - Error details
- `progress` - Progress percentage (0-100)
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp
- `completed_at` - Completion timestamp

### Assets Table
- `id` - Primary key
- `job_id` - Foreign key to jobs
- `asset_type` - Type: original_video, srt, vtt, dub_audio, dub_video
- `file_path` - Local file path
- `file_url` - Public URL
- `file_size` - Size in bytes
- `language` - Language code
- `created_at` - Creation timestamp

## ⚖️ Legal & Copyright

**Important:** This tool is for educational and personal use only.

- ✅ Respect YouTube Terms of Service
- ✅ Only use for videos you have permission to process
- ✅ Don't re-upload copyrighted content
- ✅ Use for learning, research, or personal projects
- ❌ Don't use for commercial purposes without proper licensing
- ❌ Don't distribute copyrighted material

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is for educational purposes. Please ensure you comply with:
- YouTube Terms of Service
- Content creator's copyright
- OpenAI Terms of Use
- Azure Cognitive Services Terms

## 🆘 Support

If you encounter issues:
1. Check the [Troubleshooting](#-troubleshooting) section
2. Review logs: `docker-compose logs`
3. Verify environment variables in `.env`
4. Ensure all system dependencies are installed

## 🎉 Credits

Built with:
- [Next.js](https://nextjs.org/)
- [OpenAI Whisper](https://openai.com/research/whisper)
- [Azure Cognitive Services](https://azure.microsoft.com/en-us/services/cognitive-services/)
- [yt-dlp](https://github.com/yt-dlp/yt-dlp)
- [FFmpeg](https://ffmpeg.org/)
- [BullMQ](https://docs.bullmq.io/)
- [Drizzle ORM](https://orm.drizzle.team/)

---

**Made with ❤️ for the developer community**

