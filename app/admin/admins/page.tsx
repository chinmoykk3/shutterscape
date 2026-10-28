'use client';

import React, { useState, useEffect } from 'react';
import {
  Plus,
  Key,
  Trash2,
  Unlock,
  X,
  Download,
  AlertCircle,
} from 'lucide-react';
import { useToast } from '@/components/admin/Toast';
import { DeleteModal } from '@/components/admin/DeleteModal';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

interface AdminAccount {
  _id: string;
  email: string;
  name: string;
  role: 'superadmin' | 'editor';
  lastLogin?: string;
  createdAt: string;
}

export default function AdminUsersPage() {
  const { success, error: toastError } = useToast();
  const [admins, setAdmins] = useState<AdminAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);

  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'superadmin' | 'editor'>('editor');
  const [submitting, setSubmitting] = useState(false);

  // Password Reset Modal State
  const [resetId, setResetId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  // Delete State
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deletingEmail, setDeletingEmail] = useState('');
  const [deletingLoading, setDeletingLoading] = useState(false);

  const fetchAdmins = React.useCallback(async () => {
    try {
      const res = await fetch('/api/admin/admins');
      if (res.status === 403) {
        setForbidden(true);
        return;
      }
      const data = await res.json();
      if (data.success) {
        setAdmins(data.admins);
      }
    } catch {
      toastError('Failed to retrieve admin roster.');
    } finally {
      setLoading(false);
    }
  }, [toastError]);

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !name || !password) {
      toastError('All fields are required.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/admins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, password, role }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to provision admin');

      success(`Admin clearance provisioned for ${email}`);
      setIsFormOpen(false);
      setEmail('');
      setName('');
      setPassword('');
      fetchAdmins();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Provisioning failed';
      toastError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetId || !newPassword) return;

    setResetLoading(true);
    try {
      const res = await fetch(`/api/admin/admins/${resetId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: newPassword, unlock: true }),
      });

      if (!res.ok) throw new Error('Failed to update credentials');

      success('Access credentials updated and account unlocked.');
      setResetId(null);
      setNewPassword('');
    } catch {
      toastError('Failed to update password.');
    } finally {
      setResetLoading(false);
    }
  };

  const handleUnlock = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/admins/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ unlock: true }),
      });
      if (res.ok) {
        success('Account lockout cleared.');
      }
    } catch {
      toastError('Failed to unlock account.');
    }
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    setDeletingLoading(true);
    try {
      const res = await fetch(`/api/admin/admins/${deletingId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete admin');

      success('Admin clearance revoked.');
      setAdmins((prev) => prev.filter((a) => a._id !== deletingId));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Deletion failed';
      toastError(msg);
    } finally {
      setDeletingLoading(false);
      setDeletingId(null);
    }
  };

  const exportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(admins, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = `shutterscape-admins-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  if (forbidden) {
    return (
      <div className="p-16 rounded-3xl bg-charcoal/40 border border-safelight/40 text-center space-y-4 max-w-lg mx-auto my-12">
        <AlertCircle className="w-10 h-10 text-safelight mx-auto" />
        <h2 className="font-title text-xl font-bold text-offwhite">
          Superadmin Clearance Required
        </h2>
        <p className="font-body text-xs text-offwhite-dim leading-relaxed">
          The Admin Roster is restricted exclusively to Master Curators with Superadmin privileges. Editor roles do not have permission to view or provision curator credentials.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-charcoal-border">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="amber">FRAME 07 // CLEARANCE ROSTER</Badge>
            <span className="font-mono text-xs text-offwhite-dim">
              SUPERADMIN PRIVILEGE
            </span>
          </div>
          <h1 className="font-title text-2xl sm:text-3xl font-black text-offwhite">
            Curator Access & Admins
          </h1>
          <p className="font-body text-xs text-offwhite-dim">
            Manage authenticated accounts, assign roles (Superadmin / Editor), and clear security lockouts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={exportJson} variant="secondary" size="sm" className="gap-2">
            <Download className="w-3.5 h-3.5" />
            Export JSON
          </Button>
          <Button onClick={() => setIsFormOpen(true)} variant="primary" size="sm" className="gap-2">
            <Plus className="w-3.5 h-3.5" />
            Provision Admin
          </Button>
        </div>
      </div>

      {/* Admins Table */}
      {loading ? (
        <div className="p-16 text-center font-mono text-xs text-amber animate-pulse">
          READING CLEARANCE ROSTER...
        </div>
      ) : (
        <div className="rounded-3xl bg-charcoal/80 border border-charcoal-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="border-b border-charcoal-border text-[11px] text-offwhite-dim uppercase tracking-wider bg-black/40">
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Last Login</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal-border/50">
                {admins.map((adm) => (
                  <tr key={adm._id} className="hover:bg-charcoal-subtle/50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-offwhite">
                      {adm.name}
                    </td>
                    <td className="py-3.5 px-4 text-offwhite-dim">
                      {adm.email}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-lg border text-[10px] uppercase font-bold ${
                          adm.role === 'superadmin'
                            ? 'bg-amber/15 border-amber/40 text-amber'
                            : 'bg-charcoal border-charcoal-border text-offwhite-dim'
                        }`}
                      >
                        {adm.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-[11px] text-offwhite-dim/70 whitespace-nowrap">
                      {adm.lastLogin ? new Date(adm.lastLogin).toLocaleString() : 'Never'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleUnlock(adm._id)}
                          title="Clear lockout counter"
                          className="p-1.5 rounded-lg bg-charcoal border border-charcoal-border text-offwhite-dim hover:text-amber hover:border-amber/40 transition-colors"
                        >
                          <Unlock className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setResetId(adm._id);
                            setNewPassword('');
                          }}
                          title="Reset access key"
                          className="p-1.5 rounded-lg bg-charcoal border border-charcoal-border text-offwhite-dim hover:text-amber hover:border-amber/40 transition-colors"
                        >
                          <Key className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setDeletingId(adm._id);
                            setDeletingEmail(adm.email);
                          }}
                          title="Revoke admin clearance"
                          className="p-1.5 rounded-lg bg-charcoal border border-charcoal-border text-offwhite-dim hover:text-safelight hover:border-safelight/40 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Provision Admin Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl bg-charcoal border border-charcoal-border p-6 sm:p-8 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-charcoal-border">
              <div>
                <Badge variant="amber">NEW CLEARANCE</Badge>
                <h3 className="font-title text-lg font-bold text-offwhite mt-1">
                  Provision Admin Account
                </h3>
              </div>
              <button onClick={() => setIsFormOpen(false)} className="text-offwhite-dim hover:text-offwhite">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAdmin} className="space-y-4">
              <div>
                <label className="block text-[11px] font-mono text-offwhite-dim uppercase mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Master Curator"
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-black/60 border border-charcoal-border text-xs text-offwhite focus:outline-none focus:border-amber"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-offwhite-dim uppercase mb-1">
                  University Email *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="curator@gcuniversity.ac.in"
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-black/60 border border-charcoal-border text-xs text-offwhite focus:outline-none focus:border-amber"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-offwhite-dim uppercase mb-1">
                  Access Key (Password, min 8 chars) *
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-black/60 border border-charcoal-border text-xs text-offwhite focus:outline-none focus:border-amber"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-offwhite-dim uppercase mb-1">
                  Clearance Role *
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as 'superadmin' | 'editor')}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-black/60 border border-charcoal-border text-xs text-offwhite focus:outline-none focus:border-amber"
                >
                  <option value="editor">Editor (Exposures & Content Only)</option>
                  <option value="superadmin">Superadmin (Full Control & Admin Roster)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-charcoal-border">
                <Button type="button" variant="secondary" size="sm" onClick={() => setIsFormOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" disabled={submitting}>
                  {submitting ? 'Provisioning...' : 'Provision Clearance'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {resetId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-sm rounded-3xl bg-charcoal border border-charcoal-border p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-charcoal-border">
              <h3 className="font-title text-base font-bold text-offwhite">
                Reset Access Key
              </h3>
              <button onClick={() => setResetId(null)} className="text-offwhite-dim hover:text-offwhite">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-[11px] font-mono text-offwhite-dim uppercase mb-1">
                  New Password (min 8 chars) *
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-3.5 py-2 rounded-xl bg-black/60 border border-charcoal-border text-xs text-offwhite focus:outline-none focus:border-amber"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-charcoal-border">
                <Button type="button" variant="ghost" size="sm" onClick={() => setResetId(null)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" disabled={resetLoading}>
                  {resetLoading ? 'Updating...' : 'Update Key'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <DeleteModal
        isOpen={!!deletingId}
        title={`Admin Account: ${deletingEmail}`}
        description="This will revoke all darkroom editing credentials for this user. This action cannot be undone."
        loading={deletingLoading}
        onConfirm={confirmDelete}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  );
}
