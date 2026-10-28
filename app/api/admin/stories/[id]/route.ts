import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { connectToDatabase } from '@/lib/db';
import { PhotoStory } from '@/lib/models/PhotoStory';
import { AuditLog } from '@/lib/models/AuditLog';
import { guardAdminApi } from '@/lib/auth';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, errorResponse } = await guardAdminApi(request);
  if (errorResponse) return errorResponse;

  try {
    const { id } = await params;
    const body = await request.json();
    await connectToDatabase();

    const story = await PhotoStory.findByIdAndUpdate(
      id,
      {
        $set: {
          title: body.title,
          slug: body.slug,
          curatorName: body.curatorName,
          description: body.description,
          coverImageUrl: body.coverImageUrl,
          frames: body.frames || [],
          status: body.status || 'published',
        },
      },
      { new: true }
    );

    if (!story) {
      return NextResponse.json({ error: 'Photo story not found' }, { status: 404 });
    }

    if (session) {
      await AuditLog.create({
        adminEmail: session.email,
        action: 'update',
        collectionName: 'PhotoStory',
        documentId: id,
        changesSummary: `Updated PhotoStory: ${story.title}`,
      });
    }

    revalidatePath('/gallery');
    revalidatePath('/');

    return NextResponse.json({ success: true, story });
  } catch (error) {
    console.error('Update story error:', error);
    return NextResponse.json({ error: 'Failed to update photo story' }, { status: 500 });
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

    const deleted = await PhotoStory.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ error: 'Photo story not found' }, { status: 404 });
    }

    if (session) {
      await AuditLog.create({
        adminEmail: session.email,
        action: 'delete',
        collectionName: 'PhotoStory',
        documentId: id,
        changesSummary: `Purged PhotoStory: ${deleted.title}`,
      });
    }

    revalidatePath('/gallery');
    revalidatePath('/');

    return NextResponse.json({ success: true, message: 'Photo story deleted' });
  } catch (error) {
    console.error('Delete story error:', error);
    return NextResponse.json({ error: 'Failed to delete photo story' }, { status: 500 });
  }
}
