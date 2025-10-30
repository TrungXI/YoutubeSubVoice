# 🎬 YouTube Sub/Voice - Hướng Dẫn Tiếng Việt

Chuyển đổi video YouTube thành phụ đề và lồng tiếng AI với nhiều ngôn ngữ.

## 📋 Tính năng

### Phiên bản cơ bản (MVP)
- ✅ Tải video từ YouTube
- ✅ Chuyển đổi giọng nói thành text (Whisper AI)
- ✅ Dịch phụ đề sang nhiều ngôn ngữ
- ✅ Tạo file phụ đề SRT và WebVTT
- ✅ Trình phát video web với phụ đề
- ✅ Theo dõi tiến trình xử lý real-time

### Phiên bản nâng cao (Pro)
- ✅ Tạo lồng tiếng AI (Azure TTS)
- ✅ Trộn âm thanh (giảm âm gốc khi có lồng tiếng)
- ✅ Điều chỉnh tốc độ giọng nói khớp với video gốc
- ✅ Xuất video đã lồng tiếng
- ✅ Nhiều giọng đọc khác nhau

## 🚀 Cách Chạy Dự Án

### Yêu cầu hệ thống

- Node.js phiên bản 20 trở lên
- Docker và Docker Compose
- OpenAI API Key
- Azure TTS Key (tùy chọn, cho tính năng lồng tiếng)

### Cách 1: Chạy với Docker (Khuyên dùng)

**Bước 1: Clone dự án**
```bash
cd youtube-sub-voice
```

**Bước 2: Tạo file cấu hình**
```bash
cp .env.example .env
```

Mở file `.env` và điền API keys:
```env
OPENAI_API_KEY=your_openai_api_key_here
AZURE_TTS_KEY=your_azure_tts_key_here  # Tùy chọn
AZURE_TTS_REGION=eastus                 # Tùy chọn
```

**Bước 3: Chạy script setup**
```bash
chmod +x scripts/setup.sh
./scripts/setup.sh
```

Hoặc chạy thủ công:
```bash
docker-compose up -d
```

**Bước 4: Truy cập ứng dụng**

Mở trình duyệt và vào: http://localhost:3000

### Cách 2: Chạy Local (Development)

**Bước 1: Cài đặt dependencies**
```bash
npm install
```

**Bước 2: Khởi động PostgreSQL và Redis**
```bash
docker run -d -p 5432:5432 -e POSTGRES_DB=youtube_sub_voice -e POSTGRES_USER=admin -e POSTGRES_PASSWORD=admin123 postgres:15-alpine

docker run -d -p 6379:6379 redis:7-alpine
```

**Bước 3: Cài đặt ffmpeg và yt-dlp**

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
- Tải ffmpeg từ: https://ffmpeg.org/download.html
- Tải yt-dlp từ: https://github.com/yt-dlp/yt-dlp/releases

**Bước 4: Chạy migrations**
```bash
npm run db:generate
npm run db:push
```

**Bước 5: Khởi động ứng dụng**

Mở 2 terminal:

**Terminal 1 - Next.js app:**
```bash
npm run dev
```

**Terminal 2 - Worker:**
```bash
npm run worker
```

**Bước 6: Truy cập**

Mở http://localhost:3000

### Cách 3: Sử dụng script dev (với tmux)

```bash
chmod +x scripts/dev.sh
./scripts/dev.sh
```

Script này sẽ tự động mở 3 cửa sổ tmux:
1. Next.js app
2. Worker
3. Docker logs

Nhấn `Ctrl+B` rồi `D` để thoát tmux (app vẫn chạy)
Dùng `tmux attach -t youtube-sub-voice` để quay lại

## 📖 Hướng dẫn sử dụng

### 1. Tạo job mới

1. Dán link YouTube vào ô "YouTube URL"
2. Chọn ngôn ngữ đích (mặc định: Tiếng Việt)
3. Bật "Enable AI Voiceover" nếu muốn lồng tiếng (cần Azure TTS)
4. Chọn giọng đọc (nam/nữ)
5. Nhấn "Start Processing"

### 2. Theo dõi tiến trình

- Job sẽ chuyển sang trang chi tiết
- Xem progress bar và các bước xử lý
- Trạng thái: Queued → Running → Done
- Các bước:
  1. Download Video (20%)
  2. Transcribe Audio (40%)
  3. Translate Text (60%)
  4. Generate Subtitles (70%)
  5. Generate Voiceover (90%) - nếu bật

### 3. Tải kết quả

Sau khi hoàn thành, bạn có thể tải:
- File phụ đề SRT
- File phụ đề WebVTT
- File âm thanh lồng tiếng (MP3)
- Video đã lồng tiếng (MP4)

### 4. Xem video với phụ đề

- Video player tự động hiển thị phụ đề
- Có thể bật/tắt phụ đề trên player
- Hỗ trợ tua nhanh/chậm

