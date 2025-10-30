# 📁 Project Structure

```
youtube-sub-voice/
│
├── 📄 Configuration Files
│   ├── .env.example              # Environment variables template
│   ├── .gitignore                # Git ignore rules
│   ├── .dockerignore             # Docker ignore rules
│   ├── .eslintrc.json            # ESLint configuration
│   ├── package.json              # NPM dependencies & scripts
│   ├── tsconfig.json             # TypeScript configuration
│   ├── next.config.js            # Next.js configuration
│   ├── tailwind.config.ts        # Tailwind CSS configuration
│   ├── postcss.config.js         # PostCSS configuration
│   ├── drizzle.config.ts         # Drizzle ORM configuration
│   ├── docker-compose.yml        # Docker services setup
│   └── Dockerfile                # Docker image definition
│
├── 📚 Documentation
│   ├── README.md                 # Main documentation (English)
│   ├── HUONG_DAN_TIENG_VIET.md  # Vietnamese guide
│   ├── CHANGELOG.md              # Version history
│   ├── LICENSE                   # MIT License
│   └── PROJECT_STRUCTURE.md      # This file
│
├── 🎨 Frontend (Next.js App Router)
│   └── app/
│       ├── layout.tsx            # Root layout
│       ├── page.tsx              # Home page
│       ├── globals.css           # Global styles
│       ├── favicon.ico           # Site icon
│       │
│       ├── api/                  # API Routes (Backend)
│       │   ├── jobs/
│       │   │   ├── route.ts      # POST /api/jobs, GET /api/jobs
│       │   │   └── [id]/
│       │   │       └── route.ts  # GET /api/jobs/:id
│       │   │
│       │   └── assets/
│       │       └── [jobId]/
│       │           └── route.ts  # GET /api/assets/:jobId
│       │
│       └── jobs/
│           └── [id]/
│               └── page.tsx      # Job detail page
│
├── 🧩 Components
│   └── components/
│       ├── JobForm.tsx           # Create job form
│       ├── JobList.tsx           # Jobs list with status
│       ├── JobStatus.tsx         # Job status display
│       └── VideoPlayer.tsx       # Video player with subtitles
│
├── 🔧 Core Logic
│   └── lib/
│       │
│       ├── config.ts             # App configuration
│       ├── utils.ts              # Utility functions
│       │
│       ├── db/                   # Database Layer
│       │   ├── index.ts          # DB connection & client
│       │   ├── schema.ts         # Drizzle schema (jobs, assets)
│       │   └── migrate.ts        # Migration runner
│       │
│       ├── queue/                # Job Queue
│       │   └── index.ts          # BullMQ setup & queue definition
│       │
│       ├── services/             # Business Logic Services
│       │   ├── ingest.ts         # YouTube download (yt-dlp)
│       │   ├── asr.ts            # Audio transcription (Whisper)
│       │   ├── translate.ts      # Translation (GPT-4)
│       │   ├── subtitles.ts      # SRT/VTT generation
│       │   └── tts.ts            # Text-to-speech (Azure TTS)
│       │
│       └── workers/              # Background Workers
│           └── worker.ts         # Main worker process (BullMQ)
│
├── 📦 Static Files
│   └── public/
│       └── media/                # Generated media files
│           └── .gitkeep          # Keep directory in git
│
└── 🛠️ Scripts
    └── scripts/
        ├── setup.sh              # Setup script (Docker/Local)
        └── dev.sh                # Dev script with tmux
```

## 🗂️ File Descriptions

### Configuration Files

| File | Purpose |
|------|---------|
| `package.json` | Dependencies, scripts, project metadata |
| `tsconfig.json` | TypeScript compiler options |
| `next.config.js` | Next.js framework configuration |
| `tailwind.config.ts` | Tailwind CSS theme & utilities |
| `drizzle.config.ts` | Database ORM configuration |
| `docker-compose.yml` | Multi-container Docker setup |
| `.env.example` | Environment variables template |

### App Structure (Next.js 14 App Router)

```
app/
├── layout.tsx          → Root layout (HTML, metadata)
├── page.tsx            → Home page (job creation form)
├── globals.css         → Global styles & Tailwind
│
├── api/                → Backend API endpoints
│   ├── jobs/           → Job management
│   └── assets/         → Asset retrieval
│
└── jobs/[id]/          → Dynamic route for job details
    └── page.tsx        → Job detail & video player
```

### Components

| Component | Purpose |
|-----------|---------|
| `JobForm.tsx` | Form to create new jobs with URL, language, voiceover options |
| `JobList.tsx` | Display list of jobs with status badges |
| `JobStatus.tsx` | Show detailed job progress and steps |
| `VideoPlayer.tsx` | HTML5 video player with subtitle track |

### Services (Business Logic)

| Service | Purpose | Tech Used |
|---------|---------|-----------|
| `ingest.ts` | Download YouTube videos | yt-dlp |
| `asr.ts` | Transcribe audio to text | OpenAI Whisper API |
| `translate.ts` | Translate text to target language | OpenAI GPT-4 |
| `subtitles.ts` | Generate SRT/VTT files | Custom formatter |
| `tts.ts` | Generate voiceover audio | Azure TTS + FFmpeg |

### Worker Flow

```
worker.ts
    ↓
1. ingest.ts      → Download video/audio
    ↓
2. asr.ts         → Transcribe audio
    ↓
3. translate.ts   → Translate transcript
    ↓
4. subtitles.ts   → Generate SRT/VTT
    ↓
5. tts.ts         → Generate voiceover (if enabled)
    ↓
   Done!
```

### Database Schema

**jobs table:**
- id, youtube_url, status, target_lang, enable_dub, voice_id
- video_title, video_duration, original_lang
- error_message, progress
- created_at, updated_at, completed_at

**assets table:**
- id, job_id, asset_type
- file_path, file_url, file_size, language
- created_at

## 🚀 Entry Points

### Development
```bash
npm run dev      # Start Next.js dev server (port 3000)
npm run worker   # Start background worker
```

### Production
```bash
npm run build    # Build Next.js app
npm start        # Start production server
```

### Docker
```bash
docker-compose up -d    # Start all services
docker-compose logs -f  # View logs
```

## 📊 Data Flow

```
User Input (YouTube URL)
    ↓
Next.js API Route (/api/jobs)
    ↓
Create Job in Database
    ↓
Add to BullMQ Queue
    ↓
Worker picks up job
    ↓
Process through services (ingest → asr → translate → subtitles → tts)
    ↓
Save assets to database & filesystem
    ↓
Update job status to 'done'
    ↓
User views results on job detail page
```

## 🔄 Tech Stack Summary

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, React 18, TypeScript |
| Styling | Tailwind CSS, Lucide Icons |
| Backend | Next.js API Routes, Node.js 20 |
| Queue | BullMQ + Redis |
| Database | PostgreSQL + Drizzle ORM |
| AI/ML | OpenAI Whisper, GPT-4, Azure TTS |
| Media | FFmpeg, yt-dlp |
| Deployment | Docker + Docker Compose |

---

**Total Files Created:** 40+ files
**Lines of Code:** ~3,000+ lines
**Languages:** TypeScript, TSX, CSS, Shell, YAML

