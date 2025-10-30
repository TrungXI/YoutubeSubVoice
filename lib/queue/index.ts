import { Queue } from 'bullmq';
import { Redis } from 'ioredis';
import { config } from '@/lib/config';
import { ProcessJobData } from '@/types';

// Create Redis connection
const connection = new Redis(config.redis.url, {
  maxRetriesPerRequest: null,
});

// Create queue
export const videoQueue = new Queue<ProcessJobData>('video-processing', {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: {
      count: 100,
      age: 24 * 3600, // 24 hours
    },
    removeOnFail: {
      count: 50,
    },
  },
});

export { connection };

