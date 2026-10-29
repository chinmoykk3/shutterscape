'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Sparkles,
  Camera,
} from 'lucide-react';

export interface ActivityGalleryPhoto {
  url: string;
  publicId: string;
  caption?: string;
  blurDataURL?: string;
  width?: number;
  height?: number;
}

interface ActivityPhotoGalleryProps {
  photos: ActivityGalleryPhoto[];
  eventTitle: string;
}

export function ActivityPhotoGallery({
  photos,
  eventTitle,
}: ActivityPhotoGalleryProps) {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  // Touch Swipe navigation for mobile
  const touchStartX = React.useRef<number | null>(null);
  const touchEndX = React.useRef<number | null>(null);

  if (!photos || photos.length === 0) return null;

  const openLightbox = (index: number) => {
    setActiveIdx(index);
  };

  const closeLightbox = () => {
    setActiveIdx(null);
  };

  const nextPhoto = () => {
    if (activeIdx === null) return;
    setActiveIdx((activeIdx + 1) % photos.length);
  };

  const prevPhoto = () => {
    if (activeIdx === null) return;
    setActiveIdx((activeIdx - 1 + photos.length) % photos.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;
    const distance = touchStartX.current - touchEndX.current;
    if (distance > 45) {
      nextPhoto();
    } else if (distance < -45) {
      prevPhoto();
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  return (
    <section
      aria-labelledby="event-gallery-heading"
      className="relative z-10 space-y-6 pt-6 border-t border-charcoal-border"
    >
      {/* Gallery Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-amber text-xs font-mono font-semibold uppercase tracking-wider">
            <Camera className="w-3.5 h-3.5" />
            35mm Contact Sheet // Roll Negatives
          </div>
          <h2
            id="event-gallery-heading"
            className="font-title text-2xl sm:text-3xl font-bold text-offwhite"
          >
            Exhibition &amp; Event Gallery
          </h2>
          <p className="font-body text-xs sm:text-sm text-offwhite-dim">
            Archived negative exposures captured during this photographic assignment ({photos.length} frames).
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-charcoal border border-charcoal-border font-mono text-xs text-amber self-start sm:self-auto">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Click any frame to inspect</span>
        </div>
      </div>

      {/* 35mm Sprocket Holes Film Strip Contact Sheet */}
      <div className="p-3 sm:p-5 rounded-3xl bg-black/60 border border-charcoal-border/80 shadow-2xl space-y-4">
        {/* Top 35mm Sprocket Row */}
        <div className="flex items-center justify-between overflow-hidden opacity-30 select-none px-2">
          {Array.from({ length: 18 }).map((_, i) => (
            <div
              key={i}
              className="w-4 h-2.5 rounded-sm bg-white/20 border border-white/40"
            />
          ))}
        </div>

        {/* Photo Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {photos.map((photo, index) => {
            const frameNumStr = String(index + 1).padStart(2, '0');
            return (
              <div
                key={photo.publicId || index}
                onClick={() => openLightbox(index)}
                className="group relative rounded-2xl bg-charcoal border border-charcoal-border/80 hover:border-amber transition-all duration-300 overflow-hidden cursor-pointer flex flex-col justify-between shadow-md hover:shadow-xl hover:-translate-y-0.5"
              >
                {/* 35mm Negative Bar */}
                <div className="flex items-center justify-between px-3 py-1.5 bg-black/90 border-b border-charcoal-border font-mono text-[10px] text-offwhite-dim">
                  <span className="text-amber font-bold">FRAME {frameNumStr}</span>
                  <span className="text-[9px] uppercase tracking-wider text-offwhite-dim/60">
                    KODAK TRI-X 400
                  </span>
                  <Maximize2 className="w-3 h-3 text-offwhite-dim group-hover:text-amber transition-colors" />
                </div>

                {/* Thumbnail Image */}
                <div className="relative aspect-[16/10] w-full bg-black overflow-hidden">
                  <Image
                    src={photo.url}
                    alt={photo.caption || `${eventTitle} - Frame ${frameNumStr}`}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                  />
                  {/* Subtle Darkroom Viewfinder Overlay on Hover */}
                  <div className="pointer-events-none absolute inset-2 rounded-lg border border-transparent group-hover:border-amber/40 transition-colors z-10">
                    <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t border-l border-amber" />
                    <div className="absolute top-0 right-0 w-2.5 h-2.5 border-t border-r border-amber" />
                    <div className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b border-l border-amber" />
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b border-r border-amber" />
                  </div>
                </div>

                {/* Caption Footer if exists */}
                {photo.caption && (
                  <div className="p-3 bg-charcoal/90 border-t border-charcoal-border">
                    <p className="font-body text-xs text-offwhite-dim group-hover:text-offwhite transition-colors line-clamp-2">
                      {photo.caption}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom 35mm Sprocket Row */}
        <div className="flex items-center justify-between overflow-hidden opacity-30 select-none px-2 pt-2">
          {Array.from({ length: 18 }).map((_, i) => (
            <div
              key={i}
              className="w-4 h-2.5 rounded-sm bg-white/20 border border-white/40"
            />
          ))}
        </div>
      </div>

      {/* Darkroom Lightbox Modal with Touch Swipe */}
      {activeIdx !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Image inspection lightbox"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl p-3 sm:p-8 animate-in fade-in"
          onClick={closeLightbox}
        >
          {/* Top Bar Controls */}
          <div
            className="absolute top-3 left-3 right-3 sm:top-6 sm:left-6 sm:right-6 flex items-center justify-between text-offwhite z-20"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="px-3 py-1 rounded-full bg-amber text-black font-mono text-xs font-bold">
                FRAME #{String(activeIdx + 1).padStart(2, '0')} of {photos.length}
              </span>
              <span className="font-mono text-xs text-offwhite-dim hidden sm:inline">
                {eventTitle}
              </span>
              <span className="sm:hidden font-mono text-[10px] text-amber">
                SWIPE ← →
              </span>
            </div>

            <button
              onClick={closeLightbox}
              aria-label="Close lightbox"
              className="p-2 sm:p-2.5 rounded-2xl bg-charcoal/90 border border-charcoal-border hover:border-amber text-offwhite-dim hover:text-offwhite transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Left Arrow Navigation */}
          {photos.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                prevPhoto();
              }}
              aria-label="Previous negative"
              className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 p-2 sm:p-3 rounded-2xl bg-charcoal/90 border border-charcoal-border hover:border-amber text-offwhite hover:text-amber transition-colors z-20 shadow-2xl"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          )}

          {/* Main Focused Image Container */}
          <div
            className="relative max-w-5xl h-[55vh] sm:h-[70vh] max-h-[80vh] w-full flex flex-col items-center justify-center z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full h-full rounded-2xl overflow-hidden border border-charcoal-border bg-black shadow-2xl">
              <Image
                src={photos[activeIdx].url}
                alt={photos[activeIdx].caption || `${eventTitle} - Frame ${activeIdx + 1}`}
                fill
                priority
                className="object-contain"
              />
            </div>

            {/* Lightbox Caption Pill */}
            {photos[activeIdx].caption && (
              <div className="mt-3 sm:mt-4 px-4 sm:px-5 py-2 sm:py-2.5 rounded-2xl bg-charcoal/90 border border-charcoal-border text-center max-w-xl max-h-[20vh] overflow-y-auto">
                <p className="font-body text-xs sm:text-sm text-offwhite">
                  {photos[activeIdx].caption}
                </p>
              </div>
            )}
          </div>

          {/* Right Arrow Navigation */}
          {photos.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                nextPhoto();
              }}
              aria-label="Next negative"
              className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 p-2 sm:p-3 rounded-2xl bg-charcoal/90 border border-charcoal-border hover:border-amber text-offwhite hover:text-amber transition-colors z-20 shadow-2xl"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          )}
        </div>
      )}
    </section>
  );
}

