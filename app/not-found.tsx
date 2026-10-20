import React from 'react';
import { CameraReadout } from '@/components/story/CameraReadout';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

/**
 * 404 = "Lost Frame" (overexposed photo aesthetic, "This frame didn't make the cut.")
 */
export default function NotFound() {
  return (
    <section className="relative min-h-[82vh] flex items-center justify-center px-4 py-20 overflow-hidden">
      {/* Overexposed Film Burn & Light Leak Background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(245,158,11,0.32)_0%,rgba(179,38,30,0.18)_45%,rgba(7,7,8,0.98)_80%)]"
      />

      <div className="relative z-10 max-w-2xl w-full rounded-2xl bg-charcoal/80 border border-amber/30 backdrop-blur-xl p-8 sm:p-12 text-center space-y-6 shadow-[0_0_60px_rgba(245,158,11,0.12)]">
        {/* Top Metadata Strip */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-charcoal-border font-mono text-[11px] text-offwhite-dim">
          <span>ROLL #404 • NEGATIVE CORRUPTED</span>
          <Badge variant="safelight" pulse>
            LOST FRAME
          </Badge>
        </div>

        {/* Overexposed Frame Preview */}
        <div className="relative mx-auto w-full h-44 sm:h-52 rounded-2xl overflow-hidden border border-offwhite/20 bg-gradient-to-tr from-[#F4F1EA] via-[#F59E0B]/60 to-[#B3261E]/40 flex items-center justify-center">
          <div className="absolute inset-0 bg-white/30 backdrop-blur-sm" />
          <div className="relative z-10 flex flex-col items-center">
            <span className="font-mono text-xs tracking-[0.3em] uppercase text-black/70 font-bold">
              ERR // 404
            </span>
            <span className="font-title text-3xl sm:text-4xl font-black text-black tracking-tight mt-1">
              OVEREXPOSED
            </span>
          </div>
        </div>

        <div className="pt-2">
          <CameraReadout
            shutter="1/8000s"
            aperture="f/1.2"
            iso="ISO 25600"
            mode="LIGHT LEAK"
          />
        </div>

        <h1 className="font-title text-3xl sm:text-5xl font-bold text-offwhite tracking-tight">
          This frame didn’t make the cut.
        </h1>

        <p className="font-body text-sm sm:text-base text-offwhite-dim max-w-lg mx-auto leading-relaxed">
          The exposure you are looking for was either burned by stray light in the darkroom or left on the editing room floor.
        </p>

        <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
          <Button href="/" variant="primary" size="md">
            Return to Prologue
          </Button>
          <Button href="/activities" variant="secondary" size="md">
            Inspect The Film Roll
          </Button>
          <Button href="/gallery" variant="ghost" size="md">
            Enter The Darkroom
          </Button>
        </div>
      </div>
    </section>
  );
}