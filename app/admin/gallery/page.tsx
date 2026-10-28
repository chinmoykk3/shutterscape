// File: app/admin/gallery/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Plus,
  Search,
  Star,
  Edit2,
  Trash2,
  Camera,
  X,
  Loader2,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { InstagramIcon } from '@/components/ui/InstagramIcon';
import { useToast } from '@/components/admin/Toast';
import { CloudinaryUploader, ImageAsset } from '@/components/admin/CloudinaryUploader';
import { DeleteModal } from '@/components/admin/DeleteModal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface GalleryItemType {
  _id: string;
  image: ImageAsset & { width: number; height: number };
  caption: string;
  story?: string;
  photographer?: string;
  cameraInfo?: string;
  room: string;
  instagramUrl?: string;
  featured: boolean;
  photoOfTheWeek?: boolean;
  status: 'draft' | 'published';
  createdAt: string;
}

const DEFAULT_ROOMS = ['General', 'Campus Life', 'Monochrome', 'Portraits', 'Street', 'Nature'];

export default function AdminGalleryPage() {
  const { success, error: toastError } = useToast();

  const [items, setItems] = useState<GalleryItemType[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedRoom, setSelectedRoom] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GalleryItemType | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form Inputs
  const [caption, setCaption] = useState('');
  const [photographer, setPhotographer] = useState('');
  const [room, setRoom] = useState('Campus Life');
  const [customRoom, setCustomRoom] = useState('');
  const [story, setStory] = useState('');
  const [cameraInfo, setCameraInfo] = useState('');
  const [featured, setFeatured] = useState(false);
  const [photoOfTheWeek, setPhotoOfTheWeek] = useState(false);
  const [status, setStatus] = useState<'draft' | 'published'>('published');
  const [image, setImage] = useState<ImageAsset | null>(null);

  // Instagram Import Modal State
  const [isInstagramModalOpen, setIsInstagramModalOpen] = useState(false);
  const [instagramTab, setInstagramTab] = useState<'url' | 'recent'>('url');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [instagramRoom, setInstagramRoom] = useState('Campus Life');
  const [instagramFeatured, setInstagramFeatured] = useState(false);
  const [instagramPotw, setInstagramPotw] = useState(false);
  const [importingInstagram, setImportingInstagram] = useState(false);
  const [syncingInstagram, setSyncingInstagram] = useState(false);

  // Manual fallback & curation states
  const [manualFallbackMode, setManualFallbackMode] = useState(false);
  const [fallbackWarning, setFallbackWarning] = useState<string | null>(null);
  const [instagramManualImage, setInstagramManualImage] = useState<ImageAsset | null>(null);
  const [instagramCustomCaption, setInstagramCustomCaption] = useState('');
  const [instagramCustomPhotographer, setInstagramCustomPhotographer] = useState('');

  // Recent posts list from @shutterscape_gcu
  interface RecentInstagramPost {
    code: string;
    url: string;
    caption: string;
    room: string;
    photographer: string;
    imageUrl?: string;
    alreadyImported: boolean;
  }
  const [recentInstagramPosts, setRecentInstagramPosts] = useState<RecentInstagramPost[]>([]);
  const [loadingRecent, setLoadingRecent] = useState(false);

  // Delete State
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deletingCaption, setDeletingCaption] = useState('');
  const [deletingLoading, setDeletingLoading] = useState(false);

  const fetchItems = React.useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (selectedRoom && selectedRoom !== 'All') params.set('room', selectedRoom);
      if (selectedStatus) params.set('status', selectedStatus);

      const res = await fetch(`/api/admin/gallery?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setItems(data.items);
      }
    } catch {
      toastError('Failed to load negatives from gallery vault.');
    } finally {
      setLoading(false);
    }
  }, [search, selectedRoom, selectedStatus, toastError]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const openCreateForm = () => {
    setEditingItem(null);
    setCaption('');
    setPhotographer('ShutterScape Member');
    setRoom('Campus Life');
    setCustomRoom('');
    setStory('');
    setCameraInfo('ISO 100 • 1/250s • f/2.8');
    setFeatured(false);
    setPhotoOfTheWeek(false);
    setStatus('published');
    setImage(null);
    setIsFormOpen(true);
  };

  const openEditForm = (item: GalleryItemType) => {
    setEditingItem(item);
    setCaption(item.caption);
    setPhotographer(item.photographer || '');
    if (DEFAULT_ROOMS.includes(item.room)) {
      setRoom(item.room);
      setCustomRoom('');
    } else {
      setRoom('Other');
      setCustomRoom(item.room);
    }
    setStory(item.story || '');
    setCameraInfo(item.cameraInfo || '');
    setFeatured(item.featured);
    setPhotoOfTheWeek(Boolean(item.photoOfTheWeek));
    setStatus(item.status);
    setImage(item.image);
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!caption || !image) {
      toastError('Caption and a photograph exposure are required.');
      return;
    }

    setSubmitting(true);
    try {
      const finalRoom = room === 'Other' && customRoom ? customRoom : room;

      const payload = {
        image: {
          url: image.url,
          publicId: image.publicId,
          blurDataURL: image.blurDataURL,
          width: image.width || 1200,
          height: image.height || 800,
        },
        caption,
        photographer,
        room: finalRoom,
        story,
        cameraInfo,
        featured,
        photoOfTheWeek,
        status,
      };

      const url = editingItem
        ? `/api/admin/gallery/${editingItem._id}`
        : '/api/admin/gallery';
      const method = editingItem ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save photograph');
      }

      success(
        editingItem
          ? 'Exposure metadata updated.'
          : 'Negative exposed and curated to darkroom.'
      );
      setIsFormOpen(false);
      fetchItems();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Operation failed.';
      toastError(message);
    } finally {
      setSubmitting(false);
    }
  };

  // Fetch Recent Posts from @shutterscape_gcu
  const fetchRecentInstagramPosts = async () => {
    setLoadingRecent(true);
    try {
      const res = await fetch('/api/admin/instagram/recent');
      const data = await res.json();
      if (data.success && Array.isArray(data.posts)) {
        setRecentInstagramPosts(data.posts);
      }
    } catch {
      // ignore
    } finally {
      setLoadingRecent(false);
    }
  };

  const openInstagramModal = () => {
    setInstagramUrl('');
    setInstagramTab('url');
    setManualFallbackMode(false);
    setFallbackWarning(null);
    setInstagramManualImage(null);
    setInstagramCustomCaption('');
    setInstagramCustomPhotographer('');
    setInstagramRoom('Campus Life');
    setInstagramFeatured(false);
    setInstagramPotw(false);
    setIsInstagramModalOpen(true);
    fetchRecentInstagramPosts();
  };

  const handleSelectRecentPost = (post: RecentInstagramPost) => {
    setInstagramUrl(post.url);
    setInstagramRoom(post.room || 'Campus Life');
    setInstagramCustomCaption(post.caption || '');
    setInstagramCustomPhotographer(post.photographer || '');
    if (post.imageUrl) {
      setInstagramManualImage({
        url: post.imageUrl,
        publicId: `ig_${post.code}`,
        width: 1080,
        height: 1350,
      });
    }
    setInstagramTab('url');
    setManualFallbackMode(false);
    setFallbackWarning(null);
  };

  // Handle 1-Click Instagram Post Import
  const handleInstagramImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!instagramUrl) {
      toastError('Please enter an Instagram post link.');
      return;
    }

    setImportingInstagram(true);
    try {
      const payload: Record<string, unknown> = {
        url: instagramUrl,
        room: instagramRoom,
        featured: instagramFeatured,
        photoOfTheWeek: instagramPotw,
      };

      if (instagramCustomCaption) payload.customCaption = instagramCustomCaption;
      if (instagramCustomPhotographer) payload.customPhotographer = instagramCustomPhotographer;
      if (instagramManualImage?.url) {
        payload.manualImageUrl = instagramManualImage.url;
        payload.manualPublicId = instagramManualImage.publicId;
        payload.imageWidth = instagramManualImage.width;
        payload.imageHeight = instagramManualImage.height;
      }

      const res = await fetch('/api/admin/instagram/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        // If scrape failed and we haven't provided a manual image yet, switch to manual fallback mode!
        if (!instagramManualImage?.url) {
          setManualFallbackMode(true);
          const errorMsg = data.isUnavailable
            ? 'Meta reports this specific post is unavailable, private, or deleted. You can attach the photograph manually below to curate this frame.'
            : data.error || 'Meta blocked automated extraction. You can attach the photograph manually below.';
          setFallbackWarning(errorMsg);
          toastError(errorMsg);
          return;
        }
        throw new Error(data.error || 'Failed to import Instagram post.');
      }

      success('Photograph and caption imported from Instagram into darkroom gallery!');
      setInstagramUrl('');
      setIsInstagramModalOpen(false);
      fetchItems();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Import failed';
      toastError(message);
    } finally {
      setImportingInstagram(false);
    }
  };

  // Handle Full Account Sync via Graph API
  const handleInstagramSync = async () => {
    setSyncingInstagram(true);
    try {
      const res = await fetch('/api/admin/instagram/sync', {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Sync failed.');
      }
      success(data.message || 'Instagram sync completed!');
      fetchItems();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Sync failed';
      toastError(message);
    } finally {
      setSyncingInstagram(false);
    }
  };

  const toggleFeatured = async (item: GalleryItemType) => {
    try {
      const res = await fetch(`/api/admin/gallery/${item._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...item,
          featured: !item.featured,
        }),
      });
      if (res.ok) {
        setItems((prev) =>
          prev.map((i) =>
            i._id === item._id ? { ...i, featured: !i.featured } : i
          )
        );
        success(item.featured ? 'Removed from featured spotlight.' : 'Set as featured exposure.');
      }
    } catch {
      toastError('Failed to toggle featured status.');
    }
  };

  const toggleStatus = async (item: GalleryItemType) => {
    const newStatus = item.status === 'published' ? 'draft' : 'published';
    try {
      const res = await fetch(`/api/admin/gallery/${item._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...item,
          status: newStatus,
        }),
      });
      if (res.ok) {
        setItems((prev) =>
          prev.map((i) => (i._id === item._id ? { ...i, status: newStatus } : i))
        );
        success(`Status updated to ${newStatus}.`);
      }
    } catch {
      toastError('Failed to toggle status.');
    }
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    setDeletingLoading(true);
    try {
      const res = await fetch(`/api/admin/gallery/${deletingId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        success('Negative and cloud storage asset destroyed.');
        setItems((prev) => prev.filter((i) => i._id !== deletingId));
      }
    } catch {
      toastError('Failed to destroy negative.');
    } finally {
      setDeletingLoading(false);
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-charcoal-border">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="amber">FRAME 02 // EXPOSURES</Badge>
            <span className="font-mono text-xs text-offwhite-dim">
              {items.length} Negatives Cataloged
            </span>
          </div>
          <h1 className="font-title text-2xl sm:text-3xl font-black text-offwhite">
            Darkroom Light Table
          </h1>
          <p className="font-body text-xs text-offwhite-dim">
            Curate photo exhibition items, assign rooms/themes, or import directly from @shutterscape_gcu.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Instagram 1-Click Importer Button */}
          <Button
            onClick={openInstagramModal}
            variant="secondary"
            size="sm"
            className="gap-2 bg-gradient-to-r from-purple-900/40 via-pink-900/40 to-amber/20 border-pink-500/30 text-offwhite hover:border-pink-500/60"
          >
            <InstagramIcon className="w-3.5 h-3.5 text-pink-400" />
            Import from Instagram
          </Button>

          {/* Standard Create Button */}
          <Button onClick={openCreateForm} variant="primary" size="sm">
            <Plus className="w-3.5 h-3.5" />
            Expose New Photograph
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col lg:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-offwhite-muted pointer-events-none" />
          <input
            type="text"
            placeholder="Search by caption, photographer, or story..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-charcoal border border-charcoal-border text-xs font-mono text-offwhite placeholder:text-offwhite-muted/50 focus:outline-none focus:border-amber transition-colors"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {/* Room Filter */}
          <select
            value={selectedRoom}
            onChange={(e) => setSelectedRoom(e.target.value)}
            className="px-3 py-2 rounded-xl bg-charcoal border border-charcoal-border text-xs font-mono text-offwhite focus:outline-none focus:border-amber transition-colors"
          >
            <option value="All">All Rooms / Categories</option>
            {DEFAULT_ROOMS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 rounded-xl bg-charcoal border border-charcoal-border text-xs font-mono text-offwhite focus:outline-none focus:border-amber transition-colors"
          >
            <option value="">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>
      </div>

      {/* Gallery Cards Grid */}
      {loading ? (
        <div className="p-16 text-center font-mono text-xs text-amber animate-pulse">
          DEVELOPING PRINTS ON LIGHT TABLE...
        </div>
      ) : items.length === 0 ? (
        <div className="p-16 rounded-3xl bg-charcoal/40 border border-charcoal-border text-center space-y-3">
          <Camera className="w-8 h-8 text-offwhite-muted mx-auto" />
          <p className="font-mono text-xs text-offwhite">No negatives found matching filters.</p>
          <div className="flex justify-center gap-3 pt-2">
            <Button onClick={openInstagramModal} variant="secondary" size="sm">
              <InstagramIcon className="w-3.5 h-3.5 mr-1 text-pink-400" />
              Import from @shutterscape_gcu
            </Button>
            <Button onClick={openCreateForm} variant="outline" size="sm">
              Upload Manually
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {items.map((item) => (
            <div
              key={item._id}
              className="rounded-3xl bg-charcoal/80 border border-charcoal-border hover:border-amber/40 transition-all overflow-hidden flex flex-col group shadow-lg"
            >
              {/* Photo Preview */}
              <div className="relative aspect-[4/3] w-full bg-black">
                {item.image?.url && (
                  <Image
                    src={item.image.url}
                    alt={item.caption}
                    fill
                    sizes="(max-width: 768px) 100vw, 25vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                )}

                {/* Badges on preview */}
                <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[10px] font-mono text-amber border border-amber/30">
                      {item.room}
                    </span>
                    {item.instagramUrl && (
                      <a
                        href={item.instagramUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 rounded-md bg-black/70 backdrop-blur-md text-pink-400 hover:text-pink-300 border border-pink-500/30 transition-colors"
                        title="View post on Instagram"
                      >
                        <InstagramIcon className="w-3 h-3" />
                      </a>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => toggleFeatured(item)}
                      aria-label="Toggle featured"
                      className={`p-1.5 rounded-lg backdrop-blur-md transition-colors ${
                        item.featured
                          ? 'bg-amber text-black shadow-md'
                          : 'bg-black/60 text-offwhite-muted hover:text-amber'
                      }`}
                    >
                      <Star className="w-3.5 h-3.5 fill-current" />
                    </button>
                    <button
                      onClick={() => toggleStatus(item)}
                      className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase backdrop-blur-md border ${
                        item.status === 'published'
                          ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                          : 'bg-safelight/20 border-safelight/40 text-[#ff8078]'
                      }`}
                    >
                      {item.status}
                    </button>
                  </div>
                </div>
              </div>

              {/* Caption & EXIF */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-1">
                  <h3 className="font-title text-sm font-bold text-offwhite group-hover:text-amber transition-colors line-clamp-1">
                    {item.caption}
                  </h3>
                  {item.photographer && (
                    <p className="font-mono text-[11px] text-offwhite-dim">
                      by {item.photographer}
                    </p>
                  )}
                  {item.cameraInfo && (
                    <p className="font-mono text-[10px] text-offwhite-dim/60 truncate pt-0.5">
                      {item.cameraInfo}
                    </p>
                  )}
                </div>

                {/* Card Actions */}
                <div className="pt-2 border-t border-charcoal-border flex items-center justify-between">
                  <span className="font-mono text-[9px] text-offwhite-dim/60">
                    {item.instagramUrl ? 'Instagram Synced' : 'Direct Upload'}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditForm(item)}
                      aria-label="Edit negative"
                      className="p-1.5 rounded-lg bg-charcoal border border-charcoal-border text-offwhite-dim hover:text-amber hover:border-amber/40 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        setDeletingId(item._id);
                        setDeletingCaption(item.caption);
                      }}
                      aria-label="Delete negative"
                      className="p-1.5 rounded-lg bg-charcoal border border-charcoal-border text-offwhite-dim hover:text-safelight hover:border-safelight/40 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* =======================================================================
          INSTAGRAM 1-CLICK IMPORT MODAL
          ======================================================================= */}
      {isInstagramModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="my-8 w-full max-w-2xl rounded-3xl bg-charcoal border border-charcoal-border p-6 sm:p-8 shadow-2xl space-y-6 animate-in zoom-in-95">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-charcoal-border">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-pink-500/20 border border-pink-500/40 flex items-center justify-center text-pink-400">
                  <InstagramIcon className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-title text-lg font-bold text-offwhite flex items-center gap-2">
                    Import from @shutterscape_gcu
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-400 border border-pink-500/30">
                      Live Meta Curation
                    </span>
                  </h2>
                  <p className="font-mono text-[10px] text-offwhite-dim">
                    Archive real photographs and captions directly from Instagram into the darkroom
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsInstagramModalOpen(false)}
                className="p-2 rounded-xl text-offwhite-dim hover:text-offwhite hover:bg-charcoal-subtle transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tab Selector */}
            <div className="flex gap-2 p-1 bg-black/40 border border-charcoal-border rounded-2xl">
              <button
                type="button"
                onClick={() => setInstagramTab('url')}
                className={`flex-1 py-2 px-3 rounded-xl font-mono text-xs transition-all ${
                  instagramTab === 'url'
                    ? 'bg-amber text-black font-bold shadow-md'
                    : 'text-offwhite-dim hover:text-offwhite'
                }`}
              >
                Paste Post Link
              </button>
              <button
                type="button"
                onClick={() => setInstagramTab('recent')}
                className={`flex-1 py-2 px-3 rounded-xl font-mono text-xs transition-all flex items-center justify-center gap-1.5 ${
                  instagramTab === 'recent'
                    ? 'bg-amber text-black font-bold shadow-md'
                    : 'text-offwhite-dim hover:text-offwhite'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                Pick from @shutterscape_gcu Feed
                {recentInstagramPosts.length > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/30 font-mono">
                    {recentInstagramPosts.length}
                  </span>
                )}
              </button>
            </div>

            {/* TAB 1: PASTE POST URL */}
            {instagramTab === 'url' && (
              <form onSubmit={handleInstagramImport} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block font-mono text-[11px] uppercase tracking-wider text-offwhite-dim">
                    Instagram Post Link *
                  </label>
                  <input
                    type="url"
                    required
                    placeholder="https://www.instagram.com/p/..."
                    value={instagramUrl}
                    onChange={(e) => {
                      setInstagramUrl(e.target.value);
                      if (fallbackWarning) {
                        setFallbackWarning(null);
                        setManualFallbackMode(false);
                      }
                    }}
                    className="w-full px-4 py-2.5 rounded-2xl bg-black/60 border border-charcoal-border text-xs font-mono text-offwhite focus:outline-none focus:border-amber transition-colors"
                  />
                  <div className="flex items-center justify-between text-[10px] font-mono text-offwhite-dim">
                    <span>Example: https://www.instagram.com/p/DejCSHaFLVz/</span>
                    {instagramUrl && (
                      <a
                        href={instagramUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-amber hover:underline flex items-center gap-1"
                      >
                        Open on Instagram <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Notice banner if scraping failed or unavailable */}
                {manualFallbackMode && (
                  <div className="p-4 rounded-2xl bg-amber/10 border border-amber/30 space-y-2 animate-in fade-in">
                    <div className="flex items-start gap-2.5">
                      <AlertTriangle className="w-4 h-4 text-amber shrink-0 mt-0.5" />
                      <div className="space-y-1 text-xs">
                        <p className="font-mono font-bold text-amber">
                          Automated Scraping Fallback Unlocked
                        </p>
                        <p className="font-body text-offwhite-dim text-[11px] leading-relaxed">
                          {fallbackWarning ||
                            'Meta indicated this post is unavailable, private, or blocked direct scraping. You can attach the photograph manually below to curate this frame.'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Manual Image Attachment if in fallback mode or if preselected */}
                {(manualFallbackMode || instagramManualImage) && (
                  <div className="space-y-3 p-4 rounded-2xl bg-black/40 border border-charcoal-border">
                    <div className="flex items-center justify-between">
                      <label className="font-mono text-[11px] uppercase tracking-wider text-amber flex items-center gap-1.5">
                        <Camera className="w-3.5 h-3.5" />
                        Photograph Asset
                      </label>
                      {instagramManualImage && (
                        <button
                          type="button"
                          onClick={() => setInstagramManualImage(null)}
                          className="text-[10px] font-mono text-red-400 hover:underline"
                        >
                          Clear Image
                        </button>
                      )}
                    </div>

                    {instagramManualImage ? (
                      <div className="flex items-center gap-3 p-2 rounded-xl bg-charcoal border border-charcoal-border">
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-black shrink-0">
                          <Image
                            src={instagramManualImage.url}
                            alt="Exposure preview"
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="space-y-0.5 min-w-0">
                          <span className="font-mono text-[10px] text-green-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Photo Attached
                          </span>
                          <p className="font-mono text-[10px] text-offwhite-dim truncate">
                            {instagramManualImage.url}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <CloudinaryUploader
                        value={instagramManualImage}
                        onChange={(asset) => setInstagramManualImage(asset)}
                        folder="shutterscape/instagram"
                        label="Upload Negative (JPG, PNG, WebP)"
                        helperText="Upload image to preserve permanent darkroom exposure"
                        aspectRatio="portrait"
                      />
                    )}

                    {/* Custom Caption & Photographer override */}
                    <div className="space-y-1.5 pt-2">
                      <label className="block font-mono text-[11px] uppercase tracking-wider text-offwhite-dim">
                        Caption / Story
                      </label>
                      <textarea
                        rows={3}
                        value={instagramCustomCaption}
                        onChange={(e) => setInstagramCustomCaption(e.target.value)}
                        placeholder="Enter photograph caption or narrative..."
                        className="w-full px-4 py-2 rounded-xl bg-black/60 border border-charcoal-border text-xs font-mono text-offwhite focus:outline-none focus:border-amber transition-colors"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block font-mono text-[11px] uppercase tracking-wider text-offwhite-dim">
                        Photographer Attribution
                      </label>
                      <input
                        type="text"
                        value={instagramCustomPhotographer}
                        onChange={(e) => setInstagramCustomPhotographer(e.target.value)}
                        placeholder="e.g. Aryan Deep Singh or @shutterscape_gcu"
                        className="w-full px-4 py-2 rounded-xl bg-black/60 border border-charcoal-border text-xs font-mono text-offwhite focus:outline-none focus:border-amber transition-colors"
                      />
                    </div>
                  </div>
                )}

                {/* Room selector */}
                <div className="space-y-1.5">
                  <label className="block font-mono text-[11px] uppercase tracking-wider text-offwhite-dim">
                    Exhibition Room
                  </label>
                  <select
                    value={instagramRoom}
                    onChange={(e) => setInstagramRoom(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl bg-black/60 border border-charcoal-border text-xs font-mono text-offwhite focus:outline-none focus:border-amber transition-colors"
                  >
                    {DEFAULT_ROOMS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                  <span className="text-[10px] font-mono text-amber/80">
                    Tip: Hashtags like #monochrome, #street, or #portrait are auto-detected!
                  </span>
                </div>

                {/* Checkboxes */}
                <div className="flex flex-col sm:flex-row gap-3 pt-1 font-mono text-xs text-offwhite">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={instagramFeatured}
                      onChange={(e) => setInstagramFeatured(e.target.checked)}
                      className="rounded accent-amber w-4 h-4"
                    />
                    Feature on Homepage
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={instagramPotw}
                      onChange={(e) => setInstagramPotw(e.target.checked)}
                      className="rounded accent-amber w-4 h-4"
                    />
                    Set as Photo of the Week
                  </label>
                </div>

                {/* Action buttons */}
                <div className="pt-4 border-t border-charcoal-border flex items-center justify-between">
                  <button
                    type="button"
                    onClick={handleInstagramSync}
                    disabled={syncingInstagram}
                    className="font-mono text-[11px] text-offwhite-dim hover:text-amber flex items-center gap-1.5 transition-colors"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${syncingInstagram ? 'animate-spin' : ''}`} />
                    Sync Graph API
                  </button>

                  <div className="flex items-center gap-2">
                    {!manualFallbackMode && !instagramManualImage && (
                      <button
                        type="button"
                        onClick={() => setManualFallbackMode(true)}
                        className="text-[11px] font-mono text-offwhite-dim hover:text-offwhite underline mr-2"
                      >
                        Attach photo manually
                      </button>
                    )}
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => setIsInstagramModalOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      disabled={importingInstagram}
                    >
                      {importingInstagram ? (
                        <span className="inline-flex items-center gap-2">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          Archiving Post...
                        </span>
                      ) : instagramManualImage ? (
                        'Archive Exposure'
                      ) : (
                        'Fetch & Curate'
                      )}
                    </Button>
                  </div>
                </div>
              </form>
            )}

            {/* TAB 2: RECENT POSTS PICKER */}
            {instagramTab === 'recent' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs font-mono text-offwhite-dim">
                  <span>Recent posts published by @shutterscape_gcu</span>
                  <button
                    onClick={fetchRecentInstagramPosts}
                    disabled={loadingRecent}
                    className="flex items-center gap-1 text-amber hover:underline"
                  >
                    <RefreshCw className={`w-3 h-3 ${loadingRecent ? 'animate-spin' : ''}`} />
                    Refresh Feed
                  </button>
                </div>

                {loadingRecent ? (
                  <div className="py-12 text-center font-mono text-xs text-amber animate-pulse">
                    DEVELOPING FEED FROM @SHUTTERSCAPE_GCU...
                  </div>
                ) : recentInstagramPosts.length === 0 ? (
                  <div className="py-12 text-center font-mono text-xs text-offwhite-dim">
                    No recent posts found. Check connection or switch to URL tab.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-[380px] overflow-y-auto pr-1">
                    {recentInstagramPosts.map((post) => (
                      <div
                        key={post.code}
                        className={`rounded-2xl border p-2.5 flex flex-col justify-between transition-all group ${
                          post.alreadyImported
                            ? 'bg-charcoal/40 border-charcoal-border opacity-70'
                            : 'bg-black/60 border-charcoal-border hover:border-amber/60'
                        }`}
                      >
                        <div className="space-y-2">
                          {/* Image preview */}
                          <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-charcoal">
                            {post.imageUrl ? (
                              <Image
                                src={post.imageUrl}
                                alt={post.caption || 'Instagram post'}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-offwhite-dim">
                                <Camera className="w-6 h-6 opacity-40" />
                              </div>
                            )}
                            <div className="absolute top-1.5 left-1.5">
                              <span className="px-1.5 py-0.5 rounded-md bg-black/80 font-mono text-[9px] text-amber border border-amber/30">
                                {post.room}
                              </span>
                            </div>
                            {post.alreadyImported && (
                              <div className="absolute top-1.5 right-1.5">
                                <span className="px-1.5 py-0.5 rounded-md bg-green-900/90 text-green-300 font-mono text-[9px] flex items-center gap-1 border border-green-500/40">
                                  <CheckCircle2 className="w-2.5 h-2.5" /> In Gallery
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Caption Snippet */}
                          <p className="font-body text-[11px] text-offwhite line-clamp-2 leading-snug">
                            {post.caption || 'Photo from @shutterscape_gcu'}
                          </p>
                        </div>

                        {/* Action */}
                        <div className="pt-2 mt-2 border-t border-charcoal-border/50 flex items-center justify-between">
                          <span className="font-mono text-[9px] text-offwhite-dim">
                            #{post.code}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleSelectRecentPost(post)}
                            className="px-2.5 py-1 rounded-lg bg-amber/20 hover:bg-amber text-amber hover:text-black font-mono text-[10px] font-bold transition-all"
                          >
                            {post.alreadyImported ? 'Re-curate' : 'Curate Frame'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create / Edit Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="my-8 w-full max-w-2xl rounded-3xl bg-charcoal border border-charcoal-border p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-charcoal-border">
              <div>
                <Badge variant="amber">
                  {editingItem ? 'EDIT NEGATIVE' : 'EXPOSE NEGATIVE'}
                </Badge>
                <h2 className="font-title text-xl font-bold text-offwhite mt-1">
                  {editingItem ? editingItem.caption : 'Upload Photo to Darkroom'}
                </h2>
              </div>
              <button
                onClick={() => setIsFormOpen(false)}
                aria-label="Close modal"
                className="p-2 rounded-xl text-offwhite-dim hover:text-offwhite hover:bg-charcoal-subtle transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Cloudinary Uploader */}
              <CloudinaryUploader
                value={image}
                onChange={setImage}
                label="Photograph File (Cloudinary) *"
                aspectRatio="auto"
                folder="shutterscape/gallery"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Caption */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="block font-mono text-[11px] uppercase tracking-wider text-offwhite-dim">
                    Photo Caption *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Shadows over Brahmaputra"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl bg-black/60 border border-charcoal-border text-sm text-offwhite focus:outline-none focus:border-amber transition-colors"
                  />
                </div>

                {/* Photographer */}
                <div className="space-y-1">
                  <label className="block font-mono text-[11px] uppercase tracking-wider text-offwhite-dim">
                    Photographer Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Uttama Purkayastha"
                    value={photographer}
                    onChange={(e) => setPhotographer(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl bg-black/60 border border-charcoal-border text-sm text-offwhite focus:outline-none focus:border-amber transition-colors"
                  />
                </div>

                {/* Room / Category */}
                <div className="space-y-1">
                  <label className="block font-mono text-[11px] uppercase tracking-wider text-offwhite-dim">
                    Exhibition Room / Category
                  </label>
                  <select
                    value={room}
                    onChange={(e) => setRoom(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl bg-black/60 border border-charcoal-border text-sm text-offwhite focus:outline-none focus:border-amber transition-colors"
                  >
                    {DEFAULT_ROOMS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                    <option value="Other">Other (Custom Room)</option>
                  </select>
                </div>

                {room === 'Other' && (
                  <div className="space-y-1 sm:col-span-2">
                    <label className="block font-mono text-[11px] uppercase tracking-wider text-offwhite-dim">
                      Custom Room Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Astro Photography"
                      value={customRoom}
                      onChange={(e) => setCustomRoom(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-2xl bg-black/60 border border-charcoal-border text-sm text-offwhite focus:outline-none focus:border-amber transition-colors"
                    />
                  </div>
                )}

                {/* Camera EXIF Info */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="block font-mono text-[11px] uppercase tracking-wider text-offwhite-dim">
                    Camera & Exposure EXIF (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Sony A7IV • 85mm f/1.4 • 1/1000s • ISO 100"
                    value={cameraInfo}
                    onChange={(e) => setCameraInfo(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl bg-black/60 border border-charcoal-border text-sm text-offwhite focus:outline-none focus:border-amber transition-colors"
                  />
                </div>

                {/* Story Behind Frame */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="block font-mono text-[11px] uppercase tracking-wider text-offwhite-dim">
                    Story Behind the Frame (Optional)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Describe how the lighting was framed, the moment it was taken, or the darkroom development process..."
                    value={story}
                    onChange={(e) => setStory(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl bg-black/60 border border-charcoal-border text-sm text-offwhite focus:outline-none focus:border-amber transition-colors"
                  />
                </div>

                {/* Featured & Status */}
                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-2 cursor-pointer font-mono text-xs text-offwhite">
                    <input
                      type="checkbox"
                      checked={featured}
                      onChange={(e) => setFeatured(e.target.checked)}
                      className="rounded accent-amber w-4 h-4"
                    />
                    Feature on Homepage
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer font-mono text-xs text-offwhite">
                    <input
                      type="checkbox"
                      checked={photoOfTheWeek}
                      onChange={(e) => setPhotoOfTheWeek(e.target.checked)}
                      className="rounded accent-amber w-4 h-4"
                    />
                    Set as Photo of the Week
                  </label>
                </div>

                <div className="space-y-1">
                  <label className="block font-mono text-[11px] uppercase tracking-wider text-offwhite-dim">
                    Publication Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as 'draft' | 'published')}
                    className="w-full px-4 py-2.5 rounded-2xl bg-black/60 border border-charcoal-border text-sm text-offwhite focus:outline-none focus:border-amber transition-colors"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-charcoal-border">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsFormOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={submitting}
                >
                  {submitting ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Saving Negative...
                    </span>
                  ) : editingItem ? (
                    'Update Exposure'
                  ) : (
                    'Expose to Darkroom'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <DeleteModal
        isOpen={!!deletingId}
        title={deletingCaption}
        loading={deletingLoading}
        onConfirm={confirmDelete}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  );
}
