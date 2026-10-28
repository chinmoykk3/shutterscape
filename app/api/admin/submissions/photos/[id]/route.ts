import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { connectDB } from '@/lib/db';
import { PhotoSubmission } from '@/lib/models/PhotoSubmission';
import { GalleryItem } from '@/lib/models/GalleryItem';
import { guardAdminApi } from '@/lib/auth';
import { getDarkroomBlurPlaceholder } from '@/lib/utils';
import { deleteCloudinaryAsset } from '@/lib/cloudinary';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { errorResponse } = await guardAdminApi(request);
  if (errorResponse) return errorResponse;

  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const { action, curatorNotes, room, featured, photoOfTheWeek } = body;

    await connectDB();
    const photo = await PhotoSubmission.findById(id);
    if (!photo) {
      return NextResponse.json({ error: 'Photo submission not found' }, { status: 404 });
    }

    if (action === 'approve') {
      photo.status = featured ? 'featured' : 'approved';
      photo.curatorNotes = curatorNotes || 'Approved for darkroom exhibition.';

      // Create permanent GalleryItem if not already created
      if (!photo.exhibitionItemId) {
        const galleryItem = await GalleryItem.create({
          caption: photo.title,
          story: photo.story || 'Captured by student lensman of Girijananda Chowdhury University.',
          photographer: `${photo.studentName} (${photo.department || 'GCU Student'})`,
          cameraInfo: photo.cameraInfo || 'Student Negative Exposure',
          room: room || photo.room || 'Campus Life',
          image: {
            url: photo.image.url,
            publicId: photo.image.publicId,
            width: photo.image.width || 1200,
            height: photo.image.height || 800,
            blurDataURL: photo.image.blurDataURL || getDarkroomBlurPlaceholder(16, 12),
          },
          featured: Boolean(featured),
          photoOfTheWeek: Boolean(photoOfTheWeek),
          status: 'published',
        });
        photo.exhibitionItemId = galleryItem._id;
      }
    } else if (action === 'reject') {
      photo.status = 'rejected';
      photo.curatorNotes = curatorNotes || 'Does not match current curatorial guidelines.';
    }

    await photo.save();

    revalidatePath('/');
    revalidatePath('/gallery');

    return NextResponse.json({
      success: true,
      photo,
      message:
        action === 'approve'
          ? 'Photograph approved and curated into darkroom exhibition!'
          : 'Submission status updated.',
    });
  } catch (error) {
    console.error('Update photo submission error:', error);
    return NextResponse.json(
      { error: 'Failed to update photo submission' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { errorResponse } = await guardAdminApi(request);
  if (errorResponse) return errorResponse;

  try {
    const { id } = await params;
    await connectDB();

    const photo = await PhotoSubmission.findById(id);
    if (!photo) {
      return NextResponse.json({ error: 'Photo submission not found' }, { status: 404 });
    }

    if (photo.image?.publicId) {
      await deleteCloudinaryAsset(photo.image.publicId).catch(() => {});
    }

    await PhotoSubmission.findByIdAndDelete(id);

    return NextResponse.json({ success: true, message: 'Photo submission permanently destroyed' });
  } catch (error) {
    console.error('Delete photo error:', error);
    return NextResponse.json(
      { error: 'Failed to delete submission' },
      { status: 500 }
    );
  }
}

