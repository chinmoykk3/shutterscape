import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { connectDB } from '@/lib/db';
import { StudentUser } from '@/lib/models/StudentUser';
import { signMemberToken, setMemberSessionCookie } from '@/lib/studentAuth';

const LoginSchema = z.object({
  email: z.string().email('Please enter a valid email address').toLowerCase().trim(),
  password: z.string().min(1, 'Password is required'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const parsed = LoginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Please enter valid credentials' }, { status: 400 });
    }

    const { email, password } = parsed.data;

    await connectDB();

    const user = await StudentUser.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }

    if (user.status === 'suspended') {
      return NextResponse.json(
        { error: 'Your student account is suspended. Please contact the society curator.' },
        { status: 403 }
      );
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }

    const token = await signMemberToken({
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      department: user.department,
      role: user.role,
    });

    await setMemberSessionCookie(token);

    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        department: user.department,
        rollNumber: user.rollNumber,
      },
    });
  } catch (error: unknown) {
    console.error('Member login error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Login failed' },
      { status: 500 }
    );
  }
}

