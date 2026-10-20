'use client';

import React, { useState } from 'react';
import { Share2, Check } from 'lucide-react';

export function ShareButton({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    if (typeof window === 'undefined') return;

    if (navigator.share) {
      try {
        await navigator.share({
          title,
          url: window.location.href,
        });
        return;
      } catch {
        // User cancelled or not supported, fall back to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Failed to copy link:', e);
    }
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-charcoal border border-charcoal-border hover:border-amber/50 text-xs font-mono text-offwhite transition-all hover:bg-white/5"
      aria-label="Share this exposure"
    >
      {copied ? (
        <>
          <Check className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-emerald-400">Copied to Clipboard!</span>
        </>
      ) : (
        <>
          <Share2 className="w-3.5 h-3.5 text-amber" />
          <span>Share Roll</span>
        </>
      )}
    </button>
  );
}
