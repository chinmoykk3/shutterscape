import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import mongoose from 'mongoose';
import { requireAdmin } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import { Activity } from '@/lib/models/Activity';
import { AuditLog } from '@/lib/models/AuditLog';
import { ActivitySchema } from '@/lib/validations';
import { sanitizeHtmlContent, getClientIp } from '@/lib/security';
import { deleteCloudinaryAsset } from '@/lib/cloudinary';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin(request);
    await connectToDatabase();
    const { id } = await params;

    const activity = await Activity.findById(id).lean();
    if (!activity) {
      return NextResponse.json({ error: 'Activity not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, activity });
  } catch (error: any) {
    if (error?.message?.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to fetch activity' }, { status: 500 });
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

    const validation = ActivitySchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', issues: validation.error.issues },
        { status: 400 }
      );
    }

    const data = validation.data;
    data.descriptionHtml = sanitizeHtmlContent(data.descriptionHtml);

    await connectToDatabase();

    const existing = await Activity.findById(id);
    if (!existing) {
      return NextResponse.json({ error: 'Activity not found' }, { status: 404 });
    }

    // If slug changed, verify uniqueness
    if (existing.slug !== data.slug) {
      const slugConflict = await Activity.findOne({ slug: data.slug, _id: { $ne: id } });
      if (slugConflict) {
        return NextResponse.json(
          { error: 'Another activity already uses this slug.' },
          { status: 409 }
        );
      }
    }

    // If image was replaced, delete old Cloudinary asset
    if (
      existing.image?.publicId &&
      data.image?.publicId &&
      existing.image.publicId !== data.image.publicId
    ) {
      await deleteCloudinaryAsset(existing.image.publicId);
    }

    Object.assign(existing, data);
    await existing.save();

    await AuditLog.create({
      adminId: new mongoose.Types.ObjectId(session.id),
      action: 'update',
      entity: 'Activity',
      entityId: id,
      details: { title: existing.title, slug: existing.slug, status: existing.status },
      ipAddress: ip,
    });

    revalidatePath('/', 'page');
    revalidatePath('/activities', 'page');
    revalidatePath(`/activities/${existing.slug}`, 'page');

    return NextResponse.json({ success: true, activity: existing });
  } catch (error: any) {
    if (error?.message?.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Activity update error:', error);
    return NextResponse.json({ error: 'Failed to update activity' }, { status: 500 });
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
    const activity = await Activity.findById(id);

    if (!activity) {
      return NextResponse.json({ error: 'Activity not found' }, { status: 404 });
    }

    // Destroy Cloudinary asset
    if (activity.image?.publicId) {
      await deleteCloudinaryAsset(activity.image.publicId);
    }

    const previousTitle = activity.title;
    const previousSlug = activity.slug;

    await Activity.findByIdAndDelete(id);

    await AuditLog.create({
      adminId: new mongoose.Types.ObjectId(session.id),
      action: 'delete',
      entity: 'Activity',
      entityId: id,
      details: { title: previousTitle, slug: previousSlug },
      ipAddress: ip,
    });

    revalidatePath('/', 'page');
    revalidatePath('/activities', 'page');
    revalidatePath(`/activities/${previousSlug}`, 'page');

    return NextResponse.json({
      success: true,
      message: 'Activity and linked image asset deleted.',
    });
  } catch (error: any) {
    if (error?.message?.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Activity deletion error:', error);
    return NextResponse.json({ error: 'Failed to delete activity' }, { status: 500 });
  }
}
