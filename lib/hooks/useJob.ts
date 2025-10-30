import { useState, useEffect, useCallback } from 'react';
import type { JobWithAssets } from '@/types';

interface UseJobResult {
  job: JobWithAssets | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useJob(jobId: string | number): UseJobResult {
  const [job, setJob] = useState<JobWithAssets | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJob = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/jobs/${jobId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch job');
      }
      
      const data = await response.json();
      setJob(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    if (jobId) {
      fetchJob();
    }
  }, [jobId, fetchJob]);

  return { job, loading, error, refetch: fetchJob };
}

