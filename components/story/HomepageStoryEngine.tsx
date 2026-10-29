// File: components/story/HomepageStoryEngine.tsx
'use client';

import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import Image from 'next/image';
import {
  Calendar,
  MapPin,
  ExternalLink,
  MessageCircle,
  ArrowRight,
  Sparkles,
  Sliders,
  CheckCircle2,
  Zap,
  Camera,
  Flame,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Countdown } from '@/components/ui/Countdown';
import { getDarkroomBlurPlaceholder } from '@/lib/utils';
import { useStoryMode } from '@/components/providers/StoryModeProvider';
import { StoryAtmosphereCanvas } from '@/components/story/StoryAtmosphereCanvas';
import { StoryScrubRail } from '@/components/story/StoryScrubRail';

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

function cleanStoryText(text?: string): string {
  if (!text) return '';
  return text.replace(/\[cite:\s*\d+\]/gi, '').trim();
}

export function HomepageStoryEngine({
  storyScenes,
  featuredGallery,
  nextUpcomingEvent,
  whatsappUrl = 'https://chat.whatsapp.com/Hs71BicR1Xj3PmOyPJ5wdc?s=sw&p=a&mlu=4&ilr=4',
  instagramUrl = 'https://www.instagram.com/shutterscape_gcu',
}: HomepageStoryEngineProps) {
  const { mode, setMode } = useStoryMode();
  const isQuickMode = mode === 'quick';

  // Pinned viewport ref and master timeline ref
  const pinnedSectionRef = useRef<HTMLDivElement>(null);
  const masterTlRef = useRef<any>(null);

  // Scene DOM references for desktop scrub
  const scene0Ref = useRef<HTMLDivElement>(null);
  const irisMaskRef = useRef<HTMLDivElement>(null);
  const irisBladesRef = useRef<SVGSVGElement>(null);

  const scene1Ref = useRef<HTMLDivElement>(null);
  const focusTargetRef = useRef<HTMLDivElement>(null);
  const focusScaleRef = useRef<HTMLDivElement>(null);
  const focusLockRef = useRef<HTMLSpanElement>(null);

  const scene2Ref = useRef<HTMLDivElement>(null);
  const bracketsRef = useRef<HTMLDivElement>(null);

  const scene3Ref = useRef<HTMLDivElement>(null);
  const filmReelRef = useRef<HTMLDivElement>(null);

  const scene4Ref = useRef<HTMLDivElement>(null);
  const developingCardRef = useRef<HTMLDivElement>(null);

  const scene5Ref = useRef<HTMLDivElement>(null);
  const flashOverlayRef = useRef<HTMLDivElement>(null);

  // Active scene tracking for contact sheet jump
  const [activeChapter, setActiveChapter] = useState(0);
  // Dynamic 35mm frame counter for scene 3 (EXP. 01/36 to 36/36)
  const [activeReelFrame, setActiveReelFrame] = useState(1);

  // Map scenes safely from incoming database documents
  const scene0 = useMemo(() => {
    const s = storyScenes.find((item) => item.key === 'scene-0-darkness' || item.order === 0);
    return {
      headline: cleanStoryText(s?.headline) || 'Darkness',
      bodyText: cleanStoryText(s?.bodyText) || 'Every photograph begins in the dark.',
    };
  }, [storyScenes]);

  const scene1 = useMemo(() => {
    const s = storyScenes.find((item) => item.key === 'scene-1-light' || item.order === 1);
    return {
      headline: cleanStoryText(s?.headline) || 'Light',
      bodyText: cleanStoryText(s?.bodyText) || 'We are ShutterScape. The eyes of GCU.',
    };
  }, [storyScenes]);

  const scene2 = useMemo(() => {
    const s = storyScenes.find((item) => item.key === 'scene-2-frame' || item.order === 2);
    return {
      headline: cleanStoryText(s?.headline) || 'Frame',
      bodyText: cleanStoryText(s?.bodyText) || 'We learn to see before we learn to shoot.',
    };
  }, [storyScenes]);

  const scene3 = useMemo(() => {
    const s = storyScenes.find((item) => item.key === 'scene-3-moments' || item.order === 3);
    return {
      headline: cleanStoryText(s?.headline) || 'Moments',
      bodyText: cleanStoryText(s?.bodyText) || '36 exposures. Countless stories.',
    };
  }, [storyScenes]);

  const scene4 = useMemo(() => {
    const s = storyScenes.find((item) => item.key === 'scene-4-next-frame' || item.order === 4);
    return {
      headline: cleanStoryText(s?.headline) || 'Next Frame',
      bodyText: cleanStoryText(s?.bodyText) || 'The next frame is still blank.',
    };
  }, [storyScenes]);

  const scene5 = useMemo(() => {
    const s = storyScenes.find((item) => item.key === 'scene-5-epilogue' || item.order === 5);
    return {
      headline: cleanStoryText(s?.headline) || 'Epilogue',
      bodyText: cleanStoryText(s?.bodyText) || 'Your story could be the next shot.',
    };
  }, [storyScenes]);

  // Fallback gallery frames if empty
  const displayGallery = useMemo(() => {
    if (featuredGallery && featuredGallery.length > 0) return featuredGallery;
    return [
      {
        _id: 'ig-1',
        image: {
          url: '/uploads/instagram/post_DejCSHaFLVz_0.jpg',
          publicId: 'ig_post_DejCSHaFLVz',
          width: 1920,
          height: 1080,
        },
        caption: 'Monochrome Court: The Rhythm of Badminton',
        photographer: 'ShutterScape Fellow (@shutterscape_gcu)',
        room: 'Monochrome',
        cameraInfo: 'Sony A7 IV • 35mm • f/2.0',
        featured: true,
      },
      {
        _id: 'ig-2',
        image: {
          url: '/uploads/instagram/shutterscape_ig_2.jpg',
          publicId: 'ig_gcu_light_trails',
          width: 1080,
          height: 1350,
        },
        caption: 'GCU Light Trails & Society Fellowship',
        photographer: 'ShutterScape Collective (@shutterscape_gcu)',
        room: 'Campus Life',
        cameraInfo: 'Fujifilm X-T5 • 16-55mm • f/8.0',
        featured: true,
      },
      {
        _id: 'ig-3',
        image: {
          url: '/uploads/instagram/post_C-XtSVsvtFU_1.webp',
          publicId: 'ig_post_ipseeta_pr',
          width: 1080,
          height: 1080,
        },
        caption: 'Faces of ShutterScape: PR & Communications',
        photographer: 'Council Portrait Team (@shutterscape_gcu)',
        room: 'Portraits',
        cameraInfo: 'Canon EOS R6 • 85mm • f/1.8',
        featured: true,
      },
      {
        _id: 'ig-4',
        image: {
          url: '/uploads/instagram/shutterscape_ig_8.jpg',
          publicId: 'ig_gcu_administrative_building',
          width: 720,
          height: 1280,
        },
        caption: 'The Spire of Azara: Girijananda Chowdhury University',
        photographer: 'Campus Archivist (@shutterscape_gcu)',
        room: 'Campus Life',
        cameraInfo: 'Nikon Z6 II • 24-70mm • f/5.6',
        featured: true,
      },
      {
        _id: 'ig-5',
        image: {
          url: '/uploads/instagram/post_C-dHP5LPw9x.webp',
          publicId: 'ig_post_wild_stone',
          width: 1080,
          height: 1080,
        },
        caption: 'Scent & Petals: Workshop Macro Dynamics',
        photographer: 'Product Workshop Team (@shutterscape_gcu)',
        room: 'Nature',
        cameraInfo: 'Leica M10 • 50mm • f/2.8',
        featured: true,
      },
      {
        _id: 'ig-6',
        image: {
          url: '/uploads/instagram/shutterscape_ig_5.jpg',
          publicId: 'ig_downhill_freeride',
          width: 1080,
          height: 1350,
        },
        caption: 'Flight of the Trail: Downhill Freeride',
        photographer: 'Action Sports Fellow (@shutterscape_gcu)',
        room: 'Street',
        cameraInfo: 'Fujifilm X-T4 • 50-140mm • f/2.8',
        featured: true,
      },
      {
        _id: 'ig-7',
        image: {
          url: '/uploads/instagram/shutterscape_ig_11.jpg',
          publicId: 'ig_students_exhibition',
          width: 720,
          height: 1280,
        },
        caption: 'Exhibition Echoes: Through Student Eyes',
        photographer: 'Documentary Fellow (@shutterscape_gcu)',
        room: 'Campus Life',
        cameraInfo: 'Nikon Z8 • 35mm • f/2.2',
        featured: true,
      },
      {
        _id: 'ig-8',
        image: {
          url: '/uploads/instagram/shutterscape_ig_12.jpg',
          publicId: 'ig_hall_reflection',
          width: 1280,
          height: 720,
        },
        caption: 'Reflections in Solitude: The Marble Hall',
        photographer: 'Architectural Fellow (@shutterscape_gcu)',
        room: 'Monochrome',
        cameraInfo: 'Hasselblad 500C/M • 80mm • f/4.0',
        featured: true,
      },
    ];
  }, [featuredGallery]);

  // Jump to specific chapter
  const handleSelectChapter = useCallback(
    (targetChapterIndex: number) => {
      setActiveChapter(targetChapterIndex);

      if (isQuickMode || typeof window === 'undefined') {
        const elem = document.getElementById(`story-scene-${targetChapterIndex}`);
        if (elem) {
          elem.scrollIntoView({ behavior: 'smooth' });
        }
        return;
      }

      if (masterTlRef.current?.scrollTrigger) {
        const st = masterTlRef.current.scrollTrigger;
        // Chapter progress fractions
        const chapterFractions = nextUpcomingEvent
          ? [0.04, 0.22, 0.42, 0.64, 0.84, 0.98]
          : [0.05, 0.26, 0.50, 0.74, 0.74, 0.97];
        const fraction = chapterFractions[targetChapterIndex] ?? 0;
        const targetScroll = st.start + (st.end - st.start) * fraction;
        window.scrollTo({
          top: targetScroll,
          behavior: 'smooth',
        });
        return;
      }

      const elem = document.getElementById(`story-scene-${targetChapterIndex}`);
      if (elem) {
        elem.scrollIntoView({ behavior: 'smooth' });
      }
    },
    [isQuickMode, nextUpcomingEvent]
  );

  // Dynamic GSAP & ScrollTrigger Initialization
  useEffect(() => {
    if (isQuickMode || typeof window === 'undefined') return;

    let ctx: any = null;
    let isCancelled = false;

    const setupGsapStory = async () => {
      try {
        const gsapModule = await import('gsap');
        const scrollTriggerModule = await import('gsap/ScrollTrigger');
        const gsap = gsapModule.default || gsapModule;
        const ScrollTrigger = scrollTriggerModule.ScrollTrigger || scrollTriggerModule.default;

        gsap.registerPlugin(ScrollTrigger);

        if (isCancelled || !pinnedSectionRef.current) return;

        ctx = gsap.context(() => {
          const mm = gsap.matchMedia();

          // =====================================================================
          // 1. CINEMATIC PINNED + SCRUBBED TIMELINE (All Devices & Viewports)
          // =====================================================================
          mm.add('all', () => {
            const masterTl = gsap.timeline({
              scrollTrigger: {
                trigger: pinnedSectionRef.current,
                start: 'top top',
                end: '+=500%',
                pin: true,
                scrub: 0.8,
                anticipatePin: 1,
                invalidateOnRefresh: true,
                onUpdate: (self) => {
                  const p = self.progress;
                  if (nextUpcomingEvent) {
                    if (p < 0.16) setActiveChapter(0);
                    else if (p < 0.35) setActiveChapter(1);
                    else if (p < 0.55) setActiveChapter(2);
                    else if (p < 0.76) setActiveChapter(3);
                    else if (p < 0.92) setActiveChapter(4);
                    else setActiveChapter(5);
                  } else {
                    if (p < 0.20) setActiveChapter(0);
                    else if (p < 0.42) setActiveChapter(1);
                    else if (p < 0.66) setActiveChapter(2);
                    else if (p < 0.88) setActiveChapter(3);
                    else setActiveChapter(5);
                  }
                },
              },
            });

            masterTlRef.current = masterTl;

            // Initial visibility and positioning
            gsap.set(scene0Ref.current, { autoAlpha: 1 });
            gsap.set(
              [
                scene1Ref.current,
                scene2Ref.current,
                scene3Ref.current,
                scene4Ref.current,
                scene5Ref.current,
                flashOverlayRef.current,
              ],
              { autoAlpha: 0 }
            );

            // -------------------------------------------------------------------
            // SCENE 0: Darkness (0.00 -> 1.80s)
            // Mechanical aperture blades rotate and the iris dilates.
            // -------------------------------------------------------------------
            masterTl
              .fromTo(
                irisMaskRef.current,
                { clipPath: 'circle(12% at 50% 50%)' },
                {
                  clipPath: 'circle(150% at 50% 50%)',
                  ease: 'power2.inOut',
                  duration: 1.5,
                },
                0
              )
              .fromTo(
                irisBladesRef.current,
                { rotation: 0, scale: 1, opacity: 0.7 },
                {
                  rotation: 140,
                  scale: 2.8,
                  opacity: 0,
                  ease: 'power2.inOut',
                  duration: 1.5,
                },
                0
              )
              .to(
                scene0Ref.current,
                {
                  autoAlpha: 0,
                  scale: 0.94,
                  duration: 0.4,
                  ease: 'power2.in',
                },
                1.4
              );

            // -------------------------------------------------------------------
            // SCENE 1: Light (2.00 -> 3.80s)
            // Headline racks focus from deep blur to tack-sharp focus with helicoid
            // ticking to infinity and AF-LOCK CONFIRMED.
            // -------------------------------------------------------------------
            masterTl
              .to(
                scene1Ref.current,
                {
                  autoAlpha: 1,
                  duration: 0.35,
                  ease: 'power2.out',
                },
                2.0
              )
              .fromTo(
                focusTargetRef.current,
                { filter: 'blur(30px) brightness(1.6)', scale: 1.08 },
                {
                  filter: 'blur(0px) brightness(1)',
                  scale: 1,
                  duration: 1.3,
                  ease: 'power2.out',
                },
                2.05
              )
              .fromTo(
                focusScaleRef.current,
                { x: -50, opacity: 0.3 },
                {
                  x: 0,
                  opacity: 1,
                  duration: 1.2,
                  ease: 'power2.out',
                },
                2.05
              )
              .to(
                focusLockRef.current,
                {
                  opacity: 1,
                  scale: 1.05,
                  duration: 0.25,
                  ease: 'back.out(2)',
                },
                2.9
              )
              .to(
                scene1Ref.current,
                {
                  autoAlpha: 0,
                  duration: 0.4,
                  ease: 'power2.in',
                },
                3.5
              );

            // -------------------------------------------------------------------
            // SCENE 2: Frame (4.00 -> 5.80s)
            // Optical viewfinder brackets snap into place with live telemetry.
            // -------------------------------------------------------------------
            masterTl
              .to(
                scene2Ref.current,
                {
                  autoAlpha: 1,
                  duration: 0.35,
                  ease: 'power2.out',
                },
                4.0
              )
              .fromTo(
                bracketsRef.current,
                { scale: 1.3, opacity: 0 },
                {
                  scale: 1,
                  opacity: 1,
                  duration: 0.85,
                  ease: 'back.out(1.5)',
                },
                4.05
              )
              .to(
                scene2Ref.current,
                {
                  autoAlpha: 0,
                  duration: 0.4,
                  ease: 'power2.in',
                },
                5.5
              );

            // -------------------------------------------------------------------
            // SCENE 3: Moments (6.00 -> 8.40s)
            // 35mm film reel scrolls horizontally on vertical wheel with live frame
            // counter (EXP. 01/36 to 36/36).
            // -------------------------------------------------------------------
            masterTl
              .to(
                scene3Ref.current,
                {
                  autoAlpha: 1,
                  duration: 0.35,
                  ease: 'power2.out',
                },
                6.0
              )
              .to(
                filmReelRef.current,
                {
                  xPercent: -58,
                  ease: 'none',
                  duration: 2.1,
                  onUpdate: function () {
                    const progress = this.progress();
                    // Live counter calculates EXP. 01 to EXP. 36
                    const current = Math.min(36, Math.max(1, Math.round(progress * 35) + 1));
                    setActiveReelFrame(current);
                  },
                },
                6.1
              )
              .to(
                scene3Ref.current,
                {
                  autoAlpha: 0,
                  duration: 0.4,
                  ease: 'power2.in',
                },
                8.1
              );

            // -------------------------------------------------------------------
            // SCENE 4: Next Frame (Latent Negative Developing with Live Countdown)
            // (8.50 -> 10.30s) - Bypassed gracefully if no upcoming event
            // -------------------------------------------------------------------
            const scene4Start = 8.5;
            const scene5Start = nextUpcomingEvent ? 10.6 : 8.5;

            if (nextUpcomingEvent) {
              masterTl
                .to(
                  scene4Ref.current,
                  {
                    autoAlpha: 1,
                    duration: 0.35,
                    ease: 'power2.out',
                  },
                  scene4Start
                )
                .fromTo(
                  developingCardRef.current,
                  {
                    filter: 'grayscale(100%) invert(80%) blur(14px) contrast(1.4)',
                    scale: 0.94,
                  },
                  {
                    filter: 'grayscale(0%) invert(0%) blur(0px) contrast(1)',
                    scale: 1,
                    duration: 1.3,
                    ease: 'power2.out',
                  },
                  scene4Start + 0.15
                )
                .to(
                  scene4Ref.current,
                  {
                    autoAlpha: 0,
                    duration: 0.4,
                    ease: 'power2.in',
                  },
                  scene4Start + 1.7
                );
            }

            // -------------------------------------------------------------------
            // SCENE 5: Epilogue (Camera Xenon Flash Fires -> Invitation Revealed)
            // -------------------------------------------------------------------
            masterTl
              .fromTo(
                flashOverlayRef.current,
                { autoAlpha: 0 },
                {
                  autoAlpha: 1,
                  duration: 0.08,
                  ease: 'power4.in',
                },
                scene5Start
              )
              .to(
                flashOverlayRef.current,
                {
                  autoAlpha: 0,
                  duration: 0.45,
                  ease: 'power2.out',
                },
                scene5Start + 0.08
              )
              .to(
                scene5Ref.current,
                {
                  autoAlpha: 1,
                  duration: 0.5,
                  ease: 'power2.out',
                },
                scene5Start + 0.12
              );
          });
        });
      } catch (err) {
        console.error('GSAP dynamic initialization error:', err);
      }
    };

    setupGsapStory();

    // Clean up all ScrollTriggers on unmount
    return () => {
      isCancelled = true;
      if (ctx) ctx.revert();
      import('gsap/ScrollTrigger')
        .then(({ ScrollTrigger }) => {
          ScrollTrigger?.getAll().forEach((trigger: any) => trigger.kill());
        })
        .catch(() => {});
    };
  }, [displayGallery.length, isQuickMode, nextUpcomingEvent]);

  // ===========================================================================
  // QUICK MODE STATIC ACCESSIBLE LAYOUT (If visitor explicitly selected Quick)
  // ===========================================================================
  if (isQuickMode) {
    return (
      <div id="story-scenes" className="relative w-full py-12 px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Quick Mode Notice Banner with one-click return to Story Engine */}
        <div className="max-w-4xl mx-auto p-4 rounded-2xl bg-charcoal border border-amber/30 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber/10 text-amber">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <p className="font-mono text-xs text-amber font-semibold uppercase tracking-wider">
                Quick Mode Active (Static Reader View)
              </p>
              <p className="font-body text-xs text-offwhite-dim">
                Viewing static accessible chapters without scroll-locked animations.
              </p>
            </div>
          </div>
          <Button
            onClick={() => setMode('story')}
            variant="primary"
            size="sm"
            className="shrink-0 gap-1.5 shadow-md"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Launch Interactive Story Engine
          </Button>
        </div>

        <div className="max-w-5xl mx-auto space-y-10">
          {/* Scene 0 */}
          <div
            id="story-scene-0"
            className="p-8 sm:p-10 rounded-3xl bg-charcoal border border-charcoal-border space-y-4 text-center"
          >
            <Badge variant="amber" className="mx-auto">
              ● CHAPTER 00 // DARKNESS
            </Badge>
            <h2 className="font-title text-4xl sm:text-5xl font-black text-offwhite">
              {scene0.headline}
            </h2>
            <p className="font-mono text-base text-amber tracking-wider">
              {`// ${scene0.bodyText}`}
            </p>
            <p className="font-mono text-xs text-offwhite-dim">
              [ Aperture dilates from f/16 to f/1.4 ]
            </p>
          </div>

          {/* Scene 1 */}
          <div
            id="story-scene-1"
            className="p-8 sm:p-10 rounded-3xl bg-charcoal border border-charcoal-border space-y-4 text-center"
          >
            <Badge variant="amber" className="mx-auto">
              ● CHAPTER 01 // LIGHT
            </Badge>
            <h2 className="font-title text-4xl sm:text-5xl font-black text-offwhite">
              {scene1.headline}
            </h2>
            <p className="font-title text-xl text-amber font-light max-w-xl mx-auto">
              {scene1.bodyText}
            </p>
            <div className="inline-flex items-center gap-2 font-mono text-xs text-amber bg-amber/10 px-4 py-2 rounded-xl border border-amber/30">
              <CheckCircle2 className="w-4 h-4" />
              OPTICAL FOCUS CONFIRMED: AF-LOCK (∞)
            </div>
          </div>

          {/* Scene 2 */}
          <div
            id="story-scene-2"
            className="p-8 sm:p-10 rounded-3xl bg-charcoal border border-charcoal-border space-y-6"
          >
            <div className="text-center space-y-2">
              <Badge variant="amber" className="mx-auto">
                ● CHAPTER 02 // FRAME
              </Badge>
              <h2 className="font-title text-4xl sm:text-5xl font-black text-offwhite">
                {scene2.headline}
              </h2>
              <p className="font-title text-lg text-offwhite-muted max-w-lg mx-auto">
                {scene2.bodyText}
              </p>
            </div>
            <div className="flex items-center justify-around max-w-md mx-auto font-mono text-xs text-amber bg-black/60 p-3 rounded-2xl border border-charcoal-border">
              <span>1/1000s</span>
              <span className="text-offwhite font-bold">f/1.4</span>
              <span>ISO 400</span>
              <span className="text-offwhite-dim">RAW+FINE</span>
            </div>
          </div>

          {/* Scene 3 */}
          <div
            id="story-scene-3"
            className="p-8 sm:p-10 rounded-3xl bg-charcoal border border-charcoal-border space-y-6"
          >
            <div className="text-center space-y-2">
              <Badge variant="amber" className="mx-auto">
                ● CHAPTER 03 // MOMENTS
              </Badge>
              <h2 className="font-title text-4xl sm:text-5xl font-black text-offwhite">
                {scene3.headline}
              </h2>
              <p className="font-mono text-sm text-amber">
                {scene3.bodyText}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayGallery.slice(0, 6).map((item, idx) => (
                <div
                  key={item._id}
                  className="relative rounded-2xl bg-black border border-charcoal-border overflow-hidden p-2.5 space-y-2"
                >
                  <div className="flex items-center justify-between text-[10px] font-mono text-amber px-1">
                    <span>KODAK TRI-X</span>
                    <span>EXP. {String(idx + 1).padStart(2, '0')}A</span>
                  </div>
                  <div className="relative aspect-[4/3] rounded-xl overflow-hidden">
                    <Image
                      src={item.image.url}
                      alt={item.caption}
                      fill
                      placeholder="blur"
                      blurDataURL={item.image.blurDataURL || getDarkroomBlurPlaceholder(16, 12)}
                      className="object-cover"
                    />
                  </div>
                  <p className="font-title text-xs font-bold text-offwhite truncate px-1">
                    {item.caption}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Scene 4 */}
          {nextUpcomingEvent && (
            <div
              id="story-scene-4"
              className="p-8 rounded-3xl bg-charcoal border-2 border-amber/40 space-y-6"
            >
              <div className="text-center space-y-2">
                <Badge variant="amber" className="mx-auto">
                  ● CHAPTER 04 // NEXT FRAME
                </Badge>
                <h2 className="font-title text-3xl sm:text-4xl font-black text-offwhite">
                  {scene4.headline}
                </h2>
                <p className="font-mono text-xs text-offwhite-dim">
                  {scene4.bodyText}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                <div className="md:col-span-5 relative aspect-[16/11] rounded-2xl overflow-hidden border border-charcoal-border">
                  <Image
                    src={nextUpcomingEvent.image?.url || 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1200'}
                    alt={nextUpcomingEvent.title}
                    fill
                    placeholder="blur"
                    blurDataURL={nextUpcomingEvent.image?.blurDataURL || getDarkroomBlurPlaceholder(16, 11)}
                    className="object-cover"
                  />
                </div>
                <div className="md:col-span-7 space-y-4">
                  <h3 className="font-title text-2xl font-bold text-offwhite">
                    {nextUpcomingEvent.title}
                  </h3>
                  <Countdown targetDate={nextUpcomingEvent.date} />
                  <div className="flex gap-3 pt-2">
                    <Button href={`/activities/${nextUpcomingEvent.slug}`} variant="primary" size="sm">
                      Examine Roll Manifest
                    </Button>
                    {nextUpcomingEvent.registrationLink && (
                      <Button href={nextUpcomingEvent.registrationLink} isExternal variant="outline" size="sm">
                        Register Now
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Scene 5 */}
          <div
            id="story-scene-5"
            className="p-10 rounded-3xl bg-gradient-to-br from-charcoal via-black to-charcoal border border-amber/40 space-y-6 text-center"
          >
            <Badge variant="amber" className="mx-auto">
              ● CHAPTER 05 // EPILOGUE
            </Badge>
            <h2 className="font-title text-4xl sm:text-5xl font-black text-offwhite">
              {scene5.headline}
            </h2>
            <p className="font-title text-xl text-amber font-light max-w-xl mx-auto">
              {scene5.bodyText}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <Button href={whatsappUrl} isExternal variant="primary" size="md">
                <MessageCircle className="w-4 h-4 mr-2" />
                Join The Collective
              </Button>
              <Button href="/gallery" variant="outline" size="md">
                Explore Light Table
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ===========================================================================
  // INTERACTIVE STORY MODE (DESKTOP PINNED SCRUB + MOBILE REVEAL)
  // ===========================================================================
  return (
    <div className="relative w-full">
      {/* =======================================================================
          CINEMATIC PINNED VIEWPORT (Active across Mobile, Tablet & Desktop)
          ======================================================================= */}
      <div className="relative w-full">
        <div
          ref={pinnedSectionRef}
          className="relative h-[100dvh] w-full overflow-hidden bg-theme-canvas text-theme-ink flex items-center justify-center select-none transition-colors duration-300"
        >
          {/* Atmospheric Silver Halide Particle & Bokeh Canvas */}
          <StoryAtmosphereCanvas activeChapter={activeChapter} />

          {/* Vertical Camera Scrub Rail HUD (Right Side) */}
          <StoryScrubRail
            activeChapter={activeChapter}
            onSelectChapter={handleSelectChapter}
            hideNextFrame={!nextUpcomingEvent}
          />

          {/* Xenon Strobe Flash Curtain (Sibling to all scenes) */}
          <div
            ref={flashOverlayRef}
            style={{ opacity: 0, visibility: 'hidden' }}
            className="pointer-events-none fixed inset-0 z-50 bg-white"
          />

          {/* Viewfinder HUD Reticle centered in viewport */}
          <div className="pointer-events-none absolute inset-0 z-30">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 opacity-25">
              <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-white/70" />
              <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-white/70" />
            </div>

            {/* Bottom Telemetry Strip */}
            <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-10 right-4 sm:right-10 flex items-center justify-between font-mono text-[9px] sm:text-[11px] text-offwhite-dim">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber animate-pulse" />
                <span className="tracking-widest uppercase">ShutterScape Optical</span>
              </div>
              <div className="tracking-widest text-amber/80 flex items-center gap-1.5 sm:gap-2">
                <span>SCROLL SHUTTER</span>
                <span className="text-offwhite-dim font-bold">↓</span>
              </div>
            </div>
          </div>

          {/* -------------------------------------------------------------------
              SCENE 0: Darkness (Mechanical Aperture Blades Rotate & Iris Dilates)
              ------------------------------------------------------------------- */}
          <div
            ref={scene0Ref}
            style={{ opacity: 1, visibility: 'visible' }}
            className="absolute inset-0 z-20 flex items-center justify-center text-center p-4 sm:p-8 bg-black pt-12 sm:pt-16 overflow-hidden"
          >
            {/* Volumetric Ray Burst emerging through aperture */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(245,158,11,0.22)_0%,_rgba(245,158,11,0.05)_40%,_transparent_70%)] animate-volumetric-rays pointer-events-none" />

            {/* Iris Mask Container */}
            <div
              ref={irisMaskRef}
              style={{ clipPath: 'circle(12% at 50% 50%)' }}
              className="absolute inset-0 flex items-center justify-center bg-radial from-amber/25 via-black to-black pointer-events-none"
            >
              {/* Rotating mechanical iris blades SVG with engraved f-stop ring */}
              <div className="relative flex items-center justify-center">
                <svg
                  ref={irisBladesRef}
                  viewBox="0 0 500 500"
                  className="w-[300px] h-[300px] sm:w-[560px] sm:h-[560px] text-amber/40 pointer-events-none will-change-transform drop-shadow-[0_0_35px_rgba(245,158,11,0.2)]"
                  style={{ transformOrigin: '50% 50%' }}
                >
                  {/* Outer Mechanical Barrel Ring */}
                  <circle cx="250" cy="250" r="240" fill="none" stroke="currentColor" strokeWidth="2.5" strokeDasharray="6 6" opacity="0.5" />
                  <circle cx="250" cy="250" r="225" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.3" />
                  <circle cx="250" cy="250" r="170" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.35" />

                  {/* 12 Mechanical Aperture Blades */}
                  {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle, i) => (
                    <g key={i} transform={`rotate(${angle} 250 250)`}>
                      <path
                        d="M250,55 C340,90 380,180 350,250 C290,200 250,140 250,55 Z"
                        fill="currentColor"
                        fillOpacity="0.14"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      />
                      {/* Secondary Blade Rib */}
                      <line x1="250" y1="55" x2="310" y2="170" stroke="currentColor" strokeWidth="0.8" opacity="0.4" />
                    </g>
                  ))}
                </svg>

                {/* Center Core Aperture Glow */}
                <div className="absolute w-20 h-20 sm:w-28 sm:h-28 rounded-full bg-amber/30 blur-2xl animate-pulse pointer-events-none" />
              </div>
            </div>

            {/* Headline and text */}
            <div className="relative z-10 max-w-2xl space-y-4 sm:space-y-5 px-2">
              <Badge variant="amber" className="mx-auto shadow-[0_0_20px_rgba(245,158,11,0.25)] text-[10px] sm:text-xs">
                ● CHAPTER 00 // THE DARKNESS
              </Badge>
              <h2 className="font-title text-4xl sm:text-6xl md:text-7xl font-black text-offwhite tracking-tight leading-none">
                {scene0.headline}
              </h2>
              <p className="font-mono text-xs sm:text-base md:text-lg text-amber tracking-widest uppercase">
                {`// ${scene0.bodyText}`}
              </p>

              {/* Real-time F-Stop Scale Readout */}
              <div className="pt-2 sm:pt-4 flex flex-col items-center gap-2">
                <div className="flex items-center gap-2 sm:gap-3 bg-charcoal/90 border border-charcoal-border px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-xl font-mono text-[10px] sm:text-xs shadow-xl backdrop-blur-md">
                  <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-amber animate-ping" />
                  <span className="text-offwhite-dim">IRIS:</span>
                  <span className="text-offwhite line-through opacity-40">f/16</span>
                  <span className="text-offwhite-dim">→</span>
                  <span className="text-amber font-bold text-xs sm:text-sm tracking-widest">f/1.4 MAXIMUM APERTURE</span>
                </div>
              </div>
            </div>
          </div>

          {/* -------------------------------------------------------------------
              SCENE 1: Light (Focus-Pull Title: deep blur -> tack-sharp focus,
              lens helicoid ticking to ∞, and AF-LOCK CONFIRMED)
              ------------------------------------------------------------------- */}
          <div
            ref={scene1Ref}
            style={{ opacity: 0, visibility: 'hidden' }}
            className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center p-4 sm:p-8 pt-12 sm:pt-16 overflow-hidden"
          >
            {/* Anamorphic Cyan-Amber Horizontal Beam Streak */}
            <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent blur-[1px] animate-anamorphic pointer-events-none -translate-y-1/2" />
            <div className="absolute top-1/2 left-0 right-0 h-[8px] bg-gradient-to-r from-transparent via-amber-400/40 to-transparent blur-[6px] animate-anamorphic pointer-events-none -translate-y-1/2" />

            {/* Concentric Lens Flare Elements */}
            <div className="absolute w-[280px] h-[280px] sm:w-[450px] sm:h-[450px] rounded-full border border-cyan-500/15 pointer-events-none" />
            <div className="absolute w-[200px] h-[200px] sm:w-[280px] sm:h-[280px] rounded-full border border-amber/20 pointer-events-none" />

            <div ref={focusTargetRef} className="max-w-3xl space-y-4 sm:space-y-6 relative z-10 px-2">
              <Badge variant="amber" className="mx-auto shadow-[0_0_20px_rgba(245,158,11,0.25)] text-[10px] sm:text-xs">
                ● CHAPTER 01 // RACKING FOCUS
              </Badge>
              <h2 className="font-title text-4xl sm:text-6xl md:text-7xl font-black text-offwhite tracking-tight leading-[1.05] chromatic-text">
                {scene1.headline}
              </h2>
              <p className="font-title text-base sm:text-2xl md:text-3xl text-amber font-light max-w-2xl mx-auto leading-snug">
                {scene1.bodyText}
              </p>
            </div>

            {/* Optical Focus Distance Helicoid Scale */}
            <div
              ref={focusScaleRef}
              className="mt-6 sm:mt-10 flex flex-col items-center gap-2 sm:gap-3 bg-charcoal/90 border border-charcoal-border px-4 sm:px-8 py-2.5 sm:py-4 rounded-2xl backdrop-blur-md shadow-2xl relative z-10 max-w-xs sm:max-w-none"
            >
              <div className="font-mono text-[9px] sm:text-[10px] tracking-widest uppercase text-offwhite-dim flex items-center gap-2">
                <Sliders className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber" />
                <span>MANUAL FOCUS HELICOID</span>
                <span className="text-amber/60 font-bold hidden sm:inline">• 35mm f/1.4 GM</span>
              </div>
              <div className="font-mono text-[10px] sm:text-xs text-offwhite tracking-widest flex items-center gap-2 sm:gap-4">
                <span className="text-offwhite-dim">0.3m</span>
                <span className="text-offwhite-dim">──</span>
                <span className="text-offwhite-dim">0.7m</span>
                <span className="text-offwhite-dim">──</span>
                <span className="text-offwhite-dim">1.2m</span>
                <span className="text-offwhite-dim hidden sm:inline">──</span>
                <span className="text-offwhite-dim hidden sm:inline">3.0m</span>
                <span className="text-offwhite-dim">──</span>
                <span className="text-amber font-bold text-xs sm:text-sm bg-amber/15 px-2 py-0.5 rounded border border-amber/30">
                  ∞
                </span>
              </div>
              <span
                ref={focusLockRef}
                className="font-mono text-[10px] sm:text-[11px] font-bold text-emerald-400 opacity-0 flex items-center gap-1.5 animate-af-flash px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30"
              >
                <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-400" />
                OPTICAL FOCUS CONFIRMED (AF-LOCK)
              </span>
            </div>
          </div>

          {/* -------------------------------------------------------------------
              SCENE 2: Frame (Optical Viewfinder Brackets Snap with Live Telemetry)
              ------------------------------------------------------------------- */}
          <div
            ref={scene2Ref}
            style={{ opacity: 0, visibility: 'hidden' }}
            className="absolute inset-0 z-20 flex items-center justify-center p-3 sm:p-8 pt-12 sm:pt-16 overflow-hidden"
          >
            <div
              ref={bracketsRef}
              className="relative max-w-4xl w-full aspect-[4/3] sm:aspect-[16/10] border border-white/20 rounded-2xl sm:rounded-3xl p-3 sm:p-8 flex flex-col justify-between bg-charcoal/50 backdrop-blur-xl shadow-[0_0_60px_rgba(0,0,0,0.85)] overflow-hidden"
            >
              {/* Authentic Monochrome Campus Backdrop inside Viewfinder */}
              <div className="absolute inset-0 pointer-events-none opacity-20 filter contrast-125">
                <Image
                  src="/uploads/instagram/post_DejCSHaFLVz_0.jpg"
                  alt="GCU Campus Framing"
                  fill
                  className="object-cover"
                />
              </div>

              {/* Corner Framing Brackets */}
              <div className="absolute top-3 left-3 sm:top-5 sm:left-5 w-5 h-5 sm:w-8 sm:h-8 border-t-2 border-l-2 border-amber" />
              <div className="absolute top-3 right-3 sm:top-5 sm:right-5 w-5 h-5 sm:w-8 sm:h-8 border-t-2 border-r-2 border-amber" />
              <div className="absolute bottom-3 left-3 sm:bottom-5 sm:left-5 w-5 h-5 sm:w-8 sm:h-8 border-b-2 border-l-2 border-amber" />
              <div className="absolute bottom-3 right-3 sm:bottom-5 sm:right-5 w-5 h-5 sm:w-8 sm:h-8 border-b-2 border-r-2 border-amber" />

              {/* Optical Rule of Thirds Grid with Intersection Nodes */}
              <div className="pointer-events-none absolute inset-3 sm:inset-6 grid grid-cols-3 grid-rows-3 border border-white/5 opacity-40">
                <div className="border-r border-b border-white/5 relative">
                  <span className="absolute bottom-[-3px] right-[-3px] w-1.5 h-1.5 rounded-full bg-amber/70" />
                </div>
                <div className="border-r border-b border-white/5 relative">
                  <span className="absolute bottom-[-3px] right-[-3px] w-1.5 h-1.5 rounded-full bg-amber/70" />
                </div>
                <div className="border-b border-white/5" />
                <div className="border-r border-b border-white/5 relative">
                  <span className="absolute bottom-[-3px] right-[-3px] w-1.5 h-1.5 rounded-full bg-amber/70" />
                </div>
                <div className="border-r border-b border-white/5 relative">
                  <span className="absolute bottom-[-3px] right-[-3px] w-1.5 h-1.5 rounded-full bg-amber/70" />
                </div>
                <div className="border-b border-white/5" />
              </div>

              {/* Viewfinder Center Crosshair Reticle with Electronic Level */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 sm:w-20 sm:h-20 pointer-events-none flex items-center justify-center">
                <div className="absolute w-full h-[1.5px] bg-amber/80" />
                <div className="absolute h-full w-[1.5px] bg-amber/80" />
                <div className="absolute inset-2 sm:inset-3 rounded-full border border-amber/40" />
                <div className="absolute inset-3.5 sm:inset-5 rounded-full border-2 border-amber" />
                {/* Electronic Level Bar */}
                <div className="absolute -bottom-6 sm:-bottom-7 flex items-center gap-1 font-mono text-[8px] sm:text-[9px] text-emerald-400 bg-black/85 px-1.5 sm:px-2 py-0.5 rounded border border-emerald-500/30">
                  <span>LEVEL 0.0°</span>
                </div>
              </div>

              {/* Top Viewfinder Telemetry */}
              <div className="flex items-center justify-between font-mono text-[9px] sm:text-xs text-offwhite-dim z-10">
                <span className="text-amber font-bold flex items-center gap-1 bg-black/75 px-2 sm:px-3 py-0.5 sm:py-1 rounded-lg border border-amber/30 text-[8px] sm:text-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber animate-ping" />
                  [AF-C TRACKING]
                </span>
                <span className="bg-black/80 px-2 sm:px-3 py-0.5 sm:py-1 rounded-lg border border-charcoal-border text-offwhite font-bold hidden xs:inline">
                  +0.3 EV
                </span>
                <span className="bg-black/80 px-2 sm:px-3 py-0.5 sm:py-1 rounded-lg border border-charcoal-border text-emerald-400 font-bold">
                  RAW 14-BIT
                </span>
              </div>

              {/* Scene Narrative */}
              <div className="text-center space-y-1.5 sm:space-y-3 z-10 max-w-xl mx-auto my-auto px-2">
                <Badge variant="amber" className="mx-auto shadow-md text-[9px] sm:text-xs">
                  ● CHAPTER 02 // THE COMPOSITION
                </Badge>
                <h2 className="font-title text-2xl sm:text-5xl md:text-6xl font-black text-offwhite tracking-tight">
                  {scene2.headline}
                </h2>
                <p className="font-title text-xs sm:text-lg md:text-xl text-offwhite-muted leading-relaxed line-clamp-2 sm:line-clamp-none">
                  {scene2.bodyText}
                </p>
              </div>

              {/* Bottom Camera Telemetry Meter & Exposure Gauge */}
              <div className="flex flex-col gap-1.5 sm:gap-2 z-10 pt-2 sm:pt-4 border-t border-white/10 font-mono text-[9px] sm:text-xs">
                {/* Exposure Meter Scale */}
                <div className="flex items-center justify-center gap-1 text-[8px] sm:text-[10px] text-offwhite-dim">
                  <span>-2</span>
                  <span className="text-white/20">···</span>
                  <span>-1</span>
                  <span className="text-white/20">···</span>
                  <span className="text-amber font-bold text-[10px] sm:text-xs">▼</span>
                  <span className="text-amber font-bold">0</span>
                  <span className="text-white/20">···</span>
                  <span>+1</span>
                  <span className="text-white/20">···</span>
                  <span>+2</span>
                </div>

                <div className="flex items-center justify-between text-amber font-bold text-[9px] sm:text-xs">
                  <span className="bg-black/80 px-1.5 sm:px-2 py-0.5 rounded border border-charcoal-border">1/2000s</span>
                  <span className="text-offwhite font-bold text-xs sm:text-sm bg-black/80 px-2 sm:px-2.5 py-0.5 rounded border border-charcoal-border">f/1.4</span>
                  <span className="bg-black/80 px-1.5 sm:px-2 py-0.5 rounded border border-charcoal-border">ISO 400</span>
                  <span className="text-emerald-400 font-semibold bg-black/80 px-1.5 sm:px-2 py-0.5 rounded border border-emerald-500/30">
                    98%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* -------------------------------------------------------------------
              SCENE 3: Moments (Horizontal Film Strip Driven by Vertical Scroll
              with Live Frame Counter EXP. 01/36 to 36/36)
              ------------------------------------------------------------------- */}
          <div
            ref={scene3Ref}
            style={{ opacity: 0, visibility: 'hidden' }}
            className="absolute inset-0 z-20 flex flex-col justify-center px-4 sm:px-12 pt-12 sm:pt-16 overflow-hidden"
          >
            {/* Header Readout Bar with Live Frame Counter */}
            <div className="max-w-6xl mx-auto w-full flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-2 sm:mb-4 z-10">
              <div className="space-y-0.5 sm:space-y-1">
                <Badge variant="amber" className="shadow-md text-[9px] sm:text-xs">
                  ● CHAPTER 03 // 35MM CONTINUOUS REEL
                </Badge>
                <h2 className="font-title text-2xl sm:text-4xl md:text-5xl font-black text-offwhite">
                  {scene3.headline}
                </h2>
                <p className="font-mono text-[10px] sm:text-xs text-offwhite-muted">
                  {scene3.bodyText}
                </p>
              </div>

              {/* Live Analog Dial / Frame Counter */}
              <div className="self-start sm:self-auto flex items-center gap-2 sm:gap-3 bg-charcoal border border-charcoal-border px-3 sm:px-4 py-1.5 sm:py-2.5 rounded-xl sm:rounded-2xl font-mono text-[10px] sm:text-xs shadow-2xl backdrop-blur-md">
                <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-amber animate-pulse shadow-[0_0_8px_#F59E0B]" />
                <span className="text-offwhite-dim">FRAME:</span>
                <span className="text-amber font-bold text-xs sm:text-sm tracking-widest">
                  EXP. {String(activeReelFrame).padStart(2, '0')}/36
                </span>
              </div>
            </div>

            {/* Horizontal Film Reel Track with 35mm Canister on Left */}
            <div className="relative w-full overflow-hidden py-2 sm:py-4 flex items-center">
              {/* Metallic 35mm Film Canister Housing */}
              <div className="relative shrink-0 w-16 sm:w-28 h-36 sm:h-56 rounded-r-xl sm:rounded-r-2xl bg-gradient-to-r from-zinc-800 via-zinc-900 to-black border-y-2 border-r-2 border-amber/40 shadow-[10px_0_30px_rgba(0,0,0,0.9)] flex flex-col justify-between p-2 sm:p-3 z-20">
                <div className="flex items-center gap-1 sm:gap-1.5">
                  <div className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 rounded-full border border-amber/70 animate-spool-spin flex items-center justify-center">
                    <span className="w-0.5 h-0.5 sm:w-1 sm:h-1 bg-amber rounded-full" />
                  </div>
                  <span className="font-mono text-[7px] sm:text-[9px] text-amber font-bold tracking-wider">TRI-X</span>
                </div>
                <div className="font-mono text-[7px] sm:text-[9px] text-offwhite-dim tracking-widest rotate-90 origin-center whitespace-nowrap uppercase">
                  SHUTTERSCAPE
                </div>
                <div className="font-mono text-[6px] sm:text-[8px] text-zinc-500">ISO 400</div>
              </div>

              {/* Film Strip Slider */}
              <div
                ref={filmReelRef}
                className="flex items-center gap-3 sm:gap-6 w-max will-change-transform pl-2 sm:pl-4"
              >
                {displayGallery.map((item, idx) => (
                  <div
                    key={item._id}
                    className="relative w-[220px] sm:w-[340px] shrink-0 bg-[#0c0c0e] border border-charcoal-border rounded-xl sm:rounded-2xl p-2 sm:p-3.5 shadow-2xl space-y-1.5 sm:space-y-2 group transition-transform duration-300 hover:-translate-y-2 hover:border-amber/60 hover:shadow-[0_15px_40px_rgba(245,158,11,0.2)]"
                  >
                    {/* Top Sprocket Perforation Strip */}
                    <div className="horizontal-film-track h-3 sm:h-5 w-full opacity-70" />

                    {/* Film Frame Margin Indicators */}
                    <div className="flex items-center justify-between text-[8px] sm:text-[10px] font-mono text-amber px-1 font-semibold">
                      <span>KODAK SAFETY FILM</span>
                      <span className="font-bold bg-black/80 px-1 py-0.5 rounded border border-amber/30">
                        EXP. {String(idx + 1).padStart(2, '0')}A
                      </span>
                      <span>▲ {idx + 1}</span>
                    </div>

                    {/* Image */}
                    <div className="relative aspect-[4/3] w-full rounded-lg sm:rounded-xl overflow-hidden bg-black shadow-inner">
                      <Image
                        src={item.image.url}
                        alt={item.caption}
                        fill
                        placeholder="blur"
                        blurDataURL={item.image.blurDataURL || getDarkroomBlurPlaceholder(16, 12)}
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-108"
                      />
                      <div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 z-10">
                        <Badge variant="neutral" className="text-[7px] sm:text-[9px] py-0.5 px-1.5 sm:px-2 bg-black/85 backdrop-blur-sm border border-white/20">
                          {item.room}
                        </Badge>
                      </div>
                    </div>

                    {/* Frame Caption */}
                    <div className="p-0.5 sm:p-1 space-y-0.5">
                      <h4 className="font-title text-xs sm:text-sm font-bold text-offwhite truncate group-hover:text-amber transition-colors">
                        {item.caption}
                      </h4>
                      {item.photographer && (
                        <p className="font-mono text-[8px] sm:text-[10px] text-offwhite-dim truncate">
                          {item.photographer}
                        </p>
                      )}
                    </div>

                    {/* Bottom Sprocket Perforation Strip */}
                    <div className="horizontal-film-track h-3 sm:h-5 w-full opacity-70" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* -------------------------------------------------------------------
              SCENE 4: Next Frame (Latent Negative Develops with Live Countdown)
              (Hidden if none)
              ------------------------------------------------------------------- */}
          {nextUpcomingEvent && (
            <div
              ref={scene4Ref}
              style={{ opacity: 0, visibility: 'hidden' }}
              className="absolute inset-0 z-20 flex items-center justify-center p-3 sm:p-8 pt-12 sm:pt-16 overflow-hidden"
            >
              {/* Concentric Chemical Agitation Wave Rings */}
              <div className="pointer-events-none absolute w-[340px] sm:w-[600px] h-[340px] sm:h-[600px] rounded-full border border-rose-600/30 animate-chemical-ripple" />
              <div className="pointer-events-none absolute w-[240px] sm:w-[400px] h-[240px] sm:h-[400px] rounded-full border border-amber/20 animate-chemical-ripple [animation-delay:1.5s]" />

              <div className="max-w-3xl w-full space-y-2 sm:space-y-4 relative z-10">
                <div className="text-center space-y-0.5 sm:space-y-1">
                  <Badge variant="amber" className="mx-auto shadow-[0_0_20px_rgba(245,158,11,0.25)] text-[9px] sm:text-xs">
                    ● CHAPTER 04 // THE LATENT NEGATIVE
                  </Badge>
                  <h2 className="font-title text-2xl sm:text-4xl md:text-5xl font-black text-offwhite">
                    {scene4.headline}
                  </h2>
                  <p className="font-mono text-[10px] sm:text-xs text-offwhite-muted">
                    {scene4.bodyText}
                  </p>
                </div>

                {/* Developing Film Frame Card */}
                <div
                  ref={developingCardRef}
                  style={{ filter: 'grayscale(100%) invert(80%) blur(14px) contrast(1.4)' }}
                  className="relative p-4 sm:p-8 rounded-2xl sm:rounded-3xl bg-charcoal/90 border-2 border-amber/50 shadow-[0_0_60px_rgba(245,158,11,0.25)] will-change-transform backdrop-blur-xl"
                >
                  {/* Darkroom Developer Bath Telemetry Bar */}
                  <div className="mb-2 sm:mb-4 flex items-center justify-between font-mono text-[9px] sm:text-[10px] text-amber pb-1.5 sm:pb-2 border-b border-charcoal-border">
                    <span className="flex items-center gap-1.5 font-bold truncate">
                      <Flame className="w-3 h-3 text-rose-500 animate-pulse shrink-0" />
                      SAFELIGHT 650nm // BATH 01: D-76
                    </span>
                    <span className="text-offwhite-dim shrink-0">TEMP: 20°C</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-6 items-center">
                    {/* Event Cover Image */}
                    <div className="md:col-span-5 relative aspect-[16/10] rounded-xl sm:rounded-2xl overflow-hidden border border-charcoal-border shadow-2xl">
                      <Image
                        src={nextUpcomingEvent.image?.url || 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1200'}
                        alt={nextUpcomingEvent.title}
                        fill
                        placeholder="blur"
                        blurDataURL={nextUpcomingEvent.image?.blurDataURL || getDarkroomBlurPlaceholder(16, 11)}
                        className="object-cover"
                      />
                      <div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 z-10">
                        <Badge variant="amber" className="text-[8px] sm:text-[9px] shadow-lg">
                          <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" />
                          EXPEDITION SCHEDULED
                        </Badge>
                      </div>
                    </div>

                    {/* Event Details & Live Countdown */}
                    <div className="md:col-span-7 space-y-2 sm:space-y-3">
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-mono text-amber">
                        <span className="flex items-center gap-1 bg-amber/10 px-2 py-0.5 rounded-full border border-amber/30">
                          <Calendar className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                          {new Date(nextUpcomingEvent.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                        {nextUpcomingEvent.venue && (
                          <span className="flex items-center gap-1 text-offwhite-dim bg-white/5 px-2 py-0.5 rounded-full border border-charcoal-border truncate max-w-[180px]">
                            <MapPin className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0" />
                            {nextUpcomingEvent.venue}
                          </span>
                        )}
                      </div>

                      <h3 className="font-title text-base sm:text-xl md:text-2xl font-bold text-offwhite leading-tight">
                        {nextUpcomingEvent.title}
                      </h3>

                      {nextUpcomingEvent.pullQuote && (
                        <p className="text-[11px] sm:text-xs text-offwhite-muted italic border-l-2 border-amber pl-2 sm:pl-3 line-clamp-2">
                          &ldquo;{nextUpcomingEvent.pullQuote}&rdquo;
                        </p>
                      )}

                      {/* Live Intervalometer Countdown */}
                      <div className="pt-0.5 sm:pt-1">
                        <Countdown targetDate={nextUpcomingEvent.date} />
                      </div>

                      {/* Register Links */}
                      <div className="pt-1 sm:pt-2 flex flex-wrap items-center gap-2 sm:gap-3">
                        <Button
                          href={`/activities/${nextUpcomingEvent.slug}`}
                          variant="primary"
                          size="sm"
                          className="gap-1.5 shadow-md text-xs py-1.5"
                        >
                          Examine Roll <ArrowRight className="w-3 h-3" />
                        </Button>
                        {nextUpcomingEvent.registrationLink && (
                          <Button
                            href={nextUpcomingEvent.registrationLink}
                            isExternal
                            variant="outline"
                            size="sm"
                            className="gap-1 text-xs py-1.5"
                          >
                            Register <ExternalLink className="w-2.5 h-2.5" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* -------------------------------------------------------------------
              SCENE 5: Epilogue (Camera Xenon Flash Fires -> Invitation Revealed)
              ------------------------------------------------------------------- */}
          <div
            ref={scene5Ref}
            style={{ opacity: 0, visibility: 'hidden' }}
            className="absolute inset-0 z-20 flex items-center justify-center p-4 sm:p-8 pt-12 sm:pt-16 text-center overflow-hidden"
          >
            {/* Center Golden Flash Flare Burst */}
            <div className="absolute w-[360px] sm:w-[600px] h-[360px] sm:h-[600px] rounded-full bg-gradient-to-r from-amber-500/10 via-amber-300/20 to-transparent blur-3xl pointer-events-none" />

            {/* Gilded Society Collective Invitation Card */}
            <div className="max-w-2xl w-full p-5 sm:p-12 rounded-2xl sm:rounded-3xl bg-gradient-to-b from-[#16161a] via-[#101014] to-black border border-amber/40 shadow-[0_0_80px_rgba(245,158,11,0.2)] space-y-4 sm:space-y-6 relative z-10 backdrop-blur-2xl">
              <div className="flex flex-col items-center gap-1.5 sm:gap-2">
                <Badge variant="amber" className="shadow-lg text-[9px] sm:text-xs">
                  ● CHAPTER 05 // THE EPILOGUE
                </Badge>
                <div className="font-mono text-[9px] sm:text-[10px] text-amber/80 tracking-widest uppercase font-bold">
                  ROLL EXPOSURE 36/36 COMPLETED • CAMERA READY
                </div>
              </div>

              {/* Society Guild Emblem Seal */}
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-amber via-pink-500 to-purple-600 p-[2px] mx-auto shadow-2xl">
                <div className="w-full h-full rounded-[10px] sm:rounded-[14px] bg-black flex items-center justify-center text-amber">
                  <Camera className="w-6 h-6 sm:w-8 sm:h-8" />
                </div>
              </div>

              <div className="space-y-2 sm:space-y-3">
                <h2 className="font-title text-2xl sm:text-5xl md:text-6xl font-black text-offwhite tracking-tight leading-[1.08]">
                  {scene5.headline}
                </h2>
                <p className="font-title text-base sm:text-2xl text-amber font-light max-w-lg mx-auto leading-relaxed">
                  {scene5.bodyText}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2.5 sm:gap-3 pt-2 sm:pt-3">
                <Button
                  href={whatsappUrl}
                  isExternal
                  variant="primary"
                  size="md"
                  className="gap-2 shadow-[0_0_25px_rgba(245,158,11,0.35)] justify-center"
                >
                  <MessageCircle className="w-4 h-4" />
                  Join The Collective
                </Button>

                <Button
                  href="/gallery"
                  variant="outline"
                  size="md"
                  className="gap-2 justify-center"
                >
                  Explore Light Table <ArrowRight className="w-4 h-4" />
                </Button>

                <Button
                  href={instagramUrl}
                  isExternal
                  variant="secondary"
                  size="md"
                  className="justify-center"
                >
                  Follow on Instagram
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
