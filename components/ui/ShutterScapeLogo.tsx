'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface ShutterScapeLogoProps {
  variant?: 'mark' | 'wordmark-white' | 'wordmark-black' | 'combined';
  className?: string;
}

function VectorMark({ svgClassName }: { svgClassName?: string }) {
  return (
    <svg
      viewBox="0 0 220 140"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('w-full h-full', svgClassName)}
      aria-hidden="true"
    >
      {/* Geometric Block 'S' */}
      <path
        d="M12 10C6.47715 10 2 14.4772 2 20V82C2 87.5228 6.47715 92 12 92H88V102H12C6.47715 102 2 106.477 2 112V120C2 125.523 6.47715 130 12 130H116C121.523 130 126 125.523 126 120V58C126 52.4772 121.523 48 116 48H40V38H116C121.523 38 126 33.5228 126 28V20C126 14.4772 121.523 10 116 10H12Z"
        fill="currentColor"
      />
      {/* Camera Lens Cone Triangle */}
      <path
        d="M134 65.5C130.5 67.5 130.5 72.5 134 74.5L208 124C211.5 126.3 216 123.8 216 119.5V20.5C216 16.2 211.5 13.7 208 16L134 65.5Z"
        fill="currentColor"
      />
    </svg>
  );
}

function StackedTypography({ darkText }: { darkText?: boolean }) {
  return (
    <div
      className={cn(
        'flex flex-col leading-[0.82] select-none',
        darkText !== undefined
          ? (darkText ? 'text-black' : 'text-offwhite')
          : 'text-slate-900 dark:text-offwhite'
      )}
    >
      <span className="font-body font-black text-[18px] sm:text-[19px] tracking-[-0.04em] lowercase">
        shutter
      </span>
      <span
        className={cn(
          'font-body font-extralight text-[18px] sm:text-[19px] tracking-[-0.03em] lowercase transition-colors duration-300',
          darkText !== undefined
            ? (darkText ? 'text-black/80' : 'text-offwhite-muted group-hover:text-amber')
            : 'text-slate-600 dark:text-offwhite-muted group-hover:text-amber-600 dark:group-hover:text-amber'
        )}
      >
        scape
      </span>
    </div>
  );
}

/**
 * Renders the official ShutterScape brand identity:
 * - 'mark': Geometric block 'S' + camera lens projection cone SVG
 * - 'wordmark-white': Stacked bold/light "shutter scape" in off-white
 * - 'wordmark-black': Stacked bold/light "shutter scape" in black
 * - 'combined': S-Cone Mark paired with stacked "shutter scape" wordmark
 */
export function ShutterScapeLogo({
  variant = 'combined',
  className,
}: ShutterScapeLogoProps) {
  const [imgError, setImgError] = useState(false);

  if (variant === 'mark') {
    return (
      <div className={cn('inline-flex items-center justify-center select-none text-slate-900 dark:text-offwhite', className)}>
        <VectorMark />
      </div>
    );
  }

  if (variant === 'wordmark-white') {
    return (
      <div className={cn('relative inline-flex items-center select-none', className)}>
        {!imgError ? (
          <Image
            src="/images/logos/logo_2.png"
            alt="shutter scape"
            width={130}
            height={62}
            className="w-auto h-8 object-contain"
            onError={() => setImgError(true)}
            priority
          />
        ) : (
          <StackedTypography darkText={false} />
        )}
      </div>
    );
  }

  if (variant === 'wordmark-black') {
    return (
      <div className={cn('relative inline-flex items-center select-none', className)}>
        {!imgError ? (
          <Image
            src="/images/logos/logo_3.png"
            alt="shutter scape"
            width={130}
            height={62}
            className="w-auto h-8 object-contain"
            onError={() => setImgError(true)}
            priority
          />
        ) : (
          <StackedTypography darkText={true} />
        )}
      </div>
    );
  }

  // Default 'combined' lockup: Geometric S-Camera Mark + Stacked "shutter scape" wordmark
  return (
    <div className={cn('inline-flex items-center gap-2 sm:gap-3 select-none', className)}>
      <div className="w-8 h-5 sm:w-10 sm:h-7 text-slate-900 dark:text-offwhite group-hover:text-amber-600 dark:group-hover:text-amber transition-colors duration-300 shrink-0">
        <VectorMark />
      </div>
      <StackedTypography />
    </div>
  );
}
