import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { deleteCloudinaryAsset } from '@/lib/cloudinary';

export async function DELETE(request: NextRequest) {
  try {
    await requireAdmin(request);

    const { searchParams } = new URL(request.url);
    const publicId = searchParams.get('publicId');

    if (!publicId) {
      return NextResponse.json(
        { error: 'Public ID is required.' },
        { status: 400 }
      );
    }

    const deleted = await deleteCloudinaryAsset(publicId);

    return NextResponse.json({
      success: deleted,
      message: deleted ? 'Asset removed from cloud storage.' : 'Asset removal failed or was already deleted.',
    });
  } catch (error: any) {
    if (error?.message?.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Cloudinary asset deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete asset from Cloudinary.' },
      { status: 500 }
    );
  }
}
