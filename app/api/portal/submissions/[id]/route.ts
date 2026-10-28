import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { PhotoSubmission } from '@/lib/models/PhotoSubmission';
import { requireMember } from '@/lib/studentAuth';
import { deleteCloudinaryAsset } from '@/lib/cloudinary';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireMember(request);
    const { id } = await params;

    await connectDB();
    const submission = await PhotoSubmission.findOne({ _id: id, studentId: session.id });

    if (!submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    if (submission.image?.publicId) {
      await deleteCloudinaryAsset(submission.image.publicId).catch(() => {});
    }

    await PhotoSubmission.findByIdAndDelete(id);

    return NextResponse.json({ success: true, message: 'Submission removed from darkroom queue' });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unauthorized' },
      { status: 401 }
    );
  }
}

