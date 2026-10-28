import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth';
import { getMemberSessionFromRequest } from '@/lib/studentAuth';
import { getSignedUploadParams } from '@/lib/cloudinary';

export async function POST(request: NextRequest) {
  try {
    const adminSession = await getSessionFromRequest(request);
    const memberSession = !adminSession ? await getMemberSessionFromRequest(request) : null;

    if (!adminSession && !memberSession) {
      return NextResponse.json({ error: 'Unauthorized: Sign-in required.' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const folder = body?.folder || 'shutterscape';

    const params = getSignedUploadParams(folder);

    return NextResponse.json({
      success: true,
      ...params,
    });
  } catch (error: any) {
    if (error?.message?.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Signature generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate upload signature.' },
      { status: 500 }
    );
  }
}
