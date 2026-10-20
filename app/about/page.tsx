import React from 'react';
import { Metadata } from 'next';
import Image from 'next/image';
import {
  Users,
  Compass,
  Camera,
  Award,
  MapPin,
  Mail,
  MessageCircle,
  ExternalLink,
  Sparkles,
  Quote,
} from 'lucide-react';
import { connectDB } from '@/lib/db';
import { Member, IMember } from '@/lib/models/Member';
import { getPublicSettings } from '@/lib/settings';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { CameraReadout } from '@/components/story/CameraReadout';
import { getDarkroomBlurPlaceholder } from '@/lib/utils';

export const revalidate = 60; // ISR cache every 60s

export const metadata: Metadata = {
  title: 'About Us & Behind The Lens | ShutterScape GCU',
  description:
    'Meet the photographers, faculty mentors, student leaders, and founding alumni behind ShutterScape, the official photography society of Girijananda Chowdhury University.',
  openGraph: {
    title: 'Behind The Lens // ShutterScape GCU',
    description:
      'Meet the photographers, faculty mentors, student leaders, and founding alumni behind ShutterScape.',
  },
};

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

export default async function AboutPage() {
  await connectDB();
  const [settings, memberDocs] = await Promise.all([
    getPublicSettings(),
    Member.find({ status: 'active' }).sort({ order: 1 }).lean<IMember[]>(),
  ]);

  const members: IMember[] = JSON.parse(JSON.stringify(memberDocs));

  const facultyMembers = members.filter((m) => m.type === 'faculty');
  const coreMembers = members.filter((m) => m.type === 'core');
  const alumniMembers = members.filter((m) => m.type === 'alumni');

  const pillars = [
    {
      num: '01',
      title: 'Observe',
      desc: 'Cultivating mindfulness, patience, and deliberate framing before depressing the mechanical shutter release.',
    },
    {
      num: '02',
      title: 'Frame',
      desc: 'Discovering hidden geometry, emotional resonance, and architectural rhythm in everyday campus life.',
    },
    {
      num: '03',
      title: 'Expose',
      desc: 'Understanding the pure physics of illumination, optical apertures, shutter velocity, and chemical darkroom printmaking.',
    },
    {
      num: '04',
      title: 'Preserve',
      desc: 'Creating an archival photographic legacy of Girijananda Chowdhury University that endures for generations.',
    },
  ];

  return (
    <div className="relative min-h-screen py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-24">
      {/* Light Leaks */}
      <div className="absolute top-16 left-1/3 w-[550px] h-[450px] rounded-full light-leak-amber blur-[160px] pointer-events-none" />
      <div className="absolute top-1/2 right-12 w-[500px] h-[500px] rounded-full light-leak-safelight blur-[160px] pointer-events-none" />

      {/* =========================================================================
          HERO HEADER
          ========================================================================= */}
      <header className="relative z-10 text-center max-w-3xl mx-auto space-y-6 pt-8">
        <div className="flex flex-col items-center gap-3">
          <Badge variant="amber">
            {'● CHAPTER 04 // BEHIND THE LENS'}
          </Badge>
          <CameraReadout
            aperture="f/1.2"
            shutter="1/2000s"
            iso="ISO 100"
            mode="COLLECTIVE"
          />
        </div>

        <div className="space-y-4">
          <h1 className="font-title text-4xl sm:text-5xl md:text-6xl font-black text-offwhite tracking-tight leading-[1.1]">
            Behind The Lens: The ShutterScape Narrative
          </h1>
          <p className="font-mono text-sm sm:text-base text-offwhite-muted max-w-2xl mx-auto leading-relaxed">
            We are the official visual chronicle of Girijananda Chowdhury University.
            A community bound by silver halide, digital sensors, and the art of seeing.
          </p>
        </div>
      </header>

      {/* =========================================================================
          TELEMETRY COUNTERS
          ========================================================================= */}
      <section aria-label="Club telemetry stats" className="relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          <div className="p-6 rounded-2xl bg-charcoal border border-charcoal-border space-y-2 text-center group hover:border-amber/50 transition-colors">
            <Users className="w-6 h-6 text-amber mx-auto" />
            <div className="font-title text-3xl sm:text-4xl font-bold text-offwhite">
              {settings.stats.members}+
            </div>
            <div className="font-mono text-xs uppercase tracking-wider text-offwhite-dim">
              Active Photographers
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-charcoal border border-charcoal-border space-y-2 text-center group hover:border-amber/50 transition-colors">
            <Compass className="w-6 h-6 text-amber mx-auto" />
            <div className="font-title text-3xl sm:text-4xl font-bold text-offwhite">
              {settings.stats.events}+
            </div>
            <div className="font-mono text-xs uppercase tracking-wider text-offwhite-dim">
              Field Expeditions
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-charcoal border border-charcoal-border space-y-2 text-center group hover:border-amber/50 transition-colors">
            <Camera className="w-6 h-6 text-amber mx-auto" />
            <div className="font-title text-3xl sm:text-4xl font-bold text-offwhite">
              {settings.stats.photos}+
            </div>
            <div className="font-mono text-xs uppercase tracking-wider text-offwhite-dim">
              Frames Exposed
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-charcoal border border-charcoal-border space-y-2 text-center group hover:border-amber/50 transition-colors">
            <Award className="w-6 h-6 text-amber mx-auto" />
            <div className="font-title text-3xl sm:text-4xl font-bold text-offwhite">
              100%
            </div>
            <div className="font-mono text-xs uppercase tracking-wider text-offwhite-dim">
              Student Operated
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          THE MANIFESTO & 4 PILLARS
          ========================================================================= */}
      <section aria-labelledby="manifesto-heading" className="relative z-10 space-y-12">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <Badge variant="neutral">OUR CODE OF VISION</Badge>
          <h2 id="manifesto-heading" className="font-title text-3xl sm:text-4xl font-bold text-offwhite">
            The Four Pillars of ShutterScape
          </h2>
          <p className="font-mono text-xs sm:text-sm text-offwhite-dim">
            Our photography philosophy balances technical discipline with uninhibited creative expression.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((pillar) => (
            <div
              key={pillar.num}
              className="p-6 rounded-2xl bg-charcoal/80 border border-charcoal-border space-y-4 hover:border-amber/50 transition-all hover:-translate-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-amber font-bold tracking-widest">
                  PILLAR {pillar.num}
                </span>
                <span className="w-2 h-2 rounded-full bg-amber/40" />
              </div>
              <h3 className="font-title text-2xl font-bold text-offwhite">
                {pillar.title}
              </h3>
              <p className="text-sm font-sans text-offwhite-muted leading-relaxed">
                {pillar.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================================
          FACULTY MENTORS & COORDINATORS
          ========================================================================= */}
      {facultyMembers.length > 0 && (
        <section aria-labelledby="faculty-heading" className="relative z-10 space-y-8">
          <div className="border-b border-charcoal-border pb-4">
            <div className="flex items-center gap-2 text-amber text-xs font-mono font-bold uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              Academic Mentorship
            </div>
            <h2 id="faculty-heading" className="font-title text-2xl sm:text-3xl font-bold text-offwhite">
              Faculty Coordinators
            </h2>
            <p className="font-mono text-xs text-offwhite-dim">
              Distinguished mentors guiding the university photography collective.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {facultyMembers.map((faculty) => (
              <div
                key={faculty._id.toString()}
                className="flex flex-col sm:flex-row items-center gap-6 p-6 sm:p-8 rounded-2xl bg-charcoal border border-charcoal-border hover:border-amber/50 transition-all"
              >
                {/* Framed Portrait */}
                <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-2xl overflow-hidden shrink-0 border-2 border-charcoal-border/80">
                  <Image
                    src={faculty.image.url}
                    alt={faculty.name}
                    fill
                    placeholder="blur"
                    blurDataURL={faculty.image.blurDataURL || getDarkroomBlurPlaceholder(12, 12)}
                    className="object-cover"
                  />
                  <div className="absolute top-2 left-2">
                    <Badge variant="amber" className="text-[9px] py-0.5 px-1.5 shadow-md">
                      FACULTY
                    </Badge>
                  </div>
                </div>

                {/* Info & Quote */}
                <div className="space-y-3 text-center sm:text-left flex-1">
                  <div>
                    <h3 className="font-title text-xl font-bold text-offwhite">
                      {faculty.name}
                    </h3>
                    <p className="font-mono text-xs text-amber font-medium">
                      {faculty.role}
                    </p>
                  </div>

                  {faculty.quote && (
                    <p className="text-xs sm:text-sm text-offwhite-muted italic border-l-2 border-amber/40 pl-3">
                      &ldquo;{faculty.quote}&rdquo;
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* =========================================================================
          CORE EXECUTIVE COMMITTEE
          ========================================================================= */}
      {coreMembers.length > 0 && (
        <section aria-labelledby="core-heading" className="relative z-10 space-y-8">
          <div className="border-b border-charcoal-border pb-4">
            <div className="flex items-center gap-2 text-amber text-xs font-mono font-bold uppercase tracking-wider mb-1">
              <Camera className="w-3.5 h-3.5" />
              Student Leadership
            </div>
            <h2 id="core-heading" className="font-title text-2xl sm:text-3xl font-bold text-offwhite">
              The Core Crew
            </h2>
            <p className="font-mono text-xs text-offwhite-dim">
              The shutterbugs, exhibition curators, and expedition leaders shaping each term.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {coreMembers.map((member) => (
              <div
                key={member._id.toString()}
                className="group flex flex-col bg-charcoal border border-charcoal-border rounded-2xl overflow-hidden transition-all duration-300 hover:border-amber hover:shadow-[0_0_25px_rgba(245,158,11,0.12)]"
              >
                {/* 35mm Slide Header */}
                <div className="px-3 py-1.5 bg-black/80 border-b border-charcoal-border font-mono text-[9px] text-offwhite-dim flex justify-between items-center">
                  <span className="text-amber">CREW #{String(member.order || 1).padStart(2, '0')}</span>
                  <span>GCU</span>
                </div>

                {/* Portrait */}
                <div className="relative aspect-square w-full bg-black/60 overflow-hidden">
                  <Image
                    src={member.image.url}
                    alt={member.name}
                    fill
                    placeholder="blur"
                    blurDataURL={member.image.blurDataURL || getDarkroomBlurPlaceholder(12, 12)}
                    className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                  />
                  <div className="pointer-events-none absolute inset-2 rounded-lg border border-white/0 transition-all duration-300 group-hover:border-white/20" />
                </div>

                {/* Info */}
                <div className="p-4 space-y-1">
                  <h3 className="font-title text-sm sm:text-base font-bold text-offwhite group-hover:text-amber transition-colors line-clamp-1">
                    {member.name}
                  </h3>
                  <p className="font-mono text-xs text-offwhite-dim font-medium">
                    {member.role}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* =========================================================================
          FOUNDING ALUMNI NEGATIVE STRIP
          ========================================================================= */}
      {alumniMembers.length > 0 && (
        <section aria-labelledby="alumni-heading" className="relative z-10 space-y-8">
          <div className="border-b border-charcoal-border pb-4">
            <div className="flex items-center gap-2 text-offwhite-dim text-xs font-mono font-bold uppercase tracking-wider mb-1">
              <Quote className="w-3.5 h-3.5 text-amber" />
              Founding Roll &amp; Legacy
            </div>
            <h2 id="alumni-heading" className="font-title text-2xl sm:text-3xl font-bold text-offwhite">
              The Alumni Negative Strip
            </h2>
            <p className="font-mono text-xs text-offwhite-dim">
              Honoring the founders and past core members who established ShutterScape at GCU.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {alumniMembers.map((alumnus) => (
              <div
                key={alumnus._id.toString()}
                className="flex items-center gap-4 p-4 rounded-2xl bg-charcoal/60 border border-charcoal-border hover:border-amber/40 transition-colors"
              >
                <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-charcoal-border grayscale hover:grayscale-0 transition-all">
                  <Image
                    src={alumnus.image.url}
                    alt={alumnus.name}
                    fill
                    placeholder="blur"
                    blurDataURL={alumnus.image.blurDataURL || getDarkroomBlurPlaceholder(8, 8)}
                    className="object-cover"
                  />
                </div>
                <div className="space-y-0.5">
                  <h3 className="font-title text-sm font-bold text-offwhite">
                    {alumnus.name}
                  </h3>
                  <p className="font-mono text-xs text-amber">
                    {alumnus.role}
                  </p>
                  {alumnus.batch && (
                    <p className="font-mono text-[10px] text-offwhite-dim">
                      {alumnus.batch}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* =========================================================================
          CAMPUS LOCATION & DARKROOM HQ
          ========================================================================= */}
      <section aria-labelledby="location-heading" className="relative z-10 space-y-8">
        <div className="border-b border-charcoal-border pb-4">
          <div className="flex items-center gap-2 text-amber text-xs font-mono font-bold uppercase tracking-wider mb-1">
            <MapPin className="w-3.5 h-3.5" />
            Coordinates &amp; Darkroom Lab
          </div>
          <h2 id="location-heading" className="font-title text-2xl sm:text-3xl font-bold text-offwhite">
            Where We Expose
          </h2>
          <p className="font-mono text-xs text-offwhite-dim">
            Visit the ShutterScape Studio &amp; Media Wing at Girijananda Chowdhury University.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Address & Contact Dossier */}
          <div className="lg:col-span-5 p-6 sm:p-8 rounded-2xl bg-charcoal border border-charcoal-border flex flex-col justify-between space-y-6">
            <div className="space-y-6">
              <div className="space-y-2">
                <span className="font-mono text-xs text-amber uppercase tracking-wider">
                  Campus Headquarters
                </span>
                <h3 className="font-title text-xl font-bold text-offwhite">
                  Girijananda Chowdhury University
                </h3>
                <p className="text-sm font-sans text-offwhite-muted leading-relaxed">
                  {settings.address}
                </p>
              </div>

              <div className="space-y-3 pt-4 border-t border-charcoal-border font-mono text-xs">
                <div className="flex items-center gap-3 text-offwhite-muted">
                  <Mail className="w-4 h-4 text-amber shrink-0" />
                  <a
                    href={`mailto:${settings.email}`}
                    className="hover:text-amber transition-colors hover:underline"
                  >
                    {settings.email}
                  </a>
                </div>

                <div className="flex items-center gap-3 text-offwhite-muted">
                  <MapPin className="w-4 h-4 text-safelight shrink-0" />
                  <span>Media Lab &amp; Darkroom, Block C</span>
                </div>
              </div>
            </div>

            {/* Social CTAs */}
            <div className="pt-6 border-t border-charcoal-border space-y-3">
              <div className="font-mono text-[10px] tracking-widest uppercase text-offwhite-dim">
                Direct Communications
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  href={settings.instagramUrl}
                  isExternal
                  variant="outline"
                  size="sm"
                  className="gap-2 justify-center"
                >
                  <InstagramIcon className="w-4 h-4 text-amber" /> Instagram
                </Button>
                <Button
                  href={settings.whatsappUrl}
                  isExternal
                  variant="primary"
                  size="sm"
                  className="gap-2 justify-center"
                >
                  <MessageCircle className="w-4 h-4" /> WhatsApp
                </Button>
              </div>
            </div>
          </div>

          {/* Map Embed */}
          <div className="lg:col-span-7 rounded-2xl overflow-hidden border border-charcoal-border min-h-[350px] relative bg-charcoal">
            <iframe
              src={settings.mapEmbedUrl}
              title="Girijananda Chowdhury University Campus Location"
              width="100%"
              height="100%"
              style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg) contrast(90%)' }}
              allowFullScreen={false}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0 w-full h-full"
            />
          </div>
        </div>
      </section>

      {/* =========================================================================
          BOTTOM JOIN CTA BANNER
          ========================================================================= */}
      <section aria-labelledby="join-cta-heading" className="relative z-10">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-amber/20 via-charcoal to-safelight/20 border-2 border-amber/30 text-center space-y-6 shadow-2xl">
          <Badge variant="amber" className="mx-auto">
            {'● NEXT ROLL IS WAITING'}
          </Badge>
          <div className="space-y-3 max-w-2xl mx-auto">
            <h2 id="join-cta-heading" className="font-title text-3xl sm:text-4xl font-black text-offwhite">
              Ready to Expose Your First Frame?
            </h2>
            <p className="font-mono text-xs sm:text-sm text-offwhite-muted">
              Whether you shoot on 35mm film, modern mirrorless, or a smartphone,
              ShutterScape is open to every student at Girijananda Chowdhury University.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Button
              href={settings.whatsappUrl}
              isExternal
              variant="primary"
              className="gap-2"
            >
              <MessageCircle className="w-4 h-4" /> Join Student WhatsApp Group
            </Button>
            <Button
              href="/gallery"
              variant="outline"
              className="gap-2"
            >
              Explore Light Table <ExternalLink className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
