import React from 'react';
import { cn } from '@/lib/utils';

interface SectionHeadingProps {
  chapter: string;
  title: string;
  subtitle?: string;
  align?: 'left' | 'center';
  className?: string;
}

export function SectionHeading({
  chapter,
  title,
  subtitle,
  align = 'left',
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        'mb-12 md:mb-16',
        align === 'center' ? 'text-center mx-auto max-w-3xl' : 'max-w-2xl',
        className
      )}
    >
      <div className="flex items-center gap-2 mb-3 font-mono text-[11px] tracking-[0.25em] text-amber uppercase select-none">
        <span className="w-2 h-2 rounded-full bg-amber animate-pulse" />
        <span>{chapter}</span>
      </div>
      <h2 className="font-title text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-offwhite leading-[1.15]">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-4 text-base sm:text-lg text-offwhite-dim font-body leading-relaxed font-light">
          {subtitle}
        </p>
      )}
    </div>
  );
}