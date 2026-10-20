'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  Calendar,
  MapPin,
  ExternalLink,
  ArrowRight,
  Sparkles,
  Eye,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Countdown } from '@/components/ui/Countdown';
import { getDarkroomBlurPlaceholder } from '@/lib/utils';

export interface UpcomingActivityItem {
  _id: string;
  title: string;
  slug: string;
  date: string;
  endDate?: string;
  venue?: string;
  descriptionHtml: string;
  pullQuote?: string;
  image: {
    url: string;
    publicId: string;
    blurDataURL?: string;
  };
  registrationLink?: string;
  status: 'draft' | 'published';
}

interface UnexposedUpcomingCardProps {
  activity: UpcomingActivityItem;
  frameNumber?: string;
}

export function UnexposedUpcomingCard({
  activity,
  frameNumber = 'EXP. 01 (UNEXPOSED)',
}: UnexposedUpcomingCardProps) {
  const [isDeveloped, setIsDeveloped] = useState(false);

  const eventDate = new Date(activity.date);
  const formattedDate = eventDate.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const formattedTime = eventDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <article
      onMouseEnter={() => setIsDeveloped(true)}
      onMouseLeave={() => setIsDeveloped(false)}
      onClick={() => setIsDeveloped((prev) => !prev)}
      className="group relative rounded-3xl bg-charcoal/95 border-2 border-amber/50 shadow-[0_0_50px_rgba(245,158,11,0.22)] overflow-hidden transition-all duration-500 hover:border-amber hover:shadow-[0_0_70px_rgba(245,158,11,0.35)] cursor-pointer"
    >
      {/* 35mm Canister Edge Header */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-2.5 bg-black/90 border-b border-charcoal-border font-mono text-[11px] text-offwhite-dim">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber animate-pulse" />
          <span className="text-amber font-bold tracking-widest uppercase">
            LATENT NEGATIVE // AWAITING EXPOSURE
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline text-offwhite-dim text-[10px]">
            HOVER OR TAP TO DEVELOP
          </span>
          <span className="text-offwhite font-bold bg-amber/20 px-2 py-0.5 rounded border border-amber/40 text-[10px]">
            {frameNumber}
          </span>
        </div>
      </div>

      <div className="p-6 sm:p-8 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Cover Image: Develop-on-hover / tap state */}
          <div className="lg:col-span-5 relative aspect-[16/11] rounded-2xl overflow-hidden border border-charcoal-border bg-black group-hover:border-amber/50 transition-colors">
            <Image
              src={activity.image?.url || 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1200'}
              alt={activity.title}
              fill
              placeholder="blur"
              blurDataURL={activity.image?.blurDataURL || getDarkroomBlurPlaceholder(16, 11)}
              className={`object-cover transition-all duration-700 ease-out ${
                isDeveloped
                  ? 'grayscale-0 blur-0 scale-100 brightness-100'
                  : 'grayscale blur-md scale-105 brightness-75'
              }`}
            />

            {/* Developing State Indicator Badge */}
            <div className="absolute top-3 left-3 z-10">
              <Badge variant="amber" className="shadow-lg backdrop-blur-md text-[10px]">
                <Sparkles className="w-3 h-3 mr-1" />
                {isDeveloped ? 'DEVELOPED CHEMICAL PRINT' : 'LATENT IMAGE (HOVER)'}
              </Badge>
            </div>

            {/* Hint overlay when undeveloped */}
            {!isDeveloped && (
              <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px] flex items-center justify-center pointer-events-none transition-opacity">
                <div className="flex items-center gap-2 bg-black/85 px-3 py-1.5 rounded-full border border-amber/40 text-[11px] font-mono text-amber">
                  <Eye className="w-3.5 h-3.5" />
                  <span>Reveal Latent Print</span>
                </div>
              </div>
            )}
          </div>

          {/* Dossier Content & Countdown */}
          <div className="lg:col-span-7 space-y-5">
            <div className="space-y-3">
              {/* Telemetry metadata */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs font-mono text-amber">
                <span className="flex items-center gap-1.5 bg-amber/10 px-3 py-1 rounded-full border border-amber/30">
                  <Calendar className="w-3.5 h-3.5" />
                  {formattedDate} • {formattedTime}
                </span>
                {activity.venue && (
                  <span className="flex items-center gap-1.5 text-offwhite-dim bg-white/5 px-3 py-1 rounded-full border border-charcoal-border">
                    <MapPin className="w-3.5 h-3.5 text-safelight" />
                    {activity.venue}
                  </span>
                )}
              </div>

              {/* Title */}
              <h3 className="font-title text-2xl sm:text-3xl font-bold text-offwhite leading-tight group-hover:text-amber transition-colors">
                {activity.title}
              </h3>

              {/* Editorial Pull Quote */}
              {activity.pullQuote && (
                <blockquote className="text-sm sm:text-base text-offwhite-muted italic border-l-2 border-amber pl-4">
                  &ldquo;{activity.pullQuote}&rdquo;
                </blockquote>
              )}
            </div>

            {/* Sanitized Rich Text Excerpt */}
            {activity.descriptionHtml && (
              <div
                className="text-xs sm:text-sm text-offwhite-dim line-clamp-2 font-sans leading-relaxed"
                dangerouslySetInnerHTML={{ __html: activity.descriptionHtml }}
              />
            )}

            {/* Live Intervalometer Countdown */}
            <div className="pt-2">
              <Countdown targetDate={activity.date} />
            </div>

            {/* Action CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button
                href={`/activities/${activity.slug}`}
                variant="primary"
                size="sm"
                className="gap-2"
              >
                Examine Roll Dossier <ArrowRight className="w-3.5 h-3.5" />
              </Button>

              {activity.registrationLink && (
                <Button
                  href={activity.registrationLink}
                  isExternal
                  variant="outline"
                  size="sm"
                  className="gap-2 border-amber/50 hover:border-amber"
                >
                  Register Now <ExternalLink className="w-3.5 h-3.5 text-amber" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
