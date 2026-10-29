'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export interface CameraReadoutProps {
  shutter?: string;
  aperture?: string;
  iso?: string;
  mode?: string;
  floatingHud?: boolean;
  className?: string;
}

interface ChapterExposure {
  chapterName: string;
  shutter: string;
  aperture: string;
  iso: string;
  safelight?: boolean;
}

const CHAPTER_PRESETS: Record<string, ChapterExposure[]> = {
  '/': [
    { chapterName: 'CH.00 DARKNESS', shutter: 'BULB', aperture: 'f/16', iso: 'ISO 100' },
    { chapterName: 'CH.01 LIGHT', shutter: '1/125s', aperture: 'f/1.4', iso: 'ISO 200' },
    { chapterName: 'CH.02 FRAME', shutter: '1/500s', aperture: 'f/4.0', iso: 'ISO 400' },
    { chapterName: 'CH.03 MOMENTS', shutter: '1/1000s', aperture: 'f/2.8', iso: 'ISO 400' },
    { chapterName: 'CH.04 NEXT FRAME', shutter: '1/60s', aperture: 'f/2.0', iso: 'ISO 800' },
    { chapterName: 'CH.05 EPILOGUE', shutter: '1/200s', aperture: 'f/8.0', iso: 'ISO 100' },
  ],
  '/activities': [
    { chapterName: '35MM FILM ROLL', shutter: '1/250s', aperture: 'f/2.8', iso: 'ISO 400' },
    { chapterName: 'ARCHIVE EXPOSURES', shutter: '1/500s', aperture: 'f/5.6', iso: 'ISO 200' },
  ],
  '/gallery': [
    {
      chapterName: 'DARKROOM SAFELIGHT',
      shutter: '2.5s',
      aperture: 'f/8.0',
      iso: 'ISO 64',
      safelight: true,
    },
    {
      chapterName: 'CHEMICAL BATH',
      shutter: '1/30s',
      aperture: 'f/4.0',
      iso: 'ISO 160',
      safelight: true,
    },
  ],
  '/about': [
    { chapterName: 'BEHIND THE LENS', shutter: '1/160s', aperture: 'f/2.0', iso: 'ISO 320' },
    { chapterName: 'THE NEGATIVES', shutter: '1/60s', aperture: 'f/1.8', iso: 'ISO 800' },
  ],
};

/**
 * Dual-purpose component:
 * 1. Inline badge when `floatingHud` is false (default)
 * 2. Persistent bottom-left HUD readout that dynamically changes aperture/ISO/shutter per chapter & scroll depth when `floatingHud` is true
 */
export function CameraReadout({
  shutter,
  aperture,
  iso,
  mode,
  floatingHud = false,
  className,
}: CameraReadoutProps) {
  const pathname = usePathname();
  const [scrollStage, setScrollStage] = useState(0);

  useEffect(() => {
    if (!floatingHud) return;

    const handleScroll = () => {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) {
        setScrollStage(0);
        return;
      }
      const ratio = Math.min(Math.max(window.scrollY / docHeight, 0), 0.99);
      const presets = CHAPTER_PRESETS[pathname] || CHAPTER_PRESETS['/'];
      const index = Math.floor(ratio * presets.length);
      setScrollStage(index);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [floatingHud, pathname]);

  if (floatingHud && pathname?.startsWith('/admin')) {
    return null;
  }

  const activePresets = CHAPTER_PRESETS[pathname] || [
    { chapterName: 'MANUAL', shutter: '1/250s', aperture: 'f/2.8', iso: 'ISO 400' },
  ];
  const currentPreset = activePresets[Math.min(scrollStage, activePresets.length - 1)];

  const displayMode = mode || currentPreset.chapterName;
  const displayShutter = shutter || currentPreset.shutter;
  const displayAperture = aperture || currentPreset.aperture;
  const displayIso = iso || currentPreset.iso;
  const isSafelight = currentPreset.safelight && !mode;

  if (floatingHud) {
    return (
      <aside
        aria-label="Camera exposure readout"
        className={cn(
          'fixed left-6 bottom-6 z-40 hidden xl:inline-flex items-center gap-3 px-3.5 py-2 rounded-full bg-charcoal/90 border backdrop-blur-md text-[11px] font-mono select-none shadow-xl shadow-black/70 transition-colors duration-500',
          isSafelight ? 'border-safelight/40 text-offwhite-muted' : 'border-charcoal-border text-offwhite-muted',
          className
        )}
      >
        <span
          className={cn(
            'font-bold tracking-wider',
            isSafelight ? 'text-[#ff7b73]' : 'text-amber'
          )}
        >
          {displayMode}
        </span>
        <span className="w-1 h-1 rounded-full bg-charcoal-border" />
        <span className="tabular-nums text-offwhite">{displayShutter}</span>
        <span className="w-1 h-1 rounded-full bg-charcoal-border" />
        <span className="tabular-nums text-offwhite">{displayAperture}</span>
        <span className="w-1 h-1 rounded-full bg-charcoal-border" />
        <span className="tabular-nums text-offwhite-dim">{displayIso}</span>
      </aside>
    );
  }

  return (
    <div
      className={cn(
        'inline-flex flex-wrap items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-white/95 dark:bg-charcoal/85 border border-stone-300 dark:border-charcoal-border text-[11px] font-mono text-slate-700 dark:text-offwhite-muted select-none backdrop-blur-md shadow-sm dark:shadow-none transition-colors duration-300',
        className
      )}
    >
      <span className="text-amber-700 dark:text-amber font-bold tracking-wider">{displayMode}</span>
      <span className="w-1 h-1 rounded-full bg-stone-300 dark:bg-charcoal-border" />
      <span className="tabular-nums font-semibold text-slate-800 dark:text-offwhite">{displayShutter}</span>
      <span className="w-1 h-1 rounded-full bg-stone-300 dark:bg-charcoal-border" />
      <span className="tabular-nums font-semibold text-slate-800 dark:text-offwhite">{displayAperture}</span>
      <span className="w-1 h-1 rounded-full bg-stone-300 dark:bg-charcoal-border" />
      <span className="tabular-nums font-semibold text-slate-900 dark:text-offwhite">{displayIso}</span>
    </div>
  );
}