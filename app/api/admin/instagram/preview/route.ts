// File: app/api/admin/instagram/preview/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/auth';
import { extractInstagramShortcode, scrapeInstagramPost } from '@/lib/instagram';
import { GalleryItem } from '@/lib/models/GalleryItem';
import { connectDB } from '@/lib/db';

const PreviewSchema = z.object({
  url: z.string().url('A valid Instagram post URL is required'),
});

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request);
    const body = await request.json();
    const parsed = PreviewSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid URL provided' }, { status: 400 });
    }

    const shortcode = extractInstagramShortcode(parsed.data.url);
    if (!shortcode) {
      return NextResponse.json({ error: 'Could not extract Instagram shortcode from URL' }, { status: 400 });
    }

    await connectDB();
    const existing = await GalleryItem.findOne({ instagramId: shortcode });

    const meta = await scrapeInstagramPost(shortcode);

    if (!meta || !meta.imageUrl) {
      return NextResponse.json({
        success: false,
        shortcode,
        isUnavailable: Boolean(meta?.isUnavailable),
        alreadyImported: Boolean(existing),
        error: meta?.isUnavailable
          ? 'This Instagram post is unavailable, private, or deleted on Meta. You can manually attach the photograph.'
          : 'Unable to extract photograph automatically from Meta. You can manually attach the photograph.',
      });
    }

    return NextResponse.json({
      success: true,
      metadata: meta,
      alreadyImported: Boolean(existing),
      existingItemId: existing?._id,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to preview post' },
      { status: 500 }
    );
  }
}

