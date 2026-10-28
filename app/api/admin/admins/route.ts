import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { connectToDatabase } from '@/lib/db';
import { Admin } from '@/lib/models/Admin';
import { AuditLog } from '@/lib/models/AuditLog';
import { guardAdminApi } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const { errorResponse } = await guardAdminApi('superadmin', request);
  if (errorResponse) return errorResponse;

  try {
    await connectToDatabase();
    const admins = await Admin.find({}, { passwordHash: 0, totpSecret: 0 }).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, admins });
  } catch (error) {
    console.error('Fetch admins error:', error);
    return NextResponse.json({ error: 'Failed to retrieve admin roster' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { session, errorResponse } = await guardAdminApi('superadmin', request);
  if (errorResponse) return errorResponse;

  try {
    const body = await request.json();
    const { email, password, name, role } = body;

    if (!email || !password || !name) {
      return NextResponse.json({ error: 'Email, password, and name are required' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
    }

    await connectToDatabase();

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await Admin.findOne({ email: normalizedEmail });
    if (existing) {
      return NextResponse.json({ error: 'An admin with this email already exists' }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const newAdmin = await Admin.create({
      email: normalizedEmail,
      name: name.trim(),
      role: role === 'superadmin' ? 'superadmin' : 'editor',
      passwordHash,
      failedAttempts: 0,
      lockUntil: null,
    });

    if (session) {
      await AuditLog.create({
        adminEmail: session.email,
        action: 'create',
        collectionName: 'Admin',
        documentId: newAdmin._id.toString(),
        changesSummary: `Provisioned ${newAdmin.role}: ${newAdmin.email}`,
      });
    }

    return NextResponse.json(
      {
        success: true,
        admin: {
          _id: newAdmin._id,
          email: newAdmin.email,
          name: newAdmin.name,
          role: newAdmin.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create admin error:', error);
    return NextResponse.json({ error: 'Failed to provision admin account' }, { status: 500 });
  }
}
