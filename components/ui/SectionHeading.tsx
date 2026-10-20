import React from 'react';
import { cn } from '@/lib/utils';

interface SectionHeadingProps {
  chapter: string;
  title: string;
  subtitle?: string;
  align?: 'left' | 'center';
  accent?: 'amber' | 'safelight';
  className?: string;
}

export function SectionHeading({
  chapter,
  title,
  subtitle,
  align = 'left',
  accent = 'amber',
  className,
}: SectionHeadingProps) {
  const isSafelight = accent === 'safelight';

  return (
    <div
      className={cn(
        'mb-12 md:mb-16',
        align === 'center' ? 'text-center mx-auto max-w-3xl' : 'max-w-2xl',
        className
      )}
    >
      <div
        className={cn(
          'inline-flex items-center gap-2 mb-3 font-mono text-[11px] tracking-[0.25em] uppercase select-none',
          isSafelight ? 'text-[#ff6b63]' : 'text-amber',
          align === 'center' && 'justify-center'
        )}
      >
        <span
          className={cn(
            'w-2 h-2 rounded-full animate-pulse',
            isSafelight ? 'bg-safelight shadow-[0_0_8px_#B3261E]' : 'bg-amber shadow-[0_0_8px_#F59E0B]'
          )}
        />
        <span>{chapter}</span>
      </div>
      <h2 className="font-title text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-offwhite leading-[1.12]">
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