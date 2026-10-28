import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Submission } from '@/lib/models/Submission';
import { guardAdminApi } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const { errorResponse } = await guardAdminApi(request);
  if (errorResponse) return errorResponse;

  try {
    await connectToDatabase();
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const type = searchParams.get('type');

    const query: Record<string, any> = {};
    if (status) query.status = status;
    if (type) query.type = type;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } },
      ];
    }

    const submissions = await Submission.find(query).sort({ createdAt: -1 });
    const unhandledCount = await Submission.countDocuments({ handled: false });

    return NextResponse.json({
      success: true,
      submissions,
      unhandledCount,
    });
  } catch (error) {
    console.error('Fetch submissions error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve submissions' },
      { status: 500 }
    );
  }
}
