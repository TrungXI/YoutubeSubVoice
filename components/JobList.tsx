'use client';

import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import type { Job, JobStatus } from '@/types';

interface JobListProps {
  jobs: Job[];
}

const StatusIcon = ({ status }: { status: JobStatus }) => {
  switch (status) {
    case 'done':
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    case 'error':
      return <XCircle className="w-5 h-5 text-red-600" />;
    case 'running':
      return <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />;
    default:
      return <Clock className="w-5 h-5 text-gray-600" />;
  }
};

const StatusBadge = ({ status }: { status: JobStatus }) => {
  const colors: Record<JobStatus, string> = {
    queued: 'bg-gray-100 text-gray-800',
    running: 'bg-blue-100 text-blue-800',
    done: 'bg-green-100 text-green-800',
    error: 'bg-red-100 text-red-800',
  };

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded ${colors[status]}`}>
      {status.toUpperCase()}
    </span>
  );
};

export default function JobList({ jobs }: JobListProps) {
  if (jobs.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <p className="text-gray-500">No jobs yet. Create one to get started!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {jobs.map((job) => (
        <Link
          key={job.id}
          href={`/jobs/${job.id}`}
          className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4 flex-1">
              <StatusIcon status={job.status} />
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900 truncate">
                  {job.videoTitle || 'Processing...'}
                </h3>
                <p className="text-sm text-gray-500 truncate mt-1">
                  {job.youtubeUrl}
                </p>
                <div className="flex items-center space-x-4 mt-2">
                  <StatusBadge status={job.status} />
                  <span className="text-xs text-gray-500">
                    Target: {job.targetLang.toUpperCase()}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}
                  </span>
                </div>
              </div>
            </div>
            
            {job.status === 'running' && (
              <div className="ml-4">
                <div className="text-sm font-medium text-gray-700">{job.progress}%</div>
              </div>
            )}
          </div>

          {job.status === 'running' && (
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${job.progress}%` }}
                />
              </div>
            </div>
          )}
        </Link>
      ))}
    </div>
  );
}

