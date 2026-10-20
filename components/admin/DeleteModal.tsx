'use client';

import React from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface DeleteModalProps {
  isOpen: boolean;
  title: string;
  description?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteModal({
  isOpen,
  title,
  description = 'This negative will be permanently purged from the database and any linked Cloudinary assets will be destroyed. This action cannot be reversed.',
  loading = false,
  onConfirm,
  onCancel,
}: DeleteModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div
        className="w-full max-w-md rounded-3xl bg-charcoal border border-safelight/40 p-6 sm:p-7 shadow-[0_0_50px_rgba(179,38,30,0.25)] space-y-5 animate-in zoom-in-95"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-safelight/15 border border-safelight/40 text-safelight">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-title text-lg font-bold text-offwhite">
              Destroy Negative?
            </h3>
            <p className="font-mono text-[11px] text-safelight uppercase tracking-wider">
              Irreversible Exposure Deletion
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <p className="font-mono text-xs text-amber font-semibold">{title}</p>
          <p className="font-body text-xs text-offwhite-dim leading-relaxed">
            {description}
          </p>
        </div>

        <div className="pt-2 flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={loading}
            onClick={onCancel}
          >
            Cancel // Retain
          </Button>
          <Button
            type="button"
            variant="danger"
            size="sm"
            disabled={loading}
            onClick={onConfirm}
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Purging...
              </span>
            ) : (
              'Destroy Negative'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
