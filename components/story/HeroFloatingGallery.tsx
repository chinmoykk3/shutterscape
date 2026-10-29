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
  // Position classes (responsive)
  posClass: string;
  // Dimensions
  sizeClass: string;
  // Rotation (degrees)
  rotate: number;
  // Parallax depth multiplier (higher = closer, moves more)
  depth: number;
  // Base opacity
  baseOpacity: number;
  // Float animation duration (seconds)
  floatDuration: number;
  // Float distance Y & X (px)
  floatY: number;
  floatX: number;
  // Float delay (seconds)
  floatDelay: number;
  // Film exp stamp
  expIndex: string;
  // Hidden on mobile?
  hideOnMobile?: boolean;
}

const CARD_CONFIGS: CardConfig[] = [
  // 0: Top-Left (Foreground Hero) - scaled on mobile
  {
    id: 0,
    posClass: 'top-[4%] left-[1%] sm:left-[4%] lg:left-[5%]',
    sizeClass: 'w-20 h-28 xs:w-24 xs:h-34 sm:w-48 sm:h-64 lg:w-56 lg:h-72',
    rotate: -6,
    depth: 1.4,
    baseOpacity: 0.5,
    floatDuration: 14,
    floatY: 14,
    floatX: 8,
    floatDelay: 0,
    expIndex: 'EXP. 01/36',
  },
  // 1: Top-Right (Foreground Hero) - scaled on mobile
  {
    id: 1,
    posClass: 'top-[4%] right-[1%] sm:right-[4%] lg:right-[6%]',
    sizeClass: 'w-20 h-28 xs:w-24 xs:h-34 sm:w-52 sm:h-68 lg:w-60 lg:h-80',
    rotate: 5,
    depth: 1.6,
    baseOpacity: 0.5,
    floatDuration: 16,
    floatY: 16,
    floatX: -10,
    floatDelay: 1.5,
    expIndex: 'EXP. 04/36',
  },
  // 2: Mid-Left (Tablet & Desktop Anchor)
  {
    id: 2,
    posClass: 'top-[44%] left-[1%] sm:left-[2%] lg:left-[3%]',
    sizeClass: 'w-32 h-44 sm:w-44 sm:h-60 lg:w-48 lg:h-64',
    rotate: 4,
    depth: 0.9,
    baseOpacity: 0.55,
    floatDuration: 18,
    floatY: 12,
    floatX: 6,
    floatDelay: 3,
    expIndex: 'EXP. 09/36',
    hideOnMobile: true,
  },
  // 3: Mid-Right (Tablet & Desktop Anchor)
  {
    id: 3,
    posClass: 'top-[46%] right-[1%] sm:right-[3%] lg:right-[4%]',
    sizeClass: 'w-32 h-44 sm:w-44 sm:h-60 lg:w-52 lg:h-68',
    rotate: -5,
    depth: 1.1,
    baseOpacity: 0.6,
    floatDuration: 15,
    floatY: 14,
    floatX: -8,
    floatDelay: 2,
    expIndex: 'EXP. 14/36',
    hideOnMobile: true,
  },
  // 4: Bottom-Left (Tablet & Desktop Print)
  {
    id: 4,
    posClass: 'bottom-[4%] left-[4%] sm:left-[8%] lg:left-[10%]',
    sizeClass: 'w-36 h-48 sm:w-48 sm:h-64 lg:w-56 lg:h-72',
    rotate: -3,
    depth: 1.3,
    baseOpacity: 0.6,
    floatDuration: 17,
    floatY: 15,
    floatX: 7,
    floatDelay: 4,
    expIndex: 'EXP. 21/36',
    hideOnMobile: true,
  },
  // 5: Bottom-Right (Tablet & Desktop Print)
  {
    id: 5,
    posClass: 'bottom-[5%] right-[3%] sm:right-[6%] lg:right-[8%]',
    sizeClass: 'w-36 h-48 sm:w-52 sm:h-68 lg:w-56 lg:h-76',
    rotate: 6,
    depth: 1.5,
    baseOpacity: 0.65,
    floatDuration: 19,
    floatY: 18,
    floatX: -9,
    floatDelay: 2.5,
    expIndex: 'EXP. 27/36',
    hideOnMobile: true,
  },
  // 6: Far Deep Accent (Desktop Only)
  {
    id: 6,
    posClass: 'top-[2%] left-[24%] sm:left-[22%] lg:left-[20%]',
    sizeClass: 'w-28 h-36 sm:w-36 sm:h-48 lg:w-40 lg:h-52',
    rotate: -2,
    depth: 0.6,
    baseOpacity: 0.4,
    floatDuration: 22,
    floatY: 8,
    floatX: 4,
    floatDelay: 5,
    expIndex: 'EXP. 31/36',
    hideOnMobile: true,
  },
  // 7: Far Deep Accent (Desktop Only)
  {
    id: 7,
    posClass: 'bottom-[1%] right-[22%] sm:right-[20%] lg:right-[18%]',
    sizeClass: 'w-28 h-36 sm:w-36 sm:h-48 lg:w-44 lg:h-56',
    rotate: 3,
    depth: 0.7,
    baseOpacity: 0.4,
    floatDuration: 20,
    floatY: 10,
    floatX: -5,
    floatDelay: 3.5,
    expIndex: 'EXP. 36/36',
    hideOnMobile: true,
  },
];

export function HeroFloatingGallery({ items }: HeroFloatingGalleryProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReduced = useReducedMotion();

  // Mouse normalized coordinates: -1 to +1
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Ultra-smooth spring damping for mouse parallax
  const smoothX = useSpring(mouseX, { stiffness: 45, damping: 25, mass: 0.5 });
  const smoothY = useSpring(mouseY, { stiffness: 45, damping: 25, mass: 0.5 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (prefersReduced) return;
      const { innerWidth, innerHeight } = window;
      // Normalize from -1 to 1
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
      {/* Darkroom Center Safeguard Vignette: Keeps center headline ultra-sharp and 100% legible */}
      <div className="hero-center-vignette absolute inset-0 bg-radial from-transparent via-transparent to-stone-100/50 dark:to-[#070708]/90 z-10 pointer-events-none transition-colors duration-500" />

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
  // When smoothX = 1, card moves cfg.depth * 22px
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
        {/* Analog Print Mount (Frame) */}
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
              <span className="w-1 h-1 rounded-full bg-amber animate-pulse" />
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
                  : 'filter contrast-[1.05] brightness-[0.92] group-hover:brightness-100'
              }`}
              placeholder={item.image.blurDataURL ? 'blur' : 'empty'}
              blurDataURL={item.image.blurDataURL}
            />

            {/* Subtle Vignette & Specular Light Sheen */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />

            {/* Optical Corner Registration Crosshairs */}
            <div className="absolute top-1 left-1 w-2 h-2 border-t border-l border-amber/40 pointer-events-none" />
            <div className="absolute top-1 right-1 w-2 h-2 border-t border-r border-amber/40 pointer-events-none" />
            <div className="absolute bottom-1 left-1 w-2 h-2 border-b border-l border-amber/40 pointer-events-none" />
            <div className="absolute bottom-1 right-1 w-2 h-2 border-b border-r border-amber/40 pointer-events-none" />

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
        <div
          className={`absolute -inset-3 rounded-3xl bg-amber/15 blur-xl -z-10 transition-opacity duration-500 pointer-events-none ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}
        />
      </motion.div>
    </div>
  );
}

