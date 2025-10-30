'use client';

import { useEffect, useRef } from 'react';

interface VideoPlayerProps {
  videoUrl: string;
  subtitleUrl?: string;
}

export default function VideoPlayer({ videoUrl, subtitleUrl }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  return (
    <div className="w-full">
      <video
        ref={videoRef}
        controls
        className="w-full rounded-lg shadow-lg"
        crossOrigin="anonymous"
      >
        <source src={videoUrl} type="video/mp4" />
        {subtitleUrl && (
          <track
            label="Subtitles"
            kind="subtitles"
            srcLang="vi"
            src={subtitleUrl}
            default
          />
        )}
        Your browser does not support the video tag.
      </video>
    </div>
  );
}

