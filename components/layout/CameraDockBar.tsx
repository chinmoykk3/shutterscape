'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Film,
  Camera,
  Info,
  UserCircle,
  MessageCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ShutterScapeLogo } from '@/components/ui/ShutterScapeLogo';

interface CameraDockBarProps {
  whatsappUrl?: string;
  instagramUrl?: string;
}

const DOCK_ITEMS = [
  {
    href: '/',
    label: 'Home',
    code: '01',
    tooltip: 'Frame 01 // Prologue & Story',
    icon: Home,
  },
  {
    href: '/activities',
    label: 'Activities',
    code: '02',
    tooltip: 'Frame 02 // 35mm Roll Manifest',
    icon: Film,
  },
  {
    href: '/gallery',
    label: 'Gallery',
    code: '03',
    tooltip: 'Frame 03 // Darkroom Light Table',
    icon: Camera,
  },
  {
    href: '/about',
    label: 'About',
    code: '04',
    tooltip: 'Frame 04 // Behind The Lens',
    icon: Info,
  },
  {
    href: '/portal',
    label: 'Studio',
    code: '05',
    tooltip: 'Frame 05 // Member Studio & Submissions',
    icon: UserCircle,
  },
];

export function CameraDockBar({
  whatsappUrl = 'https://chat.whatsapp.com/Hs71BicR1Xj3PmOyPJ5wdc?s=sw&p=a&mlu=4&ilr=4',
}: CameraDockBarProps) {
  const pathname = usePathname();
  const [hoveredIndex, setHoveredIndex] = useState<string | null>(null);

  // Hide on admin routes to prevent overlapping with admin studio tools
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  const isDarkroom = pathname === '/gallery';

  return (
    <nav
      aria-label="Floating Camera Dock"
      className="fixed bottom-3 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 select-none transition-all duration-300 max-w-[98vw]"
    >
      {/* Active Tooltip Readout */}
      {hoveredIndex && (
        <div
          role="tooltip"
          className="absolute -top-11 left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-1 rounded-lg bg-black/95 border border-charcoal-border text-[11px] font-mono text-offwhite backdrop-blur-md shadow-2xl pointer-events-none animate-in fade-in zoom-in-95 duration-150 flex items-center gap-2"
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isDarkroom ? 'bg-safelight' : 'bg-amber'
            }`}
          />
          <span>{hoveredIndex}</span>
        </div>
      )}

      {/* Floating Pill Chassis */}
      <div
        className={cn(
          'relative rounded-full p-1 sm:p-2 backdrop-blur-2xl transition-all duration-500 flex items-center gap-0.5 sm:gap-1.5 border shadow-2xl',
          isDarkroom
            ? 'bg-black/90 border-safelight/40 shadow-[0_12px_45px_rgba(179,38,30,0.3)]'
            : 'bg-black/90 border-charcoal-border/90 shadow-[0_12px_45px_rgba(0,0,0,0.9)]'
        )}
      >
        {/* Subtle Ambient Film Glow inside dock */}
        <div
          className={cn(
            'pointer-events-none absolute inset-0 rounded-full opacity-30 blur-xl',
            isDarkroom ? 'bg-safelight/20' : 'bg-amber/15'
          )}
        />

        {/* --- Left Flank: Home & Activities --- */}
        <DockButton
          item={DOCK_ITEMS[0]}
          pathname={pathname}
          isDarkroom={isDarkroom}
          onHover={setHoveredIndex}
        />

        <DockButton
          item={DOCK_ITEMS[1]}
          pathname={pathname}
          isDarkroom={isDarkroom}
          onHover={setHoveredIndex}
        />

        {/* --- Centerpiece: The ShutterScape Logo Button --- */}
        <Link
          href="/"
          aria-label="ShutterScape // Return to Origin"
          onMouseEnter={() => setHoveredIndex('ShutterScape // Return to Origin')}
          onMouseLeave={() => setHoveredIndex(null)}
          className={cn(
            'relative w-9 h-9 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all duration-300 mx-0.5 sm:mx-1 group hover:scale-110 active:scale-95 shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber',
            isDarkroom
              ? 'bg-gradient-to-b from-[#260e0d] to-black border-2 border-safelight/80 text-safelight shadow-[0_0_20px_rgba(179,38,30,0.4)]'
              : 'bg-gradient-to-b from-[#1f1e24] to-black border-2 border-amber/80 text-amber shadow-[0_0_20px_rgba(245,158,11,0.35)]'
          )}
        >
          {/* ShutterScape S-Lens Logo Mark */}
          <div className="w-4 h-3 sm:w-6 sm:h-4 relative transition-transform duration-300 group-hover:scale-110 flex items-center justify-center">
            <ShutterScapeLogo variant="mark" className="w-full h-full text-current" />
          </div>

          {/* Shutter Click Indicator Pulse */}
          <span
            className={cn(
              'absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity animate-ping pointer-events-none',
              isDarkroom ? 'bg-safelight/20' : 'bg-amber/20'
            )}
          />
        </Link>

        {/* --- Right Flank: Gallery & About --- */}
        <DockButton
          item={DOCK_ITEMS[2]}
          pathname={pathname}
          isDarkroom={isDarkroom}
          onHover={setHoveredIndex}
        />

        <DockButton
          item={DOCK_ITEMS[3]}
          pathname={pathname}
          isDarkroom={isDarkroom}
          onHover={setHoveredIndex}
        />

        <DockButton
          item={DOCK_ITEMS[4]}
          pathname={pathname}
          isDarkroom={isDarkroom}
          onHover={setHoveredIndex}
        />

        {/* Divider */}
        <div className="w-[1px] h-6 bg-charcoal-border mx-0.5 sm:mx-1 shrink-0" />

        {/* --- WhatsApp Community Guild Action Button --- */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Join WhatsApp Guild"
          onMouseEnter={() => setHoveredIndex('Join WhatsApp Guild')}
          onMouseLeave={() => setHoveredIndex(null)}
          className={cn(
            'p-2 sm:p-2.5 rounded-full transition-all duration-300 text-offwhite-dim hover:text-amber hover:bg-white/5 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber',
            'relative'
          )}
        >
          <MessageCircle className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
          <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-amber animate-pulse" />
        </a>
      </div>
    </nav>
  );
}

interface DockButtonProps {
  item: (typeof DOCK_ITEMS)[0];
  pathname: string;
  isDarkroom: boolean;
  onHover: (text: string | null) => void;
}

function DockButton({ item, pathname, isDarkroom, onHover }: DockButtonProps) {
  const Icon = item.icon;
  const isActive =
    item.href === '/' ? pathname === '/' : pathname?.startsWith(item.href);

  return (
    <Link
      href={item.href}
      aria-label={item.label}
      onMouseEnter={() => onHover(item.tooltip)}
      onMouseLeave={() => onHover(null)}
      className={cn(
        'relative px-2 sm:px-3.5 py-1.5 sm:py-2 rounded-full transition-all duration-300 flex items-center gap-1 sm:gap-1.5 text-xs font-mono tracking-wider focus:outline-none focus-visible:ring-2 focus-visible:ring-amber shrink-0',
        isActive
          ? isDarkroom
            ? 'bg-safelight text-white font-semibold shadow-md shadow-safelight/40 ring-1 ring-safelight/60'
            : 'bg-amber text-black font-semibold shadow-md shadow-amber/40 ring-1 ring-amber/60'
          : 'text-offwhite-dim hover:text-offwhite hover:bg-white/5'
      )}
    >
      <Icon className="w-4 h-4 sm:w-4.5 sm:h-4.5 shrink-0" />
      <span className="hidden md:inline-block">{item.label}</span>
      {isActive && (
        <span
          className={cn(
            'hidden lg:inline-block text-[9px] px-1.5 py-0.2 rounded-full',
            isDarkroom ? 'bg-black/40 text-offwhite' : 'bg-black/30 text-black'
          )}
        >
          {item.code}
        </span>
      )}
    </Link>
  );
}
