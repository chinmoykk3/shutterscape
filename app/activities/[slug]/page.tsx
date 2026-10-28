import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Calendar, MapPin, ArrowLeft, Clock, ExternalLink, Sparkles } from 'lucide-react';
import { connectDB } from '@/lib/db';
import { Activity, IActivity } from '@/lib/models/Activity';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Countdown } from '@/components/ui/Countdown';
import { CameraReadout } from '@/components/story/CameraReadout';
import { ShareButton } from '@/components/activities/ShareButton';
import { ActivityCard } from '@/components/activities/ActivityCard';
import { ActivityPhotoGallery } from '@/components/activities/ActivityPhotoGallery';
import { getDarkroomBlurPlaceholder } from '@/lib/utils';

export const revalidate = 60; // ISR cache every 60s

interface ActivityPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  try {
    await connectDB();
    const activities = await Activity.find({ status: 'published' }).select('slug').lean<{ slug: string }[]>();
    return activities.map((a) => ({ slug: a.slug }));
  } catch {
    return [];
  }
}

async function getActivityDetails(slug: string) {
  await connectDB();
  const activityDoc = await Activity.findOne({ slug, status: 'published' }).lean<IActivity | null>();
  if (!activityDoc) return null;

  const activity = JSON.parse(JSON.stringify(activityDoc));
  const isUpcoming = new Date(activity.date).getTime() > Date.now();

  const otherActivitiesDocs = await Activity.find({
    status: 'published',
    slug: { $ne: slug },
  })
    .sort({ date: -1 })
    .limit(3)
    .lean<IActivity[]>();

  const otherActivities = otherActivitiesDocs.map((doc) => {
    const parsed = JSON.parse(JSON.stringify(doc));
    return {
      ...parsed,
      isUpcoming: new Date(parsed.date).getTime() > Date.now(),
    };
  });

  return {
    activity,
    isUpcoming,
    otherActivities,
  };
}

export async function generateMetadata({ params }: ActivityPageProps): Promise<Metadata> {
  const { slug } = await params;
  await connectDB();
  const activity = await Activity.findOne({ slug, status: 'published' }).lean<IActivity | null>();

  if (!activity) {
    return {
      title: 'Roll Not Found | ShutterScape GCU',
    };
  }

  return {
    title: `${activity.title} | ShutterScape GCU`,
    description: activity.pullQuote || 'A photographic assignment and story by ShutterScape at Girijananda Chowdhury University.',
    openGraph: {
      title: `${activity.title} // ShutterScape Roll Archive`,
      description: activity.pullQuote || 'A photographic assignment and story by ShutterScape.',
      images: activity.image?.url ? [{ url: activity.image.url }] : [],
    },
  };
}

