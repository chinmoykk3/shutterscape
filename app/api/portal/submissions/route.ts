import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/db';
import { PhotoSubmission } from '@/lib/models/PhotoSubmission';
import { StudentUser } from '@/lib/models/StudentUser';
import { requireMember } from '@/lib/studentAuth';
import { ImageUrlSchema } from '@/lib/validations';

const CreateSubmissionSchema = z.object({
  title: z.string().min(2, 'Title/Caption must be at least 2 characters').max(150),
  room: z.string().min(1, 'Exhibition room is required').default('Campus Life'),
  story: z.string().max(1500).optional(),
  cameraInfo: z.string().max(120).optional(),
  image: z.object({
    url: ImageUrlSchema,
    publicId: z.string().min(1, 'Public ID is required'),
    blurDataURL: z.string().optional(),
    width: z.number().optional(),
    height: z.number().optional(),
  }),
});

export async function GET(request: NextRequest) {
  try {
    const session = await requireMember(request);
    await connectDB();

    const submissions = await PhotoSubmission.find({ studentId: session.id })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, submissions });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unauthorized' },
      { status: 401 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireMember(request);
    const body = await request.json().catch(() => ({}));
    const parsed = CreateSubmissionSchema.safeParse(body);

    if (!parsed.success) {
      const issueMsg = parsed.error.issues.map((i) => i.message).join(', ');
      return NextResponse.json({ error: issueMsg }, { status: 400 });
    }

    await connectDB();
    const user = await StudentUser.findById(session.id);
    if (!user) {
      return NextResponse.json({ error: 'User account not found' }, { status: 404 });
    }

    const newSubmission = await PhotoSubmission.create({
      studentId: user._id,
      studentName: user.name,
      studentEmail: user.email,
      department: user.department,
      title: parsed.data.title,
      room: parsed.data.room,
      story: parsed.data.story,
      cameraInfo: parsed.data.cameraInfo || user.cameraGear || 'Digital Exposure',
      image: parsed.data.image,
      status: 'pending',
    });

    return NextResponse.json({
      success: true,
      submission: newSubmission,
      message: 'Photograph submitted! The darkroom curators will review your exposure.',
    });
  } catch (err: unknown) {
    console.error('Submission error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to submit photograph' },
      { status: 500 }
    );
  }
}

