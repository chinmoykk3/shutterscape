'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Plus,
  ArrowUp,
  ArrowDown,
  Edit2,
  Trash2,
  Film,
  X,
  Loader2,
  Save,
} from 'lucide-react';
import { useToast } from '@/components/admin/Toast';
import { CloudinaryUploader, ImageAsset } from '@/components/admin/CloudinaryUploader';
import { DeleteModal } from '@/components/admin/DeleteModal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface StorySceneType {
  _id: string;
  key: string;
  order: number;
  headline: string;
  bodyText: string;
  image?: ImageAsset;
  status: 'active' | 'disabled';
}

export default function AdminScenesPage() {
  const { success, error: toastError } = useToast();

  const [scenes, setScenes] = useState<StorySceneType[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasOrderChanges, setHasOrderChanges] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);

  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingScene, setEditingScene] = useState<StorySceneType | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form Inputs
  const [key, setKey] = useState('');
  const [headline, setHeadline] = useState('');
  const [bodyText, setBodyText] = useState('');
  const [order, setOrder] = useState(0);
  const [status, setStatus] = useState<'active' | 'disabled'>('active');
  const [image, setImage] = useState<ImageAsset | null>(null);

  // Delete State
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deletingHeadline, setDeletingHeadline] = useState('');
  const [deletingLoading, setDeletingLoading] = useState(false);

  const fetchScenes = React.useCallback(async () => {
    try {
      const res = await fetch('/api/admin/scenes');
      const data = await res.json();
      if (data.success) {
        setScenes(data.scenes);
        setHasOrderChanges(false);
      }
    } catch {
      toastError('Failed to load story sequence.');
    } finally {
      setLoading(false);
    }
  }, [toastError]);

  useEffect(() => {
    fetchScenes();
  }, [fetchScenes]);

  const openCreateForm = () => {
    setEditingScene(null);
    setKey(`scene-${Date.now()}`);
    setHeadline(`Frame ${scenes.length + 1}: The Latent Image`);
    setBodyText('Before the silver crystals react, there is only anticipation...');
    setOrder(scenes.length + 1);
    setStatus('active');
    setImage(null);
    setIsFormOpen(true);
  };

  const openEditForm = (scene: StorySceneType) => {
    setEditingScene(scene);
    setKey(scene.key);
    setHeadline(scene.headline);
    setBodyText(scene.bodyText);
    setOrder(scene.order);
    setStatus(scene.status);
    setImage(scene.image || null);
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!key || !headline || !bodyText) {
      toastError('Key, headline, and body narrative are required.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        key,
        headline,
        bodyText,
        order: Number(order) || 0,
        status,
        image: image || undefined,
      };

      const url = editingScene
        ? `/api/admin/scenes/${editingScene._id}`
        : '/api/admin/scenes';
      const method = editingScene ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save story scene');
      }

      success(
        editingScene ? 'Scene narrative updated.' : 'New prologue scene created.'
      );
      setIsFormOpen(false);
      fetchScenes();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Operation failed.';
      toastError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const moveOrder = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= scenes.length) return;

    const newScenes = [...scenes];
    const temp = newScenes[index];
    newScenes[index] = newScenes[targetIndex];
    newScenes[targetIndex] = temp;

    const updated = newScenes.map((s, idx) => ({
      ...s,
      order: idx + 1,
    }));

    setScenes(updated);
    setHasOrderChanges(true);
  };

  const saveReorderedSequence = async () => {
    setSavingOrder(true);
    try {
      const items = scenes.map((s) => ({ id: s._id, order: s.order }));
      const res = await fetch('/api/admin/scenes/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      });

      if (!res.ok) throw new Error('Failed to update sequence');
      success('Prologue narrative sequence saved.');
      setHasOrderChanges(false);
    } catch {
      toastError('Failed to save scene sequence.');
    } finally {
      setSavingOrder(false);
    }
  };

  const toggleStatus = async (scene: StorySceneType) => {
    const newStatus = scene.status === 'active' ? 'disabled' : 'active';
    try {
      const res = await fetch(`/api/admin/scenes/${scene._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...scene,
          status: newStatus,
        }),
      });
      if (res.ok) {
        setScenes((prev) =>
          prev.map((s) => (s._id === scene._id ? { ...s, status: newStatus } : s))
        );
        success(`Scene status set to ${newStatus}.`);
      }
    } catch {
      toastError('Failed to toggle scene status.');
    }
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    setDeletingLoading(true);
    try {
      const res = await fetch(`/api/admin/scenes/${deletingId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        success('Story scene purged.');
        setScenes((prev) => prev.filter((s) => s._id !== deletingId));
      }
    } catch {
      toastError('Failed to delete scene.');
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
            <Badge variant="amber">FRAME 04 // NARRATIVE</Badge>
            <span className="font-mono text-xs text-offwhite-dim">
              {scenes.length} Sequence Frames
            </span>
          </div>
          <h1 className="font-title text-2xl sm:text-3xl font-black text-offwhite">
            Homepage Story Scenes
          </h1>
          <p className="font-body text-xs text-offwhite-dim">
            Curate the scroll-driven darkroom prologue sequence that welcomes visitors.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {hasOrderChanges && (
            <Button
              onClick={saveReorderedSequence}
              variant="outline"
              size="sm"
              disabled={savingOrder}
              className="border-emerald-500 text-emerald-400 hover:bg-emerald-500/10"
            >
              {savingOrder ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              Save Scene Sequence
            </Button>
          )}
          <Button onClick={openCreateForm} variant="primary" size="sm">
            <Plus className="w-3.5 h-3.5" />
            Add Story Scene
          </Button>
        </div>
      </div>

      {/* Scenes List */}
      {loading ? (
        <div className="p-16 text-center font-mono text-xs text-amber animate-pulse">
          ARRANGING NARRATIVE PRINTS...
        </div>
      ) : scenes.length === 0 ? (
        <div className="p-16 rounded-3xl bg-charcoal/40 border border-charcoal-border text-center space-y-3">
          <Film className="w-8 h-8 text-offwhite-muted mx-auto" />
          <p className="font-mono text-xs text-offwhite">No story scenes defined.</p>
          <Button onClick={openCreateForm} variant="outline" size="sm">
            Create First Scene
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {scenes.map((scene, index) => (
            <div
              key={scene._id}
              className="p-5 rounded-3xl bg-charcoal/80 border border-charcoal-border hover:border-amber/40 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-5 group shadow-lg"
            >
              <div className="flex items-start gap-4">
                {/* Scene Image Preview */}
                <div className="relative w-28 h-20 shrink-0 rounded-2xl overflow-hidden bg-black border border-charcoal-border">
                  {scene.image?.url ? (
                    <Image
                      src={scene.image.url}
                      alt={scene.headline}
                      fill
                      sizes="112px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-offwhite-dim/40 font-mono text-[10px]">
                      NO IMAGE
                    </div>
                  )}
                </div>

                {/* Narrative Details */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-amber font-bold">
                      FRAME 0{scene.order}
                    </span>
                    <button
                      onClick={() => toggleStatus(scene)}
                      className={`px-2 py-0.5 rounded-md text-[9px] font-mono font-bold uppercase border ${
                        scene.status === 'active'
                          ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                          : 'bg-safelight/20 border-safelight/40 text-[#ff8078]'
                      }`}
                    >
                      {scene.status}
                    </button>
                    <span className="font-mono text-[10px] text-offwhite-dim/40">
                      key: {scene.key}
                    </span>
                  </div>
                  <h3 className="font-title text-base font-bold text-offwhite group-hover:text-amber transition-colors">
                    {scene.headline}
                  </h3>
                  <p className="font-body text-xs text-offwhite-dim max-w-xl line-clamp-2">
                    {scene.bodyText}
                  </p>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-2 self-end md:self-center">
                <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-charcoal-border">
                  <button
                    onClick={() => moveOrder(index, 'up')}
                    disabled={index === 0}
                    aria-label="Move sequence up"
                    className="p-1.5 rounded-lg text-offwhite-dim hover:text-amber disabled:opacity-20 transition-colors"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => moveOrder(index, 'down')}
                    disabled={index === scenes.length - 1}
                    aria-label="Move sequence down"
                    className="p-1.5 rounded-lg text-offwhite-dim hover:text-amber disabled:opacity-20 transition-colors"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  onClick={() => openEditForm(scene)}
                  aria-label="Edit scene"
                  className="p-2 rounded-xl bg-charcoal border border-charcoal-border text-offwhite-dim hover:text-amber hover:border-amber/40 transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    setDeletingId(scene._id);
                    setDeletingHeadline(scene.headline);
                  }}
                  aria-label="Delete scene"
                  className="p-2 rounded-xl bg-charcoal border border-charcoal-border text-offwhite-dim hover:text-safelight hover:border-safelight/40 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="my-8 w-full max-w-xl rounded-3xl bg-charcoal border border-charcoal-border p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-charcoal-border">
              <div>
                <Badge variant="amber">
                  {editingScene ? 'EDIT SCENE' : 'NEW SCENE'}
                </Badge>
                <h2 className="font-title text-xl font-bold text-offwhite mt-1">
                  {editingScene ? editingScene.headline : 'Create Story Scene'}
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

            <form onSubmit={handleSubmit} className="space-y-4">
              <CloudinaryUploader
                value={image}
                onChange={setImage}
                label="Scene Photograph (Optional)"
                aspectRatio="video"
                folder="shutterscape/scenes"
              />

              <div className="space-y-1">
                <label className="block font-mono text-[11px] uppercase tracking-wider text-offwhite-dim">
                  Unique Scene Key *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. scene-aperture-first-light"
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-black/60 border border-charcoal-border text-xs font-mono text-offwhite focus:outline-none focus:border-amber transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-mono text-[11px] uppercase tracking-wider text-offwhite-dim">
                  Headline *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Frame I: The Latent Image"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-black/60 border border-charcoal-border text-sm text-offwhite focus:outline-none focus:border-amber transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-mono text-[11px] uppercase tracking-wider text-offwhite-dim">
                  Narrative Body Text *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Describe the photographic narrative for this scroll step..."
                  value={bodyText}
                  onChange={(e) => setBodyText(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-black/60 border border-charcoal-border text-sm text-offwhite focus:outline-none focus:border-amber transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block font-mono text-[11px] uppercase tracking-wider text-offwhite-dim">
                    Sequence Order
                  </label>
                  <input
                    type="number"
                    value={order}
                    onChange={(e) => setOrder(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-2xl bg-black/60 border border-charcoal-border text-sm text-offwhite focus:outline-none focus:border-amber transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-mono text-[11px] uppercase tracking-wider text-offwhite-dim">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as 'active' | 'disabled')}
                    className="w-full px-4 py-2.5 rounded-2xl bg-black/60 border border-charcoal-border text-sm text-offwhite focus:outline-none focus:border-amber transition-colors"
                  >
                    <option value="active">Active (Visible)</option>
                    <option value="disabled">Disabled (Hidden)</option>
                  </select>
                </div>
              </div>

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
                      Saving...
                    </span>
                  ) : editingScene ? (
                    'Update Scene'
                  ) : (
                    'Add Scene'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      <DeleteModal
        isOpen={!!deletingId}
        title={deletingHeadline}
        loading={deletingLoading}
        onConfirm={confirmDelete}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  );
}
