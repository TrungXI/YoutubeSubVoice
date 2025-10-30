import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { jobs, assets } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import type { JobWithAssets, APIError } from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<JobWithAssets | APIError>> {
  try {
    const jobId = parseInt(params.id);
    
    if (isNaN(jobId)) {
      return NextResponse.json({ error: 'Invalid job ID' }, { status: 400 });
    }

    const [job] = await db.select().from(jobs).where(eq(jobs.id, jobId));

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    const jobAssets = await db.select().from(assets).where(eq(assets.jobId, jobId));

    return NextResponse.json({
      ...job,
      assets: jobAssets,
    });
  } catch (error) {
    console.error('Error fetching job:', error);
    return NextResponse.json({ error: 'Failed to fetch job' }, { status: 500 });
  }
}

