import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import mongoose from 'mongoose';
import { requireAdmin } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import { StoryScene } from '@/lib/models/StoryScene';
import { AuditLog } from '@/lib/models/AuditLog';
import { StorySceneSchema } from '@/lib/validations';
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

    const scene = await StoryScene.findById(id).lean();
    if (!scene) {
      return NextResponse.json({ error: 'Story scene not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, scene });
  } catch (error: any) {
    if (error?.message?.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to fetch story scene' }, { status: 500 });
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

    const validation = StorySceneSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', issues: validation.error.issues },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const existing = await StoryScene.findById(id);
    if (!existing) {
      return NextResponse.json({ error: 'Story scene not found' }, { status: 404 });
    }

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
      entity: 'StoryScene',
      entityId: id,
      details: { key: existing.key, headline: existing.headline, status: existing.status },
      ipAddress: ip,
    });

    revalidatePath('/', 'page');

    return NextResponse.json({ success: true, scene: existing });
  } catch (error: any) {
    if (error?.message?.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Scene update error:', error);
    return NextResponse.json({ error: 'Failed to update story scene' }, { status: 500 });
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
    const scene = await StoryScene.findById(id);
    if (!scene) {
      return NextResponse.json({ error: 'Story scene not found' }, { status: 404 });
    }

    if (scene.image?.publicId) {
      await deleteCloudinaryAsset(scene.image.publicId);
    }

    const previousKey = scene.key;
    await StoryScene.findByIdAndDelete(id);

    await AuditLog.create({
      adminId: new mongoose.Types.ObjectId(session.id),
      action: 'delete',
      entity: 'StoryScene',
      entityId: id,
      details: { key: previousKey },
      ipAddress: ip,
    });

    revalidatePath('/', 'page');

    return NextResponse.json({
      success: true,
      message: 'Story scene removed.',
    });
  } catch (error: any) {
    if (error?.message?.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Scene deletion error:', error);
    return NextResponse.json({ error: 'Failed to delete story scene' }, { status: 500 });
  }
}
