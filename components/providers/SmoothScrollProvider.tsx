'use client';

import React from 'react';

/**
 * Clean native smooth scroll wrapper.
 * Strictly adheres to stack requirements: No Lenis used.
 */
export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}