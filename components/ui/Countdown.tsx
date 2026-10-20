'use client';

import React, { useState, useEffect, useSyncExternalStore } from 'react';
import { cn } from '@/lib/utils';

interface CountdownProps {
  targetDate: string | Date;
  className?: string;
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

export function Countdown({ targetDate, className, onExpire }: CountdownProps) {
  const isMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const [timeLeft, setTimeLeft] = useState<TimeRemaining>(() => {
    const diff = new Date(targetDate).getTime() - Date.now();
    return {
      days: Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24))),
      hours: Math.max(0, Math.floor((diff / (1000 * 60 * 60)) % 24)),
      minutes: Math.max(0, Math.floor((diff / 1000 / 60) % 60)),
      seconds: Math.max(0, Math.floor((diff / 1000) % 60)),
      total: Math.max(0, diff),
    };
  });

  useEffect(() => {
    const calculate = () => {
      const difference = new Date(targetDate).getTime() - Date.now();
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

    const interval = setInterval(calculate, 1000);
    return () => clearInterval(interval);
  }, [targetDate, onExpire]);

  if (!isMounted) {
    return (
      <div className={cn('flex items-center gap-2 font-mono text-xs text-offwhite-dim', className)}>
        <span>LOADING TIMER...</span>
      </div>
    );
  }

  if (timeLeft.total <= 0) {
    return (
      <div className={cn('font-mono text-xs text-amber font-semibold tracking-wider', className)}>
        EXPOSURE IN PROGRESS
      </div>
    );
  }

  const units = [
    { label: 'D', value: timeLeft.days },
    { label: 'H', value: timeLeft.hours },
    { label: 'M', value: timeLeft.minutes },
    { label: 'S', value: timeLeft.seconds },
  ];

  return (
    <div className={cn('inline-flex items-center gap-2 sm:gap-3 font-mono', className)}>
      {units.map((unit, index) => (
        <div key={unit.label} className="flex items-baseline">
          <span className="text-base sm:text-lg font-bold text-offwhite tabular-nums">
            {String(unit.value).padStart(2, '0')}
          </span>
          <span className="text-[10px] text-offwhite-dim ml-0.5 font-medium">{unit.label}</span>
          {index < units.length - 1 && <span className="text-amber/40 ml-2 sm:ml-3">:</span>}
        </div>
      ))}
    </div>
  );
}