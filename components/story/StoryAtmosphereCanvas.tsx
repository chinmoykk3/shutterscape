// File: components/story/StoryAtmosphereCanvas.tsx
'use client';

import React, { useRef, useEffect } from 'react';

interface StoryAtmosphereCanvasProps {
  activeChapter: number;
}

export function StoryAtmosphereCanvas({ activeChapter }: StoryAtmosphereCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Particle settings
    const particleCount = 45;
    const particles: Array<{
      x: number;
      y: number;
      radius: number;
      speedX: number;
      speedY: number;
      opacity: number;
      hue: number;
    }> = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 2.2 + 0.6,
        speedX: (Math.random() - 0.5) * 0.35,
        speedY: (Math.random() - 0.5) * 0.35 - 0.15,
        opacity: Math.random() * 0.5 + 0.15,
        hue: Math.random() > 0.6 ? 42 : 10, // Warm amber or safelight ruby
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Chapter-dependent ambient tint
      // 0: Darkness (very subtle amber)
      // 1: Light (cyan & gold rays)
      // 2: Viewfinder (sharp telemetry)
      // 3: 35mm (vintage warm amber)
      // 4: Darkroom (deep safelight ruby)
      // 5: Xenon Flash / Strobe
      const isSafelight = activeChapter === 4;
      const isLightMode = typeof document !== 'undefined' && document.documentElement.classList.contains('light');

      for (let i = 0; i < particleCount; i++) {
        const p = particles[i];
        p.x += p.speedX;
        p.y += p.speedY;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);

        if (isSafelight) {
          ctx.fillStyle = `hsla(355, 75%, 55%, ${p.opacity * 0.8})`;
          ctx.shadowColor = '#B3261E';
          ctx.shadowBlur = 6;
        } else if (isLightMode) {
          // Subtle warm sunlight dust motes in daylight mode
          ctx.fillStyle = `hsla(38, 85%, 45%, ${p.opacity * 0.4})`;
          ctx.shadowColor = 'rgba(217, 119, 6, 0.3)';
          ctx.shadowBlur = 3;
        } else {
          ctx.fillStyle = `hsla(${p.hue}, 85%, 60%, ${p.opacity * 0.7})`;
          ctx.shadowColor = '#F59E0B';
          ctx.shadowBlur = 4;
        }

        ctx.fill();
        ctx.shadowBlur = 0;
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [activeChapter]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 z-10 opacity-70 transition-opacity duration-1000"
    />
  );
}
