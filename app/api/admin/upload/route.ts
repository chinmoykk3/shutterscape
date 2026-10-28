import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { getSessionFromRequest } from '@/lib/auth';
import { getMemberSessionFromRequest } from '@/lib/studentAuth';
import {
  deleteCloudinaryAsset,
  isCloudinaryConfigured,
  uploadBufferToCloudinary,
} from '@/lib/cloudinary';

export async function POST(request: NextRequest) {
  try {
    const adminSession = await getSessionFromRequest(request);
    const memberSession = !adminSession ? await getMemberSessionFromRequest(request) : null;

    if (!adminSession && !memberSession) {
      return NextResponse.json({ error: 'Unauthorized: Authentication required.' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string) || 'shutterscape';

    if (!file) {
      return NextResponse.json({ error: 'No image file provided.' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 1. If Cloudinary is configured with valid keys, upload to Cloudinary
    if (isCloudinaryConfigured()) {
      try {
        const cloudAsset = await uploadBufferToCloudinary(buffer, folder);
        return NextResponse.json({
          success: true,
          isLocalFallback: false,
          asset: cloudAsset,
        });
      } catch (cloudErr) {
        console.warn('Cloudinary upload error, falling back to storage:', cloudErr);
      }
    }

    // 2. Try saving to public/uploads (local development environment)
    try {
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
        message: 'Photo saved locally.',
        asset: {
          url: `/uploads/${filename}`,
          publicId: `local_${filename}`,
          width: 1200,
          height: 800,
        },
      });
    } catch (fsErr) {
      console.warn('Filesystem read-only (e.g. Vercel serverless), optimizing to Data URL:', fsErr);

      // 3. Serverless / Vercel fallback: Optimize image with sharp to compact WebP Data URL
      let dataBuffer = buffer;
      let mimeType = 'image/webp';
      let width = 1200;
      let height = 800;

      try {
        const meta = await sharp(buffer).metadata();
        width = meta.width || 1200;
        height = meta.height || 800;

        dataBuffer = await sharp(buffer)
          .resize(1400, 1400, { fit: 'inside', withoutEnlargement: true })
          .webp({ quality: 82 })
          .toBuffer();
      } catch (sharpErr) {
        console.warn('Sharp compression error, using raw buffer:', sharpErr);
        mimeType = file.type || 'image/jpeg';
      }

      const base64Data = `data:${mimeType};base64,${dataBuffer.toString('base64')}`;
      const publicId = `inline_${Date.now()}`;

      return NextResponse.json({
        success: true,
        isLocalFallback: true,
        message: 'Photo processed and stored.',
        asset: {
          url: base64Data,
          publicId,
          width,
          height,
        },
      });
    }
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
    const adminSession = await getSessionFromRequest(request);
    const memberSession = !adminSession ? await getMemberSessionFromRequest(request) : null;

    if (!adminSession && !memberSession) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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
