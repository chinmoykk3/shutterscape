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
} from 'lucide-react';
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
  featured: boolean;
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
  const [status, setStatus] = useState<'draft' | 'published'>('published');
  const [image, setImage] = useState<ImageAsset | null>(null);

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
            Curate photo exhibition items, assign rooms/themes, and configure camera readouts.
          </p>
        </div>

        <Button onClick={openCreateForm} variant="primary" size="sm">
          <Plus className="w-3.5 h-3.5" />
          Expose New Photograph
        </Button>
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
          <Button onClick={openCreateForm} variant="outline" size="sm">
            Expose First Photograph
          </Button>
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
                  <span className="px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[10px] font-mono text-amber border border-amber/30">
                    {item.room}
                  </span>
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
                <div className="pt-2 border-t border-charcoal-border flex items-center justify-end gap-1">
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
          ))}
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
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer font-mono text-xs text-offwhite">
                    <input
                      type="checkbox"
                      checked={featured}
                      onChange={(e) => setFeatured(e.target.checked)}
                      className="rounded accent-amber w-4 h-4"
                    />
                    Feature on Homepage
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
