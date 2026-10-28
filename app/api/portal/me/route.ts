import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/db';
import { StudentUser } from '@/lib/models/StudentUser';
import { PhotoSubmission } from '@/lib/models/PhotoSubmission';
import { requireMember } from '@/lib/studentAuth';

const ProfileUpdateSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  department: z.string().max(100).optional(),
  rollNumber: z.string().max(50).optional(),
  semester: z.string().max(30).optional(),
  phone: z.string().max(20).optional(),
  cameraGear: z.string().max(150).optional(),
  bio: z.string().max(400).optional(),
  instagramHandle: z.string().max(60).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await requireMember(request);
    await connectDB();

    const user = await StudentUser.findById(session.id).select('-passwordHash').lean();
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const [totalSubmissions, approvedCount, featuredCount] = await Promise.all([
      PhotoSubmission.countDocuments({ studentId: session.id }),
      PhotoSubmission.countDocuments({ studentId: session.id, status: 'approved' }),
      PhotoSubmission.countDocuments({ studentId: session.id, status: 'featured' }),
    ]);

    return NextResponse.json({
      success: true,
      user,
      stats: {
        totalSubmissions,
        approvedCount,
        featuredCount,
      },
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unauthorized' },
      { status: 401 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await requireMember(request);
    const body = await request.json().catch(() => ({}));
    const parsed = ProfileUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid profile payload', issues: parsed.error.issues },
        { status: 400 }
      );
    }

    await connectDB();
    const updated = await StudentUser.findByIdAndUpdate(
      session.id,
      { $set: parsed.data },
      { new: true }
    ).select('-passwordHash');

    return NextResponse.json({
      success: true,
      user: updated,
      message: 'Profile updated successfully',
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unauthorized' },
      { status: 401 }
    );
  }
}

