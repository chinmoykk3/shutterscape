import type { Metadata } from 'next';
import { playfair, inter, jetbrainsMono } from '@/lib/fonts';
import './globals.css';

import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ShutterLoader } from '@/components/story/ShutterLoader';
import { ShutterBlinkTransition } from '@/components/story/ShutterBlinkTransition';
import { FilmCounterScroll } from '@/components/story/FilmCounterScroll';
import { CameraReadout } from '@/components/story/CameraReadout';
import { SmoothScrollProvider } from '@/components/providers/SmoothScrollProvider';
import { getSettings } from '@/lib/actions/settings';

export const metadata: Metadata = {
  title: {
    default: 'ShutterScape | Photography Club of GCU',
    template: '%s | ShutterScape GCU',
  },
  description:
    'Every frame tells a story. Official photography club of Girijananda Chowdhury University (GCU), Assam.',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSettings();

  return (
    <html
      lang="en"
      className={`${playfair.variable} ${inter.variable} ${jetbrainsMono.variable} bg-black text-offwhite`}
    >
      <body className="antialiased selection:bg-amber selection:text-black min-h-screen flex flex-col bg-black text-offwhite">
        {/* Persistent 3% Film Grain Overlay */}
        <div className="film-grain" aria-hidden="true" />

        {/* 150ms Shutter-Blink Page Transition */}
        <ShutterBlinkTransition />

        {/* First-Visit SVG Shutter-Click Loader (<1.5s via sessionStorage) */}
        <ShutterLoader />

        {/* Lenis + GSAP ScrollTrigger Smooth Scroll Provider */}
        <SmoothScrollProvider>
          {/* Accessibility Skip-to-Content Link */}
          <a
            href="#main-story-content"
            className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100001] focus:px-4 focus:py-2.5 focus:bg-amber focus:text-black focus:font-mono focus:text-xs focus:font-bold focus:rounded-xl focus:shadow-lg"
          >
            Skip to main story
          </a>

          {/* Global Sticky Header */}
          <Header
            instagramUrl={settings.instagramUrl}
            whatsappUrl={settings.whatsappUrl}
          />

          {/* Main Story Content */}
          <main id="main-story-content" className="flex-grow relative">
            {children}
          </main>

          {/* Persistent Bottom-Left Camera Exposure Readout HUD */}
          <CameraReadout floatingHud />

          {/* Persistent Bottom-Right Film Counter Scroll HUD ("Frame 07/36") */}
          <FilmCounterScroll />

          {/* Global "End Credits" Footer */}
          <Footer settings={settings} />
        </SmoothScrollProvider>
      </body>
    </html>
  );
}