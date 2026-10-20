import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import mongoose from 'mongoose';
import { requireAdmin } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import { Member } from '@/lib/models/Member';
import { AuditLog } from '@/lib/models/AuditLog';
import { MemberSchema } from '@/lib/validations';
import { getClientIp } from '@/lib/security';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const type = searchParams.get('type') || '';
    const status = searchParams.get('status') || '';

    const filter: Record<string, any> = {};
    if (status) filter.status = status;
    if (type && ['faculty', 'core', 'alumni'].includes(type)) {
      filter.type = type;
    }
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { role: { $regex: search, $options: 'i' } },
        { batch: { $regex: search, $options: 'i' } },
      ];
    }

    const members = await Member.find(filter).sort({ order: 1, createdAt: 1 }).lean();
    return NextResponse.json({ success: true, members });
  } catch (error: any) {
    if (error?.message?.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to fetch members' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAdmin(request);
    const ip = getClientIp(request);
    const body = await request.json().catch(() => null);

    const validation = MemberSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', issues: validation.error.issues },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Auto calculate order if not specified
    if (validation.data.order === undefined || validation.data.order === 0) {
      const highest = await Member.findOne({ type: validation.data.type })
        .sort({ order: -1 })
        .select('order')
        .lean();
      validation.data.order = (highest?.order || 0) + 1;
    }

    const member = await Member.create(validation.data);

    await AuditLog.create({
      adminId: new mongoose.Types.ObjectId(session.id),
      action: 'create',
      entity: 'Member',
      entityId: member._id.toString(),
      details: { name: member.name, role: member.role, type: member.type },
      ipAddress: ip,
    });

    revalidatePath('/', 'page');
    revalidatePath('/about', 'page');

    return NextResponse.json({ success: true, member }, { status: 201 });
  } catch (error: any) {
    if (error?.message?.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Member creation error:', error);
    return NextResponse.json({ error: 'Failed to create member' }, { status: 500 });
  }
}
