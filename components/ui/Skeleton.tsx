import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'card' | 'text' | 'avatar' | 'frame';
}

export function Skeleton({ className, variant = 'card', ...props }: SkeletonProps) {
  const variants = {
    card: 'w-full h-64 rounded-2xl',
    frame: 'w-full aspect-[4/3] rounded-2xl',
    text: 'w-3/4 h-4 rounded-md',
    avatar: 'w-16 h-16 rounded-2xl',
  };

  return (
    <div
      aria-hidden="true"
      className={cn(
        'animate-pulse bg-charcoal border border-charcoal-border/60 relative overflow-hidden',
        variants[variant],
        className
      )}
      {...props}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-offwhite/[0.03] to-transparent" />
    </div>
  );
}