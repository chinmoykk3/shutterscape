'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { ShutterScapeLogo } from '@/components/ui/ShutterScapeLogo';

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/activities', label: 'Activities' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/about', label: 'About' },
];

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setMobileOpen(false);
  }

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full transition-all duration-300',
        scrolled
          ? 'bg-black/85 backdrop-blur-md border-b border-charcoal-border py-3 shadow-lg shadow-black/40'
          : 'bg-transparent border-b border-transparent py-5'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Club Logo (Always links to "/") */}
        <Link
          href="/"
          aria-label="ShutterScape Home"
          className="group focus:outline-none focus-visible:ring-2 focus-visible:ring-amber rounded-lg py-0.5"
        >
          <ShutterScapeLogo variant="combined" />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1 bg-charcoal/60 px-3 py-1.5 rounded-full border border-charcoal-border backdrop-blur-md">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'relative px-4 py-1.5 text-xs font-mono tracking-wider transition-colors duration-200 rounded-full',
                  isActive
                    ? 'text-black bg-amber font-semibold'
                    : 'text-offwhite-muted hover:text-offwhite'
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right CTA & Mobile Drawer Trigger */}
        <div className="flex items-center gap-3">
          <Button
            href="https://chat.whatsapp.com/Hs71BicR1Xj3PmOyPJ5wdc?s=sw&p=a&mlu=4&ilr=4"
            isExternal
            size="sm"
            variant="outline"
            className="hidden sm:inline-flex"
          >
            Join ShutterScape
          </Button>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-xl bg-charcoal border border-charcoal-border text-offwhite hover:text-amber focus:outline-none"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Slide-in Drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-x-0 top-[65px] bg-black/95 backdrop-blur-xl border-b border-charcoal-border p-6 flex flex-col gap-4 animate-in slide-in-from-top-4 duration-200">
          <nav className="flex flex-col gap-2">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'px-4 py-3 text-sm font-mono tracking-wider rounded-xl transition-colors',
                    isActive
                      ? 'bg-amber text-black font-semibold'
                      : 'text-offwhite-muted hover:text-offwhite hover:bg-charcoal'
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
          <div className="pt-4 border-t border-charcoal-border flex flex-col gap-3">
            <Button
              href="https://chat.whatsapp.com/Hs71BicR1Xj3PmOyPJ5wdc?s=sw&p=a&mlu=4&ilr=4"
              isExternal
              variant="primary"
              className="w-full justify-center"
            >
              Join WhatsApp Group
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}