## 🛠️ Xử lý sự cố

### Worker không xử lý job

```bash
# Xem logs
docker-compose logs worker

# Khởi động lại worker
docker-compose restart worker
```

### Lỗi kết nối database

```bash
# Xem logs PostgreSQL
docker-compose logs postgres

# Reset database
docker-compose down -v
docker-compose up -d
```

### Lỗi ffmpeg

```bash
# Kiểm tra ffmpeg đã cài chưa
ffmpeg -version

# Kiểm tra đường dẫn
which ffmpeg
```

### Lỗi yt-dlp

```bash
# Cập nhật yt-dlp
pip3 install -U yt-dlp

# Test download
yt-dlp "https://www.youtube.com/watch?v=..."
```

### Xem tất cả logs

```bash
# Xem logs tất cả services
docker-compose logs -f

# Xem logs một service cụ thể
docker-compose logs -f app
docker-compose logs -f worker
docker-compose logs -f postgres
```

## 📊 Cấu trúc thư mục

```
youtube-sub-voice/
├── app/              # Next.js pages và API routes
├── components/       # React components
├── lib/              # Logic chính
│   ├── db/          # Database (Drizzle ORM)
│   ├── queue/       # Job queue (BullMQ)
│   ├── services/    # Business logic
│   └── workers/     # Background workers
├── public/media/    # Files đã tạo ra
├── scripts/         # Scripts tiện ích
└── docker-compose.yml
```

## 🌍 Ngôn ngữ hỗ trợ

- Tiếng Việt (vi) ✅
- Tiếng Anh (en)
- Tiếng Trung (zh)
- Tiếng Nhật (ja)
- Tiếng Hàn (ko)
- Tiếng Tây Ban Nha (es)
- Tiếng Pháp (fr)
- Tiếng Đức (de)
- Tiếng Nga (ru)
- Tiếng Bồ Đào Nha (pt)
- Tiếng Thái (th)

## 🎯 Lưu ý quan trọng

### Bản quyền và pháp lý

⚠️ **CHỈ SỬ DỤNG CHO MỤC ĐÍCH:**
- Học tập cá nhân
- Nghiên cứu
- Video của chính bạn
- Video đã được cho phép

❌ **KHÔNG SỬ DỤNG ĐỂ:**
- Tải lại video có bản quyền lên YouTube
- Phân phối nội dung không được phép
- Sử dụng thương mại mà không có giấy phép
- Vi phạm Terms of Service của YouTube

### Chi phí API

- **OpenAI Whisper**: ~$0.006/phút âm thanh
- **OpenAI GPT-4**: ~$0.01/1K tokens (tùy độ dài phụ đề)
- **Azure TTS**: ~$1/1M ký tự (có 0.5M ký tự miễn phí/tháng)

Ví dụ: Video 10 phút có thể tốn:
- Whisper: $0.06
- Translation: $0.05-0.10
- TTS (nếu bật): $0.10-0.30
- **Tổng**: ~$0.21-0.46

## 🔧 Tùy chỉnh

### Thêm ngôn ngữ mới

Mở `lib/config.ts`:
```typescript
languages: {
  supported: ['vi', 'en', 'th', ...], // Thêm mã ngôn ngữ
  default: 'vi',
}
```

### Thêm giọng đọc mới

Mở `lib/services/tts.ts`:
```typescript
const VOICE_PROFILES = {
  vi: {
    female_soft: 'vi-VN-HoaiMyNeural',
    male_warm: 'vi-VN-NamMinhNeural',
    // Thêm giọng mới ở đây
  },
};
```

Xem danh sách giọng Azure TTS: https://learn.microsoft.com/azure/cognitive-services/speech-service/language-support

### Thay đổi concurrency của worker

Mở `lib/workers/worker.ts`:
```typescript
const worker = new Worker('video-processing', processVideo, {
  connection,
  concurrency: 2, // Thay đổi số lượng jobs chạy đồng thời
});
```

## 📞 Hỗ trợ

Nếu gặp vấn đề:
1. Kiểm tra phần [Xử lý sự cố](#-xử-lý-sự-cố)
2. Xem logs: `docker-compose logs -f`
3. Kiểm tra file `.env` đã điền đầy đủ
4. Đảm bảo Docker đang chạy
5. Kiểm tra ffmpeg và yt-dlp đã cài đặt

## 🎓 Công nghệ sử dụng

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Node.js
- **Queue**: BullMQ + Redis
- **Database**: PostgreSQL + Drizzle ORM
- **AI/ML**: OpenAI Whisper, GPT-4, Azure TTS
- **Media**: FFmpeg, yt-dlp

## 📝 Cập nhật

Để cập nhật dự án:
```bash
git pull origin main
npm install
docker-compose down
docker-compose up --build -d
```

---

**Chúc bạn sử dụng thành công! 🎉**

