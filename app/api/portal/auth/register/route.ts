import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { connectDB } from '@/lib/db';
import { StudentUser } from '@/lib/models/StudentUser';
import { signMemberToken, setMemberSessionCookie } from '@/lib/studentAuth';

const RegisterSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Please enter a valid email address').toLowerCase().trim(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rollNumber: z.string().max(50).optional(),
  department: z.string().max(100).optional(),
  semester: z.string().max(30).optional(),
  phone: z.string().max(20).optional(),
  cameraGear: z.string().max(150).optional(),
  instagramHandle: z.string().max(60).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const parsed = RegisterSchema.safeParse(body);

    if (!parsed.success) {
      const issueMsg = parsed.error.issues.map((i) => i.message).join(', ');
      return NextResponse.json({ error: issueMsg }, { status: 400 });
    }

    const { name, email, password, rollNumber, department, semester, phone, cameraGear, instagramHandle } =
      parsed.data;

    await connectDB();

    const existing = await StudentUser.findOne({ email });
    if (existing) {
      return NextResponse.json(
        { error: 'An account with this email address already exists. Please log in.' },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await StudentUser.create({
      name,
      email,
      passwordHash,
      rollNumber: rollNumber || undefined,
      department: department || 'General',
      semester: semester || undefined,
      phone: phone || undefined,
      cameraGear: cameraGear || 'Smartphone / Digital Camera',
      instagramHandle: instagramHandle || undefined,
      role: 'member',
      status: 'active',
    });

    const token = await signMemberToken({
      id: newUser._id.toString(),
      email: newUser.email,
      name: newUser.name,
      department: newUser.department,
      role: newUser.role,
    });

    await setMemberSessionCookie(token);

    return NextResponse.json({
      success: true,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        department: newUser.department,
        rollNumber: newUser.rollNumber,
      },
      message: `Welcome to ShutterScape Collective, ${newUser.name}!`,
    });
  } catch (error: unknown) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Registration failed' },
      { status: 500 }
    );
  }
}

