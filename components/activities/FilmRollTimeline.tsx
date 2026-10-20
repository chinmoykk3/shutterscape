'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Film, Sparkles } from 'lucide-react';
import { UnexposedUpcomingCard, UpcomingActivityItem } from './UnexposedUpcomingCard';
import { FilmFrameCard, FilmFrameItem } from './FilmFrameCard';
import { Badge } from '@/components/ui/Badge';

export interface YearGroupedActivities {
  year: number;
  activities: FilmFrameItem[];
}

interface FilmRollTimelineProps {
  upcomingActivities: UpcomingActivityItem[];
  yearGroups: YearGroupedActivities[];
}

export function FilmRollTimeline({
  upcomingActivities,
  yearGroups,
}: FilmRollTimelineProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const [selectedYear, setSelectedYear] = useState<number | 'all'>('all');

  // Available years from props
  const allYears = yearGroups.map((g) => g.year);

  // Filter year groups
  const filteredGroups = selectedYear === 'all'
    ? yearGroups
    : yearGroups.filter((g) => g.year === selectedYear);

  // Scroll-drawn connecting line tracker
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current || !lineRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const containerTop = rect.top;
      const containerHeight = rect.height;
      const windowHeight = window.innerHeight;

      // Start filling when container enters middle of screen
      const startOffset = windowHeight * 0.7;
      const scrolledPast = startOffset - containerTop;
      const progress = Math.min(Math.max(scrolledPast / containerHeight, 0), 1);

      lineRef.current.style.height = `${progress * 100}%`;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [filteredGroups]);

  return (
    <div ref={containerRef} className="relative w-full space-y-16">
      {/* =========================================================================
          CONTROL BAR: Year "Roll" Switcher & Telemetry Readout
          ========================================================================= */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-charcoal/85 p-4 rounded-2xl border border-charcoal-border backdrop-blur-xl">
        {/* Year Canister Switchers */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            type="button"
            onClick={() => setSelectedYear('all')}
            className={`px-4 py-2 rounded-xl text-xs font-mono tracking-wider transition-all whitespace-nowrap flex items-center gap-2 ${
              selectedYear === 'all'
                ? 'bg-amber text-black font-semibold shadow-md shadow-amber/20'
                : 'text-offwhite-muted hover:text-offwhite hover:bg-white/5'
            }`}
          >
            <Film className="w-3.5 h-3.5" />
            All Rolls
          </button>

          {allYears.map((year) => (
            <button
              key={year}
              type="button"
              onClick={() => setSelectedYear(year)}
              className={`px-4 py-2 rounded-xl text-xs font-mono tracking-wider transition-all whitespace-nowrap ${
                selectedYear === year
                  ? 'bg-amber text-black font-semibold shadow-md shadow-amber/20'
                  : 'text-offwhite-muted hover:text-offwhite hover:bg-white/5'
              }`}
            >
              Roll {year}
            </button>
          ))}
        </div>

        {/* Telemetry info */}
        <div className="text-xs font-mono text-offwhite-dim flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber animate-pulse" />
          <span>CONTINUOUS 35MM CASSETTE // ISO 400</span>
        </div>
      </div>

      {/* =========================================================================
          THE VERTICAL 35MM FILM REEL STRIP
          ========================================================================= */}
      <div className="relative w-full px-2 sm:px-6 md:px-12 py-8 rounded-3xl bg-[#09090b] border-2 border-charcoal-border/80 shadow-2xl overflow-hidden">
        {/* Left Sprocket Track */}
        <div
          aria-hidden="true"
          className="sprocket-track-left hidden md:block opacity-75"
        />

        {/* Right Sprocket Track */}
        <div
          aria-hidden="true"
          className="sprocket-track-right hidden md:block opacity-75"
        />

        {/* Central Scroll-Drawn Connecting Line */}
        <div className="absolute top-12 bottom-12 left-4 md:left-1/2 -translate-x-1/2 w-[2px] bg-charcoal-border/50 z-0 pointer-events-none">
          {/* Active Drawn Fill */}
          <div
            ref={lineRef}
            className="w-full bg-gradient-to-b from-amber via-amber to-safelight transition-all duration-100 ease-out shadow-[0_0_12px_rgba(245,158,11,0.6)]"
            style={{ height: '0%' }}
          />
        </div>

        {/* Content Flow inside Film Strip */}
        <div className="relative z-10 space-y-20 max-w-5xl mx-auto pl-6 md:pl-0">
          {/* =====================================================================
              SECTION 1: UNEXPOSED FRAMES (Upcoming Expeditions)
              ===================================================================== */}
          {upcomingActivities.length > 0 && selectedYear === 'all' && (
            <section aria-labelledby="unexposed-rolls-heading" className="space-y-8">
              {/* Canister Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-black/80 border border-amber/40 shadow-lg">
                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full bg-amber animate-ping" />
                  <div>
                    <h2 id="unexposed-rolls-heading" className="font-title text-xl font-bold text-offwhite flex items-center gap-2">
                      <span>Unexposed Frames</span>
                      <Badge variant="amber" className="text-[10px] py-0.5 px-2">
                        <Sparkles className="w-3 h-3 mr-1" />
                        SCHEDULED MISSIONS
                      </Badge>
                    </h2>
                    <p className="font-mono text-xs text-amber">
                      Latent exposures awaiting chemical development. Hover or tap to preview.
                    </p>
                  </div>
                </div>
                <div className="font-mono text-xs text-offwhite-dim">
                  CANISTER CASSETTE 01 // LOADED
                </div>
              </div>

              {/* Stack of Upcoming Unexposed Cards */}
              <div className="space-y-8">
                {upcomingActivities.map((activity, idx) => (
                  <UnexposedUpcomingCard
                    key={activity._id}
                    activity={activity}
                    frameNumber={`EXP. ${String(idx + 1).padStart(2, '0')} (UNEXPOSED)`}
                  />
                ))}
              </div>
            </section>
          )}

          {/* =====================================================================
              SECTION 2: CHRONOLOGICAL YEAR "ROLL" GROUPS (Archived Exposures)
              ===================================================================== */}
          {filteredGroups.map((group, groupIdx) => (
            <section
              key={group.year}
              aria-labelledby={`roll-heading-${group.year}`}
              className="space-y-8"
            >
              {/* Year Roll Canister Header */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-black/90 border border-charcoal-border shadow-md">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-charcoal border border-charcoal-border flex items-center justify-center font-mono text-xs font-bold text-amber">
                    {String(groupIdx + 1).padStart(2, '0')}
                  </div>
                  <div>
                    <h2
                      id={`roll-heading-${group.year}`}
                      className="font-title text-xl sm:text-2xl font-black text-offwhite tracking-tight"
                    >
                      Roll {group.year} {'//'} The Negatives
                    </h2>
                    <p className="font-mono text-[11px] text-offwhite-dim">
                      Archival exposures cataloged during academic term {group.year}.
                    </p>
                  </div>
                </div>
                <Badge variant="neutral" className="text-xs font-mono">
                  {group.activities.length} EXPOSURES
                </Badge>
              </div>

              {/* Grid of 35mm Frame Cards within this year roll (Single-column on mobile, 2-column on desktop) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {group.activities.map((activity, frameIdx) => (
                  <FilmFrameCard
                    key={activity._id}
                    activity={activity}
                    frameIndex={frameIdx + 1}
                  />
                ))}
              </div>
            </section>
          ))}

          {/* Empty State */}
          {filteredGroups.length === 0 && upcomingActivities.length === 0 && (
            <div className="p-16 text-center rounded-2xl bg-charcoal/40 border border-charcoal-border border-dashed space-y-4">
              <Film className="w-10 h-10 text-offwhite-dim mx-auto" />
              <h3 className="font-title text-xl font-bold text-offwhite">
                No Negatives Found on this Roll
              </h3>
              <p className="text-xs font-mono text-offwhite-muted max-w-sm mx-auto">
                No activities recorded for the selected roll year. Choose &quot;All Rolls&quot; to view all past expeditions.
              </p>
              <button
                type="button"
                onClick={() => setSelectedYear('all')}
                className="text-xs font-mono text-amber hover:underline"
              >
                Reset to All Rolls
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
