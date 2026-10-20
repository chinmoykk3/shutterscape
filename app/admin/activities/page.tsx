'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Plus,
  Search,
  Calendar,
  MapPin,
  Edit2,
  Trash2,
  X,
  Loader2,
} from 'lucide-react';
import { useToast } from '@/components/admin/Toast';
import { CloudinaryUploader, ImageAsset } from '@/components/admin/CloudinaryUploader';
import { RichTextEditor } from '@/components/admin/RichTextEditor';
import { DeleteModal } from '@/components/admin/DeleteModal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { slugify } from '@/lib/utils';

interface ActivityItem {
  _id: string;
  title: string;
  slug: string;
  date: string;
  endDate?: string;
  venue?: string;
  descriptionHtml: string;
  pullQuote?: string;
  image: ImageAsset;
  registrationLink?: string;
  status: 'draft' | 'published';
  createdAt: string;
}

export default function AdminActivitiesPage() {
  const { success, error: toastError } = useToast();

  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ActivityItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form Fields
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [date, setDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [venue, setVenue] = useState('');
  const [pullQuote, setPullQuote] = useState('');
  const [registrationLink, setRegistrationLink] = useState('');
  const [image, setImage] = useState<ImageAsset | null>(null);
  const [descriptionHtml, setDescriptionHtml] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');

  // Delete State
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deletingTitle, setDeletingTitle] = useState('');
  const [deletingLoading, setDeletingLoading] = useState(false);

  const fetchActivities = React.useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);

      const res = await fetch(`/api/admin/activities?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setActivities(data.activities);
      }
    } catch {
      toastError('Failed to fetch film rolls from darkroom database.');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, toastError]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const openCreateForm = () => {
    setEditingItem(null);
    setTitle('');
    setSlug('');
    setDate(new Date().toISOString().split('T')[0]);
    setEndDate('');
    setVenue('GCU Campus, Azara');
    setPullQuote('');
    setRegistrationLink('');
    setImage(null);
    setDescriptionHtml('<p>Write event details and exhibition highlights here...</p>');
    setStatus('published');
    setIsFormOpen(true);
  };

  const openEditForm = (item: ActivityItem) => {
    setEditingItem(item);
    setTitle(item.title);
    setSlug(item.slug);
    setDate(item.date ? new Date(item.date).toISOString().split('T')[0] : '');
    setEndDate(item.endDate ? new Date(item.endDate).toISOString().split('T')[0] : '');
    setVenue(item.venue || '');
    setPullQuote(item.pullQuote || '');
    setRegistrationLink(item.registrationLink || '');
    setImage(item.image);
    setDescriptionHtml(item.descriptionHtml || '');
    setStatus(item.status);
    setIsFormOpen(true);
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!editingItem) {
      setSlug(slugify(val));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !slug || !date || !image || !descriptionHtml) {
      toastError('Please complete all required fields including cover image.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title,
        slug,
        date: new Date(date),
        endDate: endDate ? new Date(endDate) : undefined,
        venue,
        pullQuote,
        registrationLink,
        image,
        descriptionHtml,
        status,
      };

      const url = editingItem
        ? `/api/admin/activities/${editingItem._id}`
        : '/api/admin/activities';
      const method = editingItem ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save activity');
      }

      success(
        editingItem
          ? 'Film roll updated successfully.'
          : 'New film roll exposed and registered.'
      );
      setIsFormOpen(false);
      fetchActivities();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Operation failed.';
      toastError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleStatus = async (item: ActivityItem) => {
    const newStatus = item.status === 'published' ? 'draft' : 'published';
    try {
      const res = await fetch(`/api/admin/activities/${item._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...item,
          status: newStatus,
        }),
      });
      if (res.ok) {
        success(`Status updated to ${newStatus}.`);
        setActivities((prev) =>
          prev.map((a) => (a._id === item._id ? { ...a, status: newStatus } : a))
        );
      }
    } catch {
      toastError('Failed to toggle status.');
    }
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    setDeletingLoading(true);
    try {
      const res = await fetch(`/api/admin/activities/${deletingId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        success('Film roll and cover photograph expunged.');
        setActivities((prev) => prev.filter((a) => a._id !== deletingId));
      } else {
        throw new Error('Failed to delete');
      }
    } catch {
      toastError('Failed to delete activity.');
    } finally {
      setDeletingLoading(false);
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-charcoal-border">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="amber">FRAME 01 // FILM ROLLS</Badge>
            <span className="font-mono text-xs text-offwhite-dim">
              {activities.length} Exposures Recorded
            </span>
          </div>
          <h1 className="font-title text-2xl sm:text-3xl font-black text-offwhite">
            Activities & Workshops
          </h1>
          <p className="font-body text-xs text-offwhite-dim">
            Curate photo walks, campus exhibitions, and workshop registration links.
          </p>
        </div>

        <Button onClick={openCreateForm} variant="primary" size="sm">
          <Plus className="w-3.5 h-3.5" />
          Expose New Film Roll
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-offwhite-muted pointer-events-none" />
          <input
            type="text"
            placeholder="Search activities by title, venue, or slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-charcoal border border-charcoal-border text-xs font-mono text-offwhite placeholder:text-offwhite-muted/50 focus:outline-none focus:border-amber transition-colors"
          />
        </div>

        <div className="flex gap-2">
          {['', 'published', 'draft'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-2 rounded-xl text-xs font-mono uppercase transition-all ${
                statusFilter === s
                  ? 'bg-amber text-black font-semibold shadow-md'
                  : 'bg-charcoal border border-charcoal-border text-offwhite-dim hover:text-offwhite'
              }`}
            >
              {s || 'All Status'}
            </button>
          ))}
        </div>
      </div>

      {/* Activities Grid / Table */}
      {loading ? (
        <div className="p-16 text-center font-mono text-xs text-amber animate-pulse">
          READING FILM ROLL NEGATIVES...
        </div>
      ) : activities.length === 0 ? (
        <div className="p-16 rounded-3xl bg-charcoal/40 border border-charcoal-border text-center space-y-3">
          <Calendar className="w-8 h-8 text-offwhite-muted mx-auto" />
          <p className="font-mono text-xs text-offwhite">No film rolls found.</p>
          <Button onClick={openCreateForm} variant="outline" size="sm">
            Create First Activity
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {activities.map((item) => (
            <div
              key={item._id}
              className="rounded-3xl bg-charcoal/80 border border-charcoal-border hover:border-amber/40 transition-all overflow-hidden flex flex-col group shadow-lg"
            >
              {/* Cover Image Frame */}
              <div className="relative aspect-video w-full bg-black">
                {item.image?.url && (
                  <Image
                    src={item.image.url}
                    alt={item.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                )}
                <div className="absolute top-3 right-3 flex items-center gap-1.5">
                  <button
                    onClick={() => toggleStatus(item)}
                    aria-label={`Toggle ${item.status}`}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase backdrop-blur-md shadow-md border ${
                      item.status === 'published'
                        ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                        : 'bg-safelight/20 border-safelight/40 text-[#ff8078]'
                    }`}
                  >
                    {item.status}
                  </button>
                </div>
              </div>

              {/* Details */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-3 font-mono text-[11px] text-amber">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(item.date).toLocaleDateString()}
                    </span>
                    {item.venue && (
                      <span className="inline-flex items-center gap-1 text-offwhite-dim truncate max-w-[150px]">
                        <MapPin className="w-3.5 h-3.5 text-offwhite-dim/60" />
                        {item.venue}
                      </span>
                    )}
                  </div>
                  <h3 className="font-title text-lg font-bold text-offwhite group-hover:text-amber transition-colors line-clamp-2">
                    {item.title}
                  </h3>
                  {item.pullQuote && (
                    <p className="font-body text-xs text-offwhite-dim italic line-clamp-2">
                      &quot;{item.pullQuote}&quot;
                    </p>
                  )}
                </div>

                {/* Card Actions */}
                <div className="pt-3 border-t border-charcoal-border flex items-center justify-between gap-2">
                  <span className="font-mono text-[10px] text-offwhite-dim/50 truncate">
                    /{item.slug}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditForm(item)}
                      aria-label="Edit roll"
                      className="p-2 rounded-xl bg-charcoal border border-charcoal-border text-offwhite-dim hover:text-amber hover:border-amber/40 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        setDeletingId(item._id);
                        setDeletingTitle(item.title);
                      }}
                      aria-label="Delete roll"
                      className="p-2 rounded-xl bg-charcoal border border-charcoal-border text-offwhite-dim hover:text-safelight hover:border-safelight/40 transition-colors"
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

      {/* Create / Edit Modal Form */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="my-8 w-full max-w-3xl rounded-3xl bg-charcoal border border-charcoal-border p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-charcoal-border">
              <div>
                <Badge variant="amber">
                  {editingItem ? 'EDIT FILM ROLL' : 'NEW FILM ROLL'}
                </Badge>
                <h2 className="font-title text-xl font-bold text-offwhite mt-1">
                  {editingItem ? editingItem.title : 'Expose New Activity'}
                </h2>
              </div>
              <button
                onClick={() => setIsFormOpen(false)}
                aria-label="Close form"
                className="p-2 rounded-xl text-offwhite-dim hover:text-offwhite hover:bg-charcoal-subtle transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Title */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="block font-mono text-[11px] uppercase tracking-wider text-offwhite-dim">
                    Activity Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Annual Photo Walk: Brahmaputra Light"
                    value={title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl bg-black/60 border border-charcoal-border text-sm text-offwhite focus:outline-none focus:border-amber transition-colors"
                  />
                </div>

                {/* Slug */}
                <div className="space-y-1.5">
                  <label className="block font-mono text-[11px] uppercase tracking-wider text-offwhite-dim">
                    URL Slug *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="annual-photo-walk"
                    value={slug}
                    onChange={(e) => setSlug(slugify(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-2xl bg-black/60 border border-charcoal-border text-xs font-mono text-offwhite focus:outline-none focus:border-amber transition-colors"
                  />
                </div>

                {/* Venue */}
                <div className="space-y-1.5">
                  <label className="block font-mono text-[11px] uppercase tracking-wider text-offwhite-dim">
                    Venue / Location
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. GCU Campus Amphitheater"
                    value={venue}
                    onChange={(e) => setVenue(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl bg-black/60 border border-charcoal-border text-sm text-offwhite focus:outline-none focus:border-amber transition-colors"
                  />
                </div>

                {/* Date */}
                <div className="space-y-1.5">
                  <label className="block font-mono text-[11px] uppercase tracking-wider text-offwhite-dim">
                    Event Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl bg-black/60 border border-charcoal-border text-sm text-offwhite focus:outline-none focus:border-amber transition-colors"
                  />
                </div>

                {/* End Date */}
                <div className="space-y-1.5">
                  <label className="block font-mono text-[11px] uppercase tracking-wider text-offwhite-dim">
                    End Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl bg-black/60 border border-charcoal-border text-sm text-offwhite focus:outline-none focus:border-amber transition-colors"
                  />
                </div>

                {/* Pull Quote */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="block font-mono text-[11px] uppercase tracking-wider text-offwhite-dim">
                    Pull Quote / Headline Subtext
                  </label>
                  <input
                    type="text"
                    placeholder="Capturing dawn mist over the river."
                    value={pullQuote}
                    onChange={(e) => setPullQuote(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl bg-black/60 border border-charcoal-border text-sm text-offwhite focus:outline-none focus:border-amber transition-colors"
                  />
                </div>

                {/* Registration Link */}
                <div className="space-y-1.5">
                  <label className="block font-mono text-[11px] uppercase tracking-wider text-offwhite-dim">
                    Registration Link (URL)
                  </label>
                  <input
                    type="url"
                    placeholder="https://forms.google.com/..."
                    value={registrationLink}
                    onChange={(e) => setRegistrationLink(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl bg-black/60 border border-charcoal-border text-sm text-offwhite focus:outline-none focus:border-amber transition-colors"
                  />
                </div>

                {/* Status Toggle */}
                <div className="space-y-1.5">
                  <label className="block font-mono text-[11px] uppercase tracking-wider text-offwhite-dim">
                    Publication Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as 'draft' | 'published')}
                    className="w-full px-4 py-2.5 rounded-2xl bg-black/60 border border-charcoal-border text-sm text-offwhite focus:outline-none focus:border-amber transition-colors"
                  >
                    <option value="published">Published (Live to World)</option>
                    <option value="draft">Draft (Darkroom Only)</option>
                  </select>
                </div>
              </div>

              {/* Cloudinary Cover Image */}
              <CloudinaryUploader
                value={image}
                onChange={setImage}
                label="Cover Photograph (Cloudinary) *"
                aspectRatio="video"
                folder="shutterscape/activities"
              />

              {/* Tiptap Rich Text Description */}
              <RichTextEditor
                value={descriptionHtml}
                onChange={setDescriptionHtml}
                label="Exhibition / Activity Narrative *"
              />

              {/* Actions */}
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
                      Saving Roll...
                    </span>
                  ) : editingItem ? (
                    'Update Film Roll'
                  ) : (
                    'Expose Film Roll'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={!!deletingId}
        title={deletingTitle}
        loading={deletingLoading}
        onConfirm={confirmDelete}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  );
}
