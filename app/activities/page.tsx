import React from 'react';
import { Metadata } from 'next';
import Image from 'next/image';
import { Calendar, MapPin, ArrowRight, Sparkles, ExternalLink } from 'lucide-react';
import { connectDB } from '@/lib/db';
import { Activity, IActivity } from '@/lib/models/Activity';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Countdown } from '@/components/ui/Countdown';
import { CameraReadout } from '@/components/story/CameraReadout';
import { ActivitiesView, ActivityData } from '@/components/activities/ActivitiesView';
import { getDarkroomBlurPlaceholder } from '@/lib/utils';

export const revalidate = 60; // ISR cache every 60s

export const metadata: Metadata = {
  title: 'Activities & Expeditions | ShutterScape GCU',
  description:
    'Explore upcoming photowalks, workshops, campus exhibitions, and field expeditions by ShutterScape, the official photography club of Girijananda Chowdhury University.',
  openGraph: {
    title: 'Activities & Expeditions // ShutterScape GCU',
    description:
      'Explore upcoming photowalks, workshops, campus exhibitions, and field expeditions by ShutterScape.',
  },
};

async function getActivities(): Promise<{
  activities: ActivityData[];
  nextUpcoming: ActivityData | null;
}> {
  try {
    await connectDB();
    const docs = await Activity.find({ status: 'published' })
      .sort({ date: -1 })
      .lean<IActivity[]>();

    const now = Date.now();
    const activities: ActivityData[] = docs.map((doc) => {
      const parsed = JSON.parse(JSON.stringify(doc));
      return {
        ...parsed,
        isUpcoming: new Date(parsed.date).getTime() > now,
      };
    });

    // Find the closest upcoming event
    const upcomingEvents = activities
      .filter((a) => a.isUpcoming)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const nextUpcoming = upcomingEvents[0] || null;

    return { activities, nextUpcoming };
  } catch (error) {
    console.error('Failed to query activities:', error);
    return { activities: [], nextUpcoming: null };
  }
}

export default async function ActivitiesPage() {
  const { activities, nextUpcoming } = await getActivities();

  return (
    <div className="relative min-h-screen py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16">
      {/* Ambient Darkroom Lighting */}
      <div className="absolute top-10 left-1/3 w-[500px] h-[400px] rounded-full light-leak-amber blur-[150px] pointer-events-none" />
      <div className="absolute top-1/2 right-10 w-[450px] h-[450px] rounded-full light-leak-safelight blur-[160px] pointer-events-none" />

      {/* Hero Header */}
      <header className="relative z-10 text-center max-w-3xl mx-auto space-y-6 pt-8">
        <div className="flex flex-col items-center gap-3">
          <Badge variant="amber">
            {'● CHAPTER 02 // FIELD EXPEDITIONS'}
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
            The Field Expeditions &amp; Roll Archive
          </h1>
          <p className="font-mono text-sm sm:text-base text-offwhite-muted max-w-2xl mx-auto">
            From rural tea garden photowalks to darkroom silver gelatin printmaking.
            Each assignment is documented as a negative in our university roll manifest.
          </p>
        </div>
      </header>

      {/* Next Upcoming Event Spotlight (if available) */}
      {nextUpcoming && (
        <section aria-labelledby="featured-upcoming-heading" className="relative z-10">
          <div className="p-1 rounded-3xl bg-gradient-to-r from-amber/40 via-charcoal-border to-safelight/40 shadow-[0_0_50px_rgba(245,158,11,0.12)]">
            <div className="bg-charcoal/95 backdrop-blur-2xl rounded-[22px] p-6 sm:p-8 lg:p-10 border border-charcoal-border">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                {/* Left Poster Image */}
                <div className="lg:col-span-5 relative aspect-[16/11] rounded-2xl overflow-hidden border border-charcoal-border group">
                  <Image
                    src={nextUpcoming.image?.url || 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1200'}
                    alt={nextUpcoming.title}
                    fill
                    placeholder="blur"
                    blurDataURL={nextUpcoming.image?.blurDataURL || getDarkroomBlurPlaceholder(16, 11)}
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <div className="absolute top-3 left-3">
                    <Badge variant="amber" className="shadow-lg backdrop-blur-md">
                      <Sparkles className="w-3 h-3 mr-1" />
                      NEXT SCHEDULED EVENT
                    </Badge>
                  </div>
                </div>

                {/* Right Event Dossier */}
                <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-amber">
                      <span className="flex items-center gap-1.5 bg-amber/10 px-3 py-1 rounded-full border border-amber/30">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(nextUpcoming.date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                      {nextUpcoming.venue && (
                        <span className="flex items-center gap-1.5 text-offwhite-dim bg-white/5 px-3 py-1 rounded-full border border-charcoal-border">
                          <MapPin className="w-3.5 h-3.5" />
                          {nextUpcoming.venue}
                        </span>
                      )}
                    </div>

                    <h2
                      id="featured-upcoming-heading"
                      className="font-title text-2xl sm:text-3xl md:text-4xl font-bold text-offwhite leading-tight"
                    >
                      {nextUpcoming.title}
                    </h2>

                    {nextUpcoming.pullQuote && (
                      <p className="text-sm md:text-base text-offwhite-muted italic border-l-2 border-amber pl-4">
                        &ldquo;{nextUpcoming.pullQuote}&rdquo;
                      </p>
                    )}
                  </div>

                  {/* Countdown Readout */}
                  <div className="pt-2">
                    <Countdown targetDate={nextUpcoming.date} />
                  </div>

                  {/* CTAs */}
                  <div className="flex flex-wrap items-center gap-4 pt-2">
                    <Button
                      href={`/activities/${nextUpcoming.slug}`}
                      variant="primary"
                      className="gap-2"
                    >
                      Examine Roll Dossier <ArrowRight className="w-4 h-4" />
                    </Button>

                    {nextUpcoming.registrationLink && (
                      <Button
                        href={nextUpcoming.registrationLink}
                        isExternal
                        variant="outline"
                        className="gap-2"
                      >
                        Secure Seat / Register <ExternalLink className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Main Activities Collection Timeline */}
      <section aria-labelledby="all-rolls-heading" className="relative z-10 space-y-6">
        <div className="flex items-center justify-between border-b border-charcoal-border pb-4">
          <div>
            <h2 id="all-rolls-heading" className="font-title text-2xl font-bold text-offwhite">
              Roll Manifest Directory
            </h2>
            <p className="font-mono text-xs text-offwhite-dim">
              Chronological ledger of past and scheduled campus photography assignments.
            </p>
          </div>
        </div>

        <ActivitiesView initialActivities={activities} />
      </section>
    </div>
  );
}
