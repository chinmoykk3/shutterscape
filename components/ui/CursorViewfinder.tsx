'use client';

import React, { useEffect, useState, useRef } from 'react';

/**
 * Desktop Camera Viewfinder Cursor.
 * Renders custom corner brackets and autofocus crosshair following the mouse.
 * Expands and locks into amber on interactive elements.
 * Honors prefers-reduced-motion and pointer: coarse.
 */
export function CursorViewfinder() {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);

  const posRef = useRef({ x: -100, y: -100 });
  const targetRef = useRef({ x: -100, y: -100 });
  const cursorRef = useRef<HTMLDivElement>(null);
  const reqRef = useRef<number | null>(null);

  useEffect(() => {
    // Only enable on desktop pointer devices with motion allowed
    const hasFinePointer = window.matchMedia('(pointer: fine)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!hasFinePointer || prefersReducedMotion) {
      return;
    }

    setMounted(true);

    const handleMouseMove = (e: MouseEvent) => {
      targetRef.current = { x: e.clientX, y: e.clientY };
      if (!visible) setVisible(true);

      // Check if hovering interactive element
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.closest('a') ||
          target.closest('button') ||
          target.closest('input') ||
          target.closest('textarea') ||
          target.closest('select') ||
          target.closest('[role="button"]') ||
          target.closest('.interactive'))
      ) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);
    const handleMouseLeave = () => setVisible(false);
    const handleMouseEnter = () => setVisible(true);

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    // Smooth lerp loop
    const render = () => {
      posRef.current.x += (targetRef.current.x - posRef.current.x) * 0.22;
      posRef.current.y += (targetRef.current.y - posRef.current.y) * 0.22;

      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${posRef.current.x}px, ${posRef.current.y}px, 0)`;
      }

      reqRef.current = requestAnimationFrame(render);
    };

    reqRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      if (reqRef.current) cancelAnimationFrame(reqRef.current);
    };
  }, [visible]);

  if (!mounted) return null;

  return (
    <div
      ref={cursorRef}
      aria-hidden="true"
      className={`fixed top-0 left-0 pointer-events-none z-[99999] -translate-x-1/2 -translate-y-1/2 transition-opacity duration-300 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
      style={{ willChange: 'transform' }}
    >
      <div
        className={`relative transition-all duration-200 ease-out flex items-center justify-center ${
          isHovering
            ? 'w-10 h-10 border-amber text-amber'
            : isClicking
            ? 'w-6 h-6 border-white text-white scale-90'
            : 'w-7 h-7 border-offwhite-dim/60 text-offwhite-dim'
        }`}
      >
        {/* Top-Left Reticle */}
        <span
          className={`absolute top-0 left-0 w-2 h-2 border-t border-l transition-colors duration-200 ${
            isHovering ? 'border-amber border-t-2 border-l-2' : 'border-offwhite/50'
          }`}
        />
        {/* Top-Right Reticle */}
        <span
          className={`absolute top-0 right-0 w-2 h-2 border-t border-r transition-colors duration-200 ${
            isHovering ? 'border-amber border-t-2 border-r-2' : 'border-offwhite/50'
          }`}
        />
        {/* Bottom-Left Reticle */}
        <span
          className={`absolute bottom-0 left-0 w-2 h-2 border-b border-l transition-colors duration-200 ${
            isHovering ? 'border-amber border-b-2 border-l-2' : 'border-offwhite/50'
          }`}
        />
        {/* Bottom-Right Reticle */}
        <span
          className={`absolute bottom-0 right-0 w-2 h-2 border-b border-r transition-colors duration-200 ${
            isHovering ? 'border-amber border-b-2 border-r-2' : 'border-offwhite/50'
          }`}
        />

        {/* Center Autofocus Crosshair Dot */}
        <div
          className={`w-1 h-1 rounded-full transition-transform duration-200 ${
            isHovering
              ? 'bg-amber scale-150 shadow-[0_0_8px_#F59E0B]'
              : 'bg-offwhite-dim/60 scale-100'
          }`}
        />
      </div>
    </div>
  );
}
