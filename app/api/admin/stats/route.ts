import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import { Activity } from '@/lib/models/Activity';
import { GalleryItem } from '@/lib/models/GalleryItem';
import { Member } from '@/lib/models/Member';
import { StoryScene } from '@/lib/models/StoryScene';
import { Submission } from '@/lib/models/Submission';
import { PhotoStory } from '@/lib/models/PhotoStory';
import { AuditLog } from '@/lib/models/AuditLog';
import '@/lib/models/Admin'; // Register Admin model for Mongoose populate

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
    await connectToDatabase();

    const [
      totalActivities,
      publishedActivities,
      totalGallery,
      publishedGallery,
      totalMembers,
      activeMembers,
      totalScenes,
      unhandledSubmissions,
      totalStories,
      recentAuditLogs,
    ] = await Promise.all([
      Activity.countDocuments(),
      Activity.countDocuments({ status: 'published' }),
      GalleryItem.countDocuments(),
      GalleryItem.countDocuments({ status: 'published' }),
      Member.countDocuments(),
      Member.countDocuments({ status: 'active' }),
      StoryScene.countDocuments(),
      Submission.countDocuments({ handled: false }),
      PhotoStory.countDocuments(),
      AuditLog.find()
        .sort({ timestamp: -1 })
        .limit(6)
        .populate('adminId', 'name email')
        .lean(),
    ]);

    return NextResponse.json({
      success: true,
      stats: {
        activities: { total: totalActivities, published: publishedActivities },
        gallery: { total: totalGallery, published: publishedGallery },
        members: { total: totalMembers, active: activeMembers },
        scenes: { total: totalScenes },
        submissions: { unhandled: unhandledSubmissions },
        stories: { total: totalStories },
      },
      recentLogs: recentAuditLogs,
    });
  } catch (error: any) {
    if (error?.message?.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to fetch dashboard stats' }, { status: 500 });
  }
}
