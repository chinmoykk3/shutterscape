'use client';

import React, { useEffect, useState } from 'react';

/**
 * Lightweight SVG/CSS shutter-click loader (<1.5s, first visit only via sessionStorage).
 * Respects prefers-reduced-motion.
 */
export function ShutterLoader() {
  const [visible, setVisible] = useState(false);
  const [shutterFired, setShutterFired] = useState(false);
  const [fadingOut, setFadingOut] = useState(false);

  useEffect(() => {
    try {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReducedMotion) return;

      const hasVisited = sessionStorage.getItem('shutterscape_loader_seen');
      if (hasVisited) return;

      const showTimer = setTimeout(() => {
        setVisible(true);
      }, 0);

      // Trigger shutter iris close-open snap at 600ms
      const snapTimer = setTimeout(() => {
        setShutterFired(true);
      }, 550);

      // Begin fade out at 1050ms
      const fadeTimer = setTimeout(() => {
        setFadingOut(true);
      }, 1050);

      // Unmount completely at 1350ms (<1.5s budget)
      const doneTimer = setTimeout(() => {
        setVisible(false);
        sessionStorage.setItem('shutterscape_loader_seen', '1');
      }, 1350);

      return () => {
        clearTimeout(showTimer);
        clearTimeout(snapTimer);
        clearTimeout(fadeTimer);
        clearTimeout(doneTimer);
      };
    } catch {
      // Ignore storage access errors and keep hidden
    }
  }, []);

  if (!visible) return null;

  return (
    <div
      role="status"
      aria-label="Opening camera shutter"
      className={`fixed inset-0 z-[100000] flex flex-col items-center justify-center bg-black transition-opacity duration-300 ease-out ${fadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
    >
      <div className="relative w-28 h-28 flex items-center justify-center">
        {/* Outer Lens Ring */}
        <svg viewBox="0 0 120 120" className="w-full h-full">
          <circle
            cx="60"
            cy="60"
            r="56"
            fill="none"
            stroke="#29292F"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />
          <circle
            cx="60"
            cy="60"
            r="48"
            fill="none"
            stroke="#F59E0B"
            strokeWidth="1.5"
            strokeOpacity="0.4"
          />

          {/* 6 Mechanical Aperture Blades that contract and dilate */}
          <g
            className="origin-center transition-transform duration-300 ease-in-out"
            style={{
              transform: shutterFired ? 'scale(0.15) rotate(65deg)' : 'scale(0.85) rotate(0deg)',
            }}
          >
            <polygon points="60,12 95,35 60,52" fill="#F59E0B" fillOpacity="0.9" />
            <polygon points="102,36 102,80 68,60" fill="#F59E0B" fillOpacity="0.75" />
            <polygon points="95,88 60,108 60,68" fill="#F59E0B" fillOpacity="0.9" />
            <polygon points="25,88 60,68 25,45" fill="#F59E0B" fillOpacity="0.75" />
            <polygon points="18,40 52,60 18,80" fill="#F59E0B" fillOpacity="0.85" />
            <polygon points="25,32 60,12 60,52" fill="#F59E0B" fillOpacity="0.7" />
          </g>
        </svg>

        {/* Flash Pop Ring when shutter fires */}
        <div
          className={`absolute inset-0 rounded-full border-2 border-amber transition-all duration-300 ${shutterFired ? 'scale-125 opacity-0' : 'scale-75 opacity-60'
            }`}
        />
      </div>

      <div className="mt-6 flex flex-col items-center gap-1.5 font-mono text-center">
        <div className="flex items-center gap-2 text-xs tracking-[0.28em] text-amber uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-amber animate-ping" />
          <span>{shutterFired ? 'SHUTTER RELEASED' : 'METERING LIGHT'}</span>
        </div>
        <span className="text-[10px] text-offwhite-dim tracking-widest">
          1/250s • f/1.4 • ISO 100
        </span>
      </div>
    </div>
  );
}