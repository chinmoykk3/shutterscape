'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Camera,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  LogOut,
  Trash2,
  ExternalLink,
  Loader2,
  X,
} from 'lucide-react';
import { CloudinaryUploader, ImageAsset } from '@/components/admin/CloudinaryUploader';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  department?: string;
  rollNumber?: string;
  cameraGear?: string;
  instagramHandle?: string;
  bio?: string;
}

interface PhotoSubmissionItem {
  _id: string;
  title: string;
  story?: string;
  room: string;
  cameraInfo?: string;
  image: {
    url: string;
    publicId: string;
    blurDataURL?: string;
  };
  status: 'pending' | 'approved' | 'featured' | 'rejected';
  curatorNotes?: string;
  createdAt: string;
}

const ROOM_OPTIONS = [
  'Campus Life',
  'Monochrome',
  'Street',
  'Portraits',
  'Nature',
  'Activities',
];

export default function MemberPortalDashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState({ totalSubmissions: 0, approvedCount: 0, featuredCount: 0 });
  const [submissions, setSubmissions] = useState<PhotoSubmissionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'submissions' | 'profile'>('submissions');

  // Submit Modal States
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [submitImage, setSubmitImage] = useState<ImageAsset | null>(null);
  const [submitTitle, setSubmitTitle] = useState('');
  const [submitRoom, setSubmitRoom] = useState('Campus Life');
  const [submitStory, setSubmitStory] = useState('');
  const [submitCameraInfo, setSubmitCameraInfo] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccessMsg, setSubmitSuccessMsg] = useState<string | null>(null);

  // Profile Edit States
  const [editBio, setEditBio] = useState('');
  const [editGear, setEditGear] = useState('');
  const [editInstagram, setEditInstagram] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState<string | null>(null);

  const fetchProfileAndSubmissions = useCallback(async () => {
    try {
      const [meRes, subsRes] = await Promise.all([
        fetch('/api/portal/me'),
        fetch('/api/portal/submissions'),
      ]);

      if (!meRes.ok) {
        router.push('/portal/login');
        return;
      }

      const meData = await meRes.json();
      if (meData.success && meData.user) {
        setProfile(meData.user);
        setStats(meData.stats || { totalSubmissions: 0, approvedCount: 0, featuredCount: 0 });
        setEditBio(meData.user.bio || '');
        setEditGear(meData.user.cameraGear || '');
        setEditInstagram(meData.user.instagramHandle || '');
        setSubmitCameraInfo(meData.user.cameraGear || 'ISO 200 • 1/500s • f/2.8');
      }

      if (subsRes.ok) {
        const subsData = await subsRes.json();
        if (subsData.success && Array.isArray(subsData.submissions)) {
          setSubmissions(subsData.submissions);
        }
      }
    } catch {
      router.push('/portal/login');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchProfileAndSubmissions();
  }, [fetchProfileAndSubmissions]);

  const handleLogout = async () => {
    await fetch('/api/portal/auth/logout', { method: 'POST' });
    router.push('/portal/login');
    router.refresh();
  };

  const handlePhotoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submitImage?.url) {
      setSubmitError('Please attach a photograph negative.');
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch('/api/portal/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: submitTitle,
          room: submitRoom,
          story: submitStory,
          cameraInfo: submitCameraInfo,
          image: {
            url: submitImage.url,
            publicId: submitImage.publicId,
            blurDataURL: submitImage.blurDataURL,
            width: submitImage.width,
            height: submitImage.height,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit photograph');
      }

      setSubmitSuccessMsg('Photograph submitted to darkroom queue!');
      setSubmitTitle('');
      setSubmitStory('');
      setSubmitImage(null);
      setTimeout(() => {
        setIsSubmitModalOpen(false);
        setSubmitSuccessMsg(null);
      }, 1500);

      fetchProfileAndSubmissions();
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSubmission = async (id: string) => {
    if (!confirm('Are you sure you want to withdraw this negative from review?')) return;
    try {
      const res = await fetch(`/api/portal/submissions/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setSubmissions((prev) => prev.filter((s) => s._id !== id));
        setStats((prev) => ({ ...prev, totalSubmissions: Math.max(0, prev.totalSubmissions - 1) }));
      }
    } catch {
      alert('Failed to delete submission');
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileSuccessMsg(null);

    try {
      const res = await fetch('/api/portal/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bio: editBio,
          cameraGear: editGear,
          instagramHandle: editInstagram,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Update failed');

      setProfileSuccessMsg('Profile telemetry updated.');
      setTimeout(() => setProfileSuccessMsg(null), 3000);
      fetchProfileAndSubmissions();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-theme-canvas text-theme-ink flex items-center justify-center font-mono text-xs text-amber animate-pulse">
        CALIBRATING MEMBER STUDIO & VIEWPORT...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-theme-canvas text-theme-ink pt-28 pb-24 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in">
        {/* Studio HUD Header */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#0c0c0e]/90 border border-charcoal-border shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 backdrop-blur-md">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="amber">EXPOSURE // MEMBER STUDIO</Badge>
              <span className="font-mono text-xs text-offwhite-dim">
                GCU COLLECTIVE MEMBER
              </span>
            </div>
            <h1 className="font-title text-2xl sm:text-4xl font-black text-offwhite">
              {profile?.name}&apos;s Studio
            </h1>
            <p className="font-mono text-xs text-amber">
              {profile?.department} {profile?.rollNumber ? `• ${profile.rollNumber}` : ''}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              onClick={() => setIsSubmitModalOpen(true)}
              variant="primary"
              size="sm"
              className="gap-2 shadow-lg"
            >
              <Plus className="w-4 h-4" />
              Expose New Negative
            </Button>
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="gap-1.5 text-offwhite-dim hover:text-red-400"
            >
              <LogOut className="w-3.5 h-3.5" />
              Log Out
            </Button>
          </div>
        </div>

        {/* Telemetry Stats Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-charcoal/60 border border-charcoal-border space-y-1">
            <span className="font-mono text-[10px] uppercase tracking-wider text-offwhite-dim">
              Total Submissions
            </span>
            <p className="font-title text-3xl font-black text-offwhite">
              {stats.totalSubmissions}
            </p>
            <span className="font-mono text-[10px] text-amber/80">Archived in studio reel</span>
          </div>

          <div className="p-5 rounded-2xl bg-charcoal/60 border border-charcoal-border space-y-1">
            <span className="font-mono text-[10px] uppercase tracking-wider text-offwhite-dim">
              Curated to Exhibition
            </span>
            <p className="font-title text-3xl font-black text-green-400">
              {stats.approvedCount}
            </p>
            <span className="font-mono text-[10px] text-green-400/80">Active in darkroom gallery</span>
          </div>

          <div className="p-5 rounded-2xl bg-charcoal/60 border border-charcoal-border space-y-1">
            <span className="font-mono text-[10px] uppercase tracking-wider text-offwhite-dim">
              Featured Spotlights
            </span>
            <p className="font-title text-3xl font-black text-amber">
              {stats.featuredCount}
            </p>
            <span className="font-mono text-[10px] text-amber/80">Homepage & Photo of Week</span>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex gap-2 p-1 bg-black/60 border border-charcoal-border rounded-2xl max-w-sm">
          <button
            type="button"
            onClick={() => setActiveTab('submissions')}
            className={`flex-1 py-2 px-3 rounded-xl font-mono text-xs transition-all ${
              activeTab === 'submissions'
                ? 'bg-amber text-black font-bold shadow-md'
                : 'text-offwhite-dim hover:text-offwhite'
            }`}
          >
            My Submissions ({submissions.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-2 px-3 rounded-xl font-mono text-xs transition-all ${
              activeTab === 'profile'
                ? 'bg-amber text-black font-bold shadow-md'
                : 'text-offwhite-dim hover:text-offwhite'
            }`}
          >
            My Gear & Bio
          </button>
        </div>

        {/* TAB 1: SUBMISSIONS GRID */}
        {activeTab === 'submissions' && (
          <div className="space-y-4">
            {submissions.length === 0 ? (
              <div className="p-16 rounded-3xl bg-charcoal/40 border border-charcoal-border text-center space-y-4">
                <Camera className="w-10 h-10 text-offwhite-muted mx-auto" />
                <div className="space-y-1">
                  <h3 className="font-title text-lg font-bold text-offwhite">
                    No Negatives Exposed Yet
                  </h3>
                  <p className="font-body text-xs text-offwhite-dim max-w-md mx-auto">
                    Capture a frame of campus life, architectural light, or student dynamics and submit it for darkroom exhibition review.
                  </p>
                </div>
                <Button
                  onClick={() => setIsSubmitModalOpen(true)}
                  variant="primary"
                  size="sm"
                  className="gap-2"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Submit First Photograph
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {submissions.map((sub) => (
                  <div
                    key={sub._id}
                    className="rounded-3xl bg-charcoal/80 border border-charcoal-border hover:border-amber/40 transition-all overflow-hidden flex flex-col group shadow-lg"
                  >
                    {/* Photo Container */}
                    <div className="relative aspect-[4/3] w-full bg-black">
                      <Image
                        src={sub.image.url}
                        alt={sub.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-2.5 left-2.5">
                        <span className="px-2 py-0.5 rounded-md bg-black/80 font-mono text-[10px] text-amber border border-amber/30">
                          {sub.room}
                        </span>
                      </div>
                      <div className="absolute top-2.5 right-2.5">
                        {sub.status === 'pending' && (
                          <span className="px-2 py-0.5 rounded-md bg-amber-950/90 text-amber-300 font-mono text-[10px] flex items-center gap-1 border border-amber-500/40">
                            <Clock className="w-2.5 h-2.5" /> In Chemical Bath
                          </span>
                        )}
                        {sub.status === 'approved' && (
                          <span className="px-2 py-0.5 rounded-md bg-green-950/90 text-green-300 font-mono text-[10px] flex items-center gap-1 border border-green-500/40">
                            <CheckCircle2 className="w-2.5 h-2.5" /> Curated to Gallery
                          </span>
                        )}
                        {sub.status === 'featured' && (
                          <span className="px-2 py-0.5 rounded-md bg-purple-950/90 text-purple-300 font-mono text-[10px] flex items-center gap-1 border border-purple-500/40">
                            <Sparkles className="w-2.5 h-2.5" /> Featured Spotlight
                          </span>
                        )}
                        {sub.status === 'rejected' && (
                          <span className="px-2 py-0.5 rounded-md bg-rose-950/90 text-rose-300 font-mono text-[10px] flex items-center gap-1 border border-rose-500/40">
                            <AlertCircle className="w-2.5 h-2.5" /> Needs Re-frame
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Metadata */}
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div className="space-y-1">
                        <h4 className="font-title text-base font-bold text-offwhite line-clamp-1">
                          {sub.title}
                        </h4>
                        {sub.story && (
                          <p className="font-body text-xs text-offwhite-dim line-clamp-2">
                            {sub.story}
                          </p>
                        )}
                        <p className="font-mono text-[10px] text-offwhite-dim/60 pt-1">
                          {sub.cameraInfo || 'Digital Negative'}
                        </p>
                      </div>

                      {/* Curator Feedback */}
                      {sub.curatorNotes && (
                        <div className="p-2.5 rounded-xl bg-black/40 border border-charcoal-border text-[11px] font-mono text-offwhite-muted">
                          <span className="text-amber font-bold">Curator Note: </span>
                          {sub.curatorNotes}
                        </div>
                      )}

                      {/* Footer Actions */}
                      <div className="pt-2 border-t border-charcoal-border/50 flex items-center justify-between text-[10px] font-mono text-offwhite-dim">
                        <span>{new Date(sub.createdAt).toLocaleDateString()}</span>
                        {sub.status === 'pending' && (
                          <button
                            type="button"
                            onClick={() => handleDeleteSubmission(sub._id)}
                            className="text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors"
                          >
                            <Trash2 className="w-3 h-3" /> Withdraw
                          </button>
                        )}
                        {sub.status === 'approved' && (
                          <Link
                            href="/gallery"
                            className="text-amber hover:underline flex items-center gap-1"
                          >
                            View in Gallery <ExternalLink className="w-3 h-3" />
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: PROFILE & GEAR SETTINGS */}
        {activeTab === 'profile' && (
          <div className="max-w-xl p-6 sm:p-8 rounded-3xl bg-[#0c0c0e]/90 border border-charcoal-border space-y-6">
            <div>
              <h3 className="font-title text-lg font-bold text-offwhite">
                Photographer Telemetry & Bio
              </h3>
              <p className="font-mono text-xs text-offwhite-dim">
                Details displayed on your submissions and curated gallery prints
              </p>
            </div>

            {profileSuccessMsg && (
              <div className="p-3 rounded-2xl bg-green-950/40 border border-green-500/30 text-xs font-mono text-green-300">
                {profileSuccessMsg}
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block font-mono text-[11px] uppercase tracking-wider text-offwhite-dim">
                  Primary Camera Body & Lenses
                </label>
                <input
                  type="text"
                  placeholder="e.g. Nikon Z50 with 50mm f/1.8 or iPhone 15 Pro"
                  value={editGear}
                  onChange={(e) => setEditGear(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-black/60 border border-charcoal-border text-xs font-mono text-offwhite focus:outline-none focus:border-amber transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block font-mono text-[11px] uppercase tracking-wider text-offwhite-dim">
                  Instagram Handle
                </label>
                <input
                  type="text"
                  placeholder="@yourhandle"
                  value={editInstagram}
                  onChange={(e) => setEditInstagram(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-black/60 border border-charcoal-border text-xs font-mono text-offwhite focus:outline-none focus:border-amber transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block font-mono text-[11px] uppercase tracking-wider text-offwhite-dim">
                  Photographer Statement / Bio
                </label>
                <textarea
                  rows={3}
                  placeholder="Tell the darkroom collective about your visual philosophy..."
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-black/60 border border-charcoal-border text-xs font-mono text-offwhite focus:outline-none focus:border-amber transition-colors"
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={savingProfile}
              >
                {savingProfile ? 'Updating Telemetry...' : 'Save Profile'}
              </Button>
            </form>
          </div>
        )}
      </div>

      {/* =======================================================================
          SUBMISSION MODAL: EXPOSE NEW NEGATIVE
          ======================================================================= */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="my-4 sm:my-8 w-full max-w-xl max-h-[92vh] overflow-y-auto rounded-3xl bg-charcoal border border-charcoal-border p-4 sm:p-8 shadow-2xl space-y-6 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-charcoal-border">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber/20 border border-amber/40 flex items-center justify-center text-amber">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-title text-lg font-bold text-offwhite">
                    Expose New Negative
                  </h2>
                  <p className="font-mono text-[10px] text-offwhite-dim">
                    Submit your photograph to ShutterScape darkroom curation
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsSubmitModalOpen(false)}
                className="p-2 rounded-xl text-offwhite-dim hover:text-offwhite hover:bg-charcoal-subtle transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {submitError && (
              <div className="p-3 rounded-2xl bg-red-950/40 border border-red-500/30 text-xs font-mono text-red-300">
                {submitError}
              </div>
            )}
            {submitSuccessMsg && (
              <div className="p-3 rounded-2xl bg-green-950/40 border border-green-500/30 text-xs font-mono text-green-300">
                {submitSuccessMsg}
              </div>
            )}

            <form onSubmit={handlePhotoSubmit} className="space-y-4">
              {/* Photo Uploader */}
              <CloudinaryUploader
                value={submitImage}
                onChange={setSubmitImage}
                folder="shutterscape/student-submissions"
                label="Photograph Negative *"
                helperText="Upload JPG, PNG or WebP up to 5MB"
                aspectRatio="portrait"
              />

              {/* Title / Caption */}
              <div className="space-y-1.5">
                <label className="block font-mono text-[11px] uppercase tracking-wider text-offwhite-dim">
                  Photograph Title / Caption *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Shadows over the Azara courtyard"
                  value={submitTitle}
                  onChange={(e) => setSubmitTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-black/60 border border-charcoal-border text-xs font-mono text-offwhite focus:outline-none focus:border-amber transition-colors"
                />
              </div>

              {/* Exhibition Room */}
              <div className="space-y-1.5">
                <label className="block font-mono text-[11px] uppercase tracking-wider text-offwhite-dim">
                  Suggested Exhibition Room
                </label>
                <select
                  value={submitRoom}
                  onChange={(e) => setSubmitRoom(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-black/60 border border-charcoal-border text-xs font-mono text-offwhite focus:outline-none focus:border-amber transition-colors"
                >
                  {ROOM_OPTIONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              {/* Camera Telemetry */}
              <div className="space-y-1.5">
                <label className="block font-mono text-[11px] uppercase tracking-wider text-offwhite-dim">
                  Camera Telemetry / Settings
                </label>
                <input
                  type="text"
                  placeholder="e.g. ISO 200 • 1/500s • f/2.8 or iPhone 15 Pro"
                  value={submitCameraInfo}
                  onChange={(e) => setSubmitCameraInfo(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-black/60 border border-charcoal-border text-xs font-mono text-offwhite focus:outline-none focus:border-amber transition-colors"
                />
              </div>

              {/* Story Narrative */}
              <div className="space-y-1.5">
                <label className="block font-mono text-[11px] uppercase tracking-wider text-offwhite-dim">
                  The Story Behind the Frame (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Where and when was this taken? What inspired the frame?"
                  value={submitStory}
                  onChange={(e) => setSubmitStory(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-black/60 border border-charcoal-border text-xs font-mono text-offwhite focus:outline-none focus:border-amber transition-colors"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-charcoal-border flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsSubmitModalOpen(false)}
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
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Submitting Negative...
                    </span>
                  ) : (
                    'Submit to Darkroom'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

