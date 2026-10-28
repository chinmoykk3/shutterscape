import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Submission } from '@/lib/models/Submission';
import { SubmissionSchema } from '@/lib/validations';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parseResult = SubmissionSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid form submission', details: parseResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // Check honeypot for bots
    if (parseResult.data.honeypot) {
      return NextResponse.json({ success: true, message: 'Received' });
    }

    await connectToDatabase();

    const submission = await Submission.create({
      name: parseResult.data.name,
      email: parseResult.data.email,
      message: parseResult.data.message || '',
      handled: false,
    });

    return NextResponse.json(
      { success: true, message: 'Membership application received', id: submission._id },
      { status: 201 }
    );
  } catch (error) {
    console.error('Contact/Join submission error:', error);
    return NextResponse.json(
      { error: 'Failed to process submission. Please try again later.' },
      { status: 500 }
    );
  }
}
