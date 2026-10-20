import { CameraReadout } from '@/components/story/CameraReadout';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <main className="relative min-h-[85vh] flex items-center justify-center px-4 overflow-hidden">
      {/* Overexposed Light Burn Shader */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-radial from-amber/20 via-black to-black opacity-90"
      />

      <div className="relative z-10 max-w-xl mx-auto text-center space-y-6">
        <div className="inline-flex flex-col items-center gap-2">
          <CameraReadout shutter="1/8000s" aperture="f/1.2" iso="ISO 25600" mode="OVEREXPOSED" />
          <span className="font-mono text-xs uppercase tracking-[0.3em] text-safelight font-bold mt-2">
            Error 404 • Lost Frame
          </span>
        </div>

        <h1 className="font-title text-4xl sm:text-6xl font-black text-offwhite tracking-tight">
          This frame didn’t make the cut.
        </h1>

        <p className="font-body text-base sm:text-lg text-offwhite-dim font-light leading-relaxed">
          The negative you are searching for might have suffered severe light leak, got left on the cutting room floor, or was never loaded into the spool.
        </p>

        <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
          <Button href="/" variant="primary" size="md">
            Rewind to Prologue
          </Button>
          <Button href="/gallery" variant="secondary" size="md">
            Visit The Darkroom
          </Button>
        </div>
      </div>
    </main>
  );
}