'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import {
  Inbox,
  Search,
  CheckCircle2,
  Trash2,
  Mail,
  Download,
  Calendar,
  Phone,
  RefreshCw,
  Camera,
  Sparkles,
  XCircle,
  ExternalLink,
  Tag,
  GraduationCap,
  Sliders,
} from 'lucide-react';
import { useToast } from '@/components/admin/Toast';
import { DeleteModal } from '@/components/admin/DeleteModal';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

interface SubmissionItem {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message?: string;
  type?: string;
  status?: string;
  handled: boolean;
  createdAt: string;
}

interface PhotoSubmissionItem {
  _id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  rollNumber?: string;
  department?: string;
  title: string;
  story?: string;
  room: string;
  cameraInfo?: string;
  image: {
    url: string;
    publicId?: string;
    width?: number;
    height?: number;
    blurDataURL?: string;
  };
  status: 'pending' | 'approved' | 'featured' | 'rejected';
  curatorNotes?: string;
  exhibitionItemId?: string;
  createdAt: string;
}

export default function AdminSubmissionsPage() {
  const { success, error: toastError } = useToast();
  const [activeTab, setActiveTab] = useState<'photos' | 'inquiries'>('photos');

  // Contact Inquiries State
  const [submissions, setSubmissions] = useState<SubmissionItem[]>([]);
  const [loadingInquiries, setLoadingInquiries] = useState(true);
  const [inquirySearch, setInquirySearch] = useState('');
  const [inquiryStatusFilter, setInquiryStatusFilter] = useState('');

  // Student Photo Submissions State
  const [photos, setPhotos] = useState<PhotoSubmissionItem[]>([]);
  const [loadingPhotos, setLoadingPhotos] = useState(true);
  const [photoSearch, setPhotoSearch] = useState('');
  const [photoStatusFilter, setPhotoStatusFilter] = useState('');
  const [curatingId, setCuratingId] = useState<string | null>(null);

  // Deletion State
  const [deletingType, setDeletingType] = useState<'inquiry' | 'photo' | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deletingTitle, setDeletingTitle] = useState('');
  const [deletingLoading, setDeletingLoading] = useState(false);

  // Fetch inquiries
  const fetchInquiries = useCallback(async () => {
    try {
      setLoadingInquiries(true);
      const params = new URLSearchParams();
      if (inquirySearch) params.set('search', inquirySearch);
      if (inquiryStatusFilter) params.set('status', inquiryStatusFilter);

      const res = await fetch(`/api/admin/submissions?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setSubmissions(data.submissions);
      }
    } catch {
      toastError('Failed to load inquiries.');
    } finally {
      setLoadingInquiries(false);
    }
  }, [inquirySearch, inquiryStatusFilter, toastError]);

  // Fetch student photos
  const fetchPhotos = useCallback(async () => {
    try {
      setLoadingPhotos(true);
      const params = new URLSearchParams();
      if (photoSearch) params.set('search', photoSearch);
      if (photoStatusFilter) params.set('status', photoStatusFilter);

      const res = await fetch(`/api/admin/submissions/photos?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setPhotos(data.photos);
      }
    } catch {
      toastError('Failed to load student photo submissions.');
    } finally {
      setLoadingPhotos(false);
    }
  }, [photoSearch, photoStatusFilter, toastError]);

  useEffect(() => {
    fetchInquiries();
  }, [fetchInquiries]);

  useEffect(() => {
    fetchPhotos();
  }, [fetchPhotos]);

  // Toggle handled on inquiry
  const toggleHandled = async (item: SubmissionItem) => {
    try {
      const res = await fetch(`/api/admin/submissions/${item._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ handled: !item.handled, status: !item.handled ? 'read' : 'unread' }),
      });
      if (res.ok) {
        setSubmissions((prev) =>
          prev.map((s) => (s._id === item._id ? { ...s, handled: !s.handled } : s))
        );
        success(item.handled ? 'Marked as unhandled.' : 'Marked as handled.');
      }
    } catch {
      toastError('Failed to update submission status.');
    }
  };

  // Curator actions for student photo
  const handlePhotoDecision = async (
    photoId: string,
    action: 'approve' | 'reject',
    options?: { featured?: boolean; photoOfTheWeek?: boolean; curatorNotes?: string }
  ) => {
    try {
      setCuratingId(photoId);
      const res = await fetch(`/api/admin/submissions/photos/${photoId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          featured: options?.featured ?? false,
          photoOfTheWeek: options?.photoOfTheWeek ?? false,
          curatorNotes: options?.curatorNotes,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update photo');

      success(
        action === 'approve'
          ? 'Photograph approved & added to Darkroom Gallery!'
          : 'Negative marked as rejected.'
      );
      fetchPhotos();
    } catch (err: unknown) {
      toastError(err instanceof Error ? err.message : 'Curator action failed');
    } finally {
      setCuratingId(null);
    }
  };

  const confirmDelete = async () => {
    if (!deletingId || !deletingType) return;
    setDeletingLoading(true);
    try {
      const endpoint =
        deletingType === 'photo'
          ? `/api/admin/submissions/photos/${deletingId}`
          : `/api/admin/submissions/${deletingId}`;

      const res = await fetch(endpoint, { method: 'DELETE' });
      if (res.ok) {
        success(
          deletingType === 'photo'
            ? 'Student negative purged from archive.'
            : 'Inquiry purged from archive.'
        );
        if (deletingType === 'photo') {
          setPhotos((prev) => prev.filter((p) => p._id !== deletingId));
        } else {
          setSubmissions((prev) => prev.filter((s) => s._id !== deletingId));
        }
      } else {
        throw new Error();
      }
    } catch {
      toastError('Failed to delete item.');
    } finally {
      setDeletingLoading(false);
      setDeletingId(null);
      setDeletingType(null);
    }
  };

  const exportJson = () => {
    const dataToExport = activeTab === 'photos' ? photos : submissions;
    const filename = `shutterscape-${activeTab}-${new Date().toISOString().slice(0, 10)}.json`;
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(dataToExport, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', filename);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const pendingPhotosCount = photos.filter((p) => p.status === 'pending').length;
  const unhandledInquiriesCount = submissions.filter((s) => !s.handled).length;

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-charcoal-border">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="amber">FRAME 06 // CURATOR HUB</Badge>
            <span className="font-mono text-xs text-offwhite-dim">
              {pendingPhotosCount} Pending Negatives • {unhandledInquiriesCount} Inquiries
            </span>
          </div>
          <h1 className="font-title text-2xl sm:text-3xl font-black text-offwhite">
            Submissions & Curatorial Desk
          </h1>
          <p className="font-body text-xs text-offwhite-dim">
            Review club member negatives for exhibition, or reply to student membership inquiries.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={exportJson} variant="secondary" size="sm" className="gap-2">
            <Download className="w-3.5 h-3.5" />
            Export JSON
          </Button>
          <button
            onClick={() => {
              if (activeTab === 'photos') fetchPhotos();
              else fetchInquiries();
            }}
            aria-label="Refresh submissions"
            className="p-2.5 rounded-xl bg-charcoal border border-charcoal-border text-offwhite-dim hover:text-amber transition-colors"
          >
            <RefreshCw
              className={`w-4 h-4 ${loadingPhotos || loadingInquiries ? 'animate-spin' : ''}`}
            />
          </button>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-3 border-b border-charcoal-border/70 pb-3">
        <button
          onClick={() => setActiveTab('photos')}
          className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-xs font-mono uppercase tracking-wider transition-all ${
            activeTab === 'photos'
              ? 'bg-amber text-black font-bold shadow-lg shadow-amber/20'
              : 'bg-charcoal/60 border border-charcoal-border text-offwhite-dim hover:text-offwhite'
          }`}
        >
          <Camera className="w-4 h-4" />
          <span>Student Photo Negatives</span>
          {pendingPhotosCount > 0 && (
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === 'photos' ? 'bg-black text-amber' : 'bg-amber text-black'
              }`}
            >
              {pendingPhotosCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('inquiries')}
          className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-xs font-mono uppercase tracking-wider transition-all ${
            activeTab === 'inquiries'
              ? 'bg-amber text-black font-bold shadow-lg shadow-amber/20'
              : 'bg-charcoal/60 border border-charcoal-border text-offwhite-dim hover:text-offwhite'
          }`}
        >
          <Inbox className="w-4 h-4" />
          <span>Contact & Membership Inquiries</span>
          {unhandledInquiriesCount > 0 && (
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === 'inquiries' ? 'bg-black text-amber' : 'bg-amber text-black'
              }`}
            >
              {unhandledInquiriesCount}
            </span>
          )}
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: STUDENT PHOTO SUBMISSIONS                         */}
      {/* ======================================================== */}
      {activeTab === 'photos' && (
        <div className="space-y-6">
          {/* Filters & Search */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-offwhite-muted pointer-events-none" />
              <input
                type="text"
                placeholder="Search by student name, roll number, title, or department..."
                value={photoSearch}
                onChange={(e) => setPhotoSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-charcoal border border-charcoal-border text-xs font-mono text-offwhite placeholder:text-offwhite-muted/50 focus:outline-none focus:border-amber transition-colors"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {['', 'pending', 'approved', 'featured', 'rejected'].map((s) => (
                <button
                  key={s}
                  onClick={() => setPhotoStatusFilter(s)}
                  className={`px-3 py-2 rounded-xl text-xs font-mono uppercase transition-all ${
                    photoStatusFilter === s
                      ? 'bg-amber text-black font-semibold shadow-md'
                      : 'bg-charcoal border border-charcoal-border text-offwhite-dim hover:text-offwhite'
                  }`}
                >
                  {s || 'All Status'}
                </button>
              ))}
            </div>
          </div>

          {/* Photos Stream */}
          {loadingPhotos ? (
            <div className="p-16 text-center font-mono text-xs text-amber animate-pulse">
              EXPOSING STUDENT NEGATIVES ARCHIVE...
            </div>
          ) : photos.length === 0 ? (
            <div className="p-16 rounded-3xl bg-charcoal/40 border border-charcoal-border text-center space-y-3">
              <Camera className="w-8 h-8 text-offwhite-muted mx-auto" />
              <p className="font-mono text-xs text-offwhite">
                No student photo submissions match your filter.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {photos.map((item) => {
                const isPending = item.status === 'pending';
                const isApproved = item.status === 'approved' || item.status === 'featured';

                return (
                  <div
                    key={item._id}
                    className={`rounded-3xl border overflow-hidden flex flex-col transition-all ${
                      isPending
                        ? 'bg-charcoal/90 border-amber/50 shadow-xl'
                        : isApproved
                        ? 'bg-charcoal/60 border-emerald-500/30'
                        : 'bg-charcoal/40 border-charcoal-border opacity-75'
                    }`}
                  >
                    {/* Negative Image Preview */}
                    <div className="relative aspect-[16/10] bg-black group overflow-hidden">
                      <Image
                        src={item.image.url}
                        alt={item.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent pointer-events-none" />

                      {/* Top Badges */}
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider backdrop-blur-md border ${
                            item.status === 'pending'
                              ? 'bg-amber/90 text-black border-amber animate-pulse'
                              : item.status === 'featured'
                              ? 'bg-purple-600/90 text-white border-purple-400'
                              : item.status === 'approved'
                              ? 'bg-emerald-600/90 text-white border-emerald-400'
                              : 'bg-safelight/90 text-white border-safelight'
                          }`}
                        >
                          ● {item.status}
                        </span>

                        <span className="px-2.5 py-1 rounded-full text-[10px] font-mono bg-black/80 text-offwhite-dim border border-charcoal-border backdrop-blur-md">
                          {item.room}
                        </span>
                      </div>

                      {/* Title & Roll in bottom gradient */}
                      <div className="absolute bottom-3 left-3 right-3">
                        <h3 className="font-title text-lg font-bold text-offwhite drop-shadow-md">
                          {item.title}
                        </h3>
                        <p className="font-mono text-[11px] text-offwhite-dim flex items-center gap-2">
                          <span>By {item.studentName}</span>
                          {item.rollNumber && (
                            <>
                              <span>•</span>
                              <span>Roll: {item.rollNumber}</span>
                            </>
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Metadata & Curatorial Actions */}
                    <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-3">
                        {item.story && (
                          <p className="font-body text-xs text-offwhite-dim leading-relaxed italic line-clamp-3">
                            &ldquo;{item.story}&rdquo;
                          </p>
                        )}

                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-charcoal-border/50 text-[11px] font-mono">
                          <div className="text-offwhite-dim/80 flex items-center gap-1.5">
                            <GraduationCap className="w-3.5 h-3.5 text-amber shrink-0" />
                            <span className="truncate">{item.department || 'GCU'}</span>
                          </div>
                          <div className="text-offwhite-dim/80 flex items-center gap-1.5">
                            <Sliders className="w-3.5 h-3.5 text-amber shrink-0" />
                            <span className="truncate">{item.cameraInfo || 'Standard Negative'}</span>
                          </div>
                          <div className="text-offwhite-dim/80 flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-amber shrink-0" />
                            <a
                              href={`mailto:${item.studentEmail}`}
                              className="truncate hover:text-amber transition-colors"
                            >
                              {item.studentEmail}
                            </a>
                          </div>
                          <div className="text-offwhite-dim/80 flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-amber shrink-0" />
                            <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>

                        {item.curatorNotes && (
                          <div className="p-2.5 rounded-xl bg-charcoal border border-charcoal-border/80 text-[11px] font-mono text-offwhite-dim">
                            <span className="text-amber font-bold">Curator Note: </span>
                            {item.curatorNotes}
                          </div>
                        )}
                      </div>

                      {/* Action Bar */}
                      <div className="pt-3 border-t border-charcoal-border/60 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <a
                            href={item.image.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-xl bg-charcoal border border-charcoal-border text-offwhite-dim hover:text-offwhite transition-colors"
                            title="Inspect Full Negative"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>

                          <button
                            onClick={() => {
                              setDeletingType('photo');
                              setDeletingId(item._id);
                              setDeletingTitle(`Negative: "${item.title}" by ${item.studentName}`);
                            }}
                            className="p-2 rounded-xl bg-charcoal border border-charcoal-border text-offwhite-dim hover:text-safelight hover:border-safelight/40 transition-colors"
                            title="Delete Negative"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="flex items-center gap-2">
                          {item.status !== 'approved' && item.status !== 'featured' && (
                            <Button
                              onClick={() => handlePhotoDecision(item._id, 'approve')}
                              variant="primary"
                              size="sm"
                              className="gap-1.5"
                              disabled={curatingId === item._id}
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Approve to Gallery
                            </Button>
                          )}

                          {item.status === 'approved' && (
                            <Button
                              onClick={() =>
                                handlePhotoDecision(item._id, 'approve', { featured: true })
                              }
                              variant="secondary"
                              size="sm"
                              className="gap-1.5 text-purple-300 border-purple-500/40"
                              disabled={curatingId === item._id}
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                              Feature on Hero
                            </Button>
                          )}

                          {item.status !== 'rejected' && (
                            <Button
                              onClick={() => handlePhotoDecision(item._id, 'reject')}
                              variant="secondary"
                              size="sm"
                              className="gap-1.5 text-safelight border-safelight/40 hover:bg-safelight/10"
                              disabled={curatingId === item._id}
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              Reject
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: CONTACT & MEMBERSHIP INQUIRIES                    */}
      {/* ======================================================== */}
      {activeTab === 'inquiries' && (
        <div className="space-y-6">
          {/* Filter & Search Bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-offwhite-muted pointer-events-none" />
              <input
                type="text"
                placeholder="Search by name, email, or message contents..."
                value={inquirySearch}
                onChange={(e) => setInquirySearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-charcoal border border-charcoal-border text-xs font-mono text-offwhite placeholder:text-offwhite-muted/50 focus:outline-none focus:border-amber transition-colors"
              />
            </div>

            <div className="flex gap-2">
              {['', 'unread', 'read'].map((s) => (
                <button
                  key={s}
                  onClick={() => setInquiryStatusFilter(s)}
                  className={`px-3 py-2 rounded-xl text-xs font-mono uppercase transition-all ${
                    inquiryStatusFilter === s
                      ? 'bg-amber text-black font-semibold shadow-md'
                      : 'bg-charcoal border border-charcoal-border text-offwhite-dim hover:text-offwhite'
                  }`}
                >
                  {s || 'All Status'}
                </button>
              ))}
            </div>
          </div>

          {/* Inquiries List */}
          {loadingInquiries ? (
            <div className="p-16 text-center font-mono text-xs text-amber animate-pulse">
              FETCHING INBOX DISPATCHES...
            </div>
          ) : submissions.length === 0 ? (
            <div className="p-16 rounded-3xl bg-charcoal/40 border border-charcoal-border text-center space-y-3">
              <Inbox className="w-8 h-8 text-offwhite-muted mx-auto" />
              <p className="font-mono text-xs text-offwhite">No inquiries or applications found.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {submissions.map((item) => (
                <div
                  key={item._id}
                  className={`p-5 rounded-3xl border transition-all ${
                    item.handled
                      ? 'bg-charcoal/50 border-charcoal-border/70 opacity-80'
                      : 'bg-charcoal/90 border-amber/40 shadow-lg'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-charcoal-border/60">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-title text-base font-bold text-offwhite">
                          {item.name}
                        </span>
                        {!item.handled && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-amber/20 text-amber border border-amber/40 animate-pulse">
                            NEW INQUIRY
                          </span>
                        )}
                        {item.type && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-mono bg-charcoal-border text-offwhite-dim flex items-center gap-1">
                            <Tag className="w-2.5 h-2.5" />
                            {item.type}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-offwhite-dim">
                        <a
                          href={`mailto:${item.email}`}
                          className="hover:text-amber inline-flex items-center gap-1.5 transition-colors"
                        >
                          <Mail className="w-3.5 h-3.5 text-amber" />
                          {item.email}
                        </a>
                        {item.phone && (
                          <span className="inline-flex items-center gap-1.5 text-offwhite-dim/80">
                            <Phone className="w-3.5 h-3.5 text-offwhite-dim/60" />
                            {item.phone}
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1 text-[11px] text-offwhite-dim/60">
                          <Calendar className="w-3 h-3" />
                          {new Date(item.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        onClick={() => toggleHandled(item)}
                        variant={item.handled ? 'secondary' : 'primary'}
                        size="sm"
                        className="gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {item.handled ? 'Mark Unhandled' : 'Mark Handled'}
                      </Button>
                      <button
                        onClick={() => {
                          setDeletingType('inquiry');
                          setDeletingId(item._id);
                          setDeletingTitle(`Inquiry from ${item.name} (${item.email})`);
                        }}
                        aria-label="Delete inquiry"
                        className="p-2 rounded-xl bg-charcoal border border-charcoal-border text-offwhite-dim hover:text-safelight hover:border-safelight/40 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {item.message && (
                    <div className="pt-3">
                      <p className="text-xs font-body text-offwhite-dim leading-relaxed whitespace-pre-wrap">
                        {item.message}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Delete Modal */}
      <DeleteModal
        isOpen={!!deletingId}
        title={deletingTitle}
        loading={deletingLoading}
        onConfirm={confirmDelete}
        onCancel={() => {
          setDeletingId(null);
          setDeletingType(null);
        }}
      />
    </div>
  );
}