export default async function SingleActivityPage({ params }: ActivityPageProps) {
  const { slug } = await params;
  const data = await getActivityDetails(slug);

  if (!data) {
    notFound();
  }

  const { activity, isUpcoming, otherActivities } = data;
  const eventDate = new Date(activity.date);

  const formattedDate = eventDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const formattedTime = eventDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://shutterscape.gcuniversity.ac.in';
  const eventJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: activity.title,
    description: activity.pullQuote || activity.title,
    startDate: activity.date,
    endDate: activity.endDate || activity.date,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: {
      '@type': 'Place',
      name: activity.venue || 'Girijananda Chowdhury University (GCU) Campus',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Guwahati',
        addressRegion: 'Assam',
        addressCountry: 'IN',
      },
    },
    image: activity.image?.url ? [activity.image.url] : [],
    organizer: {
      '@type': 'Organization',
      name: 'ShutterScape Photography Club GCU',
      url: siteUrl,
    },
    url: `${siteUrl}/activities/${activity.slug}`,
  };

  return (
    <article className="relative min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-12">
      {/* Event Schema Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventJsonLd) }}
      />

      {/* Light Leaks */}
      <div className="absolute top-20 right-1/4 w-[450px] h-[450px] rounded-full light-leak-amber blur-[150px] pointer-events-none" />
      <div className="absolute top-2/3 left-10 w-[400px] h-[400px] rounded-full light-leak-safelight blur-[160px] pointer-events-none" />

      {/* Breadcrumb Navigation & Top Action Bar */}
      <nav aria-label="Breadcrumb" className="relative z-10 flex flex-wrap items-center justify-between gap-4 pt-4 border-b border-charcoal-border pb-4">
        <Link
          href="/activities"
          className="inline-flex items-center gap-2 text-xs font-mono text-offwhite-dim hover:text-amber transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>← Return to Roll Manifest</span>
        </Link>

        <div className="flex items-center gap-3">
          <Badge variant={isUpcoming ? 'amber' : 'neutral'}>
            {isUpcoming ? '● UPCOMING EXPEDITION' : 'ARCHIVED NEGATIVE'}
          </Badge>
          <ShareButton title={activity.title} />
        </div>
      </nav>

      {/* Header Readout & Title */}
      <header className="relative z-10 space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <CameraReadout
            aperture="f/2.0"
            shutter="1/500s"
            iso="ISO 400"
            mode="FIELD EXPOSURE"
          />
        </div>

        <h1 className="font-title text-3xl sm:text-5xl md:text-6xl font-black text-offwhite tracking-tight leading-[1.12]">
          {activity.title}
        </h1>

        {/* Telemetry Bar */}
        <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-xs sm:text-sm font-mono text-offwhite-dim bg-charcoal/90 p-4 rounded-2xl border border-charcoal-border">
          <div className="flex items-center gap-2 text-amber font-medium">
            <Calendar className="w-4 h-4" />
            <span>{formattedDate}</span>
          </div>

          <div className="flex items-center gap-2 text-offwhite-muted">
            <Clock className="w-4 h-4" />
            <span>{formattedTime}</span>
          </div>

          {activity.venue && (
            <div className="flex items-center gap-2 text-offwhite-muted">
              <MapPin className="w-4 h-4 text-safelight" />
              <span>{activity.venue}</span>
            </div>
          )}
        </div>
      </header>

      {/* Viewfinder Main Image Display */}
      <div className="relative z-10 space-y-2">
        <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full rounded-2xl overflow-hidden border-2 border-charcoal-border bg-black shadow-2xl group">
          <Image
            src={activity.image?.url || 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1600'}
            alt={activity.title}
            fill
            priority
            placeholder="blur"
            blurDataURL={activity.image?.blurDataURL || getDarkroomBlurPlaceholder(16, 9)}
            className="object-cover"
          />

          {/* Viewfinder Corner Overlays */}
          <div className="pointer-events-none absolute inset-4 rounded-xl border border-white/10">
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-amber" />
            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-amber" />
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-amber" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-amber" />

            {/* Crosshair Center */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 opacity-60">
              <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-amber/70" />
              <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-amber/70" />
              <div className="absolute inset-1.5 rounded-full border border-amber/50" />
            </div>

            {/* Bottom HUD bar on image */}
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] font-mono text-offwhite-dim bg-black/75 backdrop-blur-md px-3 py-1.5 rounded-lg border border-charcoal-border">
              <span className="text-amber">KODAK TRI-X 400 EXP</span>
              <span className="uppercase">ShutterScape Field Expedition</span>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Event Action Box */}
      {isUpcoming && (
        <section
          aria-labelledby="registration-box-heading"
          className="relative z-10 p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-charcoal via-charcoal to-black border-2 border-amber/30 space-y-6 shadow-xl"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-amber text-xs font-mono font-bold uppercase tracking-wider">
                <Sparkles className="w-4 h-4" />
                Live Countdown to Expedition
              </div>
              <h2 id="registration-box-heading" className="font-title text-xl font-bold text-offwhite">
                Registration is currently active
              </h2>
            </div>

            {activity.registrationLink && (
              <Button
                href={activity.registrationLink}
                isExternal
                variant="primary"
                className="gap-2 self-start sm:self-auto"
              >
                Secure Your Spot <ExternalLink className="w-4 h-4" />
              </Button>
            )}
          </div>

          <div className="pt-2">
            <Countdown targetDate={activity.date} />
          </div>
        </section>
      )}

      {/* Editorial Pull Quote */}
      {activity.pullQuote && (
        <blockquote className="relative z-10 border-l-4 border-safelight bg-charcoal/60 p-6 sm:p-8 rounded-r-2xl border-y border-r border-charcoal-border font-serif text-lg sm:text-2xl text-offwhite italic leading-relaxed">
          &ldquo;{activity.pullQuote}&rdquo;
        </blockquote>
      )}

      {/* Rich Text Event Dossier Body */}
      <section aria-labelledby="activity-story-heading" className="relative z-10 space-y-6">
        <h2 id="activity-story-heading" className="font-title text-2xl font-bold text-offwhite border-b border-charcoal-border pb-3">
          Assignment Brief &amp; Story
        </h2>

        {/* Cleanly Styled Darkroom Prose */}
        <div
          className="prose prose-invert prose-amber max-w-none text-offwhite-muted leading-relaxed font-sans
            prose-headings:font-title prose-headings:text-offwhite prose-headings:tracking-tight
            prose-p:mb-4 prose-p:text-base sm:prose-p:text-lg
            prose-a:text-amber prose-a:underline hover:prose-a:text-amber-light
            prose-strong:text-offwhite prose-strong:font-bold
            prose-ul:list-disc prose-ul:pl-6 prose-li:my-1
            prose-blockquote:border-l-amber prose-blockquote:text-offwhite-dim"
          dangerouslySetInnerHTML={{ __html: activity.descriptionHtml }}
        />
      </section>

      {/* 35mm Event Negatives & Multi-Photo Gallery */}
      {activity.gallery && activity.gallery.length > 0 && (
        <ActivityPhotoGallery
          photos={activity.gallery}
          eventTitle={activity.title}
        />
      )}

      {/* More Field Rolls Footer Showcase */}
      {otherActivities.length > 0 && (
        <section aria-labelledby="other-rolls-heading" className="relative z-10 pt-12 border-t border-charcoal-border space-y-6">
          <div className="flex items-center justify-between">
            <h3 id="other-rolls-heading" className="font-title text-2xl font-bold text-offwhite">
              More From The Manifest
            </h3>
            <Link
              href="/activities"
              className="text-xs font-mono text-amber hover:underline flex items-center gap-1"
            >
              View Full Roll Archive →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {otherActivities.map((other: IActivity, idx: number) => (
              <ActivityCard
                key={other._id.toString()}
                activity={JSON.parse(JSON.stringify(other))}
                frameIndex={idx + 1}
              />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
