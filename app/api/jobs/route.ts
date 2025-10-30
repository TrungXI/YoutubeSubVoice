import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { jobs } from '@/lib/db/schema';
import { videoQueue } from '@/lib/queue';
import { desc } from 'drizzle-orm';
import { z } from 'zod';
import type { CreateJobRequest, CreateJobResponse, APIError } from '@/types';

const createJobSchema = z.object({
  youtubeUrl: z.string().url(),
  targetLang: z.string().default('vi'),
  enableDub: z.boolean().default(false),
  voiceId: z.string().optional(),
});

export async function POST(request: NextRequest): Promise<NextResponse<CreateJobResponse | APIError>> {
  try {
    const body = await request.json();
    const validatedData = createJobSchema.parse(body);

    // Create job in database
    const [job] = await db
      .insert(jobs)
      .values({
        youtubeUrl: validatedData.youtubeUrl,
        targetLang: validatedData.targetLang,
        enableDub: validatedData.enableDub,
        voiceId: validatedData.voiceId,
        status: 'queued',
        progress: 0,
      })
      .returning();

    // Add to queue
    await videoQueue.add('process-video', {
      jobId: job.id,
      youtubeUrl: validatedData.youtubeUrl,
      targetLang: validatedData.targetLang,
      enableDub: validatedData.enableDub,
      voiceId: validatedData.voiceId,
    });

    return NextResponse.json(job, { status: 201 });
  } catch (error) {
    console.error('Error creating job:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create job' },
      { status: 400 }
    );
  }
}

export async function GET(request: NextRequest): Promise<NextResponse<CreateJobResponse[] | APIError>> {
  try {
    const allJobs = await db.select().from(jobs).orderBy(desc(jobs.createdAt)).limit(50);
    return NextResponse.json(allJobs);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 });
  }
}

