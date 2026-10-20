'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, MapPin, ArrowRight, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { getDarkroomBlurPlaceholder } from '@/lib/utils';

export interface FilmFrameItem {
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

interface FilmFrameCardProps {
  activity: FilmFrameItem;
  frameIndex: number;
}

export function FilmFrameCard({ activity, frameIndex }: FilmFrameCardProps) {
  const eventDate = new Date(activity.date);
  const formattedDate = eventDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const frameNumStr = String(frameIndex).padStart(2, '0');

  return (
    <article className="group relative rounded-2xl bg-charcoal border border-charcoal-border hover:border-amber/50 transition-all duration-500 hover:shadow-[0_0_35px_rgba(245,158,11,0.12)] overflow-hidden flex flex-col justify-between">
      {/* 35mm Film Negative Edge Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-black/80 border-b border-charcoal-border font-mono text-[10px] text-offwhite-dim">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-amber/80" />
          <span className="tracking-widest uppercase text-amber">KODAK TRI-X</span>
        </div>
        <div className="tracking-widest flex items-center gap-2">
          <span>FRAME <strong className="text-offwhite font-bold">{frameNumStr}</strong>/36</span>
          <span className="text-offwhite-dim">▲</span>
        </div>
      </div>

      {/* Main Image Frame with Viewfinder Overlay */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-black">
        <Image
          src={activity.image?.url || 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1200'}
          alt={activity.title}
          fill
          placeholder="blur"
          blurDataURL={activity.image?.blurDataURL || getDarkroomBlurPlaceholder(16, 10)}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />

        {/* Viewfinder Corner Overlays */}
        <div className="pointer-events-none absolute inset-3 rounded-lg border border-white/0 transition-all duration-300 group-hover:border-white/15 z-10">
          <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-amber opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-amber opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-amber opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-amber opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        </div>

        {/* Status Badge */}
        <div className="absolute top-3 right-3 z-20">
          <Badge variant="neutral" className="bg-black/85 backdrop-blur-md border-charcoal-border text-[9px] py-0.5 px-2">
            DEVELOPED NEGATIVE
          </Badge>
        </div>
      </div>

      {/* Frame Content */}
      <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-3">
          {/* Metadata telemetry line */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-mono text-offwhite-dim">
            <span className="flex items-center gap-1.5 text-amber">
              <Calendar className="w-3.5 h-3.5" />
              {formattedDate}
            </span>
            {activity.venue && (
              <span className="flex items-center gap-1.5 text-offwhite-muted truncate max-w-[200px]" title={activity.venue}>
                <MapPin className="w-3.5 h-3.5 text-offwhite-dim" />
                {activity.venue}
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="font-title text-xl font-bold text-offwhite group-hover:text-amber transition-colors line-clamp-2 leading-tight">
            {activity.title}
          </h3>

          {/* Pullquote highlight */}
          {activity.pullQuote && (
            <blockquote className="text-xs sm:text-sm text-offwhite-muted italic border-l-2 border-safelight/70 pl-3 line-clamp-2">
              &ldquo;{activity.pullQuote}&rdquo;
            </blockquote>
          )}

          {/* Sanitized Rich Text Excerpt */}
          {activity.descriptionHtml && (
            <div
              className="text-xs text-offwhite-dim line-clamp-2 font-sans leading-relaxed"
              dangerouslySetInnerHTML={{ __html: activity.descriptionHtml }}
            />
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-charcoal-border/70 flex items-center justify-between">
          <Link
            href={`/activities/${activity.slug}`}
            className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-amber group-hover:translate-x-1 transition-transform"
          >
            Examine Frame <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          {activity.registrationLink && (
            <a
              href={activity.registrationLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] font-mono text-offwhite-dim hover:text-amber transition-colors"
            >
              Register <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
