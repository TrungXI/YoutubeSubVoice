/**
 * Validates if a string is a valid YouTube URL
 */
export function isValidYouTubeUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    
    return (
      (hostname === 'www.youtube.com' || hostname === 'youtube.com' || hostname === 'm.youtube.com') &&
      (urlObj.pathname === '/watch' && urlObj.searchParams.has('v')) ||
      (hostname === 'youtu.be' && urlObj.pathname.length > 1)
    );
  } catch {
    return false;
  }
}

/**
 * Extracts YouTube video ID from URL
 */
export function extractYouTubeVideoId(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    
    if (hostname === 'youtu.be') {
      return urlObj.pathname.slice(1);
    }
    
    if (hostname.includes('youtube.com')) {
      return urlObj.searchParams.get('v');
    }
    
    return null;
  } catch {
    return null;
  }
}

/**
 * Validates language code
 */
export function isValidLanguageCode(code: string): boolean {
  const validCodes = ['vi', 'en', 'zh', 'ja', 'ko', 'es', 'fr', 'de', 'ru', 'pt', 'th'];
  return validCodes.includes(code);
}

/**
 * Formats duration in seconds to HH:MM:SS
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Formats file size in bytes to human readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Validates if job is in terminal state (done or error)
 */
export function isJobTerminal(status: string): boolean {
  return status === 'done' || status === 'error';
}

/**
 * Validates if job is currently processing
 */
export function isJobProcessing(status: string): boolean {
  return status === 'running' || status === 'queued';
}

