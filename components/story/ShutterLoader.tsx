'use client';

import React, { useEffect, useState, useSyncExternalStore } from 'react';

const emptySubscribe = () => () => {};

export function ShutterLoader() {
  const isClient = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    const hasSeenLoader = sessionStorage.getItem('shutterscape_first_load');
    if (!hasSeenLoader) {
      const showTimer = setTimeout(() => {
        setVisible(true);
      }, 0);

      const closeTimer = setTimeout(() => {
        setClosing(true);
        setTimeout(() => {
          setVisible(false);
          sessionStorage.setItem('shutterscape_first_load', 'true');
        }, 350);
      }, 1100);

      return () => {
        clearTimeout(showTimer);
        clearTimeout(closeTimer);
      };
    }
  }, []);

  if (!isClient || !visible) return null;

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-[100000] flex flex-col items-center justify-center bg-black transition-opacity duration-350 ease-out ${
        closing ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center">
        {/* Animated Camera Aperture Blades */}
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full text-amber animate-spin"
          style={{ animationDuration: '4s', animationTimingFunction: 'linear' }}
        >
          <circle cx="50" cy="50" r="46" fill="none" stroke="#29292F" strokeWidth="2" />
          <path
            d="M50 10 L50 50 L20 30 Z"
            fill="#F59E0B"
            className="origin-center transition-all duration-700"
          />
          <path
            d="M90 50 L50 50 L70 20 Z"
            fill="#F59E0B"
            opacity="0.85"
            className="origin-center transition-all duration-700"
          />
          <path
            d="M50 90 L50 50 L80 70 Z"
            fill="#F59E0B"
            opacity="0.7"
            className="origin-center transition-all duration-700"
          />
          <path
            d="M10 50 L50 50 L30 80 Z"
            fill="#F59E0B"
            opacity="0.9"
            className="origin-center transition-all duration-700"
          />
        </svg>

        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-4 h-4 rounded-full bg-black border border-amber" />
        </div>
      </div>

      <div className="mt-6 flex flex-col items-center gap-1 font-mono text-center">
        <span className="text-xs tracking-[0.3em] uppercase text-amber">CALIBRATING LENS</span>
        <span className="text-[10px] text-offwhite-dim tracking-widest">SHUTTERSCAPE GCU</span>
      </div>
    </div>
  );
}