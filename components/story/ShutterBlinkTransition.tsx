'use client';

import React, { useEffect, useState, useRef } from 'react';
import { usePathname } from 'next/navigation';

/**
 * 150ms physical camera shutter-blink curtain on page navigation.
 * Honors prefers-reduced-motion.
 */
export function ShutterBlinkTransition() {
  const pathname = usePathname();
  const isFirstRender = useRef(true);
  const [blinking, setBlinking] = useState(false);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const startTimer = setTimeout(() => {
      setBlinking(true);
    }, 0);
    const timer = setTimeout(() => {
      setBlinking(false);
    }, 150);

    return () => {
      clearTimeout(startTimer);
      clearTimeout(timer);
    };
  }, [pathname]);

  if (!blinking) return null;

  return (
    <div
      aria-hidden="true"
      className="shutter-curtain animate-shutter-blink flex flex-col justify-between"
    >
      <div className="w-full h-1/2 bg-black border-b border-amber/20" />
      <div className="w-full h-1/2 bg-black border-t border-amber/20" />
    </div>
  );
}