import type { Metadata } from 'next';
import { playfair, inter, jetbrainsMono } from '@/lib/fonts';
import './globals.css';

import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ShutterLoader } from '@/components/story/ShutterLoader';
import { ShutterBlinkTransition } from '@/components/story/ShutterBlinkTransition';
import { FilmCounterScroll } from '@/components/story/FilmCounterScroll';
import { SmoothScrollProvider } from '@/components/providers/SmoothScrollProvider';
import { getSettings } from '@/lib/actions/settings';

export const metadata: Metadata = {
  title: 'ShutterScape | Photography Club of Girijananda Chowdhury University',
  description: 'Every frame tells a story. The official photography club of GCU, Assam.',
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
      <body className="antialiased selection:bg-amber selection:text-black min-h-screen flex flex-col">
        {/* Subtle persistent 3% analog film grain overlay */}
        <div className="film-grain" aria-hidden="true" />

        {/* Shutter blink route transitions */}
        <ShutterBlinkTransition />

        {/* First session visit shutter click loader */}
        <ShutterLoader />

        {/* Smooth scroll wrapper */}
        <SmoothScrollProvider>
          {/* Skip accessibility link */}
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[10000] focus:px-4 focus:py-2 focus:bg-amber focus:text-black focus:font-mono focus:rounded-md"
          >
            Skip to main frame
          </a>

          {/* Sticky Header with navigation blur */}
          <Header />

          {/* Main Story Container */}
          <main id="main-content" className="flex-grow">
            {children}
          </main>

          {/* Global Film Progress Scroll HUD */}
          <FilmCounterScroll />

          {/* End Credits Footer */}
          <Footer settings={settings} />
        </SmoothScrollProvider>
      </body>
    </html>
  );
}