import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { requireAdmin } from '@/lib/auth';
import {
  deleteCloudinaryAsset,
  isCloudinaryConfigured,
  uploadBufferToCloudinary,
} from '@/lib/cloudinary';

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request);

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string) || 'shutterscape';

    if (!file) {
      return NextResponse.json({ error: 'No image file provided.' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // If Cloudinary is configured with valid non-placeholder keys, upload to Cloudinary
    if (isCloudinaryConfigured()) {
      try {
        const cloudAsset = await uploadBufferToCloudinary(buffer, folder);
        return NextResponse.json({
          success: true,
          isLocalFallback: false,
          asset: cloudAsset,
        });
      } catch (cloudErr) {
        console.warn('Cloudinary upload error, falling back to local storage:', cloudErr);
      }
    }

    // Local development fallback if Cloudinary credentials are not configured or failed
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `${Date.now()}-${safeName}`;
    const filePath = path.join(uploadsDir, filename);

    await fs.promises.writeFile(filePath, buffer);

    return NextResponse.json({
      success: true,
      isLocalFallback: true,
      message: 'Photo saved locally. Configure Cloudinary credentials in .env.local for production cloud storage.',
      asset: {
        url: `/uploads/${filename}`,
        publicId: `local_${filename}`,
        width: 1200,
        height: 800,
      },
    });
  } catch (error: any) {
    if (error?.message?.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Upload processing error:', error);
    return NextResponse.json(
      { error: 'Failed to process and store photographic asset.' },
      { status: 500 }
    );
  }
}

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

    // If it's a local fallback file, remove from public/uploads
    if (publicId.startsWith('local_')) {
      const filename = publicId.replace('local_', '');
      const filePath = path.join(process.cwd(), 'public', 'uploads', filename);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch {}
      }
      return NextResponse.json({
        success: true,
        message: 'Local asset removed from darkroom storage.',
      });
    }

    // If Cloudinary is not configured with real keys, skip remote deletion
    if (!isCloudinaryConfigured()) {
      return NextResponse.json({
        success: true,
        message: 'Asset reference cleared from local workspace.',
      });
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
