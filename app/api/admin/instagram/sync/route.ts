// File: app/api/admin/instagram/sync/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth';
import { syncInstagramGraphApi } from '@/lib/instagram';
import { AuditLog } from '@/lib/models/AuditLog';

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin(request);
    const result = await syncInstagramGraphApi();

    if (!result.success && result.syncedCount === 0) {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      );
    }

    if (result.syncedCount > 0) {
      await AuditLog.create({
        action: 'create',
        model: 'GalleryItem',
        adminEmail: admin.email,
        details: {
          source: 'Instagram Graph API Auto-Sync',
          syncedCount: result.syncedCount,
        },
      });

      revalidatePath('/');
      revalidatePath('/gallery');
    }

    return NextResponse.json({
      success: true,
      syncedCount: result.syncedCount,
      message: result.message,
    });
  } catch (error: unknown) {
    console.error('Instagram sync error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
