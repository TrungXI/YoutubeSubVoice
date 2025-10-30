'use client';

import { useState, useEffect } from 'react';
import JobForm from '@/components/JobForm';
import JobList from '@/components/JobList';
import { PlayCircle } from 'lucide-react';
import type { Job } from '@/types';

export default function Home() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchJobs = async () => {
    try {
      const response = await fetch('/api/jobs');
      const data = await response.json();
      setJobs(data);
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
    }
  };

  useEffect(() => {
    fetchJobs();
    // Poll every 5 seconds
    const interval = setInterval(fetchJobs, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleJobCreated = () => {
    fetchJobs();
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <PlayCircle className="w-16 h-16 text-blue-600" />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            YouTube Sub/Voice
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Transform YouTube videos into subtitles and AI-powered voiceovers in multiple languages
          </p>
        </div>

        {/* Job Form */}
        <div className="max-w-3xl mx-auto mb-12">
          <JobForm onJobCreated={handleJobCreated} />
        </div>

        {/* Jobs List */}
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Jobs</h2>
          <JobList jobs={jobs} />
        </div>

        {/* Footer */}
        <div className="mt-16 text-center text-sm text-gray-500">
          <p>
            ⚠️ Please respect YouTube Terms of Service and video copyrights.
            Only use for permitted purposes (education, personal use, with permission).
          </p>
        </div>
      </div>
    </main>
  );
}

