'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Plus,
  BookOpen,
  Edit2,
  Trash2,
  X,
  Download,
  ArrowUp,
  ArrowDown,
  ExternalLink,
} from 'lucide-react';
import { useToast } from '@/components/admin/Toast';
import { CloudinaryUploader, ImageAsset } from '@/components/admin/CloudinaryUploader';
import { DeleteModal } from '@/components/admin/DeleteModal';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { slugify } from '@/lib/utils';

interface FrameItem {
  galleryItemId?: string;
  imageUrl: string;
  caption?: string;
  narration?: string;
  order: number;
}

interface PhotoStoryItem {
  _id: string;
  title: string;
  slug: string;
  curatorName: string;
  description: string;
  coverImageUrl: string;
  frames: FrameItem[];
  status: 'draft' | 'published';
  createdAt: string;
}

export default function AdminStoriesPage() {
  const { success, error: toastError } = useToast();
  const [stories, setStories] = useState<PhotoStoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PhotoStoryItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form Fields
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [curatorName, setCuratorName] = useState('');
  const [description, setDescription] = useState('');
  const [coverAsset, setCoverAsset] = useState<ImageAsset | null>(null);
  const [frames, setFrames] = useState<FrameItem[]>([]);
  const [status, setStatus] = useState<'draft' | 'published'>('published');

  // Delete State
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deletingTitle, setDeletingTitle] = useState('');
  const [deletingLoading, setDeletingLoading] = useState(false);

  const fetchStories = React.useCallback(async () => {
    try {
      const res = await fetch('/api/admin/stories');
      const data = await res.json();
      if (data.success) {
        setStories(data.stories);
      }
    } catch {
      toastError('Failed to load photo stories.');
    } finally {
      setLoading(false);
    }
  }, [toastError]);

  useEffect(() => {
    fetchStories();
  }, [fetchStories]);

  const openCreateForm = () => {
    setEditingItem(null);
    setTitle('');
    setSlug('');
    setCuratorName('Curator Team');
    setDescription('');
    setCoverAsset(null);
    setFrames([
      {
        imageUrl: '',
        caption: 'Frame 01 // Introduction',
        narration: 'Begin the visual chronicle here...',
        order: 1,
      },
    ]);
    setStatus('published');
    setIsFormOpen(true);
  };

  const openEditForm = (item: PhotoStoryItem) => {
    setEditingItem(item);
    setTitle(item.title);
    setSlug(item.slug);
    setCuratorName(item.curatorName);
    setDescription(item.description);
    setCoverAsset({ url: item.coverImageUrl, publicId: 'legacy' });
    setFrames(item.frames || []);
    setStatus(item.status);
    setIsFormOpen(true);
  };

  const addFrame = () => {
    setFrames((prev) => [
      ...prev,
      {
        imageUrl: '',
        caption: `Frame ${String(prev.length + 1).padStart(2, '0')}`,
        narration: '',
        order: prev.length + 1,
      },
    ]);
  };

  const updateFrame = (index: number, field: keyof FrameItem, val: any) => {
    setFrames((prev) =>
      prev.map((f, i) => (i === index ? { ...f, [field]: val } : f))
    );
  };

  const removeFrame = (index: number) => {
    if (frames.length <= 1) {
      toastError('A photo story must retain at least one frame.');
      return;
    }
    setFrames((prev) => prev.filter((_, i) => i !== index));
  };

  const moveFrame = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === frames.length - 1)
    ) {
      return;
    }
    const newFrames = [...frames];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const temp = newFrames[index];
    newFrames[index] = newFrames[targetIndex];
    newFrames[targetIndex] = temp;
    // Update order numbers
    newFrames.forEach((f, idx) => (f.order = idx + 1));
    setFrames(newFrames);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !slug || !description || !coverAsset) {
      toastError('Title, slug, description, and cover image are required.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title,
        slug,
        curatorName,
        description,
        coverImageUrl: coverAsset.url,
        frames: frames.filter((f) => f.imageUrl),
        status,
      };

      const url = editingItem
        ? `/api/admin/stories/${editingItem._id}`
        : '/api/admin/stories';
      const method = editingItem ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save story');

      success(editingItem ? 'Photo story updated.' : 'Photo story published.');
      setIsFormOpen(false);
      fetchStories();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save story';
      toastError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    setDeletingLoading(true);
    try {
      const res = await fetch(`/api/admin/stories/${deletingId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        success('Photo story expunged.');
        setStories((prev) => prev.filter((s) => s._id !== deletingId));
      }
    } catch {
      toastError('Failed to delete story.');
    } finally {
      setDeletingLoading(false);
      setDeletingId(null);
    }
  };

  const exportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(stories, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = `shutterscape-stories-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-charcoal-border">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="amber">FRAME 03 // PHOTO STORIES</Badge>
            <span className="font-mono text-xs text-offwhite-dim">
              {stories.length} Serial Narratives
            </span>
          </div>
          <h1 className="font-title text-2xl sm:text-3xl font-black text-offwhite">
            Photo Stories & Chronicles
          </h1>
          <p className="font-body text-xs text-offwhite-dim">
            Curate multi-frame narrated exhibitions that trace campus life from dawn to midnight.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={exportJson} variant="secondary" size="sm" className="gap-2">
            <Download className="w-3.5 h-3.5" />
            Export JSON
          </Button>
          <Button onClick={openCreateForm} variant="primary" size="sm" className="gap-2">
            <Plus className="w-3.5 h-3.5" />
            Curate Photo Story
          </Button>
        </div>
      </div>

      {/* Stories Grid */}
      {loading ? (
        <div className="p-16 text-center font-mono text-xs text-amber animate-pulse">
          LOADING PHOTO STORIES...
        </div>
      ) : stories.length === 0 ? (
        <div className="p-16 rounded-3xl bg-charcoal/40 border border-charcoal-border text-center space-y-3">
          <BookOpen className="w-8 h-8 text-offwhite-muted mx-auto" />
          <p className="font-mono text-xs text-offwhite">No photo stories created yet.</p>
          <Button onClick={openCreateForm} variant="outline" size="sm">
            Curate First Story
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {stories.map((story) => (
            <div
              key={story._id}
              className="rounded-3xl bg-charcoal/80 border border-charcoal-border hover:border-amber/40 transition-all overflow-hidden flex flex-col group shadow-lg"
            >
              <div className="relative aspect-video w-full bg-black">
                {story.coverImageUrl && (
                  <Image
                    src={story.coverImageUrl}
                    alt={story.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                )}
                <div className="absolute top-3 right-3 flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-black/70 backdrop-blur-md border border-charcoal-border text-amber">
                    {story.frames?.length || 0} Frames
                  </span>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-1">
                  <h3 className="font-title text-base font-bold text-offwhite group-hover:text-amber transition-colors line-clamp-1">
                    {story.title}
                  </h3>
                  <p className="font-mono text-[11px] text-offwhite-dim">
                    Curated by {story.curatorName}
                  </p>
                  <p className="font-body text-xs text-offwhite-dim/80 line-clamp-2">
                    {story.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-charcoal-border flex items-center justify-between">
                  <Link
                    href={`/gallery?tab=stories`}
                    target="_blank"
                    className="font-mono text-[10px] text-amber hover:underline inline-flex items-center gap-1"
                  >
                    View in Darkroom <ExternalLink className="w-2.5 h-2.5" />
                  </Link>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditForm(story)}
                      aria-label="Edit story"
                      className="p-1.5 rounded-lg bg-charcoal border border-charcoal-border text-offwhite-dim hover:text-amber hover:border-amber/40 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        setDeletingId(story._id);
                        setDeletingTitle(story.title);
                      }}
                      aria-label="Delete story"
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

      {/* Modal Form */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="my-8 w-full max-w-3xl rounded-3xl bg-charcoal border border-charcoal-border p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-charcoal-border">
              <div>
                <Badge variant="amber">
                  {editingItem ? 'EDIT PHOTO STORY' : 'NEW PHOTO STORY'}
                </Badge>
                <h2 className="font-title text-xl font-bold text-offwhite mt-1">
                  {editingItem ? editingItem.title : 'Curate Visual Chronicle'}
                </h2>
              </div>
              <button
                onClick={() => setIsFormOpen(false)}
                aria-label="Close"
                className="p-2 rounded-xl text-offwhite-dim hover:text-offwhite transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1 sm:col-span-2">
                  <label className="block font-mono text-[11px] uppercase text-offwhite-dim">
                    Story Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value);
                      if (!editingItem) setSlug(slugify(e.target.value));
                    }}
                    placeholder="e.g. 24 Hours Under the Rain Trees"
                    className="w-full px-4 py-2.5 rounded-2xl bg-black/60 border border-charcoal-border text-sm text-offwhite focus:outline-none focus:border-amber transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-mono text-[11px] uppercase text-offwhite-dim">
                    URL Slug *
                  </label>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => setSlug(slugify(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-2xl bg-black/60 border border-charcoal-border text-xs font-mono text-offwhite focus:outline-none focus:border-amber transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-mono text-[11px] uppercase text-offwhite-dim">
                    Curator Name
                  </label>
                  <input
                    type="text"
                    value={curatorName}
                    onChange={(e) => setCuratorName(e.target.value)}
                    placeholder="e.g. Debashis Hazarika"
                    className="w-full px-4 py-2.5 rounded-2xl bg-black/60 border border-charcoal-border text-sm text-offwhite focus:outline-none focus:border-amber transition-colors"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="block font-mono text-[11px] uppercase text-offwhite-dim">
                    Overview Description *
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief background and narrative arc for this photo story..."
                    className="w-full px-4 py-2.5 rounded-2xl bg-black/60 border border-charcoal-border text-sm text-offwhite focus:outline-none focus:border-amber transition-colors resize-none"
                  />
                </div>
              </div>

              <CloudinaryUploader
                value={coverAsset}
                onChange={setCoverAsset}
                label="Story Cover Photograph *"
                aspectRatio="video"
                folder="shutterscape/stories"
              />

              {/* Frames Builder */}
              <div className="space-y-4 pt-2 border-t border-charcoal-border">
                <div className="flex items-center justify-between">
                  <h3 className="font-mono text-xs uppercase tracking-wider text-amber font-bold">
                    Story Frames Sequence ({frames.length} frames)
                  </h3>
                  <Button type="button" onClick={addFrame} variant="secondary" size="sm">
                    <Plus className="w-3.5 h-3.5" /> Add Frame
                  </Button>
                </div>

                <div className="space-y-3">
                  {frames.map((frame, index) => (
                    <div
                      key={index}
                      className="p-4 rounded-2xl bg-black/50 border border-charcoal-border space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs text-amber font-bold">
                          Frame #{index + 1}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => moveFrame(index, 'up')}
                            disabled={index === 0}
                            className="p-1 rounded bg-charcoal text-offwhite-dim hover:text-offwhite disabled:opacity-30"
                          >
                            <ArrowUp className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveFrame(index, 'down')}
                            disabled={index === frames.length - 1}
                            className="p-1 rounded bg-charcoal text-offwhite-dim hover:text-offwhite disabled:opacity-30"
                          >
                            <ArrowDown className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeFrame(index)}
                            className="p-1 rounded bg-charcoal text-safelight hover:bg-safelight/20"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-mono text-offwhite-dim uppercase mb-1">
                            Photograph Image URL *
                          </label>
                          <input
                            type="url"
                            required
                            value={frame.imageUrl}
                            onChange={(e) => updateFrame(index, 'imageUrl', e.target.value)}
                            placeholder="https://images.unsplash.com/..."
                            className="w-full px-3 py-1.5 rounded-xl bg-charcoal border border-charcoal-border text-xs text-offwhite focus:outline-none focus:border-amber"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-mono text-offwhite-dim uppercase mb-1">
                            Caption
                          </label>
                          <input
                            type="text"
                            value={frame.caption || ''}
                            onChange={(e) => updateFrame(index, 'caption', e.target.value)}
                            placeholder="e.g. 07:15 AM — Dew on amphitheatre"
                            className="w-full px-3 py-1.5 rounded-xl bg-charcoal border border-charcoal-border text-xs text-offwhite focus:outline-none focus:border-amber"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-[10px] font-mono text-offwhite-dim uppercase mb-1">
                            Narration Paragraph
                          </label>
                          <textarea
                            rows={2}
                            value={frame.narration || ''}
                            onChange={(e) => updateFrame(index, 'narration', e.target.value)}
                            placeholder="The narrative text displayed alongside this frame..."
                            className="w-full px-3 py-1.5 rounded-xl bg-charcoal border border-charcoal-border text-xs text-offwhite focus:outline-none focus:border-amber resize-none"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-charcoal-border">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsFormOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" disabled={submitting}>
                  {submitting ? 'Developing Story...' : editingItem ? 'Update Story' : 'Publish Story'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
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
