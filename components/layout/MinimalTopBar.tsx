'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShutterScapeLogo } from '@/components/ui/ShutterScapeLogo';
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

  // Hide on admin routes to leave full screen for Editing Room
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  const isDarkroom = pathname === '/gallery';

  return (
    <header className="fixed top-0 left-0 right-0 z-40 pointer-events-none p-4 sm:p-6 transition-all duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Left: Brand Identity Mark (Interactive) */}
        <div className="pointer-events-auto">
          <Link
            href="/"
            aria-label="ShutterScape Home"
            className="group flex items-center gap-3 p-2 -ml-2 rounded-2xl transition-all duration-300 hover:bg-black/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber"
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

        {/* Right: Live Viewfinder Status & Social Mark (Interactive) */}
        <div className="pointer-events-auto flex items-center gap-3">
          {/* Subtle Live Viewfinder Status Chip */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 border border-charcoal-border/70 backdrop-blur-md font-mono text-[10px] text-offwhite-dim">
            <span
              className={cn(
                'w-1.5 h-1.5 rounded-full animate-pulse',
                isDarkroom ? 'bg-safelight' : 'bg-amber'
              )}
            />
            <span className="uppercase tracking-widest">
              {isDarkroom ? 'SAFELIGHT 650NM' : 'METERING: 5000K'}
            </span>
          </div>

          {/* Instagram Link */}
          <a
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Follow ShutterScape on Instagram"
            className="p-2 sm:p-2.5 rounded-full bg-black/60 border border-charcoal-border/80 text-offwhite-dim hover:text-amber hover:border-amber/40 backdrop-blur-md transition-all active:scale-95 shadow-lg"
          >
            <InstagramIcon className="w-4 h-4" />
          </a>
        </div>
      </div>
    </header>
  );
}
