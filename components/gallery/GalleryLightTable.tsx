'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Image from 'next/image';
import {
  Search,
  Camera,
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Maximize2,
  Sliders,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { getDarkroomBlurPlaceholder } from '@/lib/utils';

export interface GalleryItemData {
  _id: string;
  image: {
    url: string;
    publicId: string;
    width: number;
    height: number;
    blurDataURL?: string;
  };
  caption: string;
  story?: string;
  photographer?: string;
  cameraInfo?: string;
  room: string;
  featured: boolean;
  status: 'draft' | 'published';
  createdAt: string;
}

interface GalleryLightTableProps {
  initialItems: GalleryItemData[];
}

export function GalleryLightTable({ initialItems }: GalleryLightTableProps) {
  const [selectedRoom, setSelectedRoom] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Extract all unique rooms from items
  const rooms = useMemo(() => {
    const set = new Set<string>();
    initialItems.forEach((item) => {
      if (item.room) set.add(item.room);
    });
    return ['All', ...Array.from(set)];
  }, [initialItems]);

  // Filter items by room and search query
  const filteredItems = useMemo(() => {
    return initialItems.filter((item) => {
      if (selectedRoom !== 'All' && item.room !== selectedRoom) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesCaption = item.caption.toLowerCase().includes(query);
        const matchesPhotographer = item.photographer?.toLowerCase().includes(query);
        const matchesCamera = item.cameraInfo?.toLowerCase().includes(query);
        const matchesStory = item.story?.toLowerCase().includes(query);
        if (!matchesCaption && !matchesPhotographer && !matchesCamera && !matchesStory) {
          return false;
        }
      }
      return true;
    });
  }, [initialItems, selectedRoom, searchQuery]);

  // Handle Lightbox navigation
  const activeItem = lightboxIndex !== null ? filteredItems[lightboxIndex] : null;

  const handlePrev = useCallback(() => {
    if (lightboxIndex === null) return;
    setLightboxIndex((prev) => (prev! > 0 ? prev! - 1 : filteredItems.length - 1));
  }, [lightboxIndex, filteredItems.length]);

  const handleNext = useCallback(() => {
    if (lightboxIndex === null) return;
    setLightboxIndex((prev) => (prev! < filteredItems.length - 1 ? prev! + 1 : 0));
  }, [lightboxIndex, filteredItems.length]);

  const handleClose = useCallback(() => {
    setLightboxIndex(null);
  }, []);

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (lightboxIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [lightboxIndex, handleClose, handlePrev, handleNext]);

  return (
    <div className="space-y-8">
      {/* Light Table Control Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-charcoal/85 p-3.5 sm:p-4 rounded-2xl border border-charcoal-border backdrop-blur-xl">
        {/* Room Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {rooms.map((room) => {
            const isActive = selectedRoom === room;
            return (
              <button
                key={room}
                type="button"
                onClick={() => setSelectedRoom(room)}
                className={`px-4 py-2 rounded-xl text-xs font-mono tracking-wider transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-amber text-black font-semibold shadow-md shadow-amber/20'
                    : 'text-offwhite-muted hover:text-offwhite hover:bg-white/5'
                }`}
              >
                {room === 'All' ? 'All Rooms' : room}
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[260px]">
          <Search className="w-4 h-4 text-offwhite-dim absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search photographer, frame, camera..."
            className="w-full bg-black/60 border border-charcoal-border rounded-xl pl-9 pr-4 py-2 text-xs font-mono text-offwhite placeholder:text-offwhite-dim focus:outline-none focus:border-amber transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-offwhite-dim hover:text-offwhite text-xs font-mono"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Frame Counter Telemetry Readout */}
      <div className="flex items-center justify-between text-xs font-mono text-offwhite-dim px-1">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber animate-pulse" />
          <span>
            LIGHT TABLE STATUS: <strong className="text-offwhite">{filteredItems.length}</strong> EXPOSURES ILLUMINATED
          </span>
        </div>
        <div className="hidden sm:block text-offwhite-dim">
          CLICK ANY SLIDE TO EXPAND TELEMETRY &amp; EXIF
        </div>
      </div>

      {/* Light Table Grid */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item, index) => {
            const frameIndexStr = String(index + 1).padStart(2, '0');
            return (
              <div
                key={item._id}
                role="button"
                tabIndex={0}
                onClick={() => setLightboxIndex(index)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setLightboxIndex(index);
                  }
                }}
                className="group relative cursor-pointer flex flex-col bg-charcoal border border-charcoal-border rounded-2xl overflow-hidden transition-all duration-500 hover:border-amber hover:shadow-[0_0_30px_rgba(245,158,11,0.18)] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber"
              >
                {/* 35mm Slide Mount Header */}
                <div className="flex items-center justify-between px-3 py-1.5 bg-black/80 border-b border-charcoal-border font-mono text-[10px] text-offwhite-dim">
                  <span className="text-amber">SLIDE {frameIndexStr}</span>
                  <span className="uppercase">{item.room || 'GENERAL'}</span>
                </div>

                {/* Image Frame */}
                <div className="relative aspect-[4/3] w-full bg-black/80 overflow-hidden">
                  <Image
                    src={item.image.url}
                    alt={item.caption}
                    fill
                    placeholder="blur"
                    blurDataURL={item.image.blurDataURL || getDarkroomBlurPlaceholder(16, 12)}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />

                  {/* Featured Gold Badge */}
                  {item.featured && (
                    <div className="absolute top-2.5 left-2.5 z-10">
                      <Badge variant="amber" className="bg-black/80 backdrop-blur-md shadow-md text-[9px] py-0.5 px-2">
                        <Sparkles className="w-2.5 h-2.5 mr-1" />
                        FEATURED
                      </Badge>
                    </div>
                  )}

                  {/* Corner Viewfinder brackets on hover */}
                  <div className="pointer-events-none absolute inset-3 rounded-lg border border-white/0 transition-all duration-300 group-hover:border-white/15 z-10">
                    <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t-2 border-l-2 border-amber opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    <div className="absolute top-0 right-0 w-2.5 h-2.5 border-t-2 border-r-2 border-amber opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    <div className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b-2 border-l-2 border-amber opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b-2 border-r-2 border-amber opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  </div>

                  {/* Expand icon on hover */}
                  <div className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-black/80 backdrop-blur-md border border-charcoal-border flex items-center justify-center text-amber opacity-0 group-hover:opacity-100 transition-opacity z-20">
                    <Maximize2 className="w-4 h-4" />
                  </div>
                </div>

                {/* Caption & Photographer Metadata Footer */}
                <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                  <div className="space-y-1">
                    <h3 className="font-title text-sm font-bold text-offwhite group-hover:text-amber transition-colors line-clamp-1">
                      {item.caption}
                    </h3>
                    {item.photographer && (
                      <p className="text-xs font-mono text-offwhite-dim">
                        Photo by <span className="text-offwhite-muted">{item.photographer}</span>
                      </p>
                    )}
                  </div>

                  {/* Camera Metadata Telemetry */}
                  {item.cameraInfo && (
                    <div className="pt-2 border-t border-charcoal-border/70 text-[10px] font-mono text-offwhite-dim truncate" title={item.cameraInfo}>
                      {item.cameraInfo}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="p-16 text-center rounded-2xl bg-charcoal/40 border border-charcoal-border border-dashed space-y-4">
          <div className="w-12 h-12 rounded-full bg-charcoal border border-charcoal-border flex items-center justify-center mx-auto text-offwhite-dim">
            <Camera className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h4 className="font-title text-lg text-offwhite font-bold">No Exposures on Light Table</h4>
            <p className="text-xs font-mono text-offwhite-muted max-w-sm mx-auto">
              No photographs match the current room or search query.
            </p>
          </div>
          {(selectedRoom !== 'All' || searchQuery) && (
            <button
              type="button"
              onClick={() => {
                setSelectedRoom('All');
                setSearchQuery('');
              }}
              className="text-xs font-mono text-amber hover:underline"
            >
              Reset Filters &amp; View All
            </button>
          )}
        </div>
      )}

      {/* =========================================================================
          FULLSCREEN LIGHTBOX MODAL WITH ANALOG EXIF TELEMETRY
          ========================================================================= */}
      {activeItem && lightboxIndex !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={activeItem.caption}
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl flex flex-col justify-between overflow-hidden animate-in fade-in duration-200"
        >
          {/* Subtle Ambient Red Safelight Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-safelight/10 blur-[180px] pointer-events-none" />

          {/* Top Control Bar */}
          <div className="relative z-10 flex items-center justify-between p-4 sm:px-8 border-b border-charcoal-border/80 bg-black/80">
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-amber animate-pulse" />
              <div className="font-mono text-xs text-offwhite-dim">
                FRAME <strong className="text-amber">{String(lightboxIndex + 1).padStart(2, '0')}</strong> OF{' '}
                <strong className="text-offwhite">{String(filteredItems.length).padStart(2, '0')}</strong>
              </div>
              <Badge variant="neutral" className="hidden sm:inline-flex text-[10px]">
                {activeItem.room}
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              <span className="hidden sm:inline font-mono text-[10px] text-offwhite-dim mr-2">
                USE ARROWS [← →] OR ESC
              </span>
              <button
                type="button"
                onClick={handleClose}
                className="p-2 rounded-full bg-charcoal border border-charcoal-border text-offwhite hover:text-amber hover:border-amber transition-colors"
                aria-label="Close lightbox"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Central Image Stage with Nav Controls */}
          <div className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-8 min-h-0">
            {/* Prev Arrow */}
            <button
              type="button"
              onClick={handlePrev}
              className="absolute left-3 sm:left-8 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/70 border border-charcoal-border text-offwhite hover:text-amber hover:border-amber transition-all backdrop-blur-md"
              aria-label="Previous exposure"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {/* Next Arrow */}
            <button
              type="button"
              onClick={handleNext}
              className="absolute right-3 sm:right-8 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/70 border border-charcoal-border text-offwhite hover:text-amber hover:border-amber transition-all backdrop-blur-md"
              aria-label="Next exposure"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Main Image Frame */}
            <div className="relative max-w-5xl max-h-[70vh] w-full h-full flex items-center justify-center">
              <div className="relative w-full h-full">
                <Image
                  src={activeItem.image.url}
                  alt={activeItem.caption}
                  fill
                  priority
                  placeholder="blur"
                  blurDataURL={activeItem.image.blurDataURL || getDarkroomBlurPlaceholder(16, 12)}
                  className="object-contain"
                />
              </div>
            </div>
          </div>

          {/* Bottom Telemetry HUD Bar */}
          <div className="relative z-10 bg-black/90 border-t border-charcoal-border/80 p-4 sm:px-8 py-5">
            <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Caption & Story */}
              <div className="space-y-1 max-w-xl">
                <h3 className="font-title text-lg sm:text-xl font-bold text-offwhite">
                  {activeItem.caption}
                </h3>
                {activeItem.story && (
                  <p className="text-xs sm:text-sm text-offwhite-muted font-sans leading-relaxed">
                    {activeItem.story}
                  </p>
                )}
                {activeItem.photographer && (
                  <p className="text-xs font-mono text-amber">
                    Photographer: <span className="text-offwhite">{activeItem.photographer}</span>
                  </p>
                )}
              </div>

              {/* Technical EXIF Readout Box */}
              {activeItem.cameraInfo && (
                <div className="bg-charcoal/80 border border-charcoal-border p-3 rounded-xl font-mono text-xs space-y-1 self-start md:self-auto min-w-[240px]">
                  <div className="text-[10px] uppercase text-offwhite-dim tracking-widest flex items-center gap-1.5">
                    <Sliders className="w-3 h-3 text-amber" />
                    CAMERA EXIF TELEMETRY
                  </div>
                  <div className="text-offwhite font-medium">
                    {activeItem.cameraInfo}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
