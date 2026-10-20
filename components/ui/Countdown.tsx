'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface CountdownProps {
  targetDate: string | Date;
  className?: string;
  compact?: boolean;
  onExpire?: () => void;
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

const emptySubscribe = () => () => {};

export function Countdown({
  targetDate,
  className,
  compact = false,
  onExpire,
}: CountdownProps) {
  const mounted = React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
  const [timeLeft, setTimeLeft] = useState<TimeRemaining>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    total: 1,
  });

  useEffect(() => {

    const calculate = () => {
      const targetTime = new Date(targetDate).getTime();
      const nowTime = Date.now();
      const difference = targetTime - nowTime;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 });
        if (onExpire) onExpire();
        return;
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
        total: difference,
      });
    };

    calculate();
    const interval = setInterval(calculate, 1000);
    return () => clearInterval(interval);
  }, [targetDate, onExpire]);

  if (!mounted) {
    return (
      <div
        className={cn(
          'inline-flex items-center gap-2 font-mono text-xs text-offwhite-dim',
          className
        )}
      >
        <span className="w-2 h-2 rounded-full bg-amber/50 animate-ping" />
        <span>SYNCING SHUTTER TIMER...</span>
      </div>
    );
  }

  if (timeLeft.total <= 0) {
    return (
      <div
        className={cn(
          'inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber/15 border border-amber/40 font-mono text-xs text-amber font-semibold tracking-wider',
          className
        )}
      >
        <span className="w-2 h-2 rounded-full bg-amber animate-ping" />
        <span>SHUTTER OPEN • LIVE NOW</span>
      </div>
    );
  }

  const units = [
    { label: compact ? 'D' : 'DAYS', value: timeLeft.days },
    { label: compact ? 'H' : 'HRS', value: timeLeft.hours },
    { label: compact ? 'M' : 'MIN', value: timeLeft.minutes },
    { label: compact ? 'S' : 'SEC', value: timeLeft.seconds },
  ];

  if (compact) {
    return (
      <div
        aria-label="Countdown timer"
        className={cn('inline-flex items-center gap-2 font-mono', className)}
      >
        {units.map((unit, index) => (
          <div key={unit.label} className="flex items-baseline">
            <span className="text-sm sm:text-base font-bold text-offwhite tabular-nums">
              {String(unit.value).padStart(2, '0')}
            </span>
            <span className="text-[10px] text-amber ml-0.5">{unit.label}</span>
            {index < units.length - 1 && (
              <span className="text-offwhite-dim/40 mx-1.5">:</span>
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      aria-label="Countdown timer"
      className={cn('grid grid-cols-4 gap-2 sm:gap-4 font-mono max-w-md', className)}
    >
      {units.map((unit) => (
        <div
          key={unit.label}
          className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl bg-charcoal/90 border border-amber/30 shadow-[0_0_20px_rgba(245,158,11,0.08)]"
        >
          <span className="text-xl sm:text-3xl font-bold text-offwhite tabular-nums tracking-tight">
            {String(unit.value).padStart(2, '0')}
          </span>
          <span className="text-[9px] sm:text-[10px] tracking-[0.2em] text-amber uppercase mt-1">
            {unit.label}
          </span>
        </div>
      ))}
    </div>
  );
}