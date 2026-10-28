// File: components/story/QuickFactsStrip.tsx
'use client';

import React from 'react';
import { Camera, Film, Flame, MapPin, Layers, Users, Aperture } from 'lucide-react';

interface QuickFactsStripProps {
  stats: {
    members: number;
    events: number;
    photos: number;
  };
}

export function QuickFactsStrip({ stats }: QuickFactsStripProps) {
  const facts = [
    {
      icon: Users,
      label: 'Society Roster',
      value: `${stats.members}+ Fellows`,
      sub: 'Students & Faculty',
      color: 'text-amber',
    },
    {
      icon: Film,
      label: 'Analog Standard',
      value: '35mm & 120 Roll',
      sub: '36 Exp. Per Canister',
      color: 'text-offwhite',
    },
    {
      icon: Camera,
      label: 'Archive Negatives',
      value: `${stats.photos}+ Frames`,
      sub: 'Silver & Digital RAW',
      color: 'text-amber',
    },
    {
      icon: Layers,
      label: 'Field Expeditions',
      value: `${stats.events} Walks`,
      sub: 'Statewide Photowalks',
      color: 'text-offwhite',
    },
    {
      icon: Flame,
      label: 'Club Darkroom',
      value: '630nm Safelight',
      sub: 'Silver Gelatin Chemistry',
      color: 'text-rose-400',
    },
    {
      icon: MapPin,
      label: 'Home Campus',
      value: '26.1332° N, 91.6194° E',
      sub: 'Azara, Guwahati, Assam',
      color: 'text-offwhite-dim',
    },
  ];

  return (
    <div className="w-full bg-[#08080a] border-y border-charcoal-border/70 py-6 px-4 sm:px-6 lg:px-8 overflow-hidden select-none">
      <div className="max-w-7xl mx-auto">
        {/* Monospace telemetry header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-charcoal-border/40 font-mono text-[10px] tracking-widest uppercase text-offwhite-dim">
          <div className="flex items-center gap-2">
            <Aperture className="w-3.5 h-3.5 text-amber animate-spin-slow" />
            <span>SHUTTERSCAPE // QUICK TELEMETRY & ARCHIVE SPECIFICATIONS</span>
          </div>
          <div className="hidden md:flex items-center gap-3 text-amber/80">
            <span>GCU VISUAL ARTS ARCHIVE</span>
            <span>•</span>
            <span>EST. 2023</span>
          </div>
        </div>

        {/* Fact items grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
          {facts.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="flex flex-col p-3.5 rounded-xl bg-charcoal/40 border border-charcoal-border/60 hover:border-amber/40 transition-colors group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-[9px] text-offwhite-dim tracking-wider uppercase">
                    {item.label}
                  </span>
                  <Icon className="w-3.5 h-3.5 text-amber/70 group-hover:text-amber transition-colors" />
                </div>
                <div className={`font-mono text-sm sm:text-base font-bold ${item.color} tracking-tight`}>
                  {item.value}
                </div>
                <div className="font-mono text-[10px] text-offwhite-dim/80 mt-0.5 truncate">
                  {item.sub}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
