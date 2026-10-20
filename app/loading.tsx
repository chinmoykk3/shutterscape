import React from 'react';
import { Skeleton } from '@/components/ui/Skeleton';

export default function Loading() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12"
    >
      {/* Top Camera Metering Status */}
      <div className="flex items-center gap-3 font-mono text-xs tracking-widest uppercase text-amber">
        <span className="w-2 h-2 rounded-full bg-amber animate-ping" />
        <span>Developing negative in chemical bath...</span>
      </div>

      {/* Hero Frame Skeleton */}
      <div className="space-y-4">
        <Skeleton variant="text" className="w-40 h-4" />
        <Skeleton variant="text" className="w-2/3 h-12 rounded-xl" />
        <Skeleton variant="frame" className="w-full h-[50vh] rounded-2xl mt-6" />
      </div>

      {/* 3-Column Contact Sheet Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Skeleton variant="card" />
        <Skeleton variant="card" />
        <Skeleton variant="card" />
      </div>
    </div>
  );
}