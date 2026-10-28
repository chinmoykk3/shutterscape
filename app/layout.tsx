import type { Metadata } from 'next';
import { playfair, inter, jetbrainsMono } from '@/lib/fonts';
import './globals.css';

import { MinimalTopBar } from '@/components/layout/MinimalTopBar';
import { CameraDockBar } from '@/components/layout/CameraDockBar';
import { Footer } from '@/components/layout/Footer';
import { ShutterLoader } from '@/components/story/ShutterLoader';
import { ShutterBlinkTransition } from '@/components/story/ShutterBlinkTransition';
import { FilmCounterScroll } from '@/components/story/FilmCounterScroll';
import { CameraReadout } from '@/components/story/CameraReadout';
import { CursorViewfinder } from '@/components/ui/CursorViewfinder';
import { DayArcProvider } from '@/components/providers/DayArcProvider';
import { StoryModeProvider } from '@/components/providers/StoryModeProvider';
import { SmoothScrollProvider } from '@/components/providers/SmoothScrollProvider';
import { getSettings } from '@/lib/actions/settings';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://shutterscape.gcuniversity.ac.in';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'ShutterScape | Photography Club of GCU',
    template: '%s | ShutterScape GCU',
  },
  description:
    'Every frame tells a story. Official photography club of Girijananda Chowdhury University (GCU), Assam. Darkroom archives, visual storytelling, and field expeditions.',
  keywords: [
    'photography club',
    'Girijananda Chowdhury University',
    'GCU Guwahati',
    'GCU Assam',
    'ShutterScape',
    'darkroom',
    '35mm film photography',
    'student photography',
    'Codénix',
  ],
  authors: [
    { name: 'ShutterScape Collective' },
    { name: 'Codénix (GCU Coding Club)', url: 'https://codingclub.gcuniversity.ac.in' },
  ],
  creator: 'Codénix (GCU Coding Club)',
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: siteUrl,
    siteName: 'ShutterScape GCU',
    title: 'ShutterScape | Photography Club of Girijananda Chowdhury University',
    description:
      'Every frame tells a story. Official photography club of Girijananda Chowdhury University (GCU), Assam.',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1200&h=630&fit=crop',
        width: 1200,
        height: 630,
        alt: 'ShutterScape Photography Club GCU',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ShutterScape | Photography Club of GCU',
    description:
      'Every frame tells a story. Official photography club of Girijananda Chowdhury University (GCU), Assam.',
    images: ['https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1200&h=630&fit=crop'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = JSON.parse(JSON.stringify(await getSettings()));

  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'ShutterScape Photography Club',
    alternateName: 'ShutterScape GCU',
    url: siteUrl,
    logo: `${siteUrl}/logo.png`,
    description:
      'Official photography club of Girijananda Chowdhury University (GCU), Guwahati, Assam.',
    parentOrganization: {
      '@type': 'CollegeOrUniversity',
      name: 'Girijananda Chowdhury University',
      url: 'https://gcuniversity.ac.in',
    },
    sameAs: [
      settings.instagramUrl || 'https://www.instagram.com/shutterscape_gcu',
      'https://codingclub.gcuniversity.ac.in',
    ],
  };

  return (
    <html
      lang="en"
      className={`${playfair.variable} ${inter.variable} ${jetbrainsMono.variable} bg-black text-offwhite`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
      </head>
      <body className="antialiased selection:bg-amber selection:text-black min-h-screen flex flex-col bg-black text-offwhite">
        <DayArcProvider>
          <StoryModeProvider>
            {/* Desktop Cursor Viewfinder */}
            <CursorViewfinder />

            {/* Persistent 3% Film Grain Overlay */}
            <div className="film-grain" aria-hidden="true" />

            {/* 150ms Shutter-Blink Page Transition */}
            <ShutterBlinkTransition />

            {/* First-Visit SVG Shutter-Click Loader (<1.5s via sessionStorage) */}
            <ShutterLoader />

            {/* GSAP ScrollTrigger Smooth Scroll Provider */}
            <SmoothScrollProvider>
              {/* Accessibility Skip-to-Content Link */}
              <a
                href="#main-story-content"
                className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100001] focus:px-4 focus:py-2.5 focus:bg-amber focus:text-black focus:font-mono focus:text-xs focus:font-bold focus:rounded-xl focus:shadow-lg"
              >
                Skip to main story
              </a>

              {/* Minimal Floating Top Watermark Strip */}
              <MinimalTopBar
                instagramUrl={settings.instagramUrl}
                whatsappUrl={settings.whatsappUrl}
              />

              {/* Main Story Content */}
              <main id="main-story-content" className="flex-grow relative pb-24">
                {children}
              </main>

              {/* Floating Camera Island Dock Bar */}
              <CameraDockBar
                whatsappUrl={settings.whatsappUrl}
                instagramUrl={settings.instagramUrl}
              />

              {/* Persistent Bottom-Left Camera Exposure Readout HUD (XL screens) */}
              <CameraReadout floatingHud />

              {/* Persistent Bottom-Right Film Counter Scroll HUD (XL screens) */}
              <FilmCounterScroll />

              {/* Global "End Credits" Footer */}
              <Footer settings={settings} />
            </SmoothScrollProvider>
          </StoryModeProvider>
        </DayArcProvider>
      </body>
    </html>
  );
}