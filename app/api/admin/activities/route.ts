import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import mongoose from 'mongoose';
import { requireAdmin } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import { Activity } from '@/lib/models/Activity';
import { AuditLog } from '@/lib/models/AuditLog';
import { ActivitySchema } from '@/lib/validations';
import { sanitizeHtmlContent, getClientIp } from '@/lib/security';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';

    const filter: Record<string, any> = {};
    if (status && ['draft', 'published'].includes(status)) {
      filter.status = status;
    }
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { venue: { $regex: search, $options: 'i' } },
        { slug: { $regex: search, $options: 'i' } },
      ];
    }

    const activities = await Activity.find(filter).sort({ date: -1 }).lean();
    return NextResponse.json({ success: true, activities });
  } catch (error: any) {
    if (error?.message?.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to fetch activities' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAdmin(request);
    const ip = getClientIp(request);
    const body = await request.json().catch(() => null);

    const validation = ActivitySchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', issues: validation.error.issues },
        { status: 400 }
      );
    }

    const data = validation.data;
    // Server-side sanitize rich text description HTML
    data.descriptionHtml = sanitizeHtmlContent(data.descriptionHtml);

    await connectToDatabase();

    // Check slug uniqueness
    const existing = await Activity.findOne({ slug: data.slug });
    if (existing) {
      return NextResponse.json(
        { error: 'An activity with this slug already exists.' },
        { status: 409 }
      );
    }

    const activity = await Activity.create(data);

    // Record AuditLog
    await AuditLog.create({
      adminId: new mongoose.Types.ObjectId(session.id),
      action: 'create',
      entity: 'Activity',
      entityId: activity._id.toString(),
      details: { title: activity.title, slug: activity.slug, status: activity.status },
      ipAddress: ip,
    });

    // Revalidate public cache
    revalidatePath('/', 'page');
    revalidatePath('/activities', 'page');
    revalidatePath(`/activities/${activity.slug}`, 'page');

    return NextResponse.json({ success: true, activity }, { status: 201 });
  } catch (error: any) {
    if (error?.message?.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Activity creation error:', error);
    return NextResponse.json({ error: 'Failed to create activity' }, { status: 500 });
  }
}
