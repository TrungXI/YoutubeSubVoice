'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import VideoPlayer from '@/components/VideoPlayer';
import JobStatus from '@/components/JobStatus';
import { ArrowLeft, Download } from 'lucide-react';
import type { JobWithAssets, Asset } from '@/types';

export default function JobDetailPage() {
  const params = useParams();
  const [job, setJob] = useState<JobWithAssets | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchJob = async () => {
    try {
      const response = await fetch(`/api/jobs/${params.id}`);
      const data = await response.json();
      setJob(data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch job:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJob();
    
    // Poll every 3 seconds if not done
    const interval = setInterval(() => {
      if (job?.status !== 'done' && job?.status !== 'error') {
        fetchJob();
      }
    }, 3000);
    
    return () => clearInterval(interval);
  }, [params.id, job?.status]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading job...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Job not found</p>
          <Link href="/" className="text-blue-600 hover:underline">
            ← Back to home
          </Link>
        </div>
      </div>
    );
  }

  const videoAsset = job.assets?.find((a: Asset) => 
    a.assetType === 'original_video' || a.assetType === 'dub_video'
  );
  const subtitleAsset = job.assets?.find((a: Asset) => a.assetType === 'vtt');
  const srtAsset = job.assets?.find((a: Asset) => a.assetType === 'srt');
  const dubAudioAsset = job.assets?.find((a: Asset) => a.assetType === 'dub_audio');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Link
          href="/"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to home
        </Link>

        {/* Job Info */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {job.videoTitle || 'Processing...'}
          </h1>
          <JobStatus job={job} />
        </div>

        {/* Video Player */}
        {job.status === 'done' && videoAsset && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Video Player</h2>
            <VideoPlayer
              videoUrl={videoAsset.fileUrl}
              subtitleUrl={subtitleAsset?.fileUrl}
            />
          </div>
        )}

        {/* Downloads */}
        {job.status === 'done' && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Downloads</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {srtAsset && (
                <a
                  href={srtAsset.fileUrl}
                  download
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div>
                    <p className="font-medium">SRT Subtitles</p>
                    <p className="text-sm text-gray-500">SubRip format</p>
                  </div>
                  <Download className="w-5 h-5 text-blue-600" />
                </a>
              )}
              {subtitleAsset && (
                <a
                  href={subtitleAsset.fileUrl}
                  download
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div>
                    <p className="font-medium">WebVTT Subtitles</p>
                    <p className="text-sm text-gray-500">Web format</p>
                  </div>
                  <Download className="w-5 h-5 text-blue-600" />
                </a>
              )}
              {dubAudioAsset && (
                <a
                  href={dubAudioAsset.fileUrl}
                  download
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div>
                    <p className="font-medium">Dubbed Audio</p>
                    <p className="text-sm text-gray-500">MP3 format</p>
                  </div>
                  <Download className="w-5 h-5 text-blue-600" />
                </a>
              )}
              {videoAsset && (
                <a
                  href={videoAsset.fileUrl}
                  download
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div>
                    <p className="font-medium">Video</p>
                    <p className="text-sm text-gray-500">MP4 format</p>
                  </div>
                  <Download className="w-5 h-5 text-blue-600" />
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

