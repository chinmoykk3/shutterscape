import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, MapPin, ExternalLink, MessageCircle } from 'lucide-react';
import { GlobalSettings } from '@/lib/actions/settings';
import { Button } from '@/components/ui/Button';
import { ShutterScapeLogo } from '@/components/ui/ShutterScapeLogo';

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

interface FooterProps {
  settings: GlobalSettings;
}

export function Footer({ settings }: FooterProps) {
  return (
    <footer className="relative bg-charcoal border-t border-charcoal-border text-offwhite-muted pt-16 pb-12 overflow-hidden">
      {/* Subtle Darkroom Safelight Vignette */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-48 bg-radial from-safelight/10 via-transparent to-transparent blur-3xl"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Column 1: ShutterScape & Official GCU White Footer Lockup */}
          <div className="space-y-5">
            <Link href="/" className="inline-block group focus:outline-none">
              <ShutterScapeLogo variant="combined" />
            </Link>

            {/* Official GCU White Horizontal Lockup (GCU-Logo-White-footer.png) */}
            <div className="pt-1">
              <Image
                src="/images/logos/gcu-footer-white.png"
                alt="Girijananda Chowdhury University, Assam"
                width={220}
                height={64}
                className="w-48 h-auto object-contain opacity-90 hover:opacity-100 transition-opacity"
              />
            </div>

            <p className="text-xs font-body text-offwhite-dim leading-relaxed">
              {settings.footerTagline}
            </p>
          </div>

          {/* Column 2: University Address, Email & JOIN US Buttons */}
          <div className="space-y-4">
            <h4 className="font-mono text-xs text-offwhite uppercase tracking-widest flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber" /> Contact & Join Us
            </h4>
            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-amber shrink-0 mt-0.5" />
                <span className="text-offwhite-dim leading-relaxed">{settings.address}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-amber shrink-0" />
                <a
                  href={`mailto:${settings.email}`}
                  className="text-offwhite hover:text-amber transition-colors underline-offset-4 hover:underline"
                >
                  {settings.email}
                </a>
              </div>
            </div>
            <div className="pt-2 flex flex-wrap gap-2.5">
              <Button
                href={settings.instagramUrl}
                isExternal
                size="sm"
                variant="secondary"
                className="gap-2"
              >
                <InstagramIcon className="w-3.5 h-3.5 text-amber" /> Instagram
              </Button>
              <Button
                href={settings.whatsappUrl}
                isExternal
                size="sm"
                variant="primary"
                className="gap-2"
              >
                <MessageCircle className="w-3.5 h-3.5" /> Join WhatsApp
              </Button>
            </div>
          </div>

          {/* Column 3: Story Chapter Index */}
          <div className="space-y-4">
            <h4 className="font-mono text-xs text-offwhite uppercase tracking-widest flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber" /> Story Chapters
            </h4>
            <ul className="space-y-2.5 text-xs font-mono">
              <li>
                <Link href="/" className="hover:text-amber transition-colors">
                  01 // Home (Prologue to Epilogue)
                </Link>
              </li>
              <li>
                <Link href="/activities" className="hover:text-amber transition-colors">
                  02 // Activities (The Film Roll)
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="hover:text-amber transition-colors">
                  03 // Gallery (The Darkroom)
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-amber transition-colors">
                  04 // About (Behind the Lens)
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/login"
                  className="text-offwhite-dim hover:text-offwhite transition-colors"
                >
                  05 // Admin (The Editing Room)
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Embedded University Map */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-mono text-xs text-offwhite uppercase tracking-widest flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber" /> GCU Campus
              </h4>
              <a
                href="https://maps.app.goo.gl/NhdHs1u76Bjxo2J87"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] font-mono text-amber hover:underline flex items-center gap-1"
              >
                Open in Google Maps <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
            <div className="relative w-full h-36 rounded-2xl overflow-hidden border border-charcoal-border bg-black">
              <iframe
                title="Girijananda Chowdhury University Campus Map"
                src={settings.mapEmbedUrl}
                width="100%"
                height="100%"
                style={{ border: 0, filter: 'grayscale(100%) invert(90%) contrast(90%)' }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>

        {/* Bottom End Credits Bar */}
        <div className="pt-8 border-t border-charcoal-border/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-mono text-offwhite-dim">
          <div>
            © {new Date().getFullYear()} ShutterScape — Photography Club of Girijananda Chowdhury University.
          </div>
          <div>
            Website Maintained by{' '}
            <a
              href="https://codingclub.gcuniversity.ac.in"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber hover:underline transition-colors font-medium"
            >
              Codénix (GCU Coding Club)
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}