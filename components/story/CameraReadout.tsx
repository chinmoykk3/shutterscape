'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface CameraReadoutProps {
  shutter?: string;
  aperture?: string;
  iso?: string;
  mode?: string;
  className?: string;
}

export function CameraReadout({
  shutter = '1/250s',
  aperture = 'f/2.8',
  iso = 'ISO 400',
  mode = 'MANUAL',
  className,
}: CameraReadoutProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-3 px-3 py-1 rounded-lg bg-charcoal/80 border border-charcoal-border/80 text-[11px] font-mono text-offwhite-muted select-none backdrop-blur-sm',
        className
      )}
    >
      <span className="text-amber font-bold">{mode}</span>
      <span className="w-1 h-1 rounded-full bg-charcoal-border" />
      <span>{shutter}</span>
      <span className="w-1 h-1 rounded-full bg-charcoal-border" />
      <span>{aperture}</span>
      <span className="w-1 h-1 rounded-full bg-charcoal-border" />
      <span className="text-offwhite">{iso}</span>
    </div>
  );
}