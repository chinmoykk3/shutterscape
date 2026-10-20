import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import mongoose from 'mongoose';
import { requireAdmin } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import { GalleryItem } from '@/lib/models/GalleryItem';
import { AuditLog } from '@/lib/models/AuditLog';
import { GalleryItemSchema } from '@/lib/validations';
import { getClientIp } from '@/lib/security';
import { deleteCloudinaryAsset } from '@/lib/cloudinary';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin(request);
    await connectToDatabase();
    const { id } = await params;

    const item = await GalleryItem.findById(id).lean();
    if (!item) {
      return NextResponse.json({ error: 'Gallery item not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, item });
  } catch (error: any) {
    if (error?.message?.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to fetch gallery item' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdmin(request);
    const ip = getClientIp(request);
    const { id } = await params;
    const body = await request.json().catch(() => null);

    const validation = GalleryItemSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', issues: validation.error.issues },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const existing = await GalleryItem.findById(id);
    if (!existing) {
      return NextResponse.json({ error: 'Gallery item not found' }, { status: 404 });
    }

    // Clean up replaced Cloudinary asset
    if (
      existing.image?.publicId &&
      validation.data.image?.publicId &&
      existing.image.publicId !== validation.data.image.publicId
    ) {
      await deleteCloudinaryAsset(existing.image.publicId);
    }

    Object.assign(existing, validation.data);
    await existing.save();

    await AuditLog.create({
      adminId: new mongoose.Types.ObjectId(session.id),
      action: 'update',
      entity: 'GalleryItem',
      entityId: id,
      details: { caption: existing.caption, room: existing.room, status: existing.status },
      ipAddress: ip,
    });

    revalidatePath('/', 'page');
    revalidatePath('/gallery', 'page');

    return NextResponse.json({ success: true, item: existing });
  } catch (error: any) {
    if (error?.message?.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Gallery item update error:', error);
    return NextResponse.json({ error: 'Failed to update gallery item' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdmin(request);
    const ip = getClientIp(request);
    const { id } = await params;

    await connectToDatabase();
    const item = await GalleryItem.findById(id);
    if (!item) {
      return NextResponse.json({ error: 'Gallery item not found' }, { status: 404 });
    }

    if (item.image?.publicId) {
      await deleteCloudinaryAsset(item.image.publicId);
    }

    const previousCaption = item.caption;
    await GalleryItem.findByIdAndDelete(id);

    await AuditLog.create({
      adminId: new mongoose.Types.ObjectId(session.id),
      action: 'delete',
      entity: 'GalleryItem',
      entityId: id,
      details: { caption: previousCaption },
      ipAddress: ip,
    });

    revalidatePath('/', 'page');
    revalidatePath('/gallery', 'page');

    return NextResponse.json({
      success: true,
      message: 'Gallery exposure purged successfully.',
    });
  } catch (error: any) {
    if (error?.message?.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Gallery item deletion error:', error);
    return NextResponse.json({ error: 'Failed to delete gallery item' }, { status: 500 });
  }
}
