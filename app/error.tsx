'use client';

import React, { useEffect } from 'react';
import { CameraReadout } from '@/components/story/CameraReadout';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to console or error tracking service
    console.error('ShutterScape Camera System Exception:', error);
  }, [error]);

  return (
    <section className="relative min-h-[82vh] flex items-center justify-center px-4 py-20 overflow-hidden">
      {/* Red Safelight Warning Glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(179,38,30,0.3)_0%,rgba(18,18,20,0.95)_70%)]"
      />

      <div className="relative z-10 max-w-xl w-full rounded-2xl bg-charcoal/90 border border-safelight/40 backdrop-blur-xl p-8 sm:p-10 text-center space-y-6 shadow-[0_0_60px_rgba(179,38,30,0.2)]">
        {/* Top Status Strip */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-charcoal-border font-mono text-[11px] text-offwhite-dim">
          <span>OPTICAL EXPOSURE FAULT</span>
          <Badge variant="safelight" pulse>
            SHUTTER JAMMED
          </Badge>
        </div>

        {/* Warning Icon Badge */}
        <div className="w-16 h-16 rounded-full bg-safelight/10 border border-safelight/30 flex items-center justify-center mx-auto text-safelight shadow-[0_0_25px_rgba(179,38,30,0.25)]">
          <AlertTriangle className="w-8 h-8 animate-pulse" />
        </div>

        <div className="space-y-2">
          <span className="font-mono text-xs tracking-[0.25em] text-safelight uppercase font-bold">
            MECHANICAL ERROR // {error.digest ? `DIGEST: ${error.digest.slice(0, 8)}` : '500 FAULT'}
          </span>
          <h1 className="font-title text-3xl sm:text-4xl font-bold text-offwhite tracking-tight">
            A glitch occurred in the optical engine.
          </h1>
          <p className="font-body text-sm text-offwhite-dim max-w-md mx-auto leading-relaxed">
            The film advance mechanism encountered an unexpected obstruction while rendering this exposure.
          </p>
        </div>

        <div className="py-2">
          <CameraReadout
            shutter="JAMMED"
            aperture="f/0.0"
            iso="ERR"
            mode="FAULT STATE"
          />
        </div>

        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          <Button
            onClick={() => reset()}
            variant="primary"
            size="md"
            className="gap-2 shadow-[0_0_20px_rgba(245,158,11,0.25)]"
          >
            <RefreshCw className="w-4 h-4" />
            Clear Jam &amp; Retry
          </Button>
          <Button
            href="/"
            variant="secondary"
            size="md"
            className="gap-2"
          >
            <Home className="w-4 h-4" />
            Return to Light Table
          </Button>
        </div>
      </div>
    </section>
  );
}
