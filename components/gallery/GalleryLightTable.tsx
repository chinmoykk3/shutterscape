'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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
  Sun,
  Flame,
  ArrowDown,
  User,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { InstagramIcon } from '@/components/ui/InstagramIcon';
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
  instagramUrl?: string;
  featured: boolean;
  status: 'draft' | 'published';
  createdAt: string;
}

interface GalleryLightTableProps {
  initialItems: GalleryItemData[];
}

// Individual Masonry Card with Develop-on-Scroll Observer
function GalleryMasonryCard({
  item,
  index,
  onSelect,
  safelightMode,
}: {
  item: GalleryItemData;
  index: number;
  onSelect: () => void;
  safelightMode: boolean;
}) {
  const [isDeveloped, setIsDeveloped] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsDeveloped(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const frameIndexStr = String(index + 1).padStart(2, '0');

  // Compute aspect ratio padding for masonry balance
  const isPortrait = item.image.height > item.image.width;

  return (
    <div
      ref={cardRef}
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect();
        }
      }}
      className={`break-inside-avoid mb-6 group relative cursor-pointer flex flex-col rounded-2xl overflow-hidden transition-all duration-500 border bg-charcoal focus:outline-none focus-visible:ring-2 focus-visible:ring-amber ${
        safelightMode
          ? 'border-safelight/40 hover:border-safelight hover:shadow-[0_0_30px_rgba(179,38,30,0.3)]'
          : 'border-charcoal-border hover:border-amber hover:shadow-[0_0_30px_rgba(245,158,11,0.18)]'
      }`}
    >
      {/* 35mm Slide Mount Header */}
      <div className="flex items-center justify-between px-3.5 py-2 bg-black/85 border-b border-charcoal-border font-mono text-[10px] text-offwhite-dim">
        <span className={safelightMode ? 'text-safelight font-bold' : 'text-amber'}>
          SLIDE {frameIndexStr}
        </span>
        <span className="uppercase text-offwhite-dim">{item.room || 'GENERAL'}</span>
      </div>

      {/* Image Container with Develop-on-Scroll Effect */}
      <div
        className={`relative w-full overflow-hidden bg-black ${
          isPortrait ? 'aspect-[3/4]' : 'aspect-[4/3]'
        }`}
      >
        <Image
          src={item.image.url}
          alt={item.caption}
          fill
          placeholder="blur"
          blurDataURL={item.image.blurDataURL || getDarkroomBlurPlaceholder(16, 12)}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className={`object-cover transition-all duration-1000 ease-out group-hover:scale-105 ${
            isDeveloped
              ? 'darkroom-developed'
              : 'darkroom-undeveloped'
          }`}
        />

        {/* Featured Gold Badge */}
        {item.featured && (
          <div className="absolute top-2.5 left-2.5 z-10">
            <Badge variant="amber" className="bg-black/85 backdrop-blur-md shadow-md text-[9px] py-0.5 px-2">
              <Sparkles className="w-2.5 h-2.5 mr-1" />
              FEATURED
            </Badge>
          </div>
        )}

        {/* Developing Badge floating */}
        <div className="absolute top-2.5 right-2.5 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="font-mono text-[9px] px-2 py-0.5 rounded bg-black/80 border border-white/20 text-offwhite">
            {isDeveloped ? 'DEVELOPED' : 'LATENT'}
          </span>
        </div>

        {/* Corner Viewfinder Brackets on Hover */}
        <div className="pointer-events-none absolute inset-3 rounded-lg border border-white/0 transition-all duration-300 group-hover:border-white/15 z-10">
          <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t-2 border-l-2 border-amber opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <div className="absolute top-0 right-0 w-2.5 h-2.5 border-t-2 border-r-2 border-amber opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <div className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b-2 border-l-2 border-amber opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b-2 border-r-2 border-amber opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        </div>

        {/* Expand Icon */}
        <div className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-black/80 backdrop-blur-md border border-charcoal-border flex items-center justify-center text-amber opacity-0 group-hover:opacity-100 transition-opacity z-20">
          <Maximize2 className="w-4 h-4" />
        </div>
      </div>

      {/* Caption Under Each Image */}
      <div className="p-4 space-y-2.5 bg-charcoal/95 border-t border-charcoal-border/70">
        <div className="space-y-1">
          <h3 className="font-title text-base font-bold text-offwhite group-hover:text-amber transition-colors line-clamp-2 leading-snug">
            {item.caption}
          </h3>
          {item.photographer && (
            <p className="text-xs font-mono text-offwhite-dim flex items-center gap-1.5">
              <User className="w-3 h-3 text-amber shrink-0" />
              <span>{item.photographer}</span>
            </p>
          )}
        </div>

        {/* Technical EXIF readout & Instagram attribution line */}
        <div className="pt-2 border-t border-charcoal-border/70 flex items-center justify-between text-[10px] font-mono text-offwhite-dim">
          <span className="truncate pr-2" title={item.cameraInfo || item.room}>
            {item.cameraInfo || item.room}
          </span>
          {item.instagramUrl && (
            <a
              href={item.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1 text-pink-400 hover:text-pink-300 transition-colors shrink-0"
              title="View on Instagram (@shutterscape_gcu)"
            >
              <InstagramIcon className="w-3 h-3" />
              <span>Instagram</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export function GalleryLightTable({ initialItems }: GalleryLightTableProps) {
  const [selectedRoom, setSelectedRoom] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [safelightMode, setSafelightMode] = useState(false);
  const [visibleCount, setVisibleCount] = useState(8);

  // Focus trap ref
  const lightboxModalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

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

  // Paginated visible slice for "Load More"
  const visibleItems = useMemo(() => {
    return filteredItems.slice(0, visibleCount);
  }, [filteredItems, visibleCount]);

  const hasMore = visibleCount < filteredItems.length;

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 8);
  };

  // Reset pagination when room or search query changes
  useEffect(() => {
    setVisibleCount(8);
  }, [selectedRoom, searchQuery]);

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

  // Keyboard navigation & accessibility focus trap for lightbox
  useEffect(() => {
    if (lightboxIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    // Focus close button on open
    setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 50);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [lightboxIndex, handleClose, handlePrev, handleNext]);

  return (
    <div className={`space-y-10 transition-colors duration-700 ${safelightMode ? 'darkroom-safelight-active' : ''}`}>
      {/* =========================================================================
          SAFELIGHT INTRO HUD BANNER
          ========================================================================= */}
      <div
        className={`p-6 sm:p-8 rounded-3xl border transition-all duration-700 relative overflow-hidden ${
          safelightMode
            ? 'bg-gradient-to-r from-safelight/25 via-charcoal to-safelight/20 border-safelight/60 shadow-[0_0_50px_rgba(179,38,30,0.25)]'
            : 'bg-charcoal/80 border-charcoal-border shadow-xl backdrop-blur-xl'
        }`}
      >
        {/* Ambient Safelight Glow Bulb */}
        <div
          className={`absolute -top-12 -right-12 w-48 h-48 rounded-full blur-3xl transition-opacity duration-700 pointer-events-none ${
            safelightMode ? 'bg-safelight/40 opacity-100' : 'bg-amber/15 opacity-50'
          }`}
        />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full animate-pulse ${
                  safelightMode ? 'bg-safelight shadow-[0_0_10px_#B3261E]' : 'bg-amber'
                }`}
              />
              <span className="font-mono text-xs uppercase tracking-widest text-offwhite-dim">
                {safelightMode
                  ? 'DARKROOM SAFELIGHT ENGAGED // 650nm EMULSION SAFE'
                  : 'LIGHT TABLE ILLUMINATION // 5000K BALANCED'}
              </span>
            </div>

            <h2 className="font-title text-2xl sm:text-3xl font-black text-offwhite">
              {safelightMode ? 'Darkroom Safelight Inspection' : 'The Curated Light Table'}
            </h2>

            <p className="font-mono text-xs text-offwhite-muted leading-relaxed">
              {safelightMode
                ? 'Under ruby safelight, silver halides develop without fogging. Examine raw grain and contrast.'
                : 'Balanced illumination reveals true tone, aperture depth, and shutter speed telemetry.'}
            </p>
          </div>

          {/* Safelight Toggle Switcher */}
          <div className="flex items-center gap-2 bg-black/80 p-1.5 rounded-2xl border border-charcoal-border shrink-0 self-start md:self-auto">
            <button
              type="button"
              onClick={() => setSafelightMode(false)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono transition-all ${
                !safelightMode
                  ? 'bg-amber text-black font-semibold shadow-md'
                  : 'text-offwhite-muted hover:text-offwhite'
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
              5000K Loupe
            </button>

            <button
              type="button"
              onClick={() => setSafelightMode(true)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono transition-all ${
                safelightMode
                  ? 'bg-safelight text-offwhite font-semibold shadow-md shadow-safelight/40'
                  : 'text-offwhite-muted hover:text-offwhite'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-safelight" />
              650nm Safelight
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          CONTROL BAR: Category Chips & Search
          ========================================================================= */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-charcoal/85 p-3.5 sm:p-4 rounded-2xl border border-charcoal-border backdrop-blur-xl">
        {/* Category Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {rooms.map((room) => {
            const isActive = selectedRoom === room;
            const count =
              room === 'All'
                ? initialItems.length
                : initialItems.filter((i) => i.room === room).length;

            return (
              <button
                key={room}
                type="button"
                onClick={() => setSelectedRoom(room)}
                className={`px-4 py-2 rounded-xl text-xs font-mono tracking-wider transition-all whitespace-nowrap flex items-center gap-2 ${
                  isActive
                    ? safelightMode
                      ? 'bg-safelight text-offwhite font-semibold shadow-md shadow-safelight/30'
                      : 'bg-amber text-black font-semibold shadow-md shadow-amber/20'
                    : 'text-offwhite-muted hover:text-offwhite hover:bg-white/5'
                }`}
              >
                <span>{room === 'All' ? 'All Rooms' : room}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isActive
                      ? safelightMode
                        ? 'bg-black/40 text-offwhite'
                        : 'bg-black/30 text-black'
                      : 'bg-white/10 text-offwhite-dim'
                  }`}
                >
                  {count}
                </span>
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
            placeholder="Search photographer, camera, title..."
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
          <span
            className={`w-2 h-2 rounded-full animate-pulse ${
              safelightMode ? 'bg-safelight' : 'bg-amber'
            }`}
          />
          <span>
            SHOWING <strong className="text-offwhite">{visibleItems.length}</strong> OF{' '}
            <strong className="text-offwhite">{filteredItems.length}</strong> PRINTS ON LIGHT TABLE
          </span>
        </div>
        <div className="hidden sm:block text-offwhite-dim">
          IMAGES DEVELOP SMOOTHLY ON SCROLL
        </div>
      </div>

      {/* =========================================================================
          TRUE RESPONSIVE MASONRY GRID (CSS Multi-Columns with Balance)
          ========================================================================= */}
      {visibleItems.length > 0 ? (
        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 [column-fill:_balance]">
          {visibleItems.map((item, index) => (
            <GalleryMasonryCard
              key={item._id}
              item={item}
              index={index}
              safelightMode={safelightMode}
              onSelect={() => setLightboxIndex(index)}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="p-16 text-center rounded-2xl bg-charcoal/40 border border-charcoal-border border-dashed space-y-4">
          <div className="w-12 h-12 rounded-full bg-charcoal border border-charcoal-border flex items-center justify-center mx-auto text-offwhite-dim">
            <Camera className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h4 className="font-title text-lg text-offwhite font-bold">No Exposures Found</h4>
            <p className="text-xs font-mono text-offwhite-muted max-w-sm mx-auto">
              No photographs match the current room filter or search query.
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
          LOAD MORE BUTTON
          ========================================================================= */}
      {hasMore && (
        <div className="pt-8 text-center">
          <Button
            onClick={handleLoadMore}
            variant="outline"
            size="lg"
            className="gap-2 px-8 py-3 font-mono text-xs border-charcoal-border hover:border-amber"
          >
            <ArrowDown className="w-4 h-4 text-amber" />
            Load More Exposures ({filteredItems.length - visibleCount} Remaining)
          </Button>
        </div>
      )}

      {/* =========================================================================
          ACCESSIBLE LIGHTBOX MODAL WITH EXIF TELEMETRY
          ========================================================================= */}
      {activeItem && lightboxIndex !== null && (
        <div
          ref={lightboxModalRef}
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
                ref={closeButtonRef}
                type="button"
                onClick={handleClose}
                className="p-2 rounded-full bg-charcoal border border-charcoal-border text-offwhite hover:text-amber hover:border-amber transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber"
                aria-label="Close lightbox modal"
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
              className="absolute left-3 sm:left-8 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/75 border border-charcoal-border text-offwhite hover:text-amber hover:border-amber transition-all backdrop-blur-md focus:outline-none focus-visible:ring-2 focus-visible:ring-amber"
              aria-label="Previous exposure"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {/* Next Arrow */}
            <button
              type="button"
              onClick={handleNext}
              className="absolute right-3 sm:right-8 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/75 border border-charcoal-border text-offwhite hover:text-amber hover:border-amber transition-all backdrop-blur-md focus:outline-none focus-visible:ring-2 focus-visible:ring-amber"
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
              <div className="space-y-1.5 max-w-xl">
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

              {/* Technical EXIF Readout Box & Instagram Link */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 self-start md:self-auto">
                {activeItem.cameraInfo && (
                  <div className="bg-charcoal/80 border border-charcoal-border p-3.5 rounded-xl font-mono text-xs space-y-1 min-w-[240px]">
                    <div className="text-[10px] uppercase text-offwhite-dim tracking-widest flex items-center gap-1.5">
                      <Sliders className="w-3 h-3 text-amber" />
                      CAMERA EXIF TELEMETRY
                    </div>
                    <div className="text-offwhite font-medium">
                      {activeItem.cameraInfo}
                    </div>
                  </div>
                )}

                {activeItem.instagramUrl && (
                  <Button
                    href={activeItem.instagramUrl}
                    isExternal
                    variant="secondary"
                    size="sm"
                    className="gap-2 text-pink-400 border-pink-500/30 hover:border-pink-500/60 shadow-lg whitespace-nowrap"
                  >
                    <InstagramIcon className="w-4 h-4" />
                    <span>View on @shutterscape_gcu</span>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
