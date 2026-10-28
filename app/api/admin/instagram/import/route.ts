// File: app/api/admin/instagram/import/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth';
import { importInstagramPostToGallery } from '@/lib/instagram';
import { AuditLog } from '@/lib/models/AuditLog';

const ImportSchema = z.object({
  url: z.string().url('A valid Instagram post URL is required'),
  room: z.string().optional(),
  featured: z.boolean().optional(),
  photoOfTheWeek: z.boolean().optional(),
  customCaption: z.string().optional(),
  customPhotographer: z.string().optional(),
  manualImageUrl: z.string().optional(),
  manualPublicId: z.string().optional(),
  imageWidth: z.number().optional(),
  imageHeight: z.number().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin(request);
    const body = await request.json();
    const parsed = ImportSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid payload', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const result = await importInstagramPostToGallery(parsed.data.url, {
      room: parsed.data.room,
      featured: parsed.data.featured,
      photoOfTheWeek: parsed.data.photoOfTheWeek,
      customCaption: parsed.data.customCaption,
      customPhotographer: parsed.data.customPhotographer,
      manualImageUrl: parsed.data.manualImageUrl,
      manualPublicId: parsed.data.manualPublicId,
      imageWidth: parsed.data.imageWidth,
      imageHeight: parsed.data.imageHeight,
    });

    if (!result.success || !result.item) {
      return NextResponse.json(
        {
          error: result.error || 'Failed to import Instagram post',
          isUnavailable: result.isUnavailable,
        },
        { status: 422 }
      );
    }

    // Log the operation in the audit trail
    await AuditLog.create({
      action: 'create',
      model: 'GalleryItem',
      documentId: result.item._id,
      adminEmail: admin.email,
      details: {
        source: 'Instagram Import',
        url: parsed.data.url,
        caption: result.item.caption,
      },
    });

    // Revalidate public routes
    revalidatePath('/');
    revalidatePath('/gallery');

    return NextResponse.json({
      success: true,
      item: result.item,
    });
  } catch (error: unknown) {
    console.error('Instagram import API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
