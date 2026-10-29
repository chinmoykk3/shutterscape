'use client';

import React, { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { motion, useMotionValue, useSpring, useReducedMotion } from 'framer-motion';

export interface FloatingGalleryItem {
  _id?: string;
  caption?: string;
  photographer?: string;
  room?: string;
  image: {
    url: string;
    blurDataURL?: string;
    width?: number;
    height?: number;
  };
}

interface HeroFloatingGalleryProps {
  items: FloatingGalleryItem[];
}

interface CardConfig {
  id: number;
  posClass: string;
  sizeClass: string;
  rotate: number;
  depth: number;
  baseOpacity: number;
  floatDuration: number;
  floatY: number;
  floatX: number;
  floatDelay: number;
  expIndex: string;
  hideOnMobile?: boolean;
}

const CARD_CONFIGS: CardConfig[] = [
  // 0: Upper-Left (Anchored safely below fixed header)
  {
    id: 0,
    posClass: 'top-[14%] sm:top-[15%] lg:top-[16%] left-[1.5%] sm:left-[3%] lg:left-[4%]',
    sizeClass: 'w-24 h-32 sm:w-48 sm:h-64 lg:w-56 lg:h-72',
    rotate: -5,
    depth: 1.4,
    baseOpacity: 0.55,
    floatDuration: 14,
    floatY: 12,
    floatX: 8,
    floatDelay: 0,
    expIndex: 'EXP. 01/36',
  },
  // 1: Upper-Right (Anchored safely below fixed header controls)
  {
    id: 1,
    posClass: 'top-[14%] sm:top-[15%] lg:top-[16%] right-[1.5%] sm:right-[3%] lg:right-[4%]',
    sizeClass: 'w-24 h-32 sm:w-50 sm:h-66 lg:w-58 lg:h-76',
    rotate: 4,
    depth: 1.5,
    baseOpacity: 0.55,
    floatDuration: 16,
    floatY: 14,
    floatX: -9,
    floatDelay: 1.5,
    expIndex: 'EXP. 04/36',
  },
  // 2: Mid-Left (Flanking Headline)
  {
    id: 2,
    posClass: 'top-[50%] left-[1%] sm:left-[2%] lg:left-[2.5%]',
    sizeClass: 'w-32 h-44 sm:w-44 sm:h-60 lg:w-48 lg:h-64',
    rotate: 3,
    depth: 0.9,
    baseOpacity: 0.6,
    floatDuration: 18,
    floatY: 10,
    floatX: 6,
    floatDelay: 3,
    expIndex: 'EXP. 09/36',
    hideOnMobile: true,
  },
  // 3: Mid-Right (Flanking Headline)
  {
    id: 3,
    posClass: 'top-[52%] right-[1%] sm:right-[2%] lg:right-[2.5%]',
    sizeClass: 'w-32 h-44 sm:w-44 sm:h-60 lg:w-52 lg:h-68',
    rotate: -4,
    depth: 1.1,
    baseOpacity: 0.6,
    floatDuration: 15,
    floatY: 12,
    floatX: -7,
    floatDelay: 2,
    expIndex: 'EXP. 14/36',
    hideOnMobile: true,
  },
  // 4: Lower-Left (Clear of floating dock)
  {
    id: 4,
    posClass: 'bottom-[6%] sm:bottom-[7%] left-[3%] sm:left-[5%] lg:left-[7%]',
    sizeClass: 'w-36 h-48 sm:w-48 sm:h-64 lg:w-54 lg:h-70',
    rotate: -3,
    depth: 1.3,
    baseOpacity: 0.65,
    floatDuration: 17,
    floatY: 14,
    floatX: 6,
    floatDelay: 4,
    expIndex: 'EXP. 21/36',
    hideOnMobile: true,
  },
  // 5: Lower-Right (Clear of floating dock)
  {
    id: 5,
    posClass: 'bottom-[6%] sm:bottom-[7%] right-[3%] sm:right-[5%] lg:right-[7%]',
    sizeClass: 'w-36 h-48 sm:w-50 sm:h-66 lg:w-56 lg:h-74',
    rotate: 5,
    depth: 1.4,
    baseOpacity: 0.7,
    floatDuration: 19,
    floatY: 16,
    floatX: -8,
    floatDelay: 2.5,
    expIndex: 'EXP. 27/36',
    hideOnMobile: true,
  },
  // 6: Deep Accent Top-Center
  {
    id: 6,
    posClass: 'top-[16%] left-[22%] sm:left-[20%] lg:left-[18%]',
    sizeClass: 'w-28 h-36 sm:w-36 sm:h-48 lg:w-40 lg:h-52',
    rotate: -2,
    depth: 0.5,
    baseOpacity: 0.4,
    floatDuration: 22,
    floatY: 8,
    floatX: 4,
    floatDelay: 5,
    expIndex: 'EXP. 31/36',
    hideOnMobile: true,
  },
  // 7: Deep Accent Bottom-Center
  {
    id: 7,
    posClass: 'bottom-[8%] right-[22%] sm:right-[20%] lg:right-[18%]',
    sizeClass: 'w-28 h-36 sm:w-36 sm:h-48 lg:w-42 lg:h-54',
    rotate: 3,
    depth: 0.6,
    baseOpacity: 0.4,
    floatDuration: 20,
    floatY: 9,
    floatX: -5,
    floatDelay: 3.5,
    expIndex: 'EXP. 35/36',
    hideOnMobile: true,
  },
];

/**
 * Optical Ground Glass Calibration Blueprint with Reactive Mouse Parallax
 */
function OpticalGroundGlassParallax({
  smoothX,
  smoothY,
  prefersReduced,
}: {
  smoothX: ReturnType<typeof useSpring>;
  smoothY: ReturnType<typeof useSpring>;
  prefersReduced: boolean;
}) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (prefersReduced) return;
    const unsubX = smoothX.on('change', (val) => {
      setOffset((prev) => ({ ...prev, x: val * 10 }));
    });
    const unsubY = smoothY.on('change', (val) => {
      setOffset((prev) => ({ ...prev, y: val * 8 }));
    });
    return () => {
      unsubX();
      unsubY();
    };
  }, [smoothX, smoothY, prefersReduced]);

  return (
    <div
      style={{
        transform: `translate3d(${offset.x}px, ${offset.y}px, 0)`,
      }}
      className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden transition-transform duration-300 ease-out z-0"
    >
      {/* Outer Optical Calibration Reticle (960px) */}
      <div className="relative w-[620px] h-[620px] sm:w-[940px] sm:h-[940px] rounded-full border border-amber-500/15 dark:border-amber/10 flex items-center justify-center">
        {/* Cardinal Degree Markers */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 font-mono text-[8px] sm:text-[9px] tracking-[0.25em] text-amber-700/60 dark:text-amber/40 uppercase">
          00° // OPTICAL FIELD
        </div>
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 font-mono text-[8px] sm:text-[9px] tracking-[0.25em] text-amber-700/60 dark:text-amber/40 uppercase">
          180° // FOCAL PLANE
        </div>
        <div className="absolute left-2 top-1/2 -translate-y-1/2 -rotate-90 font-mono text-[8px] sm:text-[9px] tracking-[0.25em] text-stone-400 dark:text-offwhite-dim/40 uppercase">
          270° • 35MM
        </div>
        <div className="absolute right-2 top-1/2 -translate-y-1/2 rotate-90 font-mono text-[8px] sm:text-[9px] tracking-[0.25em] text-stone-400 dark:text-offwhite-dim/40 uppercase">
          90° • GCU ARCHIVE
        </div>

        {/* Mid Helicoid Dashed Calibration Ring (700px) */}
        <div className="w-[460px] h-[460px] sm:w-[700px] sm:h-[700px] rounded-full border border-stone-300/60 dark:border-white/5 border-dashed flex items-center justify-center">
          {/* Inner Ground Glass Ring (460px) */}
          <div className="w-[300px] h-[300px] sm:w-[480px] sm:h-[480px] rounded-full border border-stone-300/40 dark:border-white/5 flex items-center justify-center">
            {/* Center Split-Image Rangefinder Prism Box (180px) */}
            <div className="w-36 h-36 sm:w-48 sm:h-48 rounded-full border border-amber-500/20 dark:border-amber/20 relative">
              {/* Rangefinder Optical Focus Marks */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-1 bg-amber-500/40" />
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-1 bg-amber-500/40" />
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-2 bg-amber-500/40" />
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-2 bg-amber-500/40" />
            </div>
          </div>
        </div>
      </div>

      {/* Crosshair Alignment Axes */}
      <div className="absolute w-[94%] max-w-7xl h-[1px] bg-gradient-to-r from-transparent via-stone-300/50 dark:via-white/10 to-transparent" />
      <div className="absolute h-[85%] max-h-[760px] w-[1px] bg-gradient-to-b from-transparent via-stone-300/50 dark:via-white/10 to-transparent" />

      {/* Sub-Axis Fine Metric Ruler Ticks on Horizontal Crosshair */}
      <div className="absolute w-[80%] max-w-5xl h-2 flex justify-between items-center opacity-40 dark:opacity-20 pointer-events-none">
        {Array.from({ length: 17 }).map((_, i) => (
          <div
            key={i}
            className={`w-[1px] bg-stone-400 dark:bg-white ${
              i % 4 === 0 ? 'h-3' : 'h-1.5'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export function HeroFloatingGallery({ items }: HeroFloatingGalleryProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReduced = useReducedMotion();

  // Mouse coordinate motion values for reactive parallax
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth physics springs for ultra-fluid response
  const smoothX = useSpring(mouseX, { stiffness: 45, damping: 25, mass: 0.5 });
  const smoothY = useSpring(mouseY, { stiffness: 45, damping: 25, mass: 0.5 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (prefersReduced) return;
      const { innerWidth, innerHeight } = window;
      const nx = (e.clientX / innerWidth) * 2 - 1;
      const ny = (e.clientY / innerHeight) * 2 - 1;
      mouseX.set(nx);
      mouseY.set(ny);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY, prefersReduced]);

  if (!items || items.length === 0) {
    return null;
  }

  // Distribute items across configs with fallback looping
  const cards = CARD_CONFIGS.map((cfg, index) => {
    const item = items[index % items.length];
    return { cfg, item };
  });

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0"
    >
      {/* Interactive Optical Ground-Glass Lens Calibration Blueprint */}
      <OpticalGroundGlassParallax
        smoothX={smoothX}
        smoothY={smoothY}
        prefersReduced={Boolean(prefersReduced)}
      />

      {/* Floating Photograph Constellation */}
      {cards.map(({ cfg, item }, idx) => {
        if (!item?.image?.url) return null;

        return (
          <FloatingCard
            key={`${cfg.id}-${idx}`}
            cfg={cfg}
            item={item}
            smoothX={smoothX}
            smoothY={smoothY}
            prefersReduced={Boolean(prefersReduced)}
          />
        );
      })}
    </div>
  );
}

interface FloatingCardProps {
  cfg: CardConfig;
  item: FloatingGalleryItem;
  smoothX: ReturnType<typeof useSpring>;
  smoothY: ReturnType<typeof useSpring>;
  prefersReduced: boolean;
}

function FloatingCard({
  cfg,
  item,
  smoothX,
  smoothY,
  prefersReduced,
}: FloatingCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Parallax transform calculation based on depth
  const [parallaxOffset, setParallaxOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (prefersReduced) return;
    const unsubX = smoothX.on('change', (latestX) => {
      setParallaxOffset((prev) => ({
        ...prev,
        x: latestX * cfg.depth * 24,
      }));
    });
    const unsubY = smoothY.on('change', (latestY) => {
      setParallaxOffset((prev) => ({
        ...prev,
        y: latestY * cfg.depth * 20,
      }));
    });
    return () => {
      unsubX();
      unsubY();
    };
  }, [smoothX, smoothY, cfg.depth, prefersReduced]);

  const captionText = item.caption || 'GCU ShutterScape Negative';
  const roomTag = item.room || 'Gallery';
  const photographer = item.photographer || 'ShutterScape Collective';

  return (
    <div
      className={`absolute ${cfg.posClass} ${cfg.hideOnMobile ? 'hidden md:block' : ''} pointer-events-none sm:pointer-events-auto transition-transform duration-500 ease-out`}
      style={{
        transform: `translate3d(${parallaxOffset.x}px, ${parallaxOffset.y}px, 0)`,
        zIndex: isHovered ? 30 : cfg.depth > 1.2 ? 12 : 5,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div
        animate={
          prefersReduced
            ? {}
            : {
                y: [-cfg.floatY, cfg.floatY, -cfg.floatY],
                x: [-cfg.floatX, cfg.floatX, -cfg.floatX],
                rotate: [cfg.rotate - 1.2, cfg.rotate + 1.2, cfg.rotate - 1.2],
              }
        }
        transition={{
          duration: cfg.floatDuration,
          repeat: Infinity,
          repeatType: 'reverse',
          ease: 'easeInOut',
          delay: cfg.floatDelay,
        }}
        initial={{
          opacity: 0,
          scale: 0.92,
          rotate: cfg.rotate,
        }}
        whileInView={{
          opacity: isHovered ? 1 : cfg.baseOpacity,
          scale: isHovered ? 1.08 : 1,
          transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
        }}
        viewport={{ once: true }}
        className={`relative ${cfg.sizeClass} group cursor-pointer transition-all duration-500`}
      >
        {/* Analog Print Mount (Exhibition Passe-Partout Frame) */}
        <div
          className={`hero-floating-card relative w-full h-full rounded-2xl p-1.5 sm:p-2 bg-white/95 dark:bg-[#0c0c0e]/90 border border-stone-200/90 dark:border-white/10 backdrop-blur-md overflow-hidden transition-all duration-500 ${
            isHovered
              ? 'border-amber-500 dark:border-amber/60 shadow-[0_20px_50px_rgba(0,0,0,0.12),0_0_25px_rgba(245,158,11,0.2)] dark:shadow-[0_25px_60px_rgba(0,0,0,0.95),0_0_35px_rgba(245,158,11,0.3)] ring-1 ring-amber-500/40 dark:ring-amber/40'
              : 'shadow-[0_12px_32px_rgba(0,0,0,0.06),0_1px_4px_rgba(0,0,0,0.03)] dark:shadow-[0_15px_40px_rgba(0,0,0,0.85),0_0_15px_rgba(245,158,11,0.04)]'
          }`}
        >
          {/* Top Film Frame Stamp Header */}
          <div className="flex items-center justify-between px-1.5 pb-1 font-mono text-[8px] sm:text-[9px] text-slate-500 dark:text-offwhite-dim/70 tracking-wider uppercase border-b border-stone-100 dark:border-white/5">
            <span className="flex items-center gap-1 text-amber-700 dark:text-amber/80 font-bold">
              <span className="w-1 h-1 rounded-full bg-amber-500 animate-pulse" />
              {cfg.expIndex}
            </span>
            <span className="truncate max-w-[80px] sm:max-w-[100px] text-slate-400 dark:text-offwhite-muted/60">
              {roomTag}
            </span>
          </div>

          {/* Photograph Exposure Canvas */}
          <div className="relative w-full h-[calc(100%-22px)] sm:h-[calc(100%-24px)] mt-1 rounded-xl overflow-hidden bg-stone-100 dark:bg-black/60">
            <Image
              src={item.image.url}
              alt={captionText}
              fill
              sizes="(max-width: 640px) 140px, (max-width: 1024px) 220px, 260px"
              className={`object-cover transition-all duration-700 ease-out ${
                isHovered
                  ? 'scale-105 filter-none'
                  : 'filter contrast-[1.02] brightness-[0.98] group-hover:brightness-100'
              }`}
              placeholder={item.image.blurDataURL ? 'blur' : 'empty'}
              blurDataURL={item.image.blurDataURL}
            />

            {/* Subtle Gradient & Specular Light Sheen */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

            {/* Optical Corner Registration Crosshairs */}
            <div className="absolute top-1 left-1 w-2 h-2 border-t border-l border-amber-500/60 dark:border-amber/40 pointer-events-none" />
            <div className="absolute top-1 right-1 w-2 h-2 border-t border-r border-amber-500/60 dark:border-amber/40 pointer-events-none" />
            <div className="absolute bottom-1 left-1 w-2 h-2 border-b border-l border-amber-500/60 dark:border-amber/40 pointer-events-none" />
            <div className="absolute bottom-1 right-1 w-2 h-2 border-b border-r border-amber-500/60 dark:border-amber/40 pointer-events-none" />

            {/* Hover Floating Details Pill */}
            <div
              className={`absolute inset-x-2 bottom-2 p-2 rounded-lg bg-white/95 dark:bg-black/85 backdrop-blur-md border border-stone-200 dark:border-white/10 shadow-lg transition-all duration-300 pointer-events-none ${
                isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
              }`}
            >
              <p className="font-body text-[10px] sm:text-[11px] text-slate-900 dark:text-offwhite font-medium line-clamp-1 leading-tight">
                {captionText}
              </p>
              <p className="font-mono text-[8px] sm:text-[9px] text-amber-700 dark:text-amber/90 truncate mt-0.5 font-semibold">
                by {photographer}
              </p>
            </div>
          </div>
        </div>

        {/* Ambient Warm Underglow */}
        <div className="absolute -inset-1 rounded-2xl bg-amber-500/10 dark:bg-amber/5 blur-md -z-10 group-hover:bg-amber-500/20 dark:group-hover:bg-amber/15 transition-colors" />
      </motion.div>
    </div>
  );
}
