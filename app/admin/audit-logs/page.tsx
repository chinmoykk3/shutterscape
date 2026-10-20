'use client';

import React, { useState, useEffect } from 'react';
import {
  Clock,
  Filter,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Terminal,
} from 'lucide-react';
import { useToast } from '@/components/admin/Toast';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

interface AuditLogRecord {
  _id: string;
  adminId?: { name: string; email: string };
  action: 'create' | 'update' | 'delete' | 'login' | 'logout' | 'lockout';
  entity: string;
  entityId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  timestamp: string;
}

export default function AdminAuditLogsPage() {
  const { error: toastError } = useToast();

  const [logs, setLogs] = useState<AuditLogRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Filters
  const [selectedEntity, setSelectedEntity] = useState('');
  const [selectedAction, setSelectedAction] = useState('');

  const fetchLogs = React.useCallback(async () => {
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: '15',
      });
      if (selectedEntity) params.set('entity', selectedEntity);
      if (selectedAction) params.set('action', selectedAction);

      const res = await fetch(`/api/admin/audit-logs?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setLogs(data.logs);
        setTotalPages(data.pagination.totalPages || 1);
        setTotalCount(data.pagination.total || 0);
      }
    } catch {
      toastError('Failed to fetch immutable audit records.');
    } finally {
      setLoading(false);
    }
  }, [page, selectedEntity, selectedAction, toastError]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-charcoal-border">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="safelight">FRAME 06 // AUDIT TRAIL</Badge>
            <span className="font-mono text-xs text-offwhite-dim">
              {totalCount} Immutable Records Logged
            </span>
          </div>
          <h1 className="font-title text-2xl sm:text-3xl font-black text-offwhite">
            Darkroom Audit Ledger
          </h1>
          <p className="font-body text-xs text-offwhite-dim">
            Tamper-evident logs of every login, modification, exposure creation, and deletion.
          </p>
        </div>

        <button
          onClick={fetchLogs}
          aria-label="Refresh logs"
          className="p-2.5 rounded-xl bg-charcoal border border-charcoal-border text-offwhite-dim hover:text-amber hover:border-amber/40 transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Filter Strip */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 font-mono text-xs text-offwhite-dim">
          <Filter className="w-3.5 h-3.5 text-amber" />
          <span>Filters:</span>
        </div>

        {/* Entity Filter */}
        <select
          value={selectedEntity}
          onChange={(e) => {
            setSelectedEntity(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 rounded-xl bg-charcoal border border-charcoal-border text-xs font-mono text-offwhite focus:outline-none focus:border-amber transition-colors"
        >
          <option value="">All Entities</option>
          <option value="Activity">Activities</option>
          <option value="GalleryItem">Gallery Items</option>
          <option value="Member">Members</option>
          <option value="StoryScene">Story Scenes</option>
          <option value="Settings">Settings</option>
          <option value="Auth">Authentication</option>
        </select>

        {/* Action Filter */}
        <select
          value={selectedAction}
          onChange={(e) => {
            setSelectedAction(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 rounded-xl bg-charcoal border border-charcoal-border text-xs font-mono text-offwhite focus:outline-none focus:border-amber transition-colors"
        >
          <option value="">All Actions</option>
          <option value="create">Create</option>
          <option value="update">Update</option>
          <option value="delete">Delete</option>
          <option value="login">Login</option>
          <option value="logout">Logout</option>
          <option value="lockout">Lockout</option>
        </select>
      </div>

      {/* Audit Log Table */}
      <div className="rounded-3xl bg-charcoal/80 border border-charcoal-border overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-16 text-center font-mono text-xs text-amber animate-pulse">
            AUDITING CIPHERED LEDGERS...
          </div>
        ) : logs.length === 0 ? (
          <div className="p-16 text-center space-y-2">
            <Terminal className="w-8 h-8 text-offwhite-muted mx-auto" />
            <p className="font-mono text-xs text-offwhite">
              No audit logs match current filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="border-b border-charcoal-border text-[11px] text-offwhite-dim uppercase tracking-wider bg-black/40">
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Operator</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Entity</th>
                  <th className="py-3 px-4">IP Address</th>
                  <th className="py-3 px-4">Payload Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal-border/50">
                {logs.map((log) => {
                  const dateStr = new Date(log.timestamp).toLocaleString();
                  const actionColor =
                    log.action === 'create'
                      ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
                      : log.action === 'delete' || log.action === 'lockout'
                      ? 'text-safelight bg-safelight/10 border-safelight/30'
                      : log.action === 'update'
                      ? 'text-amber bg-amber/10 border-amber/30'
                      : 'text-offwhite bg-offwhite/10 border-offwhite/20';

                  return (
                    <tr
                      key={log._id}
                      className="hover:bg-charcoal-subtle/40 transition-colors"
                    >
                      <td className="py-3.5 px-4 text-offwhite-dim whitespace-nowrap text-[11px]">
                        <Clock className="w-3 h-3 inline mr-1 text-offwhite-dim/60" />
                        {dateStr}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="text-offwhite font-medium">
                          {log.adminId?.name || log.adminId?.email || 'System / CLI'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded-lg border text-[10px] uppercase font-bold ${actionColor}`}
                        >
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-amber whitespace-nowrap font-semibold">
                        {log.entity}
                      </td>
                      <td className="py-3.5 px-4 text-offwhite-dim/70 whitespace-nowrap text-[11px]">
                        {log.ipAddress || '—'}
                      </td>
                      <td className="py-3.5 px-4 max-w-sm">
                        <div className="p-1.5 rounded-lg bg-black/60 border border-charcoal-border/70 text-[10px] font-mono text-offwhite-dim truncate">
                          {log.details ? JSON.stringify(log.details) : '—'}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-charcoal-border flex items-center justify-between font-mono text-xs">
            <span className="text-offwhite-dim">
              Page {page} of {totalPages} ({totalCount} total entries)
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Prev
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
