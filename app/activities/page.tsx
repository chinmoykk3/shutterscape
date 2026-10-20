import React from 'react';
import { Metadata } from 'next';
import { connectDB } from '@/lib/db';
import { Activity, IActivity } from '@/lib/models/Activity';
import { Badge } from '@/components/ui/Badge';
import { CameraReadout } from '@/components/story/CameraReadout';
import {
  FilmRollTimeline,
  YearGroupedActivities,
} from '@/components/activities/FilmRollTimeline';
import { UpcomingActivityItem } from '@/components/activities/UnexposedUpcomingCard';
import { FilmFrameItem } from '@/components/activities/FilmFrameCard';
import { sanitizeHtmlContent } from '@/lib/security';

export const revalidate = 60; // ISR cache every 60s

export const metadata: Metadata = {
  title: 'Activities Film Roll | ShutterScape GCU',
  description:
    'A continuous vertical 35mm film roll documenting upcoming photowalks and past photographic expeditions at Girijananda Chowdhury University.',
  openGraph: {
    title: 'Activities Film Roll // ShutterScape GCU',
    description:
      'A continuous vertical 35mm film roll documenting upcoming photowalks and past photographic expeditions at Girijananda Chowdhury University.',
  },
};

async function getFilmRollData(): Promise<{
  upcomingActivities: UpcomingActivityItem[];
  yearGroups: YearGroupedActivities[];
}> {
  try {
    await connectDB();
    const docs = await Activity.find({ status: 'published' })
      .sort({ date: -1 })
      .lean<IActivity[]>();

    const now = Date.now();

    const upcomingActivities: UpcomingActivityItem[] = [];
    const archivedActivities: FilmFrameItem[] = [];

    // Sanitize and partition
    docs.forEach((doc) => {
      const parsed = JSON.parse(JSON.stringify(doc));
      const eventTime = new Date(parsed.date).getTime();
      const sanitizedHtml = sanitizeHtmlContent(parsed.descriptionHtml || '');

      const item = {
        ...parsed,
        descriptionHtml: sanitizedHtml,
      };

      if (eventTime > now) {
        upcomingActivities.push(item);
      } else {
        archivedActivities.push(item);
      }
    });

    // Upcoming sorted soonest first
    upcomingActivities.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Group archived by year (newest first)
    const yearMap = new Map<number, FilmFrameItem[]>();

    archivedActivities.forEach((activity) => {
      const year = new Date(activity.date).getFullYear();
      if (!yearMap.has(year)) {
        yearMap.set(year, []);
      }
      yearMap.get(year)!.push(activity);
    });

    const sortedYears = Array.from(yearMap.keys()).sort((a, b) => b - a);

    const yearGroups: YearGroupedActivities[] = sortedYears.map((year) => ({
      year,
      activities: yearMap.get(year)!,
    }));

    return { upcomingActivities, yearGroups };
  } catch (error) {
    console.error('Failed to query film roll activities:', error);
    return { upcomingActivities: [], yearGroups: [] };
  }
}

export default async function ActivitiesPage() {
  const { upcomingActivities, yearGroups } = await getFilmRollData();

  return (
    <div className="relative min-h-screen py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16">
      {/* Ambient Darkroom Lighting */}
      <div className="absolute top-10 left-1/3 w-[500px] h-[400px] rounded-full light-leak-amber blur-[150px] pointer-events-none" />
      <div className="absolute top-1/2 right-10 w-[450px] h-[450px] rounded-full light-leak-safelight blur-[160px] pointer-events-none" />

      {/* Hero Header */}
      <header className="relative z-10 text-center max-w-3xl mx-auto space-y-6 pt-8">
        <div className="flex flex-col items-center gap-3">
          <Badge variant="amber">
            {'● CHAPTER 02 // 35MM CONTINUOUS STRIP'}
          </Badge>
          <CameraReadout
            aperture="f/2.8"
            shutter="1/500s"
            iso="TRI-X 400"
            mode="ROLL 02"
          />
        </div>

        <div className="space-y-3">
          <h1 className="font-title text-4xl sm:text-5xl md:text-6xl font-black text-offwhite tracking-tight leading-[1.1]">
            The Activities Film Roll
          </h1>
          <p className="font-mono text-sm sm:text-base text-offwhite-muted max-w-2xl mx-auto">
            A vertical 35mm strip with sprocket holes and negative frames. Upcoming assignments
            remain unexposed at the top until scheduled, followed by our archived expeditions
            arranged by year roll.
          </p>
        </div>
      </header>

      {/* Main 35mm Strip Timeline */}
      <section aria-label="35mm Film Roll Timeline" className="relative z-10">
        <FilmRollTimeline
          upcomingActivities={upcomingActivities}
          yearGroups={yearGroups}
        />
      </section>
    </div>
  );
}
