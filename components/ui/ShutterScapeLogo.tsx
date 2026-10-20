import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface ShutterScapeLogoProps {
    variant?: 'mark' | 'wordmark-white' | 'wordmark-black' | 'combined';
    className?: string;
}

export function ShutterScapeLogo({
    variant = 'combined',
    className,
}: ShutterScapeLogoProps) {
    if (variant === 'wordmark-white') {
        return (
            <div className={cn('relative inline-flex items-center select-none', className)}>
                <Image
                    src="/images/logos/shutterscape-wordmark-white.png"
                    alt="shutter scape"
                    width={140}
                    height={68}
                    className="w-auto h-full object-contain"
                    priority
                />
            </div>
        );
    }

    if (variant === 'wordmark-black') {
        return (
            <div className={cn('relative inline-flex items-center select-none', className)}>
                <Image
                    src="/images/logos/shutterscape-wordmark-black.png"
                    alt="shutter scape"
                    width={140}
                    height={68}
                    className="w-auto h-full object-contain"
                    priority
                />
            </div>
        );
    }

    if (variant === 'mark') {
        return (
            <div className={cn('inline-flex items-center justify-center select-none', className)}>
                <svg
                    viewBox="0 0 220 140"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-full h-full"
                    aria-label="ShutterScape Mark"
                >
                    <path
                        d="M12 10C6.47715 10 2 14.4772 2 20V82C2 87.5228 6.47715 92 12 92H88V102H12C6.47715 102 2 106.477 2 112V120C2 125.523 6.47715 130 12 130H116C121.523 130 126 125.523 126 120V58C126 52.4772 121.523 48 116 48H40V38H116C121.523 38 126 33.5228 126 28V20C126 14.4772 121.523 10 116 10H12Z"
                        fill="currentColor"
                    />
                    <path
                        d="M134 65.5C130.5 67.5 130.5 72.5 134 74.5L208 124C211.5 126.3 216 123.8 216 119.5V20.5C216 16.2 211.5 13.7 208 16L134 65.5Z"
                        fill="currentColor"
                    />
                </svg>
            </div>
        );
    }

    // Combined: Geometric S-Camera Mark + Stacked "shutter scape" typography
    return (
        <div className={cn('inline-flex items-center gap-3 select-none', className)}>
            <div className="w-9 h-6 text-offwhite group-hover:text-amber transition-colors duration-300 shrink-0">
                <svg
                    viewBox="0 0 220 140"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-full h-full"
                    aria-hidden="true"
                >
                    <path
                        d="M12 10C6.47715 10 2 14.4772 2 20V82C2 87.5228 6.47715 92 12 92H88V102H12C6.47715 102 2 106.477 2 112V120C2 125.523 6.47715 130 12 130H116C121.523 130 126 125.523 126 120V58C126 52.4772 121.523 48 116 48H40V38H116C121.523 38 126 33.5228 126 28V20C126 14.4772 121.523 10 116 10H12Z"
                        fill="currentColor"
                    />
                    <path
                        d="M134 65.5C130.5 67.5 130.5 72.5 134 74.5L208 124C211.5 126.3 216 123.8 216 119.5V20.5C216 16.2 211.5 13.7 208 16L134 65.5Z"
                        fill="currentColor"
                    />
                </svg>
            </div>
            <div className="flex flex-col leading-[0.82] tracking-tight text-offwhite">
                <span className="font-body font-black text-lg lowercase tracking-[-0.04em]">
                    shutter
                </span>
                <span className="font-body font-extralight text-lg lowercase tracking-[-0.03em] text-offwhite-muted group-hover:text-amber transition-colors">
                    scape
                </span>
            </div>
        </div>
    );
}