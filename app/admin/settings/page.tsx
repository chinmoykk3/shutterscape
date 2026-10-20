'use client';

import React, { useState, useEffect } from 'react';
import {
  Save,
  Sliders,
  MapPin,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { useToast } from '@/components/admin/Toast';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export default function AdminSettingsPage() {
  const { success, error: toastError } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form Fields
  const [heroTitle, setHeroTitle] = useState('');
  const [heroSubtitle, setHeroSubtitle] = useState('');
  const [footerTagline, setFooterTagline] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [whatsappUrl, setWhatsappUrl] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [mapEmbedUrl, setMapEmbedUrl] = useState('');

  // Stats
  const [membersCount, setMembersCount] = useState(65);
  const [eventsCount, setEventsCount] = useState(18);
  const [photosCount, setPhotosCount] = useState(1200);

  const fetchSettings = React.useCallback(async () => {
    try {
      const res = await fetch('/api/admin/settings');
      const data = await res.json();
      if (data.success && data.settings) {
        const s = data.settings;
        setHeroTitle(s.heroTitle || '');
        setHeroSubtitle(s.heroSubtitle || '');
        setFooterTagline(s.footerTagline || '');
        setInstagramUrl(s.instagramUrl || '');
        setWhatsappUrl(s.whatsappUrl || '');
        setEmail(s.email || '');
        setAddress(s.address || '');
        setMapEmbedUrl(s.mapEmbedUrl || '');
        if (s.stats) {
          setMembersCount(s.stats.members || 0);
          setEventsCount(s.stats.events || 0);
          setPhotosCount(s.stats.photos || 0);
        }
      }
    } catch {
      toastError('Failed to fetch site configuration.');
    } finally {
      setLoading(false);
    }
  }, [toastError]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        heroTitle,
        heroSubtitle,
        footerTagline,
        instagramUrl,
        whatsappUrl,
        email,
        address,
        mapEmbedUrl,
        heroImages: [],
        stats: {
          members: Number(membersCount),
          events: Number(eventsCount),
          photos: Number(photosCount),
        },
      };

      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update settings');
      }

      success('Darkroom site parameters updated and public cache revalidated.');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Settings update failed.';
      toastError(message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-16 text-center font-mono text-xs text-amber animate-pulse">
        CALIBRATING APERTURE & DARKROOM SETTINGS...
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-charcoal-border">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="amber">FRAME 05 // CONFIG</Badge>
            <span className="font-mono text-xs text-offwhite-dim">
              Global Society Parameters
            </span>
          </div>
          <h1 className="font-title text-2xl sm:text-3xl font-black text-offwhite">
            Site Settings & Parameters
          </h1>
          <p className="font-body text-xs text-offwhite-dim">
            Configure club social handles, statistics counters, and global end-credit tags.
          </p>
        </div>

        <Button
          onClick={handleSubmit}
          variant="primary"
          size="sm"
          disabled={saving}
        >
          {saving ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Saving Parameters...
            </span>
          ) : (
            <span className="inline-flex items-center gap-2">
              <Save className="w-3.5 h-3.5" />
              Save Configuration
            </span>
          )}
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Statistics Counters Section */}
        <div className="p-6 rounded-3xl bg-charcoal/80 border border-charcoal-border space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-charcoal-border/70">
            <Sparkles className="w-4 h-4 text-amber" />
            <h2 className="font-title text-lg font-bold text-offwhite">
              Public Roll Statistics
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="block font-mono text-[11px] uppercase tracking-wider text-offwhite-dim">
                Active Members Count
              </label>
              <input
                type="number"
                value={membersCount}
                onChange={(e) => setMembersCount(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-2xl bg-black/60 border border-charcoal-border text-sm text-offwhite focus:outline-none focus:border-amber transition-colors"
              />
            </div>
            <div className="space-y-1">
              <label className="block font-mono text-[11px] uppercase tracking-wider text-offwhite-dim">
                Conducted Events Count
              </label>
              <input
                type="number"
                value={eventsCount}
                onChange={(e) => setEventsCount(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-2xl bg-black/60 border border-charcoal-border text-sm text-offwhite focus:outline-none focus:border-amber transition-colors"
              />
            </div>
            <div className="space-y-1">
              <label className="block font-mono text-[11px] uppercase tracking-wider text-offwhite-dim">
                Captured Photos / Exposures
              </label>
              <input
                type="number"
                value={photosCount}
                onChange={(e) => setPhotosCount(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-2xl bg-black/60 border border-charcoal-border text-sm text-offwhite focus:outline-none focus:border-amber transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Narrative & Hero Section */}
        <div className="p-6 rounded-3xl bg-charcoal/80 border border-charcoal-border space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-charcoal-border/70">
            <Sliders className="w-4 h-4 text-amber" />
            <h2 className="font-title text-lg font-bold text-offwhite">
              Hero Headlines & End Credits Tagline
            </h2>
          </div>
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="block font-mono text-[11px] uppercase tracking-wider text-offwhite-dim">
                Hero Aperture Title
              </label>
              <input
                type="text"
                value={heroTitle}
                onChange={(e) => setHeroTitle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-black/60 border border-charcoal-border text-sm text-offwhite focus:outline-none focus:border-amber transition-colors"
              />
            </div>
            <div className="space-y-1">
              <label className="block font-mono text-[11px] uppercase tracking-wider text-offwhite-dim">
                Hero Subtitle
              </label>
              <input
                type="text"
                value={heroSubtitle}
                onChange={(e) => setHeroSubtitle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-black/60 border border-charcoal-border text-sm text-offwhite focus:outline-none focus:border-amber transition-colors"
              />
            </div>
            <div className="space-y-1">
              <label className="block font-mono text-[11px] uppercase tracking-wider text-offwhite-dim">
                End Credits Footer Tagline
              </label>
              <input
                type="text"
                value={footerTagline}
                onChange={(e) => setFooterTagline(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-black/60 border border-charcoal-border text-sm text-offwhite focus:outline-none focus:border-amber transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Links & Campus Map */}
        <div className="p-6 rounded-3xl bg-charcoal/80 border border-charcoal-border space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-charcoal-border/70">
            <MapPin className="w-4 h-4 text-amber" />
            <h2 className="font-title text-lg font-bold text-offwhite">
              Club Channels & Coordinates
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block font-mono text-[11px] uppercase tracking-wider text-offwhite-dim">
                Instagram URL
              </label>
              <input
                type="url"
                value={instagramUrl}
                onChange={(e) => setInstagramUrl(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-black/60 border border-charcoal-border text-xs font-mono text-offwhite focus:outline-none focus:border-amber transition-colors"
              />
            </div>

            <div className="space-y-1">
              <label className="block font-mono text-[11px] uppercase tracking-wider text-offwhite-dim">
                WhatsApp Community Invite URL
              </label>
              <input
                type="url"
                value={whatsappUrl}
                onChange={(e) => setWhatsappUrl(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-black/60 border border-charcoal-border text-xs font-mono text-offwhite focus:outline-none focus:border-amber transition-colors"
              />
            </div>

            <div className="space-y-1">
              <label className="block font-mono text-[11px] uppercase tracking-wider text-offwhite-dim">
                Official Society Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-black/60 border border-charcoal-border text-sm text-offwhite focus:outline-none focus:border-amber transition-colors"
              />
            </div>

            <div className="space-y-1">
              <label className="block font-mono text-[11px] uppercase tracking-wider text-offwhite-dim">
                University Campus Address
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-black/60 border border-charcoal-border text-sm text-offwhite focus:outline-none focus:border-amber transition-colors"
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="block font-mono text-[11px] uppercase tracking-wider text-offwhite-dim">
                Google Maps Embed URL
              </label>
              <input
                type="url"
                value={mapEmbedUrl}
                onChange={(e) => setMapEmbedUrl(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-black/60 border border-charcoal-border text-xs font-mono text-offwhite focus:outline-none focus:border-amber transition-colors"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={saving}
            className="w-full sm:w-auto px-8"
          >
            {saving ? 'Transmitting Configuration...' : 'Commit Site Settings'}
          </Button>
        </div>
      </form>
    </div>
  );
}
