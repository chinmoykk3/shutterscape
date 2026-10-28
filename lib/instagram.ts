// File: lib/instagram.ts
import { exec } from 'child_process';
import fs from 'fs';
import { connectDB } from '@/lib/db';
import { GalleryItem, IGalleryItem } from '@/lib/models/GalleryItem';
import { isCloudinaryConfigured, cloudinary } from '@/lib/cloudinary';
import { getDarkroomBlurPlaceholder } from '@/lib/utils';

export interface InstagramPostMetadata {
  shortcode: string;
  permalink: string;
  imageUrl: string;
  caption: string;
  photographer: string;
  room: string;
  timestamp?: Date;
  isUnavailable?: boolean;
}

/**
 * Extracts the 11-character shortcode from any valid Instagram post or reel URL.
 */
export function extractInstagramShortcode(url: string): string | null {
  try {
    const cleanUrl = url.trim();
    const match = cleanUrl.match(/\/(?:p|reel|tv)\/([A-Za-z0-9_-]+)/i);
    if (match) return match[1];

    // Handle raw shortcode input
    if (/^[A-Za-z0-9_-]{8,15}$/.test(cleanUrl)) {
      return cleanUrl;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Decodes HTML entities in scraped text (e.g. &quot;, &#x2014;).
 */
export function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#x2014;/g, '—')
    .replace(/&#x2013;/g, '–')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)));
}

/**
 * Automatically infers the darkroom exhibition room based on hashtags and keywords in the caption.
 */
export function inferRoomFromCaption(caption: string): string {
  const lower = caption.toLowerCase();

  if (lower.includes('#monochrome') || lower.includes('#blackandwhite') || lower.includes('#bnw')) {
    return 'Monochrome';
  }
  if (lower.includes('#street') || lower.includes('#streetphotography') || lower.includes('#urban')) {
    return 'Street';
  }
  if (lower.includes('#portrait') || lower.includes('#portraits') || lower.includes('#faces')) {
    return 'Portraits';
  }
  if (
    lower.includes('#nature') ||
    lower.includes('#landscape') ||
    lower.includes('#river') ||
    lower.includes('#sky') ||
    lower.includes('#sunset')
  ) {
    return 'Nature';
  }
  if (
    lower.includes('#campus') ||
    lower.includes('#gcu') ||
    lower.includes('#university') ||
    lower.includes('#college')
  ) {
    return 'Campus Life';
  }
  if (
    lower.includes('#activity') ||
    lower.includes('#activities') ||
    lower.includes('#workshop') ||
    lower.includes('#event')
  ) {
    return 'Activities';
  }

  return 'Campus Life';
}

/**
 * Extracts photographer attribution from caption if mentioned (e.g. "Captured by @username" or "Photo by Name").
 */
export function inferPhotographerFromCaption(caption: string): string {
  const captureMatch = caption.match(/(?:captured|shot|photographed|photo|frames?)\s+by\s+[@:]([^\n,\.]+)/i);
  if (captureMatch && captureMatch[1]) {
    return captureMatch[1].trim();
  }
  return 'ShutterScape Lensman (@shutterscape_gcu)';
}

/**
 * Tier 1: Scrapes metadata using OpenGraph social crawler user agents (Fast & resilient).
 */
async function scrapeViaOpenGraph(shortcode: string): Promise<Partial<InstagramPostMetadata> | null> {
  const url = `https://www.instagram.com/p/${shortcode}/`;
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      next: { revalidate: 0 },
    });

    const html = await res.text();
    const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1] : '';

    if (title.includes('unavailable') || title.includes('Page Not Found')) {
      return { isUnavailable: true };
    }

    const ogImg =
      html.match(/property="og:image"\s+content="([^">]+)"/i) ||
      html.match(/content="([^">]+)"\s+property="og:image"/i);
    const ogDesc =
      html.match(/property="og:description"\s+content="([^">]+)"/i) ||
      html.match(/content="([^">]+)"\s+property="og:description"/i);

    let imageUrl = ogImg ? ogImg[1].replace(/&amp;/g, '&') : '';
    let caption = '';

    if (ogDesc && ogDesc[1]) {
      const decodedDesc = decodeHtmlEntities(ogDesc[1]);
      const quoteMatch = decodedDesc.match(/:\s*["“]([\s\S]*?)["”]\s*\.?\s*$/);
      if (quoteMatch && quoteMatch[1]) {
        caption = quoteMatch[1].trim();
      } else {
        caption = decodedDesc.trim();
      }
    }

    if (imageUrl) {
      return { imageUrl, caption };
    }
  } catch (err) {
    console.warn(`Tier 1 OpenGraph scrape failed for ${shortcode}:`, err);
  }
  return null;
}

/**
 * Tier 2: Headless Chrome local DOM dumper for SPA-hydrated Instagram post data.
 */
