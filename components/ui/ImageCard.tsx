'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { cn, getDarkroomBlurPlaceholder } from '@/lib/utils';

export interface ImageCardProps extends React.HTMLAttributes<HTMLDivElement> {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  aspectRatio?: 'landscape' | 'portrait' | 'square' | 'video' | 'auto';
  priority?: boolean;
  blurDataURL?: string;
  showViewfinder?: boolean;
  frameNumber?: string;
  cameraMeta?: string;
  developOnScroll?: boolean;
  developed?: boolean;
}

export function ImageCard({
  src,
  alt,
  width = 1000,
  height = 750,
  aspectRatio = 'landscape',
  priority = false,
  blurDataURL,
  showViewfinder = true,
  frameNumber,
  cameraMeta,
  developOnScroll = false,
  developed = true,
  className,
  children,
  ...props
}: ImageCardProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  const ratios = {
    landscape: 'aspect-[4/3]',
    portrait: 'aspect-[3/4]',
    square: 'aspect-square',
    video: 'aspect-video',
    auto: '',
  };

  const placeholderUrl = blurDataURL || getDarkroomBlurPlaceholder(16, 12);

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-2xl bg-charcoal border border-charcoal-border/80 transition-all duration-500 hover:border-amber/50 hover:shadow-[0_0_30px_rgba(245,158,11,0.12)]',
        ratios[aspectRatio],
        className
      )}
      {...props}
    >
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        placeholder="blur"
        blurDataURL={placeholderUrl}
        onLoad={() => setIsLoaded(true)}
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        className={cn(
          'w-full h-full object-cover rounded-2xl transition-all duration-700 ease-out group-hover:scale-[1.04]',
          !isLoaded ? 'scale-105 blur-md grayscale' : 'scale-100 blur-0',
          developOnScroll && !developed && 'darkroom-undeveloped',
          developOnScroll && developed && 'darkroom-developed'
        )}
      />

      {/* Camera Viewfinder Overlay on Hover */}
      {showViewfinder && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-3 rounded-xl border border-white/0 transition-all duration-300 group-hover:border-white/15 z-10"
        >
          {/* Corner Brackets */}
          <div className="absolute top-0 left-0 w-3.5 h-3.5 border-t-2 border-l-2 border-amber opacity-0 transition-all duration-300 -translate-x-1 -translate-y-1 group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-100" />
          <div className="absolute top-0 right-0 w-3.5 h-3.5 border-t-2 border-r-2 border-amber opacity-0 transition-all duration-300 translate-x-1 -translate-y-1 group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-100" />
          <div className="absolute bottom-0 left-0 w-3.5 h-3.5 border-b-2 border-l-2 border-amber opacity-0 transition-all duration-300 -translate-x-1 translate-y-1 group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-100" />
          <div className="absolute bottom-0 right-0 w-3.5 h-3.5 border-b-2 border-r-2 border-amber opacity-0 transition-all duration-300 translate-x-1 translate-y-1 group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-100" />

          {/* Center Autofocus Crosshair */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 opacity-0 scale-75 transition-all duration-300 group-hover:opacity-80 group-hover:scale-100">
            <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-amber/70" />
            <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-amber/70" />
            <div className="absolute inset-1 rounded-full border border-amber/40" />
          </div>

          {/* Optional Frame Number & Camera Metadata Readout inside Viewfinder */}
          {(frameNumber || cameraMeta) && (
            <div className="absolute top-2 left-2.5 right-2.5 flex items-center justify-between text-[10px] font-mono text-amber opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              {frameNumber && <span className="bg-black/70 px-1.5 py-0.5 rounded">{frameNumber}</span>}
              {cameraMeta && <span className="bg-black/70 px-1.5 py-0.5 rounded text-offwhite-muted">{cameraMeta}</span>}
            </div>
          )}
        </div>
      )}

      {/* Optional Card Content Overlay */}
      {children && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent flex flex-col justify-end p-5 z-20">
          {children}
        </div>
      )}
    </div>
  );
}