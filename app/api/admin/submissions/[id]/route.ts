import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Submission } from '@/lib/models/Submission';
import { AuditLog } from '@/lib/models/AuditLog';
import { guardAdminApi } from '@/lib/auth';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, errorResponse } = await guardAdminApi(request);
  if (errorResponse) return errorResponse;

  try {
    const { id } = await params;
    const body = await request.json();
    await connectToDatabase();

    const submission = await Submission.findByIdAndUpdate(
      id,
      {
        $set: {
          handled: body.handled !== undefined ? body.handled : true,
          status: body.status || 'read',
          notes: body.notes,
        },
      },
      { new: true }
    );

    if (!submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    if (session) {
      await AuditLog.create({
        adminEmail: session.email,
        action: 'update',
        collectionName: 'Submission',
        documentId: id,
        changesSummary: `Updated submission from ${submission.email} (handled: ${submission.handled})`,
      });
    }

    return NextResponse.json({ success: true, submission });
  } catch (error) {
    console.error('Update submission error:', error);
    return NextResponse.json({ error: 'Failed to update submission' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, errorResponse } = await guardAdminApi(request);
  if (errorResponse) return errorResponse;

  try {
    const { id } = await params;
    await connectToDatabase();

    const deleted = await Submission.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    if (session) {
      await AuditLog.create({
        adminEmail: session.email,
        action: 'delete',
        collectionName: 'Submission',
        documentId: id,
        changesSummary: `Purged submission from ${deleted.email}`,
      });
    }

    return NextResponse.json({ success: true, message: 'Submission deleted' });
  } catch (error) {
    console.error('Delete submission error:', error);
    return NextResponse.json({ error: 'Failed to delete submission' }, { status: 500 });
  }
}
