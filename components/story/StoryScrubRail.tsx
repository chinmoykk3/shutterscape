// File: components/story/StoryScrubRail.tsx
'use client';

import React from 'react';

interface StoryScrubRailProps {
  activeChapter: number;
  onSelectChapter: (index: number) => void;
  hideNextFrame?: boolean;
}

const CHAPTERS = [
  { index: 0, label: '00 IRIS', title: 'Darkness' },
  { index: 1, label: '01 FOCUS', title: 'Light' },
  { index: 2, label: '02 FRAME', title: 'Composition' },
  { index: 3, label: '03 REEL', title: '35mm Moments' },
  { index: 4, label: '04 DEVELOP', title: 'Latent Frame' },
  { index: 5, label: '05 SHUTTER', title: 'Epilogue' },
];

export function StoryScrubRail({
  activeChapter,
  onSelectChapter,
  hideNextFrame = false,
}: StoryScrubRailProps) {
  const visibleChapters = hideNextFrame
    ? CHAPTERS.filter((c) => c.index !== 4)
    : CHAPTERS;

  return (
    <nav
      aria-label="Story chapter progression"
      className="hidden xl:flex fixed right-6 top-1/2 -translate-y-1/2 z-40 flex-col items-end gap-3 select-none"
    >
      <div className="flex flex-col items-end gap-2.5 bg-black/75 border border-charcoal-border/80 px-3 py-4 rounded-2xl backdrop-blur-xl shadow-2xl">
        <div className="font-mono text-[9px] text-amber/80 uppercase tracking-widest px-1 font-bold">
          CHAPTER
        </div>

        {visibleChapters.map((ch) => {
          const isActive = activeChapter === ch.index;
          return (
            <button
              key={ch.index}
              type="button"
              onClick={() => onSelectChapter(ch.index)}
              className={`group flex items-center gap-2.5 transition-all text-right ${
                isActive ? 'scale-105' : 'opacity-60 hover:opacity-100'
              }`}
              title={`Jump to ${ch.title}`}
            >
              {/* Tooltip on hover */}
              <span
                className={`font-mono text-[10px] tracking-wider transition-colors duration-200 ${
                  isActive
                    ? 'text-amber font-bold'
                    : 'text-offwhite-dim group-hover:text-offwhite'
                }`}
              >
                {ch.label}
              </span>

              {/* Indicator Notch */}
              <span
                className={`relative flex items-center justify-center transition-all duration-300 ${
                  isActive ? 'w-4 h-4' : 'w-2.5 h-2.5'
                }`}
              >
                {isActive && (
                  <span className="absolute inset-0 rounded-full bg-amber/30 animate-ping" />
                )}
                <span
                  className={`rounded-full transition-all duration-300 ${
                    isActive
                      ? 'w-2.5 h-2.5 bg-amber shadow-[0_0_10px_#F59E0B]'
                      : 'w-1.5 h-1.5 bg-white/30 group-hover:bg-white/70'
                  }`}
                />
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
