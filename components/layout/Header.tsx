'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Instagram, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { ShutterScapeLogo } from '@/components/ui/ShutterScapeLogo';

interface HeaderProps {
  instagramUrl?: string;
  whatsappUrl?: string;
}

const NAV_LINKS = [
  { href: '/', label: 'Home', frame: '01' },
  { href: '/activities', label: 'Activities', frame: '02' },
  { href: '/gallery', label: 'Gallery', frame: '03' },
  { href: '/about', label: 'About', frame: '04' },
];

export function Header({
  instagramUrl = 'https://www.instagram.com/shutterscape_gcu',
  whatsappUrl = 'https://chat.whatsapp.com/Hs71BicR1Xj3PmOyPJ5wdc?s=sw&p=a&mlu=4&ilr=4',
}: HeaderProps) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 16);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Lock body scroll & listen for Escape key when mobile drawer is open
  useEffect(() => {
    if (!mobileOpen) {
      document.body.style.overflow = '';
      return;
    }
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [mobileOpen]);

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full transition-all duration-300',
        scrolled
          ? 'bg-black/85 backdrop-blur-xl border-b border-charcoal-border py-3 shadow-lg shadow-black/50'
          : 'bg-gradient-to-b from-black/80 to-transparent border-b border-transparent py-4 sm:py-5'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Club Logo (Always links to "/") */}
        <Link
          href="/"
          aria-label="ShutterScape Home"
          className="group focus:outline-none focus-visible:ring-2 focus-visible:ring-amber rounded-xl py-0.5"
        >
          <ShutterScapeLogo variant="combined" />
        </Link>

        {/* Desktop Navigation Pill */}
        <nav
          aria-label="Main navigation"
          className="hidden md:flex items-center gap-1 bg-charcoal/75 px-2.5 py-1.5 rounded-full border border-charcoal-border backdrop-blur-md"
        >
          {NAV_LINKS.map((link) => {
            const isActive =
              link.href === '/' ? pathname === '/' : pathname?.startsWith(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'relative px-4 py-1.5 text-xs font-mono tracking-wider transition-all duration-200 rounded-full flex items-center gap-1.5',
                  isActive
                    ? 'text-black bg-amber font-semibold shadow-[0_0_16px_rgba(245,158,11,0.3)]'
                    : 'text-offwhite-muted hover:text-offwhite hover:bg-white/5'
                )}
              >
                <span
                  className={cn(
                    'text-[9px] opacity-60',
                    isActive ? 'text-black font-bold' : 'text-amber'
                  )}
                >
                  {link.frame}
                </span>
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Join CTA & Mobile Drawer Trigger */}
        <div className="flex items-center gap-2.5">
          <Button
            href={whatsappUrl}
            isExternal
            size="sm"
            variant="outline"
            className="hidden sm:inline-flex"
          >
            Join Us
          </Button>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="md:hidden p-2.5 rounded-2xl bg-charcoal border border-charcoal-border text-offwhite hover:text-amber focus:outline-none focus-visible:ring-2 focus-visible:ring-amber"
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileOpen}
            aria-controls="mobile-navigation-drawer"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Slide-in Mobile Drawer */}
      {mobileOpen && (
        <div
          id="mobile-navigation-drawer"
          className="md:hidden fixed inset-0 top-[61px] z-50 bg-black/95 backdrop-blur-2xl flex flex-col justify-between p-6 overflow-y-auto"
        >
          <nav aria-label="Mobile navigation" className="flex flex-col gap-2.5">
            <div className="font-mono text-[10px] tracking-[0.25em] uppercase text-offwhite-dim px-2 mb-1">
              Select Chapter
            </div>
            {NAV_LINKS.map((link) => {
              const isActive =
                link.href === '/' ? pathname === '/' : pathname?.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'px-4 py-3.5 text-sm font-mono tracking-wider rounded-2xl border transition-all flex items-center justify-between',
                    isActive
                      ? 'bg-amber text-black border-amber font-semibold'
                      : 'bg-charcoal/60 text-offwhite border-charcoal-border hover:border-amber/40'
                  )}
                >
                  <span>{link.label}</span>
                  <span
                    className={cn(
                      'text-xs',
                      isActive ? 'text-black/70' : 'text-amber'
                    )}
                  >
                    FRAME {link.frame}
                  </span>
                </Link>
              );
            })}
          </nav>

          <div className="pt-6 border-t border-charcoal-border space-y-3">
            <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-offwhite-dim text-center">
              Every frame tells a story • GCU
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Button
                href={instagramUrl}
                isExternal
                variant="secondary"
                className="w-full justify-center gap-2"
              >
                <Instagram className="w-4 h-4 text-amber" /> Instagram
              </Button>
              <Button
                href={whatsappUrl}
                isExternal
                variant="primary"
                className="w-full justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4" /> WhatsApp
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}