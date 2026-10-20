'use client';

import React, { useRef, useEffect, useState, useMemo } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Calendar,
  MapPin,
  ExternalLink,
  MessageCircle,
  ArrowRight,
  Sparkles,
  Sliders,
  CheckCircle2,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Countdown } from '@/components/ui/Countdown';
import { getDarkroomBlurPlaceholder } from '@/lib/utils';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export interface StorySceneData {
  _id?: string;
  key: string;
  order: number;
  headline: string;
  bodyText: string;
  image?: {
    url?: string;
    publicId?: string;
    blurDataURL?: string;
  };
  status: 'active' | 'disabled';
}

export interface FeaturedGalleryItemData {
  _id: string;
  image: {
    url: string;
    publicId: string;
    width: number;
    height: number;
    blurDataURL?: string;
  };
  caption: string;
  photographer?: string;
  cameraInfo?: string;
  room: string;
  featured: boolean;
}

export interface NextEventData {
  _id: string;
  title: string;
  slug: string;
  date: string | Date;
  venue?: string;
  pullQuote?: string;
  image?: {
    url: string;
    blurDataURL?: string;
  };
  registrationLink?: string;
}

export interface HomepageStoryEngineProps {
  storyScenes: StorySceneData[];
  featuredGallery: FeaturedGalleryItemData[];
  nextUpcomingEvent: NextEventData | null;
  whatsappUrl?: string;
  instagramUrl?: string;
}

