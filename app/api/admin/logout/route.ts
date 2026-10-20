import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectToDatabase } from '@/lib/db';
import { AuditLog } from '@/lib/models/AuditLog';
import { getSession, clearSessionCookie } from '@/lib/auth';
import { getClientIp } from '@/lib/security';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    const ip = getClientIp(request);

    if (session) {
      try {
        await connectToDatabase();
        await AuditLog.create({
          adminId: new mongoose.Types.ObjectId(session.id),
          action: 'logout',
          entity: 'Auth',
          entityId: session.id,
          details: { email: session.email },
          ipAddress: ip,
        });
      } catch (err) {
        console.error('AuditLog logout recording warning:', err);
      }
    }

    await clearSessionCookie();

    return NextResponse.json({
      success: true,
      message: 'Logged out from The Editing Room.',
    });
  } catch (error) {
    console.error('Logout error:', error);
    await clearSessionCookie();
    return NextResponse.json({
      success: true,
      message: 'Session cleared.',
    });
  }
}

export async function GET(request: NextRequest) {
  return POST(request);
}
