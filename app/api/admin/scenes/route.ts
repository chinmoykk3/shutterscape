import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import mongoose from 'mongoose';
import { requireAdmin } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import { StoryScene } from '@/lib/models/StoryScene';
import { AuditLog } from '@/lib/models/AuditLog';
import { StorySceneSchema } from '@/lib/validations';
import { getClientIp } from '@/lib/security';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
    await connectToDatabase();

    const scenes = await StoryScene.find().sort({ order: 1, createdAt: 1 }).lean();
    return NextResponse.json({ success: true, scenes });
  } catch (error: any) {
    if (error?.message?.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to fetch story scenes' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAdmin(request);
    const ip = getClientIp(request);
    const body = await request.json().catch(() => null);

    const validation = StorySceneSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', issues: validation.error.issues },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const existingKey = await StoryScene.findOne({ key: validation.data.key });
    if (existingKey) {
      return NextResponse.json(
        { error: 'A scene with this key already exists.' },
        { status: 409 }
      );
    }

    const scene = await StoryScene.create(validation.data);

    await AuditLog.create({
      adminId: new mongoose.Types.ObjectId(session.id),
      action: 'create',
      entity: 'StoryScene',
      entityId: scene._id.toString(),
      details: { key: scene.key, headline: scene.headline },
      ipAddress: ip,
    });

    revalidatePath('/', 'page');

    return NextResponse.json({ success: true, scene }, { status: 201 });
  } catch (error: any) {
    if (error?.message?.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Story scene creation error:', error);
    return NextResponse.json({ error: 'Failed to create story scene' }, { status: 500 });
  }
}
