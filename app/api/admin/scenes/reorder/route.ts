import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import mongoose from 'mongoose';
import { requireAdmin } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import { StoryScene } from '@/lib/models/StoryScene';
import { AuditLog } from '@/lib/models/AuditLog';
import { getClientIp } from '@/lib/security';

export async function PUT(request: NextRequest) {
  try {
    const session = await requireAdmin(request);
    const ip = getClientIp(request);
    const body = await request.json().catch(() => null);

    if (!body || !Array.isArray(body.items)) {
      return NextResponse.json(
        { error: 'Invalid items array for reordering' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const bulkOps = body.items.map((item: { id: string; order: number }) => ({
      updateOne: {
        filter: { _id: item.id },
        update: { $set: { order: item.order } },
      },
    }));

    await StoryScene.bulkWrite(bulkOps);

    await AuditLog.create({
      adminId: new mongoose.Types.ObjectId(session.id),
      action: 'update',
      entity: 'StoryScene',
      details: { action: 'reorder', count: body.items.length },
      ipAddress: ip,
    });

    revalidatePath('/', 'page');

    return NextResponse.json({ success: true, message: 'Story sequence updated.' });
  } catch (error: any) {
    if (error?.message?.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Scene reorder error:', error);
    return NextResponse.json({ error: 'Failed to reorder scenes' }, { status: 500 });
  }
}
