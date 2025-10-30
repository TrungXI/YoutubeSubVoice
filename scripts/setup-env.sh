#!/bin/bash

# Script tự động cập nhật file .env với API keys
# Sử dụng: bash scripts/setup-env.sh

set -e

ENV_FILE=".env"
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

echo "🔧 SETUP API KEYS CHO YOUTUBE SUB/VOICE"
echo "========================================"
echo ""

# Kiểm tra file .env tồn tại
if [ ! -f "$ENV_FILE" ]; then
    echo "❌ File .env chưa tồn tại!"
    echo "✅ Tạo file .env từ template..."
    cat > .env << 'EOF'
# Database
DATABASE_URL=postgresql://admin:admin123@localhost:5432/youtube_sub_voice

# Redis
REDIS_URL=redis://localhost:6379/0

# OpenAI API Key
OPENAI_API_KEY=

# Azure Text-to-Speech (Optional)
AZURE_TTS_KEY=
AZURE_TTS_REGION=eastus

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
EOF
    echo "✅ File .env đã được tạo!"
    echo ""
fi

# Đọc giá trị hiện tại
current_openai_key=$(grep "^OPENAI_API_KEY=" .env | cut -d'=' -f2)
current_azure_key=$(grep "^AZURE_TTS_KEY=" .env | cut -d'=' -f2)
current_azure_region=$(grep "^AZURE_TTS_REGION=" .env | cut -d'=' -f2)

echo "📋 GIÁ TRỊ HIỆN TẠI:"
echo "-------------------"
echo "OpenAI API Key: ${current_openai_key:-<chưa có>}"
echo "Azure TTS Key: ${current_azure_key:-<chưa có>}"
echo "Azure Region: ${current_azure_region:-eastus}"
echo ""

# Nhập OpenAI API Key
echo "🔑 OPENAI API KEY (BẮT BUỘC)"
echo "Lấy từ: https://platform.openai.com/api-keys"
echo "Format: sk-proj-... hoặc sk-..."
read -p "Nhập OpenAI API Key (Enter để giữ nguyên): " new_openai_key

if [ -n "$new_openai_key" ]; then
    # Validate format
    if [[ $new_openai_key == sk-* ]]; then
        sed -i '' "s|^OPENAI_API_KEY=.*|OPENAI_API_KEY=$new_openai_key|" .env
        echo "✅ Đã cập nhật OpenAI API Key"
    else
        echo "⚠️  Cảnh báo: Key không đúng format (nên bắt đầu bằng sk-)"
        read -p "Bạn có chắc muốn dùng key này? (y/N): " confirm
        if [[ $confirm == [yY] ]]; then
            sed -i '' "s|^OPENAI_API_KEY=.*|OPENAI_API_KEY=$new_openai_key|" .env
            echo "✅ Đã cập nhật OpenAI API Key"
        fi
    fi
fi
echo ""

# Hỏi có muốn thêm Azure TTS không
echo "🎤 AZURE TEXT-TO-SPEECH (TÙY CHỌN)"
echo "Chỉ cần nếu bạn muốn dùng tính năng lồng tiếng AI"
read -p "Bạn có muốn cấu hình Azure TTS không? (y/N): " setup_azure

if [[ $setup_azure == [yY] ]]; then
    echo ""
    echo "Lấy từ: https://portal.azure.com"
    echo "Vào: Speech Service → Keys and Endpoint"
    read -p "Nhập Azure TTS Key (Enter để giữ nguyên): " new_azure_key
    
    if [ -n "$new_azure_key" ]; then
        sed -i '' "s|^AZURE_TTS_KEY=.*|AZURE_TTS_KEY=$new_azure_key|" .env
        echo "✅ Đã cập nhật Azure TTS Key"
    fi
    
    read -p "Nhập Azure Region (mặc định: eastus): " new_azure_region
    new_azure_region=${new_azure_region:-eastus}
    sed -i '' "s|^AZURE_TTS_REGION=.*|AZURE_TTS_REGION=$new_azure_region|" .env
    echo "✅ Đã cập nhật Azure Region"
else
    echo "⏭️  Bỏ qua Azure TTS (có thể cấu hình sau)"
fi

echo ""
echo "========================================"
echo "✅ CẤU HÌNH HOÀN TẤT!"
echo "========================================"
echo ""
echo "📄 Nội dung file .env:"
echo "-------------------"
cat .env | grep -v "^#" | grep -v "^$"
echo ""
echo "🚀 BƯỚC TIẾP THEO:"
echo "1. Khởi động lại server:"
echo "   docker-compose down && docker-compose up -d"
echo "   hoặc"
echo "   npm run dev (Terminal 1) + npm run worker (Terminal 2)"
echo ""
echo "2. Truy cập: http://localhost:3000"
echo ""
echo "📚 Xem hướng dẫn đầy đủ tại: README.md"
echo ""

