import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { connectToDatabase } from '@/lib/db';
import { PhotoStory } from '@/lib/models/PhotoStory';
import { AuditLog } from '@/lib/models/AuditLog';
import { guardAdminApi } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const { errorResponse } = await guardAdminApi(request);
  if (errorResponse) return errorResponse;

  try {
    await connectToDatabase();
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search');
    const status = searchParams.get('status');

    const query: Record<string, any> = {};
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { curatorName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const stories = await PhotoStory.find(query).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, stories });
  } catch (error) {
    console.error('Fetch stories error:', error);
    return NextResponse.json({ error: 'Failed to retrieve photo stories' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { session, errorResponse } = await guardAdminApi(request);
  if (errorResponse) return errorResponse;

  try {
    const body = await request.json();
    await connectToDatabase();

    const story = await PhotoStory.create({
      title: body.title,
      slug: body.slug,
      curatorName: body.curatorName || session?.name || 'Curator',
      description: body.description,
      coverImageUrl: body.coverImageUrl,
      frames: body.frames || [],
      status: body.status || 'published',
    });

    if (session) {
      await AuditLog.create({
        adminEmail: session.email,
        action: 'create',
        collectionName: 'PhotoStory',
        documentId: story._id.toString(),
        changesSummary: `Created PhotoStory: ${story.title} (${story.frames.length} frames)`,
      });
    }

    revalidatePath('/gallery');
    revalidatePath('/');

    return NextResponse.json({ success: true, story }, { status: 201 });
  } catch (error) {
    console.error('Create story error:', error);
    return NextResponse.json({ error: 'Failed to create photo story' }, { status: 500 });
  }
}
