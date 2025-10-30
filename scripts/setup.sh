#!/bin/bash

# Setup script for YouTube Sub/Voice project

echo "🚀 Setting up YouTube Sub/Voice..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Check for .env file
if [ ! -f .env ]; then
    echo "📝 Creating .env file from .env.example..."
    cp .env.example .env
    echo "⚠️  Please edit .env and add your API keys!"
    echo ""
fi

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p public/media
mkdir -p drizzle

# Pull Docker images
echo "📦 Pulling Docker images..."
docker-compose pull

# Start services
echo "🐳 Starting Docker services..."
docker-compose up -d postgres redis

# Wait for database
echo "⏳ Waiting for database to be ready..."
sleep 5

# Install dependencies (if running locally)
if [ "$1" == "--local" ]; then
    echo "📦 Installing npm dependencies..."
    npm install
    
    echo "🗄️  Running database migrations..."
    npm run db:generate
    npm run db:push
    
    echo ""
    echo "✅ Setup complete!"
    echo ""
    echo "To start the application:"
    echo "  Terminal 1: npm run dev"
    echo "  Terminal 2: npm run worker"
    echo ""
else
    # Build and start all services
    echo "🔨 Building application..."
    docker-compose build
    
    echo "🚀 Starting all services..."
    docker-compose up -d
    
    # Wait for app to be ready
    sleep 10
    
    echo ""
    echo "✅ Setup complete!"
    echo ""
    echo "The application is running at: http://localhost:3000"
    echo ""
    echo "To view logs:"
    echo "  docker-compose logs -f"
    echo ""
    echo "To stop services:"
    echo "  docker-compose down"
    echo ""
fi

echo "⚠️  Don't forget to add your API keys to .env file:"
echo "  - OPENAI_API_KEY (required)"
echo "  - AZURE_TTS_KEY (optional, for voiceover features)"
echo ""