async function scrapeViaChrome(shortcode: string): Promise<Partial<InstagramPostMetadata> | null> {
  const chromePath = process.env.CHROME_BIN || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  if (!fs.existsSync(chromePath)) {
    return null;
  }

  return new Promise((resolve) => {
    const url = `https://www.instagram.com/p/${shortcode}/`;
    const cmd = `"${chromePath}" --headless=new --disable-gpu --virtual-time-budget=6000 --dump-dom "${url}"`;

    exec(cmd, { maxBuffer: 10 * 1024 * 1024, timeout: 15000 }, (err, stdout) => {
      if (err || !stdout) {
        return resolve(null);
      }

      const titleMatch = stdout.match(/<title>([^<]+)<\/title>/i);
      const title = titleMatch ? titleMatch[1] : '';
      if (title.includes('unavailable') || title.includes('Page Not Found')) {
        return resolve({ isUnavailable: true });
      }

      let imageUrl = '';
      const dispMatch = stdout.match(/"display_uri":"([^"]+)"/) || stdout.match(/"display_url":"([^"]+)"/);
      if (dispMatch) {
        imageUrl = dispMatch[1].replace(/\\u0026/g, '&').replace(/\\/g, '');
      } else {
        const cdnMatch = stdout.match(/https:\/\/[^"'\s\\]+?(?:cdninstagram|fbcdn)[^"'\s\\]+?\.jpg[^"'\s\\]*/i);
        if (cdnMatch) {
          imageUrl = cdnMatch[0].replace(/\\u0026/g, '&').replace(/\\/g, '');
        }
      }

      let caption = '';
      const capMatch = stdout.match(/"caption":\{"text":"([^"]+)"\}/);
      if (capMatch) {
        try {
          caption = JSON.parse(`"${capMatch[1]}"`);
        } catch {
          caption = capMatch[1];
        }
      } else {
        const ogDesc = stdout.match(/property="og:description"\s+content="([^"]+)"/i);
        if (ogDesc) caption = decodeHtmlEntities(ogDesc[1]);
      }

      if (imageUrl) {
        return resolve({ imageUrl, caption });
      }
      resolve(null);
    });
  });
}

/**
 * Scrapes metadata from Instagram using a multi-tiered architecture (OpenGraph -> Headless Chrome -> Embed).
 */
export async function scrapeInstagramPost(shortcode: string): Promise<InstagramPostMetadata | null> {
  const permalink = `https://www.instagram.com/p/${shortcode}/`;

  // 1. Try Tier 1: OpenGraph with social crawler user agents
  const ogResult = await scrapeViaOpenGraph(shortcode);
  if (ogResult?.isUnavailable) {
    return {
      shortcode,
      permalink,
      imageUrl: '',
      caption: '',
      photographer: '',
      room: '',
      isUnavailable: true,
    };
  }
  if (ogResult?.imageUrl) {
    const caption = ogResult.caption || 'Photographed by ShutterScape GCU';
    return {
      shortcode,
      permalink,
      imageUrl: ogResult.imageUrl,
      caption,
      photographer: inferPhotographerFromCaption(caption),
      room: inferRoomFromCaption(caption),
      timestamp: new Date(),
    };
  }

  // 2. Try Tier 2: Headless Chrome local rendering
  const chromeResult = await scrapeViaChrome(shortcode);
  if (chromeResult?.isUnavailable) {
    return {
      shortcode,
      permalink,
      imageUrl: '',
      caption: '',
      photographer: '',
      room: '',
      isUnavailable: true,
    };
  }
  if (chromeResult?.imageUrl) {
    const caption = chromeResult.caption || 'Photographed by ShutterScape GCU';
    return {
      shortcode,
      permalink,
      imageUrl: chromeResult.imageUrl,
      caption,
      photographer: inferPhotographerFromCaption(caption),
      room: inferRoomFromCaption(caption),
      timestamp: new Date(),
    };
  }

  return null;
}

/**
 * Imports an Instagram post by URL or manual fallback, archives asset to Cloudinary, and saves to MongoDB GalleryItem.
 */
