import { NextResponse } from 'next/server';
import { clearMemberSessionCookie } from '@/lib/studentAuth';

export async function POST() {
  await clearMemberSessionCookie();
  return NextResponse.json({ success: true, message: 'Logged out successfully' });
}

