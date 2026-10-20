'use client';

import React, { useEffect, useState } from 'react';

export function FilmCounterScroll() {
  const [frame, setFrame] = useState(1);
  const totalFrames = 36;

  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight <= 0) {
        setFrame(1);
        return;
      }
      const scrollFraction = Math.min(Math.max(window.scrollY / scrollHeight, 0), 1);
      const computedFrame = Math.min(Math.floor(scrollFraction * totalFrames) + 1, totalFrames);
      setFrame(computedFrame);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <aside
      aria-label="Story progress indicator"
      className="fixed right-4 bottom-6 z-40 hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-charcoal/90 border border-charcoal-border backdrop-blur-md text-[11px] font-mono text-offwhite select-none shadow-lg shadow-black/60"
    >
      <span className="w-1.5 h-1.5 rounded-full bg-amber animate-pulse" />
      <span className="text-offwhite-dim">EXP</span>
      <span className="text-amber font-semibold tabular-nums">
        {String(frame).padStart(2, '0')}
      </span>
      <span className="text-offwhite-dim">/</span>
      <span className="text-offwhite-dim">{totalFrames}</span>
    </aside>
  );
}