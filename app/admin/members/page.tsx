'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Plus,
  Search,
  ArrowUp,
  ArrowDown,
  Edit2,
  Trash2,
  Users,
  X,
  Loader2,
  Save,
} from 'lucide-react';
import { useToast } from '@/components/admin/Toast';
import { CloudinaryUploader, ImageAsset } from '@/components/admin/CloudinaryUploader';
import { DeleteModal } from '@/components/admin/DeleteModal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface MemberType {
  _id: string;
  name: string;
  role: string;
  type: 'faculty' | 'core' | 'alumni';
  image: ImageAsset;
  batch?: string;
  quote?: string;
  order: number;
  status: 'active' | 'archived';
}

export default function AdminMembersPage() {
  const { success, error: toastError } = useToast();

  const [members, setMembers] = useState<MemberType[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [hasOrderChanges, setHasOrderChanges] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);

  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<MemberType | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Inputs
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [type, setType] = useState<'faculty' | 'core' | 'alumni'>('core');
  const [batch, setBatch] = useState('');
  const [quote, setQuote] = useState('');
  const [order, setOrder] = useState(0);
  const [status, setStatus] = useState<'active' | 'archived'>('active');
  const [image, setImage] = useState<ImageAsset | null>(null);

  // Delete State
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deletingName, setDeletingName] = useState('');
  const [deletingLoading, setDeletingLoading] = useState(false);

  const fetchMembers = React.useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (typeFilter) params.set('type', typeFilter);

      const res = await fetch(`/api/admin/members?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setMembers(data.members);
        setHasOrderChanges(false);
      }
    } catch {
      toastError('Failed to fetch club roster from database.');
    } finally {
      setLoading(false);
    }
  }, [search, typeFilter, toastError]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const openCreateForm = () => {
    setEditingMember(null);
    setName('');
    setRole('Core Member');
    setType('core');
    setBatch('');
    setQuote('');
    setOrder(members.length + 1);
    setStatus('active');
    setImage(null);
    setIsFormOpen(true);
  };

  const openEditForm = (m: MemberType) => {
    setEditingMember(m);
    setName(m.name);
    setRole(m.role);
    setType(m.type);
    setBatch(m.batch || '');
    setQuote(m.quote || '');
    setOrder(m.order);
    setStatus(m.status);
    setImage(m.image);
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !role || !image) {
      toastError('Name, role, and portrait photograph are required.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name,
        role,
        type,
        batch: type === 'alumni' ? batch : undefined,
        quote,
        order: Number(order) || 0,
        status,
        image,
      };

      const url = editingMember
        ? `/api/admin/members/${editingMember._id}`
        : '/api/admin/members';
      const method = editingMember ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save member');
      }

      success(
        editingMember ? 'Member details updated.' : 'New member added to roster.'
      );
      setIsFormOpen(false);
      fetchMembers();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Operation failed.';
      toastError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const moveOrder = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= members.length) return;

    const newMembers = [...members];
    const temp = newMembers[index];
    newMembers[index] = newMembers[targetIndex];
    newMembers[targetIndex] = temp;

    // Update orders sequentially
    const updated = newMembers.map((m, idx) => ({
      ...m,
      order: idx + 1,
    }));

    setMembers(updated);
    setHasOrderChanges(true);
  };

  const saveReorderedSequence = async () => {
    setSavingOrder(true);
    try {
      const items = members.map((m) => ({ id: m._id, order: m.order }));
      const res = await fetch('/api/admin/members/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      });

      if (!res.ok) throw new Error('Failed to update sequence');
      success('Roster display sequence updated.');
      setHasOrderChanges(false);
    } catch {
      toastError('Failed to save reordered sequence.');
    } finally {
      setSavingOrder(false);
    }
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    setDeletingLoading(true);
    try {
      const res = await fetch(`/api/admin/members/${deletingId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        success('Member portrait and record expunged.');
        setMembers((prev) => prev.filter((m) => m._id !== deletingId));
      }
    } catch {
      toastError('Failed to delete member.');
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
            <Badge variant="amber">FRAME 03 // ROSTER</Badge>
            <span className="font-mono text-xs text-offwhite-dim">
              {members.length} Members & Mentors
            </span>
          </div>
          <h1 className="font-title text-2xl sm:text-3xl font-black text-offwhite">
            Members & Faculty Committee
          </h1>
          <p className="font-body text-xs text-offwhite-dim">
            Manage faculty coordinators, core student committee, and founding alumni negatives.
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
              Save New Order
            </Button>
          )}
          <Button onClick={openCreateForm} variant="primary" size="sm">
            <Plus className="w-3.5 h-3.5" />
            Add Team Member
          </Button>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-offwhite-muted pointer-events-none" />
          <input
            type="text"
            placeholder="Search roster by name, role, or batch..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-charcoal border border-charcoal-border text-xs font-mono text-offwhite placeholder:text-offwhite-muted/50 focus:outline-none focus:border-amber transition-colors"
          />
        </div>

        <div className="flex gap-2">
          {['', 'faculty', 'core', 'alumni'].map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-2 rounded-xl text-xs font-mono uppercase transition-all ${
                typeFilter === t
                  ? 'bg-amber text-black font-semibold shadow-md'
                  : 'bg-charcoal border border-charcoal-border text-offwhite-dim hover:text-offwhite'
              }`}
            >
              {t ? (t === 'core' ? 'Core Committee' : t) : 'All Members'}
            </button>
          ))}
        </div>
      </div>

      {/* Member Cards / Reorderable List */}
      {loading ? (
        <div className="p-16 text-center font-mono text-xs text-amber animate-pulse">
          LOADING ROSTER NEGATIVES...
        </div>
      ) : members.length === 0 ? (
        <div className="p-16 rounded-3xl bg-charcoal/40 border border-charcoal-border text-center space-y-3">
          <Users className="w-8 h-8 text-offwhite-muted mx-auto" />
          <p className="font-mono text-xs text-offwhite">No members found matching filters.</p>
          <Button onClick={openCreateForm} variant="outline" size="sm">
            Add First Member
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.map((m, index) => (
            <div
              key={m._id}
              className="p-4 rounded-3xl bg-charcoal/80 border border-charcoal-border hover:border-amber/40 transition-all flex items-center gap-4 group shadow-md"
            >
              {/* Portrait */}
              <div className="relative w-16 h-16 shrink-0 rounded-2xl overflow-hidden bg-black border border-charcoal-border">
                {m.image?.url && (
                  <Image
                    src={m.image.url}
                    alt={m.name}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] text-amber font-bold">
                    #{m.order}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase ${
                      m.type === 'faculty'
                        ? 'bg-amber/15 text-amber border border-amber/30'
                        : m.type === 'core'
                        ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                        : 'bg-offwhite/10 text-offwhite-dim border border-offwhite/20'
                    }`}
                  >
                    {m.type}
                  </span>
                </div>
                <h3 className="font-title text-base font-bold text-offwhite truncate group-hover:text-amber transition-colors mt-0.5">
                  {m.name}
                </h3>
                <p className="font-mono text-xs text-offwhite-dim truncate">
                  {m.role}
                </p>
                {m.batch && (
                  <p className="font-mono text-[10px] text-offwhite-dim/60">
                    {m.batch}
                  </p>
                )}
              </div>

              {/* Order Controls & Actions */}
              <div className="flex flex-col items-center gap-1 shrink-0">
                <div className="flex items-center gap-0.5">
                  <button
                    onClick={() => moveOrder(index, 'up')}
                    disabled={index === 0}
                    aria-label="Move up"
                    className="p-1 rounded-lg text-offwhite-dim hover:text-amber disabled:opacity-20 hover:bg-black/40 transition-colors"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => moveOrder(index, 'down')}
                    disabled={index === members.length - 1}
                    aria-label="Move down"
                    className="p-1 rounded-lg text-offwhite-dim hover:text-amber disabled:opacity-20 hover:bg-black/40 transition-colors"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-0.5">
                  <button
                    onClick={() => openEditForm(m)}
                    aria-label="Edit member"
                    className="p-1.5 rounded-lg text-offwhite-dim hover:text-amber hover:bg-black/40 transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      setDeletingId(m._id);
                      setDeletingName(m.name);
                    }}
                    aria-label="Delete member"
                    className="p-1.5 rounded-lg text-offwhite-dim hover:text-safelight hover:bg-black/40 transition-colors"
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
          <div className="my-8 w-full max-w-xl rounded-3xl bg-charcoal border border-charcoal-border p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-charcoal-border">
              <div>
                <Badge variant="amber">
                  {editingMember ? 'EDIT ROSTER' : 'ADD TO ROSTER'}
                </Badge>
                <h2 className="font-title text-xl font-bold text-offwhite mt-1">
                  {editingMember ? editingMember.name : 'New Club Member'}
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
              {/* Portrait Uploader */}
              <CloudinaryUploader
                value={image}
                onChange={setImage}
                label="Portrait Photograph *"
                aspectRatio="square"
                folder="shutterscape/members"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Name */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="block font-mono text-[11px] uppercase tracking-wider text-offwhite-dim">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Uttama Purkayastha"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl bg-black/60 border border-charcoal-border text-sm text-offwhite focus:outline-none focus:border-amber transition-colors"
                  />
                </div>

                {/* Role */}
                <div className="space-y-1">
                  <label className="block font-mono text-[11px] uppercase tracking-wider text-offwhite-dim">
                    Club Role *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. President / Core Member"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl bg-black/60 border border-charcoal-border text-sm text-offwhite focus:outline-none focus:border-amber transition-colors"
                  />
                </div>

                {/* Member Type */}
                <div className="space-y-1">
                  <label className="block font-mono text-[11px] uppercase tracking-wider text-offwhite-dim">
                    Type *
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as 'faculty' | 'core' | 'alumni')}
                    className="w-full px-4 py-2.5 rounded-2xl bg-black/60 border border-charcoal-border text-sm text-offwhite focus:outline-none focus:border-amber transition-colors"
                  >
                    <option value="faculty">Faculty Mentor / Coordinator</option>
                    <option value="core">Core Student Committee</option>
                    <option value="alumni">Founding Alumni Negative</option>
                  </select>
                </div>

                {/* Batch (For alumni or students) */}
                <div className="space-y-1">
                  <label className="block font-mono text-[11px] uppercase tracking-wider text-offwhite-dim">
                    Batch / Class (e.g. Class of 2024)
                  </label>
                  <input
                    type="text"
                    placeholder="Class of 2024"
                    value={batch}
                    onChange={(e) => setBatch(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl bg-black/60 border border-charcoal-border text-sm text-offwhite focus:outline-none focus:border-amber transition-colors"
                  />
                </div>

                {/* Sequence Order */}
                <div className="space-y-1">
                  <label className="block font-mono text-[11px] uppercase tracking-wider text-offwhite-dim">
                    Display Order Index
                  </label>
                  <input
                    type="number"
                    value={order}
                    onChange={(e) => setOrder(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-2xl bg-black/60 border border-charcoal-border text-sm text-offwhite focus:outline-none focus:border-amber transition-colors"
                  />
                </div>

                {/* Quote */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="block font-mono text-[11px] uppercase tracking-wider text-offwhite-dim">
                    Personal Quote (Optional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Photography is technical precision harmonized with emotional truth."
                    value={quote}
                    onChange={(e) => setQuote(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl bg-black/60 border border-charcoal-border text-sm text-offwhite focus:outline-none focus:border-amber transition-colors"
                  />
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
                  ) : editingMember ? (
                    'Update Member'
                  ) : (
                    'Add to Roster'
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
        title={deletingName}
        loading={deletingLoading}
        onConfirm={confirmDelete}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  );
}
