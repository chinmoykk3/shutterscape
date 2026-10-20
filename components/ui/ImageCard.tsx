'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface ImageCardProps extends React.HTMLAttributes<HTMLDivElement> {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  aspectRatio?: 'landscape' | 'portrait' | 'square' | 'auto';
  priority?: boolean;
  blurDataURL?: string;
  showViewfinder?: boolean;
}

export function ImageCard({
  src,
  alt,
  width = 800,
  height = 600,
  aspectRatio = 'landscape',
  priority = false,
  blurDataURL,
  showViewfinder = true,
  className,
  children,
  ...props
}: ImageCardProps) {
  const [isLoading, setIsLoading] = useState(true);

  const ratios = {
    landscape: 'aspect-[4/3] sm:aspect-[16/10]',
    portrait: 'aspect-[3/4]',
    square: 'aspect-square',
    auto: '',
  };

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-2xl bg-charcoal border border-charcoal-border/70 transition-all duration-500 hover:border-amber/40',
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
        placeholder={blurDataURL ? 'blur' : 'empty'}
        blurDataURL={blurDataURL}
        onLoad={() => setIsLoading(false)}
        className={cn(
          'w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105',
          isLoading ? 'scale-105 blur-md grayscale' : 'scale-100 blur-0 grayscale-0'
        )}
      />

      {/* Viewfinder Reticle Lines on Hover */}
      {showViewfinder && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-3 rounded-xl border border-transparent transition-colors duration-300 group-hover:border-white/20"
        >
          {/* Top-left corner bracket */}
          <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-amber opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          {/* Top-right corner bracket */}
          <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-amber opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          {/* Bottom-left corner bracket */}
          <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-amber opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          {/* Bottom-right corner bracket */}
          <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-amber opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

          {/* Subtle center crosshair */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 opacity-0 transition-opacity duration-300 group-hover:opacity-80">
            <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-amber/50" />
            <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-amber/50" />
          </div>
        </div>
      )}

      {children && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex flex-col justify-end p-5">
          {children}
        </div>
      )}
    </div>
  );
}