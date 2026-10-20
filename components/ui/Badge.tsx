import * as React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'amber' | 'safelight' | 'neutral' | 'outline';
  pulse?: boolean;
}

export function Badge({
  className,
  variant = 'neutral',
  pulse = false,
  children,
  ...props
}: BadgeProps) {
  const variants = {
    amber: 'bg-amber/15 text-amber border-amber/40 shadow-[0_0_12px_rgba(245,158,11,0.15)]',
    safelight: 'bg-safelight/20 text-[#ff7b73] border-safelight/50 shadow-[0_0_12px_rgba(179,38,30,0.25)]',
    neutral: 'bg-charcoal text-offwhite-muted border-charcoal-border',
    outline: 'bg-transparent text-offwhite border-offwhite/25',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono tracking-widest uppercase border backdrop-blur-sm select-none',
        variants[variant],
        className
      )}
      {...props}
    >
      {pulse && (
        <span
          className={cn(
            'w-1.5 h-1.5 rounded-full animate-pulse',
            variant === 'safelight' ? 'bg-[#ff7b73]' : 'bg-amber'
          )}
        />
      )}
      {children}
    </span>
  );
}