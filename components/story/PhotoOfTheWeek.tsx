// File: components/story/PhotoOfTheWeek.tsx
'use client';

import React from 'react';
import Image from 'next/image';
import { Sparkles, Camera, User, Tag, ArrowRight, Eye } from 'lucide-react';
import { InstagramIcon } from '@/components/ui/InstagramIcon';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { getDarkroomBlurPlaceholder } from '@/lib/utils';

export interface PhotoOfTheWeekItem {
  _id?: string;
  image: {
    url: string;
    publicId?: string;
    width?: number;
    height?: number;
    blurDataURL?: string;
  };
  caption: string;
  story?: string;
  photographer?: string;
  cameraInfo?: string;
  room: string;
  instagramUrl?: string;
}

interface PhotoOfTheWeekProps {
  item: PhotoOfTheWeekItem | null;
}

export function PhotoOfTheWeek({ item }: PhotoOfTheWeekProps) {
  if (!item || !item.image?.url) {
    return null;
  }

  return (
    <section className="relative w-full py-20 sm:py-28 bg-[#09090b] border-t border-charcoal-border overflow-hidden">
      {/* Darkroom Ruby Safelight Ambient Glows */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[550px] h-[550px] rounded-full bg-rose-600/10 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[450px] h-[450px] rounded-full bg-amber/5 blur-[140px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Curatorial Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Badge variant="amber" className="bg-amber/15 text-amber border-amber/40">
                <Sparkles className="w-3.5 h-3.5 mr-1 animate-pulse" />
                PHOTO OF THE WEEK
              </Badge>
              <span className="font-mono text-xs text-offwhite-dim tracking-widest uppercase">
                CURATORIAL SPOTLIGHT
              </span>
            </div>
            <h2 className="font-title text-3xl sm:text-5xl font-black text-offwhite tracking-tight">
              Frame in the Safelight
            </h2>
            <p className="font-body text-sm sm:text-base text-offwhite-muted max-w-2xl leading-relaxed">
              Selected each week by the society leads for exceptional narrative tension, light control, and composition.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Button href="/gallery" variant="outline" size="sm" className="gap-2">
              <Eye className="w-4 h-4" />
              View Full Light Table
            </Button>
          </div>
        </div>

        {/* Master Showcase Card */}
        <div className="relative rounded-3xl bg-charcoal/70 border border-charcoal-border/80 p-6 sm:p-8 lg:p-10 shadow-2xl backdrop-blur-sm overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* The Photograph Frame */}
            <div className="lg:col-span-7 relative group">
              <div className="relative aspect-[4/3] sm:aspect-[16/10] w-full rounded-2xl overflow-hidden bg-black border border-charcoal-border shadow-[0_0_40px_rgba(0,0,0,0.8)]">
                <Image
                  src={item.image.url}
                  alt={item.caption}
                  fill
                  priority
                  placeholder="blur"
                  blurDataURL={item.image.blurDataURL || getDarkroomBlurPlaceholder(16, 10)}
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  sizes="(max-width: 1024px) 100vw, 60vw"
                />

                {/* Corner Viewfinder Reticles */}
                <div className="pointer-events-none absolute inset-4 border border-white/10 rounded-xl transition-opacity group-hover:opacity-100 opacity-60">
                  <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-amber" />
                  <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-amber" />
                  <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-amber" />
                  <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-amber" />
                </div>

                {/* Category Badge overlay */}
                <div className="absolute top-4 left-4 z-10">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/80 backdrop-blur-md font-mono text-[10px] text-amber tracking-widest uppercase border border-amber/30">
                    <Tag className="w-3 h-3" />
                    {item.room}
                  </span>
                </div>
              </div>

              {/* 35mm Perforation Margin Caption */}
              <div className="mt-3 flex items-center justify-between font-mono text-[10px] text-offwhite-dim px-2">
                <span>SHUTTERSCAPE ARCHIVE // POTW</span>
                <span className="text-amber">NEGATIVE VERIFIED</span>
                <span>GCU SOCIETY</span>
              </div>
            </div>

            {/* Curatorial Metadata & Story */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <h3 className="font-title text-2xl sm:text-3xl lg:text-4xl font-bold text-offwhite leading-tight">
                  &ldquo;{item.caption}&rdquo;
                </h3>

                {/* Story / Curatorial Note */}
                {item.story ? (
                  <p className="font-body text-sm sm:text-base text-offwhite-muted leading-relaxed italic border-l-2 border-amber pl-4">
                    {item.story}
                  </p>
                ) : (
                  <p className="font-body text-sm sm:text-base text-offwhite-muted leading-relaxed">
                    A fleeting moment immortalized on campus grounds, demonstrating the power of available natural light and patience behind the viewfinder.
                  </p>
                )}
              </div>

              {/* Technical Telemetry Box */}
              <div className="space-y-3 pt-4 border-t border-charcoal-border/70">
                {item.photographer && (
                  <div className="flex items-center gap-3 font-mono text-xs">
                    <div className="w-8 h-8 rounded-full bg-amber/10 border border-amber/30 flex items-center justify-center text-amber shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[10px] text-offwhite-dim uppercase tracking-wider">Photographer</div>
                      <div className="text-offwhite font-bold">{item.photographer}</div>
                    </div>
                  </div>
                )}

                {item.cameraInfo && (
                  <div className="flex items-center gap-3 font-mono text-xs">
                    <div className="w-8 h-8 rounded-full bg-white/5 border border-charcoal-border flex items-center justify-center text-offwhite-dim shrink-0">
                      <Camera className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[10px] text-offwhite-dim uppercase tracking-wider">Optics & EXIF</div>
                      <div className="text-amber">{item.cameraInfo}</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Button href="/gallery" variant="primary" size="md" className="gap-2">
                  Explore Darkroom Gallery <ArrowRight className="w-4 h-4" />
                </Button>
                {item.instagramUrl && (
                  <Button
                    href={item.instagramUrl}
                    variant="secondary"
                    size="md"
                    isExternal
                    className="gap-2 text-pink-400 border-pink-500/30 hover:border-pink-500/60"
                  >
                    <InstagramIcon className="w-4 h-4" />
                    View on @shutterscape_gcu
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
