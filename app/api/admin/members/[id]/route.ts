import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import mongoose from 'mongoose';
import { requireAdmin } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import { Member } from '@/lib/models/Member';
import { AuditLog } from '@/lib/models/AuditLog';
import { MemberSchema } from '@/lib/validations';
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

    const member = await Member.findById(id).lean();
    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, member });
  } catch (error: any) {
    if (error?.message?.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to fetch member' }, { status: 500 });
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

    const validation = MemberSchema.safeParse(body);
    if (!validation.success) {
      const issueDetails = validation.error.issues
        .map((iss) => `${iss.path.join('.')}: ${iss.message}`)
        .join('; ');
      return NextResponse.json(
        { error: `Validation failed: ${issueDetails}`, issues: validation.error.issues },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const existing = await Member.findById(id);
    if (!existing) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    // Clean up replaced image asset
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
      entity: 'Member',
      entityId: id,
      details: { name: existing.name, role: existing.role, type: existing.type },
      ipAddress: ip,
    });

    revalidatePath('/', 'page');
    revalidatePath('/about', 'page');

    return NextResponse.json({ success: true, member: existing });
  } catch (error: any) {
    if (error?.message?.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Member update error:', error);
    return NextResponse.json({ error: 'Failed to update member' }, { status: 500 });
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
    const member = await Member.findById(id);
    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    if (member.image?.publicId) {
      await deleteCloudinaryAsset(member.image.publicId);
    }

    const previousName = member.name;
    await Member.findByIdAndDelete(id);

    await AuditLog.create({
      adminId: new mongoose.Types.ObjectId(session.id),
      action: 'delete',
      entity: 'Member',
      entityId: id,
      details: { name: previousName },
      ipAddress: ip,
    });

    revalidatePath('/', 'page');
    revalidatePath('/about', 'page');

    return NextResponse.json({
      success: true,
      message: 'Member removed and portrait asset purged.',
    });
  } catch (error: any) {
    if (error?.message?.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Member deletion error:', error);
    return NextResponse.json({ error: 'Failed to delete member' }, { status: 500 });
  }
}
