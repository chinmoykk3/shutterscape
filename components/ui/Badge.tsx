import * as React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'amber' | 'safelight' | 'neutral' | 'outline';
}

export function Badge({ className, variant = 'neutral', children, ...props }: BadgeProps) {
  const variants = {
    amber: 'bg-amber/15 text-amber border-amber/30',
    safelight: 'bg-safelight/20 text-[#ff6b63] border-safelight/40',
    neutral: 'bg-charcoal text-offwhite-muted border-charcoal-border',
    outline: 'bg-transparent text-offwhite border-offwhite/20',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-mono tracking-widest uppercase border backdrop-blur-sm select-none',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}