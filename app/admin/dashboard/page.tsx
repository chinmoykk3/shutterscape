'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Calendar,
  Image as ImageIcon,
  Users,
  Plus,
  ShieldCheck,
  ArrowUpRight,
  RefreshCw,
  Clock,
  Sliders,
  Inbox,
  BookOpen,
  UserCheck,
} from 'lucide-react';
import { CameraReadout } from '@/components/story/CameraReadout';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

interface DashboardStats {
  activities: { total: number; published: number };
  gallery: { total: number; published: number };
  members: { total: number; active: number };
  scenes: { total: number };
  submissions?: { unhandled: number };
  stories?: { total: number };
}

interface AuditLogItem {
  _id: string;
  adminId?: { name: string; email: string };
  action: string;
  entity: string;
  details?: Record<string, any>;
  ipAddress?: string;
  timestamp: string;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentLogs, setRecentLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStats = React.useCallback(async () => {
    try {
      const res = await fetch('/api/admin/stats');
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
        setRecentLogs(data.recentLogs || []);
      }
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* Top Header Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-charcoal-border">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Badge variant="amber">FRAME 00 // OVERVIEW</Badge>
            <span className="font-mono text-xs text-offwhite-dim">
              VAULT ACTIVE
            </span>
          </div>
          <h1 className="font-title text-2xl sm:text-3xl font-black text-offwhite tracking-tight">
            The Editing Room
          </h1>
          <p className="font-body text-xs text-offwhite-dim">
            Curate exposures, configure university narratives, and inspect audit logs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <CameraReadout
            mode="CURATOR SUITE"
            shutter="1/500s"
            aperture="f/2.8"
            iso="ISO 200"
          />
          <button
            onClick={fetchStats}
            aria-label="Refresh stats"
            className="p-2.5 rounded-xl bg-charcoal border border-charcoal-border text-offwhite-dim hover:text-amber hover:border-amber/40 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Gallery / Exposures Card */}
        <div className="p-5 rounded-3xl bg-charcoal/80 border border-charcoal-border hover:border-amber/40 transition-all space-y-3 group">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] uppercase tracking-wider text-offwhite-dim">
              Exposures (Gallery)
            </span>
            <div className="p-2 rounded-xl bg-black/60 border border-charcoal-border group-hover:text-amber text-offwhite-dim">
              <ImageIcon className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="font-title text-3xl font-black text-offwhite tabular-nums">
              {loading ? '—' : stats?.gallery.total ?? 0}
            </span>
            <span className="font-mono text-[11px] text-amber">
              {loading ? '' : `${stats?.gallery.published ?? 0} Published`}
            </span>
          </div>
          <div className="pt-1">
            <Link
              href="/admin/gallery"
              className="font-mono text-[11px] text-offwhite-dim hover:text-amber transition-colors inline-flex items-center gap-1"
            >
              Curate negatives <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Activities / Events Card */}
        <div className="p-5 rounded-3xl bg-charcoal/80 border border-charcoal-border hover:border-amber/40 transition-all space-y-3 group">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] uppercase tracking-wider text-offwhite-dim">
              35mm Film Rolls (Activities)
            </span>
            <div className="p-2 rounded-xl bg-black/60 border border-charcoal-border group-hover:text-amber text-offwhite-dim">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="font-title text-3xl font-black text-offwhite tabular-nums">
              {loading ? '—' : stats?.activities.total ?? 0}
            </span>
            <span className="font-mono text-[11px] text-amber">
              {loading ? '' : `${stats?.activities.published ?? 0} Active`}
            </span>
          </div>
          <div className="pt-1">
            <Link
              href="/admin/activities"
              className="font-mono text-[11px] text-offwhite-dim hover:text-amber transition-colors inline-flex items-center gap-1"
            >
              Manage film rolls <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Submissions Inbox Card */}
        <div className="p-5 rounded-3xl bg-charcoal/80 border border-charcoal-border hover:border-amber/40 transition-all space-y-3 group">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] uppercase tracking-wider text-offwhite-dim">
              Student Submissions
            </span>
            <div className="p-2 rounded-xl bg-black/60 border border-charcoal-border group-hover:text-amber text-offwhite-dim">
              <Inbox className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="font-title text-3xl font-black text-offwhite tabular-nums">
              {loading ? '—' : stats?.submissions?.unhandled ?? 0}
            </span>
            <span className="font-mono text-[11px] text-amber">
              Pending Review
            </span>
          </div>
          <div className="pt-1">
            <Link
              href="/admin/submissions"
              className="font-mono text-[11px] text-offwhite-dim hover:text-amber transition-colors inline-flex items-center gap-1"
            >
              Inspect inbox <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Photo Stories Card */}
        <div className="p-5 rounded-3xl bg-charcoal/80 border border-charcoal-border hover:border-amber/40 transition-all space-y-3 group">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] uppercase tracking-wider text-offwhite-dim">
              Photo Stories
            </span>
            <div className="p-2 rounded-xl bg-black/60 border border-charcoal-border group-hover:text-amber text-offwhite-dim">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="font-title text-3xl font-black text-offwhite tabular-nums">
              {loading ? '—' : stats?.stories?.total ?? 0}
            </span>
            <span className="font-mono text-[11px] text-amber">
              Visual Chronicles
            </span>
          </div>
          <div className="pt-1">
            <Link
              href="/admin/stories"
              className="font-mono text-[11px] text-offwhite-dim hover:text-amber transition-colors inline-flex items-center gap-1"
            >
              Manage chronicles <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Actions Strip */}
      <div className="p-6 rounded-3xl bg-charcoal/40 border border-charcoal-border space-y-4">
        <h2 className="font-mono text-xs uppercase tracking-wider text-offwhite-dim font-bold">
          Quick Darkroom Operations
        </h2>
        <div className="flex flex-wrap gap-3">
          <Button href="/admin/activities" variant="primary" size="sm">
            <Plus className="w-3.5 h-3.5" />
            Create Film Roll / Activity
          </Button>
          <Button href="/admin/gallery" variant="secondary" size="sm">
            <Plus className="w-3.5 h-3.5" />
            Upload Photo Exposure
          </Button>
          <Button href="/admin/stories" variant="secondary" size="sm">
            <BookOpen className="w-3.5 h-3.5" />
            Curate Photo Story
          </Button>
          <Button href="/admin/members" variant="secondary" size="sm">
            <Users className="w-3.5 h-3.5" />
            Manage Roster
          </Button>
          <Button href="/admin/submissions" variant="ghost" size="sm">
            <Inbox className="w-3.5 h-3.5" />
            Inbox & Applications
          </Button>
          <Button href="/admin/admins" variant="ghost" size="sm">
            <UserCheck className="w-3.5 h-3.5" />
            Admin Clearances
          </Button>
          <Button href="/admin/settings" variant="ghost" size="sm">
            <Sliders className="w-3.5 h-3.5" />
            Site Settings & Stats
          </Button>
        </div>
      </div>

      {/* Recent Audit Trail Preview */}
      <div className="p-6 rounded-3xl bg-charcoal/80 border border-charcoal-border space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber" />
            <h2 className="font-title text-lg font-bold text-offwhite">
              Recent Darkroom Operations
            </h2>
          </div>
          <Link
            href="/admin/audit-logs"
            className="font-mono text-xs text-amber hover:underline inline-flex items-center gap-1"
          >
            Full Audit Trail →
          </Link>
        </div>

        {loading ? (
          <div className="p-8 text-center font-mono text-xs text-offwhite-dim animate-pulse">
            Reading immutable audit ledgers...
          </div>
        ) : recentLogs.length === 0 ? (
          <div className="p-8 text-center font-mono text-xs text-offwhite-dim">
            No logged curator operations recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="border-b border-charcoal-border text-[11px] text-offwhite-dim uppercase tracking-wider">
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3">Curator</th>
                  <th className="py-2.5 px-3">Action</th>
                  <th className="py-2.5 px-3">Entity</th>
                  <th className="py-2.5 px-3">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal-border/50">
                {recentLogs.map((log) => {
                  const dateStr = new Date(log.timestamp).toLocaleString();
                  const actionColor =
                    log.action === 'create'
                      ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
                      : log.action === 'delete'
                      ? 'text-safelight bg-safelight/10 border-safelight/30'
                      : log.action === 'update'
                      ? 'text-amber bg-amber/10 border-amber/30'
                      : 'text-offwhite-dim bg-charcoal border-charcoal-border';

                  return (
                    <tr
                      key={log._id}
                      className="hover:bg-charcoal-subtle/50 transition-colors"
                    >
                      <td className="py-3 px-3 text-offwhite-dim whitespace-nowrap text-[11px]">
                        <Clock className="w-3 h-3 inline mr-1 text-offwhite-dim/60" />
                        {dateStr}
                      </td>
                      <td className="py-3 px-3 text-offwhite whitespace-nowrap">
                        {log.adminId?.name || log.adminId?.email || 'System / CLI'}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded-lg border text-[10px] uppercase font-bold ${actionColor}`}
                        >
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-offwhite-dim whitespace-nowrap">
                        {log.entity}
                      </td>
                      <td className="py-3 px-3 text-offwhite-dim max-w-xs truncate text-[11px]">
                        {log.details
                          ? JSON.stringify(log.details).substring(0, 60)
                          : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
