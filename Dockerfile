FROM node:20-alpine

# Install ffmpeg and yt-dlp dependencies
RUN apk add --no-cache \
    ffmpeg \
    python3 \
    py3-pip \
    curl

# Install yt-dlp
RUN pip3 install yt-dlp --break-system-packages

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY . .

# Create media directory
RUN mkdir -p /app/public/media

# Build Next.js (for production)
# RUN npm run build

# Expose port
EXPOSE 3000

# Default command (can be overridden)
CMD ["npm", "run", "dev"]

