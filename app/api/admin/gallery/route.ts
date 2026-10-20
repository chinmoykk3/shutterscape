import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import mongoose from 'mongoose';
import { requireAdmin } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import { GalleryItem } from '@/lib/models/GalleryItem';
import { AuditLog } from '@/lib/models/AuditLog';
import { GalleryItemSchema } from '@/lib/validations';
import { getClientIp } from '@/lib/security';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const room = searchParams.get('room') || '';
    const status = searchParams.get('status') || '';

    const filter: Record<string, any> = {};
    if (status && ['draft', 'published'].includes(status)) {
      filter.status = status;
    }
    if (room && room !== 'All') {
      filter.room = room;
    }
    if (search) {
      filter.$or = [
        { caption: { $regex: search, $options: 'i' } },
        { photographer: { $regex: search, $options: 'i' } },
        { story: { $regex: search, $options: 'i' } },
      ];
    }

    const items = await GalleryItem.find(filter)
      .sort({ featured: -1, createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, items });
  } catch (error: any) {
    if (error?.message?.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to fetch gallery items' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAdmin(request);
    const ip = getClientIp(request);
    const body = await request.json().catch(() => null);

    const validation = GalleryItemSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', issues: validation.error.issues },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const item = await GalleryItem.create(validation.data);

    await AuditLog.create({
      adminId: new mongoose.Types.ObjectId(session.id),
      action: 'create',
      entity: 'GalleryItem',
      entityId: item._id.toString(),
      details: { caption: item.caption, photographer: item.photographer, room: item.room },
      ipAddress: ip,
    });

    revalidatePath('/', 'page');
    revalidatePath('/gallery', 'page');

    return NextResponse.json({ success: true, item }, { status: 201 });
  } catch (error: any) {
    if (error?.message?.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Gallery item creation error:', error);
    return NextResponse.json({ error: 'Failed to create gallery item' }, { status: 500 });
  }
}
