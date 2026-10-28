import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { connectToDatabase } from '@/lib/db';
import { Admin } from '@/lib/models/Admin';
import { AuditLog } from '@/lib/models/AuditLog';
import { guardAdminApi } from '@/lib/auth';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, errorResponse } = await guardAdminApi('superadmin', request);
  if (errorResponse) return errorResponse;

  try {
    const { id } = await params;
    const body = await request.json();
    await connectToDatabase();

    const updateFields: Record<string, any> = {};
    if (body.name) updateFields.name = body.name.trim();
    if (body.role && (body.role === 'superadmin' || body.role === 'editor')) {
      updateFields.role = body.role;
    }
    if (body.password) {
      if (body.password.length < 8) {
        return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
      }
      updateFields.passwordHash = await bcrypt.hash(body.password, 12);
    }
    if (body.unlock) {
      updateFields.failedAttempts = 0;
      updateFields.lockUntil = null;
    }

    const admin = await Admin.findByIdAndUpdate(id, { $set: updateFields }, { new: true }).select(
      '-passwordHash -totpSecret'
    );

    if (!admin) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 });
    }

    if (session) {
      await AuditLog.create({
        adminEmail: session.email,
        action: 'update',
        collectionName: 'Admin',
        documentId: id,
        changesSummary: `Updated admin ${admin.email}: ${Object.keys(updateFields).join(', ')}`,
      });
    }

    return NextResponse.json({ success: true, admin });
  } catch (error) {
    console.error('Update admin error:', error);
    return NextResponse.json({ error: 'Failed to update admin account' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, errorResponse } = await guardAdminApi('superadmin', request);
  if (errorResponse) return errorResponse;

  try {
    const { id } = await params;
    if (session?.id === id) {
      return NextResponse.json({ error: 'Cannot delete your own active superadmin account' }, { status: 400 });
    }

    await connectToDatabase();
    const deleted = await Admin.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 });
    }

    if (session) {
      await AuditLog.create({
        adminEmail: session.email,
        action: 'delete',
        collectionName: 'Admin',
        documentId: id,
        changesSummary: `Removed admin clearance for ${deleted.email}`,
      });
    }

    return NextResponse.json({ success: true, message: 'Admin account removed' });
  } catch (error) {
    console.error('Delete admin error:', error);
    return NextResponse.json({ error: 'Failed to remove admin account' }, { status: 500 });
  }
}
