'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Plus,
  Search,
  Calendar,
  MapPin,
  Edit2,
  Trash2,
  X,
  Loader2,
  History,
  Clock,
  Eye,
  Camera,
} from 'lucide-react';
import { useToast } from '@/components/admin/Toast';
import { CloudinaryUploader, ImageAsset } from '@/components/admin/CloudinaryUploader';
import { MultiPhotoUploader, ActivityGalleryItem } from '@/components/admin/MultiPhotoUploader';
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
  gallery?: ActivityGalleryItem[];
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
  const [timelineFilter, setTimelineFilter] = useState<'all' | 'upcoming' | 'past'>('all');

  // Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ActivityItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form Fields
  const [eventTiming, setEventTiming] = useState<'upcoming' | 'past'>('upcoming');
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [date, setDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [venue, setVenue] = useState('');
  const [pullQuote, setPullQuote] = useState('');
  const [registrationLink, setRegistrationLink] = useState('');
  const [image, setImage] = useState<ImageAsset | null>(null);
  const [gallery, setGallery] = useState<ActivityGalleryItem[]>([]);
  const [descriptionHtml, setDescriptionHtml] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>('published');

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

  const [nowTimestamp, setNowTimestamp] = useState<number>(0);

  useEffect(() => {
    fetchActivities();
    setNowTimestamp(Date.now());
  }, [fetchActivities]);

  // Filter activities by timeline (upcoming vs past)
  const filteredActivities = useMemo(() => {
    return activities.filter((act) => {
      const actTime = new Date(act.date).getTime();
      const refTime = nowTimestamp || 1700000000000;
      if (timelineFilter === 'upcoming') {
        return actTime > refTime;
      }
      if (timelineFilter === 'past') {
        return actTime <= refTime;
      }
      return true;
    });
  }, [activities, timelineFilter, nowTimestamp]);

  const upcomingCount = useMemo(() => {
    const refTime = nowTimestamp || 1700000000000;
    return activities.filter((a) => new Date(a.date).getTime() > refTime).length;
  }, [activities, nowTimestamp]);

  const pastCount = useMemo(() => {
    const refTime = nowTimestamp || 1700000000000;
    return activities.filter((a) => new Date(a.date).getTime() <= refTime).length;
  }, [activities, nowTimestamp]);

  const openCreateForm = (timing: 'upcoming' | 'past' = 'upcoming') => {
    setEditingItem(null);
    setEventTiming(timing);
    setTitle('');
    setSlug('');

    if (timing === 'past') {
      // Default to 6 months ago for past events
      const pastDate = new Date();
      pastDate.setMonth(pastDate.getMonth() - 6);
      setDate(pastDate.toISOString().split('T')[0]);
      setPullQuote('Archived visual journal from our completed campus expedition.');
      setRegistrationLink('');
      setDescriptionHtml(
        '<p>Detailed retrospective and photo summary of this completed photographic exhibition / workshop...</p>'
      );
    } else {
      // Future date for upcoming events
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 14);
      setDate(futureDate.toISOString().split('T')[0]);
      setPullQuote('');
      setRegistrationLink('');
      setDescriptionHtml(
        '<p>Write assignment brief, equipment requirements, and schedule itinerary here...</p>'
      );
    }

    setEndDate('');
    setVenue('GCU Campus, Azara');
    setImage(null);
    setGallery([]);
    setStatus('published');
    setIsFormOpen(true);
  };

  const openEditForm = (item: ActivityItem) => {
    setEditingItem(item);
    const isPast = new Date(item.date).getTime() <= Date.now();
    setEventTiming(isPast ? 'past' : 'upcoming');
    setTitle(item.title);
    setSlug(item.slug);
    setDate(item.date ? new Date(item.date).toISOString().split('T')[0] : '');
    setEndDate(item.endDate ? new Date(item.endDate).toISOString().split('T')[0] : '');
    setVenue(item.venue || '');
    setPullQuote(item.pullQuote || '');
    setRegistrationLink(item.registrationLink || '');
    setImage(item.image);
    setGallery(item.gallery || []);
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

  const handleTimingChange = (newTiming: 'upcoming' | 'past') => {
    setEventTiming(newTiming);
    const currentDateVal = new Date(date).getTime();
    if (newTiming === 'past' && (!date || currentDateVal > Date.now())) {
      const pastDate = new Date();
      pastDate.setMonth(pastDate.getMonth() - 4);
      setDate(pastDate.toISOString().split('T')[0]);
    } else if (newTiming === 'upcoming' && (!date || currentDateVal <= Date.now())) {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 14);
      setDate(futureDate.toISOString().split('T')[0]);
    }
  };

  const setYearPreset = (year: number) => {
    setDate(`${year}-03-15`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !slug || !date || !image || !descriptionHtml) {
      toastError('Please complete all required fields including the cover image.');
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
        registrationLink: registrationLink || undefined,
        image,
        gallery,
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
          : eventTiming === 'past'
          ? 'Archived past event & negatives added to timeline.'
          : 'New upcoming expedition scheduled and published.'
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
            Activities &amp; Workshops
          </h1>
          <p className="font-body text-xs text-offwhite-dim">
            Curate photo walks, campus exhibitions, past photo albums, and registration links.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={() => openCreateForm('past')}
            variant="secondary"
            size="sm"
            className="gap-1.5"
          >
            <History className="w-3.5 h-3.5 text-amber" />
            Upload Previous Event
          </Button>

          <Button
            onClick={() => openCreateForm('upcoming')}
            variant="primary"
            size="sm"
            className="gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Expose New Event
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-3">
        {/* Timeline Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-[11px] uppercase tracking-wider text-offwhite-dim mr-1">
            Timeline:
          </span>
          <button
            onClick={() => setTimelineFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all flex items-center gap-1.5 ${
              timelineFilter === 'all'
                ? 'bg-amber text-black font-bold shadow-md'
                : 'bg-charcoal border border-charcoal-border text-offwhite-dim hover:text-offwhite'
            }`}
          >
            All Rolls ({activities.length})
          </button>
          <button
            onClick={() => setTimelineFilter('upcoming')}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all flex items-center gap-1.5 ${
              timelineFilter === 'upcoming'
                ? 'bg-amber text-black font-bold shadow-md'
                : 'bg-charcoal border border-charcoal-border text-offwhite-dim hover:text-offwhite'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Upcoming ({upcomingCount})
          </button>
          <button
            onClick={() => setTimelineFilter('past')}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all flex items-center gap-1.5 ${
              timelineFilter === 'past'
                ? 'bg-amber text-black font-bold shadow-md'
                : 'bg-charcoal border border-charcoal-border text-offwhite-dim hover:text-offwhite'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            Previous / Archive ({pastCount})
          </button>
        </div>

        {/* Search & Status Row */}
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
                    ? 'bg-offwhite text-black font-semibold shadow-md'
                    : 'bg-charcoal border border-charcoal-border text-offwhite-dim hover:text-offwhite'
                }`}
              >
                {s || 'All Status'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Activities Grid */}
      {loading ? (
        <div className="p-16 text-center font-mono text-xs text-amber animate-pulse">
          READING FILM ROLL NEGATIVES...
        </div>
      ) : filteredActivities.length === 0 ? (
        <div className="p-16 rounded-3xl bg-charcoal/40 border border-charcoal-border text-center space-y-3">
          <Calendar className="w-8 h-8 text-offwhite-muted mx-auto" />
          <p className="font-mono text-xs text-offwhite">
            {timelineFilter === 'past'
              ? 'No previous / archived events found.'
              : timelineFilter === 'upcoming'
              ? 'No upcoming events scheduled.'
              : 'No film rolls found.'}
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <Button onClick={() => openCreateForm('past')} variant="secondary" size="sm">
              <History className="w-3.5 h-3.5 mr-1" /> Add Previous Event
            </Button>
            <Button onClick={() => openCreateForm('upcoming')} variant="primary" size="sm">
              <Plus className="w-3.5 h-3.5 mr-1" /> Add Upcoming Event
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredActivities.map((item) => {
            const isPast = new Date(item.date).getTime() <= nowTimestamp;
            const galleryCount = item.gallery?.length || 0;

            return (
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

                  {/* Badges on Image */}
                  <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5">
                    {isPast ? (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase backdrop-blur-md shadow-md bg-blue-500/30 border border-blue-400/50 text-blue-200 flex items-center gap-1">
                        <History className="w-3 h-3" /> ARCHIVED EVENT
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase backdrop-blur-md shadow-md bg-amber/30 border border-amber/60 text-amber flex items-center gap-1">
                        <Clock className="w-3 h-3" /> UPCOMING
                      </span>
                    )}

                    {galleryCount > 0 && (
                      <span className="px-2 py-1 rounded-full text-[10px] font-mono font-bold uppercase backdrop-blur-md shadow-md bg-black/75 border border-white/20 text-offwhite flex items-center gap-1">
                        <Camera className="w-3 h-3 text-amber" /> {galleryCount} {galleryCount === 1 ? 'Photo' : 'Photos'}
                      </span>
                    )}
                  </div>

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
                        {new Date(item.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
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
                    <Link
                      href={`/activities/${item.slug}`}
                      target="_blank"
                      className="font-mono text-[11px] text-offwhite-dim/60 hover:text-amber transition-colors flex items-center gap-1 truncate"
                    >
                      <Eye className="w-3.5 h-3.5 text-amber shrink-0" />
                      <span className="truncate">View Public</span>
                    </Link>

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
            );
          })}
        </div>
      )}

      {/* Create / Edit Modal Form */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="my-4 sm:my-8 w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-3xl bg-charcoal border border-charcoal-border p-4 sm:p-8 shadow-2xl space-y-6">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-charcoal-border">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="amber">
                    {editingItem ? 'EDIT FILM ROLL' : 'NEW FILM ROLL'}
                  </Badge>
                  <span className="font-mono text-xs text-offwhite-dim">
                    {eventTiming === 'past' ? 'Archived Expedition' : 'Live Expedition'}
                  </span>
                </div>
                <h2 className="font-title text-xl font-bold text-offwhite">
                  {editingItem ? editingItem.title : eventTiming === 'past' ? 'Archive Past Event & Multi-Photo Album' : 'Expose New Activity'}
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

            {/* Event Timing Mode Toggle (Upcoming vs Past Event) */}
            <div className="p-4 rounded-2xl bg-black/60 border border-charcoal-border space-y-3">
              <label className="block font-mono text-[11px] uppercase tracking-wider text-offwhite-dim">
                Event Classification
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleTimingChange('upcoming')}
                  className={`p-3 rounded-2xl border text-left transition-all flex items-center gap-3 ${
                    eventTiming === 'upcoming'
                      ? 'bg-amber/15 border-amber text-offwhite shadow-md'
                      : 'bg-charcoal border-charcoal-border text-offwhite-dim hover:text-offwhite'
                  }`}
                >
                  <div className={`p-2 rounded-xl ${eventTiming === 'upcoming' ? 'bg-amber text-black' : 'bg-charcoal-subtle text-offwhite-dim'}`}>
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-title text-sm font-bold text-offwhite">Upcoming Assignment</p>
                    <p className="font-body text-[11px] text-offwhite-dim">Future photowalk or exhibition with registration active</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleTimingChange('past')}
                  className={`p-3 rounded-2xl border text-left transition-all flex items-center gap-3 ${
                    eventTiming === 'past'
                      ? 'bg-blue-500/15 border-blue-400 text-offwhite shadow-md'
                      : 'bg-charcoal border-charcoal-border text-offwhite-dim hover:text-offwhite'
                  }`}
                >
                  <div className={`p-2 rounded-xl ${eventTiming === 'past' ? 'bg-blue-400 text-black' : 'bg-charcoal-subtle text-offwhite-dim'}`}>
                    <History className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-title text-sm font-bold text-offwhite">Previous / Archived Event</p>
                    <p className="font-body text-[11px] text-offwhite-dim">Completed event; upload past multi-photo album &amp; negatives</p>
                  </div>
                </button>
              </div>
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
                    placeholder={
                      eventTiming === 'past'
                        ? 'e.g. Annual Photo Walk 2024: Brahmaputra Dawn'
                        : 'e.g. Monochrome Expressions: Darkroom Printing Workshop'
                    }
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
                    placeholder="annual-photo-walk-2024"
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
                    placeholder="e.g. Barduar Tea Estate / GCU Darkroom"
                    value={venue}
                    onChange={(e) => setVenue(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl bg-black/60 border border-charcoal-border text-sm text-offwhite focus:outline-none focus:border-amber transition-colors"
                  />
                </div>

                {/* Date & Past Year Presets */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block font-mono text-[11px] uppercase tracking-wider text-offwhite-dim">
                      {eventTiming === 'past' ? 'Event Date (Concluded) *' : 'Event Date *'}
                    </label>
                    {eventTiming === 'past' && (
                      <div className="flex items-center gap-1">
                        <span className="font-mono text-[10px] text-offwhite-dim/60">Quick year:</span>
                        {[2025, 2024, 2023, 2022].map((yr) => (
                          <button
                            type="button"
                            key={yr}
                            onClick={() => setYearPreset(yr)}
                            className="px-1.5 py-0.5 rounded bg-charcoal border border-charcoal-border hover:border-amber text-[10px] font-mono text-offwhite-dim hover:text-amber"
                          >
                            {yr}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
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
                    placeholder="e.g. Seeing your shot bloom in the chemicals is pure magic."
                    value={pullQuote}
                    onChange={(e) => setPullQuote(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl bg-black/60 border border-charcoal-border text-sm text-offwhite focus:outline-none focus:border-amber transition-colors"
                  />
                </div>

                {/* Registration Link */}
                <div className="space-y-1.5">
                  <label className="block font-mono text-[11px] uppercase tracking-wider text-offwhite-dim">
                    {eventTiming === 'past' ? 'Archive / Album Link (Optional)' : 'Registration Link (URL)'}
                  </label>
                  <input
                    type="url"
                    placeholder={
                      eventTiming === 'past'
                        ? 'Leave blank or link to Google Drive / press album'
                        : 'https://forms.google.com/...'
                    }
                    value={registrationLink}
                    onChange={(e) => setRegistrationLink(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl bg-black/60 border border-charcoal-border text-sm text-offwhite focus:outline-none focus:border-amber transition-colors"
                  />
                  {eventTiming === 'past' && (
                    <p className="font-mono text-[10px] text-offwhite-dim/60">
                      Registration is automatically closed on past dates.
                    </p>
                  )}
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

              {/* Cover Image Uploader */}
              <CloudinaryUploader
                value={image}
                onChange={setImage}
                label="Primary Cover Photograph (Cloudinary) *"
                helperText="Main featured poster/photo displayed in the timeline and hero viewfinder."
                aspectRatio="video"
                folder="shutterscape/activities"
              />

              {/* Multi-Photo Event Gallery Section */}
              <div className="p-5 rounded-3xl bg-black/40 border border-charcoal-border space-y-4">
                <MultiPhotoUploader
                  items={gallery}
                  onChange={setGallery}
                  folder="shutterscape/activities"
                  label={
                    eventTiming === 'past'
                      ? 'Archived Negatives & Event Gallery (Multiple Photos)'
                      : 'Event Gallery & Highlights (Multiple Photos)'
                  }
                  helperText="Upload as many photos as you want from this event. They will be displayed on the event page as an interactive 35mm contact sheet."
                />
              </div>

              {/* Rich Text Editor */}
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
                  ) : eventTiming === 'past' ? (
                    'Save Archived Event'
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
