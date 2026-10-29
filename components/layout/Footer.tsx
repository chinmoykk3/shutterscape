'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, MapPin, ExternalLink, MessageCircle, ChevronDown, ChevronUp, Send, CheckCircle2 } from 'lucide-react';
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

/**
 * Footer "End Credits" — identical on every page.
 * Reads address, email, GCU logo, JOIN US buttons (Instagram & WhatsApp),
 * embedded Google Map of Girijananda Chowdhury University, and optional expandable Join Form.
 */
export function Footer({ settings }: FooterProps) {
  const [gcuLogoError, setGcuLogoError] = useState(false);
  const [isJoinFormOpen, setIsJoinFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    department: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmitJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone || undefined,
          subject: `Join Application: ${formData.department || 'GCU Student'}`,
          message: formData.message || 'I would like to join ShutterScape photography collective.',
          type: 'join-club',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit application');
      }

      setSubmitSuccess(true);
      setFormData({ name: '', email: '', phone: '', department: '', message: '' });
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : 'Submission failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer className="relative bg-charcoal border-t border-charcoal-border text-offwhite-muted pt-16 pb-12 overflow-hidden">
      {/* Subtle Darkroom Safelight & Amber Glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 left-1/2 -translate-x-1/2 w-3/4 h-56 rounded-full bg-safelight/10 blur-3xl"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Top End Credits Roll Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-10 mb-12 border-b border-charcoal-border/80">
          <div className="flex items-center gap-2.5 font-mono text-xs uppercase tracking-[0.25em] text-amber">
            <span className="w-2 h-2 rounded-full bg-amber animate-pulse" />
            <span>End Credits • Roll Complete</span>
          </div>
          <div className="font-mono text-xs text-offwhite-dim">
            {settings.stats.members}+ Members • {settings.stats.events}+ Events • {settings.stats.photos}+ Exposures
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 mb-12">
          {/* Column 1 (4 cols): Club Identity & Official GCU White Logo */}
          <div className="lg:col-span-4 space-y-6">
            <Link
              href="/"
              aria-label="ShutterScape Home"
              className="inline-block group focus:outline-none focus-visible:ring-2 focus-visible:ring-amber rounded-xl"
            >
              <ShutterScapeLogo variant="combined" />
            </Link>

            {/* Official GCU White Horizontal Lockup (GCU-Logo-White-footer.png) */}
            <div className="pt-1">
              {!gcuLogoError ? (
                <Image
                  src="/images/logos/GCU-Logo-White-footer.png"
                  alt="Girijananda Chowdhury University, Assam"
                  width={240}
                  height={68}
                  onError={() => setGcuLogoError(true)}
                  className="w-52 h-auto object-contain opacity-95 hover:opacity-100 transition-opacity"
                />
              ) : (
                <div className="inline-flex items-center gap-3 px-3.5 py-2.5 rounded-2xl bg-black/60 border border-charcoal-border">
                  <div className="w-9 h-9 rounded-full border border-offwhite/40 flex items-center justify-center font-title font-bold text-offwhite text-sm">
                    GCU
                  </div>
                  <div className="flex flex-col">
                    <span className="font-title text-xs font-bold tracking-wider text-offwhite uppercase">
                      Girijananda Chowdhury
                    </span>
                    <span className="font-mono text-[10px] tracking-[0.25em] text-offwhite-dim uppercase">
                      University • Assam
                    </span>
                  </div>
                </div>
              )}
            </div>

            <p className="text-xs font-body text-offwhite-dim leading-relaxed max-w-sm">
              {settings.footerTagline}
            </p>
          </div>

          {/* Column 2 (3 cols): Contact Details & JOIN US Buttons */}
          <div className="lg:col-span-3 space-y-4">
            <h3 className="font-mono text-xs text-offwhite uppercase tracking-widest flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber" /> Studio & Join Us
            </h3>

            <div className="space-y-3 text-xs font-body">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-amber shrink-0 mt-0.5" />
                <span className="text-offwhite-dim leading-relaxed">{settings.address}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-amber shrink-0" />
                <a
                  href={`mailto:${settings.email}`}
                  className="text-offwhite hover:text-amber transition-colors underline-offset-4 hover:underline break-all"
                >
                  {settings.email}
                </a>
              </div>
            </div>

            <div className="pt-3 space-y-2.5">
              <span className="font-mono text-[10px] uppercase tracking-widest text-offwhite-dim block">
                Join The Collective
              </span>
              <div className="flex flex-wrap gap-2.5">
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
                  <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                </Button>
              </div>

              {/* Optional Join Form Toggle Button */}
              <button
                type="button"
                onClick={() => setIsJoinFormOpen(!isJoinFormOpen)}
                className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-mono text-amber hover:text-amber-300 underline underline-offset-4 transition-colors focus:outline-none"
              >
                <span>{isJoinFormOpen ? 'Close application form' : 'Open membership application form'}</span>
                {isJoinFormOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Column 3 (2 cols): Chapter Navigation */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="font-mono text-xs text-offwhite uppercase tracking-widest flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber" /> Chapters
            </h3>
            <ul className="space-y-2.5 text-xs font-mono">
              <li>
                <Link href="/" className="hover:text-amber transition-colors block">
                  01 / Prologue (Home)
                </Link>
              </li>
              <li>
                <Link href="/activities" className="hover:text-amber transition-colors block">
                  02 / The Film Roll
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="hover:text-amber transition-colors block">
                  03 / The Darkroom
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-amber transition-colors block">
                  04 / Behind the Lens
                </Link>
              </li>
              <li>
                <Link
                  href="/admin"
                  className="text-offwhite-dim hover:text-offwhite transition-colors block pt-1"
                >
                  05 / The Editing Room
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4 (3 cols): Embedded Google Map of GCU */}
          <div className="lg:col-span-3 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-mono text-xs text-offwhite uppercase tracking-widest flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber" /> GCU Campus
              </h3>
              <a
                href="https://maps.app.goo.gl/NhdHs1u76Bjxo2J87"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] font-mono text-amber hover:underline inline-flex items-center gap-1"
              >
                Open in Google Maps <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>

            <div className="relative w-full h-40 rounded-2xl overflow-hidden border border-charcoal-border bg-black shadow-inner">
              <iframe
                title="Girijananda Chowdhury University Location Map"
                src={settings.mapEmbedUrl}
                width="100%"
                height="100%"
                style={{ border: 0, filter: 'grayscale(100%) invert(90%) contrast(88%)' }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>

        {/* Optional Expandable Join Club Form */}
        {isJoinFormOpen && (
          <div className="mb-12 p-6 sm:p-8 rounded-2xl bg-black/75 border border-amber/40 backdrop-blur-xl animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="max-w-2xl mx-auto space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-title text-xl font-bold text-offwhite">
                    Apply to Join ShutterScape
                  </h4>
                  <p className="font-mono text-xs text-offwhite-dim mt-0.5">
                    No fancy DSLR required. All students & disciplines from GCU are welcome.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsJoinFormOpen(false)}
                  className="text-offwhite-dim hover:text-offwhite text-xs font-mono"
                >
                  [Dismiss]
                </button>
              </div>

              {submitSuccess ? (
                <div className="p-4 rounded-xl bg-amber/10 border border-amber/30 flex items-center gap-3 text-amber font-mono text-xs">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <span>
                    Exposure recorded! The lead curator will connect with you via email/WhatsApp for the next orientation roll.
                  </span>
                </div>
              ) : (
                <form onSubmit={handleSubmitJoin} className="space-y-4">
                  {submitError && (
                    <div className="p-3 rounded-lg bg-safelight/20 border border-safelight/40 text-[#ff7b73] text-xs font-mono">
                      {submitError}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-mono text-offwhite-dim uppercase mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Priyanuj Das"
                        className="w-full px-3.5 py-2 rounded-xl bg-charcoal border border-charcoal-border text-xs text-offwhite focus:outline-none focus:border-amber transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-mono text-offwhite-dim uppercase mb-1">
                        GCU Student Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="roll@gcuniversity.ac.in"
                        className="w-full px-3.5 py-2 rounded-xl bg-charcoal border border-charcoal-border text-xs text-offwhite focus:outline-none focus:border-amber transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-mono text-offwhite-dim uppercase mb-1">
                        WhatsApp Number (Optional)
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+91 98765 43210"
                        className="w-full px-3.5 py-2 rounded-xl bg-charcoal border border-charcoal-border text-xs text-offwhite focus:outline-none focus:border-amber transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-mono text-offwhite-dim uppercase mb-1">
                        Department & Year
                      </label>
                      <input
                        type="text"
                        value={formData.department}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                        placeholder="e.g. CSE, 2nd Year"
                        className="w-full px-3.5 py-2 rounded-xl bg-charcoal border border-charcoal-border text-xs text-offwhite focus:outline-none focus:border-amber transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-offwhite-dim uppercase mb-1">
                      What do you shoot with & what inspires you?
                    </label>
                    <textarea
                      rows={2}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="e.g. Phone, vintage point-and-shoot, or DSLR. Interested in architectural shadows and street candids."
                      className="w-full px-3.5 py-2 rounded-xl bg-charcoal border border-charcoal-border text-xs text-offwhite focus:outline-none focus:border-amber transition-colors resize-none"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsJoinFormOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      disabled={isSubmitting}
                      className="gap-2"
                    >
                      <Send className="w-3.5 h-3.5" />
                      {isSubmitting ? 'Submitting Application...' : 'Submit Application'}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* Bottom Bar: Copyright & Codénix Credit & Portal Links (Padded for mobile floating dock) */}
        <div className="pt-8 pb-28 sm:pb-12 border-t border-charcoal-border/60 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] font-mono text-offwhite-dim">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <span>© {new Date().getFullYear()} ShutterScape — GCU. All rights reserved.</span>
            <span className="text-charcoal-border hidden sm:inline">•</span>
            <Link href="/portal/login" className="hover:text-amber transition-colors">
              Member Studio
            </Link>
            <span className="text-charcoal-border">•</span>
            <Link href="/admin/login" className="hover:text-amber transition-colors">
              Admin Darkroom
            </Link>
          </div>
          <div>
            Website Maintained by{' '}
            <a
              href="https://codingclub.gcuniversity.ac.in"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber hover:underline transition-colors font-semibold"
            >
              Codénix (GCU Coding Club)
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}