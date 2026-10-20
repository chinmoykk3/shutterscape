import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, MapPin, ArrowRight, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { getDarkroomBlurPlaceholder } from '@/lib/utils';

export interface ActivityCardProps {
  activity: {
    _id: string;
    title: string;
    slug: string;
    date: string | Date;
    endDate?: string | Date;
    venue?: string;
    pullQuote?: string;
    image: {
      url: string;
      blurDataURL?: string;
    };
    status: 'draft' | 'published';
    isUpcoming?: boolean;
  };
  frameIndex?: number;
  isUpcoming?: boolean;
}

export function ActivityCard({ activity, frameIndex = 1, isUpcoming: explicitUpcoming }: ActivityCardProps) {
  const eventDate = new Date(activity.date);
  const isUpcoming = explicitUpcoming ?? activity.isUpcoming ?? false;
  const formattedDate = eventDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const formattedTime = eventDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const frameNum = String(frameIndex).padStart(2, '0');

  return (
    <article className="group relative flex flex-col bg-charcoal border border-charcoal-border rounded-2xl overflow-hidden transition-all duration-500 hover:border-amber/50 hover:shadow-[0_0_35px_rgba(245,158,11,0.12)]">
      {/* 35mm Film Edge Header Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-black/70 border-b border-charcoal-border/80 font-mono text-[10px] text-offwhite-dim">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-amber animate-pulse" />
          <span className="tracking-widest uppercase text-amber">KODAK TRI-X 400</span>
        </div>
        <div className="tracking-widest">
          FRAME <span className="text-offwhite font-bold">{frameNum}</span>/36
        </div>
      </div>

      {/* Image Preview with Viewfinder Brackets */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-black/60">
        <Image
          src={activity.image?.url || 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1200'}
          alt={activity.title}
          fill
          placeholder="blur"
          blurDataURL={activity.image?.blurDataURL || getDarkroomBlurPlaceholder(16, 10)}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />

        {/* Viewfinder Reticle on Hover */}
        <div className="pointer-events-none absolute inset-3 rounded-lg border border-white/0 transition-all duration-300 group-hover:border-white/20 z-10">
          <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-amber opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-amber opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-amber opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-amber opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        </div>

        {/* Status Badge floating */}
        <div className="absolute top-3 right-3 z-20">
          {isUpcoming ? (
            <Badge variant="amber" className="bg-black/85 backdrop-blur-md shadow-lg border-amber/60">
              ● UPCOMING
            </Badge>
          ) : (
            <Badge variant="neutral" className="bg-black/85 backdrop-blur-md border-charcoal-border">
              DEVELOPED
            </Badge>
          )}
        </div>
      </div>

      {/* Card Content */}
      <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-3">
          {/* Metadata telemetry line */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-mono text-offwhite-dim">
            <span className="flex items-center gap-1.5 text-amber">
              <Calendar className="w-3.5 h-3.5" />
              {formattedDate}
            </span>
            <span className="flex items-center gap-1.5 text-offwhite-muted">
              <Clock className="w-3.5 h-3.5" />
              {formattedTime}
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

          {/* Pullquote excerpt */}
          {activity.pullQuote && (
            <p className="text-sm text-offwhite-muted italic border-l-2 border-amber/40 pl-3 line-clamp-2">
              &ldquo;{activity.pullQuote}&rdquo;
            </p>
          )}
        </div>

        {/* Footer Link */}
        <div className="pt-4 border-t border-charcoal-border/70 flex items-center justify-between">
          <span className="font-mono text-xs text-offwhite-dim uppercase tracking-wider">
            {isUpcoming ? 'Registration Open' : 'Archived Manifest'}
          </span>
          <Link
            href={`/activities/${activity.slug}`}
            className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-amber group-hover:translate-x-1 transition-all"
          >
            Examine Frame <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}