export function HomepageStoryEngine({
  storyScenes,
  featuredGallery,
  nextUpcomingEvent,
  whatsappUrl = 'https://chat.whatsapp.com/Hs71BicR1Xj3PmOyPJ5wdc?s=sw&p=a&mlu=4&ilr=4',
  instagramUrl = 'https://www.instagram.com/shutterscape_gcu',
}: HomepageStoryEngineProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pinnedSectionRef = useRef<HTMLDivElement>(null);

  // Scene references for Desktop scrubbing
  const scene1Ref = useRef<HTMLDivElement>(null);
  const irisMaskRef = useRef<HTMLDivElement>(null);
  const irisBladesRef = useRef<SVGSVGElement>(null);

  const scene2Ref = useRef<HTMLDivElement>(null);
  const focusTargetRef = useRef<HTMLDivElement>(null);
  const focusScaleRef = useRef<HTMLDivElement>(null);
  const focusLockRef = useRef<HTMLSpanElement>(null);

  const scene3Ref = useRef<HTMLDivElement>(null);
  const bracketsRef = useRef<HTMLDivElement>(null);

  const scene4Ref = useRef<HTMLDivElement>(null);
  const filmReelRef = useRef<HTMLDivElement>(null);

  const scene5Ref = useRef<HTMLDivElement>(null);
  const developingCardRef = useRef<HTMLDivElement>(null);

  const scene6Ref = useRef<HTMLDivElement>(null);
  const flashOverlayRef = useRef<HTMLDivElement>(null);

  // Dynamic frame counter for scene 4
  const [activeReelFrame, setActiveReelFrame] = useState(1);

  // Map scenes safely from incoming database documents
  const scene0 = useMemo(
    () =>
      storyScenes.find((s) => s.key === 'scene-0-darkness' || s.order === 0) || {
        headline: 'Darkness',
        bodyText: 'Every photograph begins in the dark.',
      },
    [storyScenes]
  );

  const scene1 = useMemo(
    () =>
      storyScenes.find((s) => s.key === 'scene-1-light' || s.order === 1) || {
        headline: 'Light',
        bodyText: 'We are ShutterScape. The eyes of GCU.',
      },
    [storyScenes]
  );

  const scene2 = useMemo(
    () =>
      storyScenes.find((s) => s.key === 'scene-2-frame' || s.order === 2) || {
        headline: 'Frame',
        bodyText: 'We learn to see before we learn to shoot.',
      },
    [storyScenes]
  );

  const scene3 = useMemo(
    () =>
      storyScenes.find((s) => s.key === 'scene-3-moments' || s.order === 3) || {
        headline: 'Moments',
        bodyText: '36 exposures. Countless stories.',
      },
    [storyScenes]
  );

  const scene4 = useMemo(
    () =>
      storyScenes.find((s) => s.key === 'scene-4-next-frame' || s.order === 4) || {
        headline: 'Next Frame',
        bodyText: 'The next frame is still blank.',
      },
    [storyScenes]
  );

  const scene5 = useMemo(
    () =>
      storyScenes.find((s) => s.key === 'scene-5-epilogue' || s.order === 5) || {
        headline: 'Epilogue',
        bodyText: 'Your story could be the next shot.',
      },
    [storyScenes]
  );

  // Fallback gallery frames if empty
  const displayGallery = useMemo(() => {
    if (featuredGallery && featuredGallery.length > 0) return featuredGallery;
    return [
      {
        _id: 'sample-1',
        image: {
          url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1200',
          publicId: 'sample_1',
          width: 1200,
          height: 800,
        },
        caption: 'Golden Dusk over the Brahmaputra',
        photographer: 'Ikhyt De Neog',
        room: 'Landscape',
        cameraInfo: 'Sony A7 IV • 24-70mm • f/4.0',
        featured: true,
      },
      {
        _id: 'sample-2',
        image: {
          url: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?q=80&w=1200',
          publicId: 'sample_2',
          width: 1200,
          height: 800,
        },
        caption: 'Monsoon Reflections at Fancy Bazar',
        photographer: 'Uttama Purkayastha',
        room: 'Street',
        cameraInfo: 'Fujifilm X-T5 • 23mm • f/1.8',
        featured: true,
      },
      {
        _id: 'sample-3',
        image: {
          url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1200',
          publicId: 'sample_3',
          width: 1200,
          height: 1500,
        },
        caption: 'Quiet Radiance in the Library Stacks',
        photographer: 'Richita Sarma',
        room: 'Portrait',
        cameraInfo: 'Canon EOS R6 • 85mm • f/1.4',
        featured: true,
      },
      {
        _id: 'sample-4',
        image: {
          url: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200',
          publicId: 'sample_4',
          width: 1200,
          height: 800,
        },
        caption: 'Morning Vapour at Barduar Tea Estate',
        photographer: 'Sohaib Hussain',
        room: 'Landscape',
        cameraInfo: 'Nikon Z6 II • 50mm • f/2.8',
        featured: true,
      },
      {
        _id: 'sample-5',
        image: {
          url: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=1200',
          publicId: 'sample_5',
          width: 1200,
          height: 800,
        },
        caption: 'The Alchemy of Safelight',
        photographer: 'Manash Pratim Sarma',
        room: 'Monochrome',
        cameraInfo: 'Leica M10 • 35mm • f/2.0',
        featured: true,
      },
    ];
  }, [featuredGallery]);

  // GSAP ScrollTrigger Master Choreography
  useEffect(() => {
    if (!containerRef.current || !pinnedSectionRef.current) return;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      // =========================================================================
      // 1. DESKTOP: PINNED + SCRUBBED TIMELINE (1024px and up)
      // =========================================================================
      mm.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
        const masterTl = gsap.timeline({
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top top',
            end: 'bottom bottom',
            pin: pinnedSectionRef.current,
            scrub: 1,
            anticipatePin: 1,
          },
        });

        // Set initial visibility
        gsap.set(scene1Ref.current, { opacity: 1, pointerEvents: 'auto' });
        gsap.set([scene2Ref.current, scene3Ref.current, scene4Ref.current, scene5Ref.current, scene6Ref.current], {
          opacity: 0,
          pointerEvents: 'none',
        });

        // --- SCENE 1: Iris-Open Intro (0.00 -> 0.16) ---
        masterTl
          .to(
            irisMaskRef.current,
            {
              clipPath: 'circle(150% at 50% 50%)',
              ease: 'power2.inOut',
              duration: 1.5,
            },
            0
          )
          .to(
            irisBladesRef.current,
            {
              rotation: 120,
              scale: 2.2,
              opacity: 0,
              ease: 'power2.inOut',
              duration: 1.5,
            },
            0
          )
          .to(
            scene1Ref.current,
            {
              opacity: 0,
              scale: 0.95,
              pointerEvents: 'none',
              duration: 0.5,
            },
            1.5
          );

        // --- SCENE 2: Focus-Pull Title (1.6 -> 3.2) ---
        masterTl
          .set(scene2Ref.current, { pointerEvents: 'auto' }, 1.6)
          .to(
            scene2Ref.current,
            {
              opacity: 1,
              duration: 0.4,
            },
            1.6
          )
          .fromTo(
            focusTargetRef.current,
            { filter: 'blur(30px) brightness(1.6)', scale: 1.08 },
            {
              filter: 'blur(0px) brightness(1)',
              scale: 1,
              duration: 1.2,
              ease: 'power2.out',
            },
            1.7
          )
          .fromTo(
            focusScaleRef.current,
            { x: -80, opacity: 0.4 },
            {
              x: 0,
              opacity: 1,
              duration: 1.2,
              ease: 'power2.out',
            },
            1.7
          )
          .to(
            focusLockRef.current,
            {
              opacity: 1,
              color: '#F59E0B',
              duration: 0.2,
            },
            2.6
          )
          .to(
            scene2Ref.current,
            {
              opacity: 0,
              pointerEvents: 'none',
              duration: 0.4,
            },
            3.0
          );

        // --- SCENE 3: Viewfinder-Bracket Scene (3.2 -> 4.8) ---
        masterTl
          .set(scene3Ref.current, { pointerEvents: 'auto' }, 3.2)
          .to(
            scene3Ref.current,
            {
              opacity: 1,
              duration: 0.4,
            },
            3.2
          )
          .fromTo(
            bracketsRef.current,
            { scale: 1.25, opacity: 0 },
            {
              scale: 1,
              opacity: 1,
              duration: 0.8,
              ease: 'back.out(1.4)',
            },
            3.3
          )
          .to(
            scene3Ref.current,
            {
              opacity: 0,
              pointerEvents: 'none',
              duration: 0.4,
            },
            4.6
          );

        // --- SCENE 4: Horizontal Film Strip Driven by Vertical Scroll (4.8 -> 7.2) ---
        masterTl
          .set(scene4Ref.current, { pointerEvents: 'auto' }, 4.8)
          .to(
            scene4Ref.current,
            {
              opacity: 1,
              duration: 0.4,
            },
            4.8
          )
          .to(
            filmReelRef.current,
            {
              xPercent: -58,
              ease: 'none',
              duration: 2.2,
              onUpdate: function () {
                const progress = this.progress();
                const totalItems = displayGallery.length;
                const current = Math.min(Math.floor(progress * totalItems) + 1, totalItems);
                setActiveReelFrame(current);
              },
            },
            5.0
          )
          .to(
            scene4Ref.current,
            {
              opacity: 0,
              pointerEvents: 'none',
              duration: 0.4,
            },
            7.0
          );

        // --- SCENE 5: Unexposed Next-Event Frame with Live Countdown (7.2 -> 8.8) ---
        masterTl
          .set(scene5Ref.current, { pointerEvents: 'auto' }, 7.2)
          .to(
            scene5Ref.current,
            {
              opacity: 1,
              duration: 0.4,
            },
            7.2
          )
          .fromTo(
            developingCardRef.current,
            { filter: 'grayscale(100%) blur(14px) contrast(1.4)', scale: 0.96 },
            {
              filter: 'grayscale(0%) blur(0px) contrast(1)',
              scale: 1,
              duration: 1.2,
              ease: 'power2.out',
            },
            7.4
          )
          .to(
            scene5Ref.current,
            {
              opacity: 0,
              pointerEvents: 'none',
              duration: 0.4,
            },
            8.6
          );

        // --- SCENE 6: Flash-to-Join-Us Epilogue (8.8 -> 10.0) ---
        masterTl
          .set(scene6Ref.current, { pointerEvents: 'auto' }, 8.8)
          // Camera Xenon Flash burst
          .fromTo(
            flashOverlayRef.current,
            { opacity: 0 },
            {
              opacity: 1,
              duration: 0.15,
              ease: 'power4.in',
            },
            8.8
          )
          .to(
            flashOverlayRef.current,
            {
              opacity: 0,
              duration: 0.45,
              ease: 'power2.out',
            },
            8.95
          )
          .to(
            scene6Ref.current,
            {
              opacity: 1,
              duration: 0.5,
            },
            9.0
          );
      });

      // =========================================================================
      // 2. MOBILE: REVEAL-ON-SCROLL (max-width: 1023px)
      // =========================================================================
      mm.add('(max-width: 1023px) and (prefers-reduced-motion: no-preference)', () => {
        const mobileSections = containerRef.current?.querySelectorAll('.mobile-story-card');
        mobileSections?.forEach((sec) => {
          gsap.fromTo(
            sec,
            { opacity: 0, y: 35 },
            {
              opacity: 1,
              y: 0,
              duration: 0.8,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: sec,
                start: 'top 85%',
                toggleActions: 'play none none reverse',
              },
            }
          );
        });
      });

      // =========================================================================
      // 3. PREFERS-REDUCED-MOTION: STATIC ACCESSIBLE LAYOUT
      // =========================================================================
      mm.add('(prefers-reduced-motion: reduce)', () => {
        // No animation, static state
      });
    }, containerRef);

    return () => ctx.revert();
  }, [displayGallery.length]);

  return (
    <div ref={containerRef} className="relative w-full">
      {/* =========================================================================
          DESKTOP PINNED VIEWPORT (Visible >= 1024px)
          ========================================================================= */}
      <div className="hidden lg:block relative h-[600vh] w-full">
        <div
          ref={pinnedSectionRef}
          className="sticky top-0 h-screen w-full overflow-hidden bg-black flex items-center justify-center select-none"
        >
          {/* Subtle Viewfinder HUD Crosshair centered in viewport */}
          <div className="pointer-events-none absolute inset-0 z-30">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 opacity-25">
              <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-white/70" />
              <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-white/70" />
            </div>
            {/* Top Telemetry strip */}
            <div className="absolute top-8 left-10 right-10 flex items-center justify-between font-mono text-[11px] text-offwhite-dim">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber animate-pulse" />
                <span className="tracking-widest uppercase">ShutterScape Optical Engine</span>
              </div>
              <div className="tracking-widest">
                SCROLL TO ADVANCE SHUTTER
              </div>
            </div>
          </div>

          {/* ---------------------------------------------------------------------
              SCENE 1: Iris-Open Intro
              --------------------------------------------------------------------- */}
          <div
            ref={scene1Ref}
            className="absolute inset-0 z-20 flex items-center justify-center text-center p-8 bg-black transition-opacity"
          >
            {/* Iris Mask Container */}
            <div
              ref={irisMaskRef}
              style={{ clipPath: 'circle(15% at 50% 50%)' }}
              className="absolute inset-0 flex items-center justify-center bg-radial from-amber/20 via-black to-black pointer-events-none"
            >
              {/* Rotating mechanical iris blades SVG */}
              <svg
                ref={irisBladesRef}
                viewBox="0 0 400 400"
                className="w-[450px] h-[450px] text-amber/30 pointer-events-none"
              >
                <circle cx="200" cy="200" r="180" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="6 6" />
                <polygon points="200,40 280,180 120,180" fill="currentColor" fillOpacity="0.08" stroke="currentColor" strokeWidth="1.5" />
                <polygon points="200,360 280,220 120,220" fill="currentColor" fillOpacity="0.08" stroke="currentColor" strokeWidth="1.5" />
                <polygon points="40,200 180,280 180,120" fill="currentColor" fillOpacity="0.08" stroke="currentColor" strokeWidth="1.5" />
                <polygon points="360,200 220,280 220,120" fill="currentColor" fillOpacity="0.08" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </div>

            {/* Headline and text */}
            <div className="relative z-10 max-w-2xl space-y-4">
              <Badge variant="amber" className="mx-auto">
                {'● SCENE 01 // THE APERTURE'}
              </Badge>
              <h2 className="font-title text-5xl sm:text-7xl font-black text-offwhite tracking-tight">
                {scene0.headline}
              </h2>
              <p className="font-mono text-lg text-amber tracking-widest uppercase">
                {`// ${scene0.bodyText}`}
              </p>
              <div className="pt-6 font-mono text-xs text-offwhite-dim">
                [ APERTURE DIAL DILATING TO f/1.4 ]
              </div>
            </div>
          </div>

          {/* ---------------------------------------------------------------------
              SCENE 2: Focus-Pull Title
              --------------------------------------------------------------------- */}
          <div
            ref={scene2Ref}
            className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center p-8 transition-opacity"
          >
            <div ref={focusTargetRef} className="max-w-3xl space-y-6">
              <Badge variant="amber" className="mx-auto">
                {'● SCENE 02 // RACKING FOCUS'}
              </Badge>
              <h2 className="font-title text-6xl sm:text-8xl font-black text-offwhite tracking-tight leading-[1.05]">
                {scene1.headline}
              </h2>
              <p className="font-title text-2xl sm:text-3xl text-amber font-light max-w-2xl mx-auto leading-snug">
                {scene1.bodyText}
              </p>
            </div>

            {/* Optical Focus Distance Scale Indicator */}
            <div
              ref={focusScaleRef}
              className="mt-12 flex flex-col items-center gap-3 bg-charcoal/80 border border-charcoal-border px-8 py-3 rounded-2xl backdrop-blur-md"
            >
              <div className="font-mono text-[10px] tracking-widest uppercase text-offwhite-dim flex items-center gap-2">
                <Sliders className="w-3 h-3 text-amber" />
                MANUAL FOCUS HELICOID
              </div>
              <div className="font-mono text-xs text-offwhite tracking-widest flex items-center gap-4">
                <span className="text-offwhite-dim">0.3m</span>
                <span className="text-offwhite-dim">──</span>
                <span className="text-offwhite-dim">1.0m</span>
                <span className="text-offwhite-dim">──</span>
                <span className="text-offwhite-dim">3.0m</span>
                <span className="text-offwhite-dim">──</span>
                <span className="text-amber font-bold">∞</span>
              </div>
              <span
                ref={focusLockRef}
                className="font-mono text-[11px] font-bold text-offwhite-dim opacity-40 transition-colors flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-amber" />
                OPTICAL FOCUS CONFIRMED (AF-LOCK)
              </span>
            </div>
          </div>

          {/* ---------------------------------------------------------------------
              SCENE 3: Viewfinder-Bracket Scene
              --------------------------------------------------------------------- */}
          <div
            ref={scene3Ref}
            className="absolute inset-0 z-20 flex items-center justify-center p-8 transition-opacity"
          >
            {/* Viewfinder Outer Frame with Clamping Brackets */}
            <div
              ref={bracketsRef}
              className="relative max-w-4xl w-full aspect-[16/10] border border-white/10 rounded-2xl p-8 flex flex-col justify-between bg-charcoal/20 backdrop-blur-xs"
            >
              {/* Corner Framing Brackets */}
              <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-amber" />
              <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-amber" />
              <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-amber" />
              <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-amber" />

              {/* Viewfinder Center Crosshairs */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12">
                <div className="absolute top-1/2 left-0 right-0 h-[1.5px] bg-amber/80" />
                <div className="absolute left-1/2 top-0 bottom-0 w-[1.5px] bg-amber/80" />
                <div className="absolute inset-2 rounded-full border border-amber/40" />
              </div>

              {/* Top Viewfinder Telemetry */}
              <div className="flex items-center justify-between font-mono text-xs text-offwhite-dim z-10">
                <span className="text-amber font-bold">[AF-S TRACKING]</span>
                <span className="bg-black/60 px-2 py-0.5 rounded border border-charcoal-border">
                  EXP. COMP: +0.3 EV
                </span>
                <span className="text-offwhite font-bold">RAW + FINE</span>
              </div>

              {/* Scene 3 Narrative Content */}
              <div className="text-center space-y-3 z-10 max-w-xl mx-auto">
                <Badge variant="amber" className="mx-auto">
                  {'● SCENE 03 // THE COMPOSITION'}
                </Badge>
                <h2 className="font-title text-4xl sm:text-6xl font-black text-offwhite tracking-tight">
                  {scene2.headline}
                </h2>
                <p className="font-title text-lg sm:text-xl text-offwhite-muted leading-relaxed">
                  {scene2.bodyText}
                </p>
              </div>

              {/* Bottom Camera Telemetry Meter */}
              <div className="flex items-center justify-between font-mono text-xs text-amber z-10 pt-4 border-t border-white/10">
                <span>1/1000s</span>
                <span className="text-offwhite font-bold">f/1.4</span>
                <span>ISO 400</span>
                <span className="hidden sm:inline text-offwhite-dim">BATTERY: 98%</span>
              </div>
            </div>
          </div>

          {/* ---------------------------------------------------------------------
              SCENE 4: Horizontal Film Strip Driven by Vertical Scroll
              --------------------------------------------------------------------- */}
          <div
            ref={scene4Ref}
            className="absolute inset-0 z-20 flex flex-col justify-center px-12 transition-opacity"
          >
            {/* Header Readout Bar */}
            <div className="max-w-6xl mx-auto w-full flex items-end justify-between mb-6 z-10">
              <div className="space-y-1">
                <Badge variant="amber">
                  {'● SCENE 04 // 35MM CONTINUOUS STRIP'}
                </Badge>
                <h2 className="font-title text-3xl sm:text-5xl font-black text-offwhite">
                  {scene3.headline}
                </h2>
                <p className="font-mono text-xs text-offwhite-muted">
                  {scene3.bodyText}
                </p>
              </div>

              {/* Live Analog Dial / Frame Counter */}
              <div className="flex items-center gap-3 bg-charcoal border border-charcoal-border px-4 py-2 rounded-xl font-mono text-xs">
                <span className="w-2 h-2 rounded-full bg-amber animate-pulse" />
                <span className="text-offwhite-dim">FRAME:</span>
                <span className="text-amber font-bold text-sm">
                  EXP. {String(activeReelFrame).padStart(2, '0')}
                </span>
                <span className="text-offwhite-dim">/ 36</span>
              </div>
            </div>

            {/* The Horizontal Film Reel Track */}
            <div className="relative w-full overflow-visible py-4">
              <div
                ref={filmReelRef}
                className="flex items-center gap-8 w-max will-change-transform pl-4"
              >
                {displayGallery.map((item, idx) => (
                  <div
                    key={item._id}
                    className="relative w-[380px] shrink-0 bg-[#0c0c0e] border-2 border-charcoal-border rounded-xl p-3 shadow-2xl space-y-2 group"
                  >
                    {/* Top Sprocket Perforation Strip */}
                    <div className="horizontal-film-track h-6 w-full opacity-60" />

                    {/* Film Frame Margin Indicators */}
                    <div className="flex items-center justify-between text-[10px] font-mono text-amber px-1">
                      <span>KODAK TRI-X</span>
                      <span>EXP. {String(idx + 1).padStart(2, '0')}A</span>
                      <span>SAFETY FILM</span>
                    </div>

                    {/* Image */}
                    <div className="relative aspect-[4/3] w-full rounded-lg overflow-hidden bg-black">
                      <Image
                        src={item.image.url}
                        alt={item.caption}
                        fill
                        placeholder="blur"
                        blurDataURL={item.image.blurDataURL || getDarkroomBlurPlaceholder(16, 12)}
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute top-2 left-2">
                        <Badge variant="neutral" className="text-[9px] py-0.5 px-1.5 bg-black/80">
                          {item.room}
                        </Badge>
                      </div>
                    </div>

                    {/* Frame Caption */}
                    <div className="p-1 space-y-0.5">
                      <h4 className="font-title text-sm font-bold text-offwhite truncate">
                        {item.caption}
                      </h4>
                      {item.photographer && (
                        <p className="font-mono text-[10px] text-offwhite-dim">
                          Photo: {item.photographer}
                        </p>
                      )}
                    </div>

                    {/* Bottom Sprocket Perforation Strip */}
                    <div className="horizontal-film-track h-6 w-full opacity-60" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ---------------------------------------------------------------------
              SCENE 5: Unexposed Next-Event Frame with Live Countdown
              --------------------------------------------------------------------- */}
          <div
            ref={scene5Ref}
            className="absolute inset-0 z-20 flex items-center justify-center p-8 transition-opacity"
          >
            <div className="max-w-4xl w-full space-y-6">
              <div className="text-center space-y-2">
                <Badge variant="amber" className="mx-auto">
                  {'● SCENE 05 // THE LATENT NEGATIVE'}
                </Badge>
                <h2 className="font-title text-4xl sm:text-6xl font-black text-offwhite">
                  {scene4.headline}
                </h2>
                <p className="font-mono text-xs sm:text-sm text-offwhite-muted">
                  {scene4.bodyText}
                </p>
              </div>

              {/* Developing Film Frame Card */}
              <div
                ref={developingCardRef}
                className="relative p-6 sm:p-8 rounded-3xl bg-charcoal border-2 border-amber/40 shadow-[0_0_60px_rgba(245,158,11,0.15)] will-change-transform"
              >
                {nextUpcomingEvent ? (
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                    {/* Event Cover Image */}
                    <div className="md:col-span-5 relative aspect-[16/11] rounded-2xl overflow-hidden border border-charcoal-border">
                      <Image
                        src={nextUpcomingEvent.image?.url || 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1200'}
                        alt={nextUpcomingEvent.title}
                        fill
                        placeholder="blur"
                        blurDataURL={nextUpcomingEvent.image?.blurDataURL || getDarkroomBlurPlaceholder(16, 11)}
                        className="object-cover"
                      />
                      <div className="absolute top-2 left-2">
                        <Badge variant="amber" className="text-[9px] shadow-lg">
                          <Sparkles className="w-3 h-3 mr-1" />
                          EXPEDITION SCHEDULED
                        </Badge>
                      </div>
                    </div>

                    {/* Event Details & Live Countdown */}
                    <div className="md:col-span-7 space-y-4">
                      <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-amber">
                        <span className="flex items-center gap-1.5 bg-amber/10 px-2.5 py-1 rounded-full border border-amber/30">
                          <Calendar className="w-3 h-3" />
                          {new Date(nextUpcomingEvent.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                        {nextUpcomingEvent.venue && (
                          <span className="flex items-center gap-1.5 text-offwhite-dim bg-white/5 px-2.5 py-1 rounded-full border border-charcoal-border">
                            <MapPin className="w-3 h-3" />
                            {nextUpcomingEvent.venue}
                          </span>
                        )}
                      </div>

                      <h3 className="font-title text-2xl sm:text-3xl font-bold text-offwhite leading-tight">
                        {nextUpcomingEvent.title}
                      </h3>

                      {nextUpcomingEvent.pullQuote && (
                        <p className="text-xs sm:text-sm text-offwhite-muted italic border-l-2 border-amber pl-3 line-clamp-2">
                          &ldquo;{nextUpcomingEvent.pullQuote}&rdquo;
                        </p>
                      )}

                      {/* Live Intervalometer Countdown */}
                      <div className="pt-2">
                        <Countdown targetDate={nextUpcomingEvent.date} />
                      </div>

                      {/* Register Link */}
                      <div className="pt-2 flex items-center gap-3">
                        <Button
                          href={`/activities/${nextUpcomingEvent.slug}`}
                          variant="primary"
                          size="sm"
                          className="gap-2"
                        >
                          Examine Roll Manifest <ArrowRight className="w-3.5 h-3.5" />
                        </Button>
                        {nextUpcomingEvent.registrationLink && (
                          <Button
                            href={nextUpcomingEvent.registrationLink}
                            isExternal
                            variant="outline"
                            size="sm"
                            className="gap-1.5"
                          >
                            Register <ExternalLink className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Blank negative state if no upcoming activity */
                  <div className="p-12 text-center space-y-4">
                    <div className="w-12 h-12 rounded-full bg-black/60 border border-charcoal-border flex items-center justify-center mx-auto text-amber">
                      <Calendar className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-title text-2xl font-bold text-offwhite">
                        Frame 36 is Waiting in the Canister
                      </h3>
                      <p className="font-mono text-xs text-offwhite-muted max-w-md mx-auto">
                        No upcoming expedition is currently scheduled. Follow our WhatsApp guild for real-time announcements.
                      </p>
                    </div>
                    <Button href={whatsappUrl} isExternal variant="primary" size="sm">
                      Join Guild for Alerts
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ---------------------------------------------------------------------
              SCENE 6: Flash-to-Join-Us Epilogue
              --------------------------------------------------------------------- */}
          <div
            ref={scene6Ref}
            className="absolute inset-0 z-20 flex items-center justify-center p-8 transition-opacity text-center"
          >
            {/* Xenon Strobe Flash Curtain */}
            <div
              ref={flashOverlayRef}
              className="pointer-events-none fixed inset-0 z-50 bg-white opacity-0"
            />

            <div className="max-w-3xl space-y-8">
              <div className="flex flex-col items-center gap-2">
                <Badge variant="amber">
                  {'● SCENE 06 // THE EPILOGUE'}
                </Badge>
                <div className="font-mono text-[10px] text-offwhite-dim tracking-widest uppercase">
                  ROLL EXPOSURE 36/36 COMPLETED
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="font-title text-5xl sm:text-7xl font-black text-offwhite tracking-tight leading-[1.08]">
                  {scene5.headline}
                </h2>
                <p className="font-title text-2xl sm:text-3xl text-amber font-light max-w-xl mx-auto leading-relaxed">
                  {scene5.bodyText}
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                <Button
                  href={whatsappUrl}
                  isExternal
                  variant="primary"
                  size="lg"
                  className="gap-2 shadow-[0_0_30px_rgba(245,158,11,0.25)]"
                >
                  <MessageCircle className="w-5 h-5" />
                  Join The Collective
                </Button>

                <Button
                  href="/gallery"
                  variant="outline"
                  size="lg"
                  className="gap-2"
                >
                  Explore Light Table <ArrowRight className="w-4 h-4" />
                </Button>

                <Button
                  href={instagramUrl}
                  isExternal
                  variant="secondary"
                  size="lg"
                >
                  Follow on Instagram
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          MOBILE REVEAL-ON-SCROLL VIEWPORT (Visible < 1024px)
          ========================================================================= */}
      <div className="block lg:hidden py-16 px-4 space-y-16 max-w-2xl mx-auto">
        {/* Mobile Scene 1 */}
        <section className="mobile-story-card p-6 rounded-2xl bg-charcoal border border-charcoal-border space-y-4 text-center">
          <Badge variant="amber" className="mx-auto">
            {'● SCENE 01 // THE APERTURE'}
          </Badge>
          <h2 className="font-title text-3xl font-black text-offwhite">
            {scene0.headline}
          </h2>
          <p className="font-mono text-sm text-amber">
            {`// ${scene0.bodyText}`}
          </p>
        </section>

        {/* Mobile Scene 2 */}
        <section className="mobile-story-card p-6 rounded-2xl bg-charcoal border border-charcoal-border space-y-4 text-center">
          <Badge variant="amber" className="mx-auto">
            {'● SCENE 02 // RACKING FOCUS'}
          </Badge>
          <h2 className="font-title text-3xl font-black text-offwhite">
            {scene1.headline}
          </h2>
          <p className="text-sm font-sans text-offwhite-muted">
            {scene1.bodyText}
          </p>
          <div className="font-mono text-[10px] text-amber pt-2">
            [ OPTICAL FOCUS CONFIRMED: AF-LOCK ]
          </div>
        </section>

        {/* Mobile Scene 3 */}
        <section className="mobile-story-card p-6 rounded-2xl bg-charcoal border border-charcoal-border space-y-4 text-center">
          <Badge variant="amber" className="mx-auto">
            {'● SCENE 03 // THE COMPOSITION'}
          </Badge>
          <h2 className="font-title text-3xl font-black text-offwhite">
            {scene2.headline}
          </h2>
          <p className="text-sm font-sans text-offwhite-muted">
            {scene2.bodyText}
          </p>
          <div className="flex justify-between font-mono text-[10px] text-amber pt-2 border-t border-charcoal-border">
            <span>1/1000s</span>
            <span>f/1.4</span>
            <span>ISO 400</span>
          </div>
        </section>

        {/* Mobile Scene 4 */}
        <section className="mobile-story-card p-6 rounded-2xl bg-charcoal border border-charcoal-border space-y-4">
          <div className="space-y-1 text-center">
            <Badge variant="amber" className="mx-auto">
              {'● SCENE 04 // CONTINUOUS FILM STRIP'}
            </Badge>
            <h2 className="font-title text-3xl font-black text-offwhite">
              {scene3.headline}
            </h2>
            <p className="text-xs font-mono text-offwhite-muted">
              {scene3.bodyText}
            </p>
          </div>

          {/* Swipeable Reel for mobile */}
          <div className="flex items-center gap-4 overflow-x-auto py-2 scrollbar-none">
            {displayGallery.map((item, idx) => (
              <div
                key={item._id}
                className="w-[260px] shrink-0 bg-black/60 border border-charcoal-border rounded-xl p-3 space-y-2"
              >
                <div className="relative aspect-[4/3] rounded-lg overflow-hidden">
                  <Image
                    src={item.image.url}
                    alt={item.caption}
                    fill
                    placeholder="blur"
                    blurDataURL={item.image.blurDataURL || getDarkroomBlurPlaceholder(16, 12)}
                    className="object-cover"
                  />
                </div>
                <div className="font-mono text-[10px] text-amber flex justify-between">
                  <span>EXP. {String(idx + 1).padStart(2, '0')}</span>
                  <span>{item.room}</span>
                </div>
                <h4 className="font-title text-xs font-bold text-offwhite truncate">
                  {item.caption}
                </h4>
              </div>
            ))}
          </div>
        </section>

        {/* Mobile Scene 5 */}
        <section className="mobile-story-card p-6 rounded-2xl bg-charcoal border border-amber/40 space-y-4">
          <Badge variant="amber" className="mx-auto block text-center w-fit">
            {'● SCENE 05 // LATENT NEGATIVE'}
          </Badge>
          <h2 className="font-title text-2xl font-black text-offwhite text-center">
            {scene4.headline}
          </h2>
          {nextUpcomingEvent ? (
            <div className="space-y-3 pt-2">
              <h3 className="font-title text-lg font-bold text-offwhite">
                {nextUpcomingEvent.title}
              </h3>
              <Countdown targetDate={nextUpcomingEvent.date} />
              <Button
                href={`/activities/${nextUpcomingEvent.slug}`}
                variant="primary"
                size="sm"
                className="w-full justify-center"
              >
                Examine Manifest
              </Button>
            </div>
          ) : (
            <p className="font-mono text-xs text-offwhite-muted text-center">
              Next frame awaiting assignment.
            </p>
          )}
        </section>

        {/* Mobile Scene 6 */}
        <section className="mobile-story-card p-6 rounded-2xl bg-gradient-to-br from-charcoal to-black border border-amber/30 space-y-4 text-center">
          <Badge variant="amber" className="mx-auto">
            {'● SCENE 06 // THE EPILOGUE'}
          </Badge>
          <h2 className="font-title text-3xl font-black text-offwhite">
            {scene5.headline}
          </h2>
          <p className="font-title text-lg text-amber">
            {scene5.bodyText}
          </p>
          <div className="pt-2 flex flex-col gap-2.5">
            <Button href={whatsappUrl} isExternal variant="primary" className="w-full justify-center">
              <MessageCircle className="w-4 h-4 mr-2" /> Join WhatsApp Guild
            </Button>
            <Button href="/gallery" variant="outline" className="w-full justify-center">
              Explore Light Table
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
