'use client';

import * as React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  href?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isExternal?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      href,
      isExternal = false,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-mono tracking-wider uppercase transition-all duration-300 rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-amber focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:opacity-50 disabled:pointer-events-none select-none active:scale-[0.98]';

    const variants = {
      primary:
        'bg-amber text-black hover:bg-[#fbbf24] shadow-[0_0_24px_rgba(245,158,11,0.28)] hover:shadow-[0_0_32px_rgba(245,158,11,0.45)] font-semibold',
      secondary:
        'bg-charcoal text-offwhite border border-charcoal-border hover:border-offwhite/40 hover:bg-charcoal-subtle',
      outline:
        'bg-transparent border border-amber/60 text-amber hover:bg-amber/10 hover:border-amber',
      danger:
        'bg-safelight text-offwhite hover:bg-[#c92b22] shadow-[0_0_20px_rgba(179,38,30,0.35)] font-semibold',
      ghost:
        'bg-transparent text-offwhite-muted hover:text-offwhite hover:bg-charcoal/60',
    };

    const sizes = {
      sm: 'px-3.5 py-1.5 text-[11px] gap-1.5',
      md: 'px-5 py-2.5 text-xs gap-2',
      lg: 'px-7 py-3.5 text-sm gap-2.5',
    };

    const combinedClasses = cn(baseStyles, variants[variant], sizes[size], className);

    if (href) {
      if (isExternal) {
        return (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={combinedClasses}
          >
            {children}
          </a>
        );
      }
      return (
        <Link href={href} className={combinedClasses}>
          {children}
        </Link>
      );
    }

    return (
      <button ref={ref} disabled={disabled} className={combinedClasses} {...props}>
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';