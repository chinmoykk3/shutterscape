import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { PhotoSubmission } from '@/lib/models/PhotoSubmission';
import { guardAdminApi } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const { errorResponse } = await guardAdminApi(request);
  if (errorResponse) return errorResponse;

  try {
    await connectDB();
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search');
    const status = searchParams.get('status');

    const query: Record<string, unknown> = {};
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { studentName: { $regex: search, $options: 'i' } },
        { studentEmail: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } },
      ];
    }

    const photos = await PhotoSubmission.find(query).sort({ createdAt: -1 }).lean();
    const pendingCount = await PhotoSubmission.countDocuments({ status: 'pending' });

    return NextResponse.json({
      success: true,
      photos,
      pendingCount,
    });
  } catch (error) {
    console.error('Fetch photo submissions error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve photo submissions' },
      { status: 500 }
    );
  }
}

