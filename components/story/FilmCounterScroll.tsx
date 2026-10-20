'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Persistent film-counter scroll indicator (e.g., "Frame 07/36")
 */
export function FilmCounterScroll() {
  const pathname = usePathname();
  const [frame, setFrame] = useState(1);
  const totalFrames = 36;

  useEffect(() => {
    const updateFrame = () => {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) {
        setFrame(1);
        return;
      }
      const progress = Math.min(Math.max(window.scrollY / docHeight, 0), 1);
      const currentFrame = Math.min(Math.max(Math.ceil(progress * totalFrames), 1), totalFrames);
      setFrame(currentFrame);
    };

    window.addEventListener('scroll', updateFrame, { passive: true });
    window.addEventListener('resize', updateFrame, { passive: true });
    updateFrame();

    return () => {
      window.removeEventListener('scroll', updateFrame);
      window.removeEventListener('resize', updateFrame);
    };
  }, [pathname]);

  // Hide on admin routes to keep the Editing Room workspace unobstructed
  if (pathname?.startsWith('/admin')) return null;

  const isDarkroom = pathname === '/gallery';

  return (
    <aside
      aria-label={`Film roll scroll progress: Frame ${frame} of ${totalFrames}`}
      className="fixed right-4 bottom-5 z-40 flex items-center gap-2.5 px-3.5 py-2 rounded-full bg-charcoal/90 border border-charcoal-border backdrop-blur-md text-[11px] font-mono text-offwhite select-none shadow-xl shadow-black/70"
    >
      <span
        className={`w-2 h-2 rounded-full animate-pulse ${isDarkroom ? 'bg-safelight shadow-[0_0_8px_#B3261E]' : 'bg-amber shadow-[0_0_8px_#F59E0B]'
          }`}
      />
      <span className="text-offwhite-dim uppercase tracking-wider">Frame</span>
      <span
        className={`font-bold tabular-nums ${isDarkroom ? 'text-[#ff7b73]' : 'text-amber'
          }`}
      >
        {String(frame).padStart(2, '0')}
      </span>
      <span className="text-offwhite-dim/50">/</span>
      <span className="text-offwhite-dim tabular-nums">{totalFrames}</span>
    </aside>
  );
}