export async function importInstagramPostToGallery(
  url: string,
  options: {
    room?: string;
    featured?: boolean;
    photoOfTheWeek?: boolean;
    customCaption?: string;
    customPhotographer?: string;
    manualImageUrl?: string;
    manualPublicId?: string;
    imageWidth?: number;
    imageHeight?: number;
  } = {}
): Promise<{ success: boolean; item?: IGalleryItem; error?: string; isUnavailable?: boolean }> {
  await connectDB();

  const shortcode = extractInstagramShortcode(url);
  if (!shortcode) {
    return { success: false, error: 'Invalid Instagram post URL. Please provide a link like https://www.instagram.com/p/...' };
  }

  // Check if already imported
  const existing = await GalleryItem.findOne({ instagramId: shortcode });
  if (existing) {
    return {
      success: true,
      item: existing,
      error: 'This photograph has already been imported into the darkroom gallery.',
    };
  }

  let finalImageUrl = options.manualImageUrl || '';
  let caption = options.customCaption || '';
  let photographer = options.customPhotographer || '';
  let room = options.room || 'Campus Life';

  // If manual image was not provided, attempt automated scraping
  if (!finalImageUrl) {
    const meta = await scrapeInstagramPost(shortcode);
    if (!meta || !meta.imageUrl) {
      if (meta?.isUnavailable) {
        return {
          success: false,
          isUnavailable: true,
          error: 'This Instagram post is unavailable, private, or has been deleted by Meta. You can manually attach the photograph below.',
        };
      }
      return {
        success: false,
        error: 'Unable to extract photograph automatically from Meta. You can manually attach the photograph to curate this post.',
      };
    }

    finalImageUrl = meta.imageUrl;
    caption = caption || meta.caption;
    photographer = photographer || meta.photographer;
    room = options.room || meta.room || 'Campus Life';
  } else {
    caption = caption || 'Photographed by ShutterScape GCU';
    photographer = photographer || 'ShutterScape Lensman (@shutterscape_gcu)';
  }

  // Upload/archive image to Cloudinary to make it permanent (since Instagram CDN links expire)
  let publicId = options.manualPublicId || `instagram_${shortcode}`;
  let width = options.imageWidth || 1080;
  let height = options.imageHeight || 1350; // Standard portrait aspect ratio

  if (isCloudinaryConfigured() && !finalImageUrl.includes('cloudinary.com')) {
    try {
      const uploadRes = await cloudinary.uploader.upload(finalImageUrl, {
        folder: 'shutterscape/instagram',
        public_id: `ig_${shortcode}`,
        overwrite: true,
        resource_type: 'image',
      });
      finalImageUrl = uploadRes.secure_url;
      publicId = uploadRes.public_id;
      width = uploadRes.width;
      height = uploadRes.height;
    } catch (uploadError) {
      console.warn('Cloudinary archival failed, keeping direct image URL:', uploadError);
    }
  }

  const newItem = await GalleryItem.create({
    image: {
      url: finalImageUrl,
      publicId,
      width,
      height,
      blurDataURL: getDarkroomBlurPlaceholder(16, Math.round((16 * height) / width) || 12),
      focalPoint: { x: 0.5, y: 0.5 },
    },
    caption,
    photographer,
    cameraInfo: 'Instagram Feed • @shutterscape_gcu',
    room,
    instagramUrl: `https://www.instagram.com/p/${shortcode}/`,
    instagramId: shortcode,
    featured: Boolean(options.featured),
    photoOfTheWeek: Boolean(options.photoOfTheWeek),
    status: 'published',
  });

  return { success: true, item: newItem };
}

/**
 * Syncs recent media using the official Meta Instagram Graph API (if INSTAGRAM_ACCESS_TOKEN is configured).
 */
export async function syncInstagramGraphApi(): Promise<{
  success: boolean;
  syncedCount: number;
  message: string;
}> {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  if (!token) {
    return {
      success: false,
      syncedCount: 0,
      message: 'INSTAGRAM_ACCESS_TOKEN not configured in environment. Use the 1-Click Post Importer.',
    };
  }

  await connectDB();

  try {
    const res = await fetch(
      `https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,permalink,thumbnail_url,timestamp&access_token=${token}`,
      { next: { revalidate: 0 } }
    );

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return {
        success: false,
        syncedCount: 0,
        message: errData.error?.message || `Instagram API error: ${res.statusText}`,
      };
    }

    const json = await res.json();
    const mediaList = json.data || [];
    let imported = 0;

    for (const post of mediaList) {
      // Only process images and carousel albums
      if (post.media_type !== 'IMAGE' && post.media_type !== 'CAROUSEL_ALBUM') continue;

      const shortcode = extractInstagramShortcode(post.permalink) || post.id;
      const exists = await GalleryItem.findOne({ instagramId: shortcode });
      if (exists) continue;

      const mediaUrl = post.media_url || post.thumbnail_url;
      if (!mediaUrl) continue;

      let finalUrl = mediaUrl;
      let publicId = `instagram_${shortcode}`;
      let width = 1080;
      let height = 1350;

      if (isCloudinaryConfigured()) {
        try {
          const uploadRes = await cloudinary.uploader.upload(mediaUrl, {
            folder: 'shutterscape/instagram',
            public_id: `ig_${shortcode}`,
            overwrite: true,
          });
          finalUrl = uploadRes.secure_url;
          publicId = uploadRes.public_id;
          width = uploadRes.width;
          height = uploadRes.height;
        } catch {
          // fallback to mediaUrl
        }
      }

      const caption = post.caption || 'Photo from @shutterscape_gcu';
      const photographer = inferPhotographerFromCaption(caption);
      const room = inferRoomFromCaption(caption);

      await GalleryItem.create({
        image: {
          url: finalUrl,
          publicId,
          width,
          height,
          blurDataURL: getDarkroomBlurPlaceholder(16, 12),
        },
        caption,
        photographer,
        cameraInfo: 'Instagram Feed • @shutterscape_gcu',
        room,
        instagramUrl: post.permalink,
        instagramId: shortcode,
        featured: false,
        photoOfTheWeek: false,
        status: 'published',
      });

      imported++;
    }

    return {
      success: true,
      syncedCount: imported,
      message: `Successfully synchronized ${imported} new exposures from @shutterscape_gcu.`,
    };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error during Instagram sync';
    return { success: false, syncedCount: 0, message: msg };
  }
}
