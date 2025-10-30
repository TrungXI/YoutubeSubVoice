import type { JobStatus } from '@/types';

/**
 * Formats job status to display text
 */
export function formatJobStatus(status: JobStatus): string {
  const statusMap: Record<JobStatus, string> = {
    queued: 'Waiting in Queue',
    running: 'Processing',
    done: 'Completed',
    error: 'Failed',
  };
  
  return statusMap[status] || status;
}

/**
 * Formats progress percentage
 */
export function formatProgress(progress: number): string {
  return `${Math.min(100, Math.max(0, progress))}%`;
}

/**
 * Formats language code to display name
 */
export function formatLanguageName(code: string): string {
  const languageNames: Record<string, string> = {
    vi: 'Vietnamese',
    en: 'English',
    zh: 'Chinese',
    ja: 'Japanese',
    ko: 'Korean',
    es: 'Spanish',
    fr: 'French',
    de: 'German',
    ru: 'Russian',
    pt: 'Portuguese',
    th: 'Thai',
  };
  
  return languageNames[code] || code.toUpperCase();
}

/**
 * Formats timestamp for subtitles
 */
export function formatSubtitleTimestamp(
  seconds: number,
  format: 'srt' | 'vtt' = 'srt'
): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);
  
  const separator = format === 'srt' ? ',' : '.';
  
  return `${hours.toString().padStart(2, '0')}:${minutes
    .toString()
    .padStart(2, '0')}:${secs.toString().padStart(2, '0')}${separator}${ms
    .toString()
    .padStart(3, '0')}`;
}

/**
 * Truncates text to specified length
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  
  return `${text.slice(0, maxLength - 3)}...`;
}

/**
 * Formats date to relative time
 */
export function formatRelativeTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return 'just now';
  }
  
  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  }
  
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  }
  
  const days = Math.floor(diffInSeconds / 86400);
  return `${days} day${days > 1 ? 's' : ''} ago`;
}

