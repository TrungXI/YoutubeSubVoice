import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { assets } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const jobId = parseInt(params.jobId);
    
    if (isNaN(jobId)) {
      return NextResponse.json({ error: 'Invalid job ID' }, { status: 400 });
    }

    const jobAssets = await db.select().from(assets).where(eq(assets.jobId, jobId));

    // Group by asset type
    const groupedAssets = jobAssets.reduce((acc, asset) => {
      acc[asset.assetType] = {
        ...asset,
        url: asset.fileUrl,
      };
      return acc;
    }, {} as Record<string, any>);

    return NextResponse.json(groupedAssets);
  } catch (error) {
    console.error('Error fetching assets:', error);
    return NextResponse.json({ error: 'Failed to fetch assets' }, { status: 500 });
  }
}

