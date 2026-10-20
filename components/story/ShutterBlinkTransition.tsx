'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export function ShutterBlinkTransition() {
  const pathname = usePathname();
  const [blink, setBlink] = useState(false);

  useEffect(() => {
    // 150ms shutter-blink transition upon route shift
    const startTimeout = setTimeout(() => {
      setBlink(true);
    }, 0);

    const endTimeout = setTimeout(() => {
      setBlink(false);
    }, 150);

    return () => {
      clearTimeout(startTimeout);
      clearTimeout(endTimeout);
    };
  }, [pathname]);

  if (!blink) return null;

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-[99998] bg-black pointer-events-none transition-opacity duration-75 ease-in-out opacity-90"
    />
  );
}