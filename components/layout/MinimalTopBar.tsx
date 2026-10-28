'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sun, Moon, Sparkles, Zap, UserCircle } from 'lucide-react';
import { ShutterScapeLogo } from '@/components/ui/ShutterScapeLogo';
import { useDayArc } from '@/components/providers/DayArcProvider';
import { useStoryMode } from '@/components/providers/StoryModeProvider';
import { cn } from '@/lib/utils';

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

interface MinimalTopBarProps {
  instagramUrl?: string;
  whatsappUrl?: string;
}

export function MinimalTopBar({
  instagramUrl = 'https://www.instagram.com/shutterscape_gcu',
}: MinimalTopBarProps) {
  const pathname = usePathname();
  const { theme, isAuto, metadata, toggleSunMoon } = useDayArc();
  const { mode, toggleMode } = useStoryMode();

  // Hide on admin routes to leave full screen for Editing Room
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  const isDarkroom = pathname === '/gallery';

  return (
    <header className="fixed top-0 left-0 right-0 z-40 pointer-events-none p-3 sm:p-6 transition-all duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Left: Brand Identity Mark (Interactive) */}
        <div className="pointer-events-auto">
          <Link
            href="/"
            aria-label="ShutterScape Home"
            className="group flex items-center gap-2 sm:gap-3 p-1.5 sm:p-2 -ml-1 sm:-ml-2 rounded-2xl transition-all duration-300 hover:bg-black/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber"
          >
            <ShutterScapeLogo variant="combined" />
            <div className="hidden sm:flex flex-col border-l border-charcoal-border pl-3">
              <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-offwhite-dim leading-none">
                Girijananda Chowdhury University
              </span>
              <span
                className={cn(
                  'font-mono text-[10px] tracking-widest font-semibold leading-tight mt-0.5',
                  isDarkroom ? 'text-safelight' : 'text-amber'
                )}
              >
                PHOTOGRAPHY COLLECTIVE
              </span>
            </div>
          </Link>
        </div>

        {/* Right: Controls & Social Mark (Interactive) */}
        <div className="pointer-events-auto flex items-center gap-2 sm:gap-3">
          {/* Day Arc Dial / Sun-Moon Override Button */}
          <button
            type="button"
            onClick={toggleSunMoon}
            title={`Day Arc Theme: ${metadata.label} (${isAuto ? 'Auto' : 'Manual'}). Click to cycle.`}
            aria-label={`Cycle Day Arc theme, currently ${metadata.label}`}
            className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-full bg-black/75 border border-charcoal-border/80 text-offwhite-dim hover:text-amber hover:border-amber/40 backdrop-blur-md transition-all active:scale-95 shadow-lg font-mono text-[10px]"
          >
            {theme === 'night' ? (
              <Moon className="w-3.5 h-3.5 text-amber" />
            ) : (
              <Sun className="w-3.5 h-3.5 text-amber" />
            )}
            <span className="hidden lg:inline-block tracking-wider uppercase">
              {metadata.label}
            </span>
            <span className="text-[9px] px-1 py-0.2 rounded bg-white/10 text-offwhite-dim uppercase hidden xl:inline">
              {isAuto ? 'Auto' : 'Manual'}
            </span>
          </button>

          {/* Story / Quick Mode Toggle */}
          <button
            type="button"
            onClick={toggleMode}
            title={`Toggle viewing experience (Currently ${mode.toUpperCase()} mode)`}
            aria-label={`Toggle Story or Quick mode, currently ${mode} mode`}
            className={cn(
              'flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-black/75 border backdrop-blur-md transition-all active:scale-95 shadow-lg font-mono text-[10px]',
              mode === 'story'
                ? 'border-amber/40 text-amber'
                : 'border-charcoal-border/80 text-offwhite-dim hover:text-offwhite'
            )}
          >
            {mode === 'story' ? (
              <Sparkles className="w-3.5 h-3.5 text-amber" />
            ) : (
              <Zap className="w-3.5 h-3.5 text-offwhite-dim" />
            )}
            <span className="hidden md:inline-block tracking-wider uppercase font-semibold">
              {mode === 'story' ? 'Story' : 'Quick'}
            </span>
          </button>

          {/* Member Studio / Sign In Link */}
          <Link
            href="/portal"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber/15 hover:bg-amber border border-amber/30 hover:border-amber text-amber hover:text-black font-mono text-[10px] font-bold tracking-wider uppercase backdrop-blur-md transition-all active:scale-95 shadow-lg"
          >
            <UserCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Member Studio</span>
            <span className="sm:hidden">Studio</span>
          </Link>

          {/* Instagram Link */}
          <a
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Follow ShutterScape on Instagram"
            className="p-2 sm:p-2.5 rounded-full bg-black/75 border border-charcoal-border/80 text-offwhite-dim hover:text-amber hover:border-amber/40 backdrop-blur-md transition-all active:scale-95 shadow-lg"
          >
            <InstagramIcon className="w-4 h-4" />
          </a>
        </div>
      </div>
    </header>
  );
}
