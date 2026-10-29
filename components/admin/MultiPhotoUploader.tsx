'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import {
  UploadCloud,
  X,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Plus,
  Image as ImageIcon,
  CheckCircle2,
} from 'lucide-react';
import { useToast } from './Toast';

export interface ActivityGalleryItem {
  url: string;
  publicId: string;
  caption?: string;
  blurDataURL?: string;
  width?: number;
  height?: number;
}

interface MultiPhotoUploaderProps {
  items: ActivityGalleryItem[];
  onChange: (items: ActivityGalleryItem[]) => void;
  folder?: string;
  label?: string;
  helperText?: string;
}

export function MultiPhotoUploader({
  items = [],
  onChange,
  folder = 'shutterscape/activities',
  label = 'Event Negatives & Multi-Photo Gallery',
  helperText = 'Upload multiple exposures from this past or upcoming assignment. Drag or multi-select JPG, PNG, or WebP.',
}: MultiPhotoUploaderProps) {
  const { error: toastError, success: toastSuccess } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [dragOver, setDragOver] = useState(false);

  const uploadSingleFile = async (
    file: File,
    signData: any
  ): Promise<ActivityGalleryItem | null> => {
    // Attempt 1: Direct signed upload to Cloudinary
    if (signData?.isConfigured) {
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('api_key', signData.apiKey);
        formData.append('timestamp', String(signData.timestamp));
        formData.append('signature', signData.signature);
        formData.append('folder', signData.folder);

        const cloudRes = await fetch(
          `https://api.cloudinary.com/v1_1/${signData.cloudName}/image/upload`,
          {
            method: 'POST',
            body: formData,
          }
        );

        if (cloudRes.ok) {
          const cloudData = await cloudRes.json();
          const blurUrl = cloudData.secure_url.replace(
            '/upload/',
            '/upload/w_20,c_fill,e_blur:1000,f_auto,q_1/'
          );
          return {
            url: cloudData.secure_url,
            publicId: cloudData.public_id,
            blurDataURL: blurUrl,
            width: cloudData.width,
            height: cloudData.height,
            caption: '',
          };
        }
      } catch (err) {
        console.warn('Direct upload failed for file, using relay:', err);
      }
    }

    // Attempt 2: Server relay endpoint
    try {
      const relayForm = new FormData();
      relayForm.append('file', file);
      relayForm.append('folder', folder);

      const serverRes = await fetch('/api/admin/upload', {
        method: 'POST',
        body: relayForm,
      });

      if (serverRes.ok) {
        const serverData = await serverRes.json();
        return {
          url: serverData.asset.url,
          publicId: serverData.asset.publicId,
          blurDataURL: serverData.asset.blurDataURL,
          width: serverData.asset.width,
          height: serverData.asset.height,
          caption: '',
        };
      }
    } catch (err) {
      console.error('Server upload failed for file:', err);
    }

    return null;
  };

  const handleFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    if (!fileArray.length) return;

    // Filter valid files
    const validFiles = fileArray.filter((file) => {
      const isAllowed = ['image/jpeg', 'image/png', 'image/webp'].includes(file.type);
      const isUnderLimit = file.size <= 5 * 1024 * 1024;
      return isAllowed && isUnderLimit;
    });

    if (validFiles.length < fileArray.length) {
      toastError('Some files were skipped (only JPG/PNG/WebP under 5MB accepted).');
    }

    if (!validFiles.length) return;

    setUploading(true);
    setUploadStatus(`Preparing ${validFiles.length} photo(s)...`);

    try {
      // Fetch signature
      const signRes = await fetch('/api/admin/upload/sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folder }),
      });

      const signData = signRes.ok ? await signRes.json() : null;

      const newUploadedItems: ActivityGalleryItem[] = [];

      for (let i = 0; i < validFiles.length; i++) {
        const file = validFiles[i];
        setUploadStatus(`Exposing negative ${i + 1} of ${validFiles.length} (${file.name})...`);

        const uploadedItem = await uploadSingleFile(file, signData);
        if (uploadedItem) {
          newUploadedItems.push(uploadedItem);
        }
      }

      if (newUploadedItems.length > 0) {
        onChange([...items, ...newUploadedItems]);
        toastSuccess(`${newUploadedItems.length} photo(s) added to event gallery.`);
      } else {
        toastError('Failed to upload the selected photos.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Upload process failed';
      toastError(msg);
    } finally {
      setUploading(false);
      setUploadStatus('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeItem = (index: number) => {
    const updated = items.filter((_, i) => i !== index);
    onChange(updated);
  };

  const updateCaption = (index: number, newCaption: string) => {
    const updated = [...items];
    updated[index] = { ...updated[index], caption: newCaption };
    onChange(updated);
  };

  const moveItem = (index: number, direction: 'left' | 'right') => {
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    const updated = [...items];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      {/* Header and Telemetry */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <label className="block font-mono text-xs uppercase tracking-wider text-offwhite flex items-center gap-2">
            <ImageIcon className="w-3.5 h-3.5 text-amber" />
            {label}
            {items.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-amber/15 text-amber text-[10px] font-bold">
                {items.length} {items.length === 1 ? 'Exposure' : 'Exposures'}
              </span>
            )}
          </label>
          {helperText && (
            <p className="font-body text-xs text-offwhite-dim mt-0.5">{helperText}</p>
          )}
        </div>

        {items.length > 0 && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-charcoal border border-charcoal-border hover:border-amber/50 text-xs font-mono text-offwhite hover:text-amber transition-colors self-start sm:self-auto disabled:opacity-50"
          >
            <Plus className="w-3.5 h-3.5" />
            Add More Negatives
          </button>
        )}
      </div>

      {/* Hidden Multi-file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          if (e.target.files) handleFiles(e.target.files);
        }}
      />

      {/* Uploading Status Overlay Bar */}
      {uploading && (
        <div className="p-4 rounded-2xl bg-amber/10 border border-amber/30 flex items-center gap-3 animate-pulse">
          <Loader2 className="w-5 h-5 text-amber animate-spin shrink-0" />
          <div className="space-y-0.5 flex-1 min-w-0">
            <p className="text-xs font-mono font-medium text-amber truncate">{uploadStatus}</p>
            <p className="text-[11px] font-mono text-offwhite-dim">
              Uploading high-fidelity negatives directly to Cloudinary cloud...
            </p>
          </div>
        </div>
      )}

      {/* Dropzone when empty */}
      {items.length === 0 && !uploading && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
          }}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-3xl p-8 sm:p-10 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center gap-3 ${
            dragOver
              ? 'border-amber bg-amber/5 scale-[1.01]'
              : 'border-charcoal-border hover:border-amber/40 bg-black/40 hover:bg-black/60'
          }`}
        >
          <div className="w-12 h-12 rounded-2xl bg-charcoal border border-charcoal-border flex items-center justify-center text-offwhite-dim group-hover:text-amber transition-colors">
            <UploadCloud className="w-6 h-6 text-amber/80" />
          </div>
          <div className="space-y-1">
            <p className="font-mono text-xs text-offwhite font-medium">
              Click to browse or drop multiple event photos here
            </p>
            <p className="font-mono text-[11px] text-offwhite-dim">
              Upload event gallery (Photowalk shots, darkroom sessions, student frames)
            </p>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-charcoal border border-charcoal-border text-[10px] font-mono text-amber">
            <CheckCircle2 className="w-3 h-3" /> Select multiple photos simultaneously
          </div>
        </div>
      )}

      {/* Gallery Cards Grid */}
      {items.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-1">
          {items.map((item, idx) => (
            <div
              key={item.publicId || idx}
              className="group relative rounded-2xl bg-charcoal border border-charcoal-border hover:border-amber/40 transition-all overflow-hidden flex flex-col justify-between"
            >
              {/* Negative Header Bar */}
              <div className="flex items-center justify-between px-3 py-1.5 bg-black/80 border-b border-charcoal-border text-[10px] font-mono text-offwhite-dim">
                <span className="text-amber font-bold">
                  FRAME #{String(idx + 1).padStart(2, '0')}
                </span>
                <div className="flex items-center gap-1">
                  {/* Move Left */}
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => moveItem(idx, 'left')}
                    aria-label="Move negative backward"
                    className="p-1 rounded hover:bg-charcoal text-offwhite-dim hover:text-offwhite disabled:opacity-30 disabled:pointer-events-none"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  {/* Move Right */}
                  <button
                    type="button"
                    disabled={idx === items.length - 1}
                    onClick={() => moveItem(idx, 'right')}
                    aria-label="Move negative forward"
                    className="p-1 rounded hover:bg-charcoal text-offwhite-dim hover:text-offwhite disabled:opacity-30 disabled:pointer-events-none"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={() => removeItem(idx)}
                    aria-label="Remove negative"
                    className="p-1 rounded hover:bg-safelight/20 text-offwhite-dim hover:text-safelight transition-colors ml-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Photo Viewfinder Thumbnail */}
              <div className="relative aspect-[16/10] w-full bg-black overflow-hidden">
                <Image
                  src={item.url}
                  alt={item.caption || `Event exposure ${idx + 1}`}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* Caption Input */}
              <div className="p-2.5 bg-black/40 border-t border-charcoal-border">
                <input
                  type="text"
                  placeholder="Caption / shot context (optional)..."
                  value={item.caption || ''}
                  onChange={(e) => updateCaption(idx, e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-xl bg-charcoal border border-charcoal-border text-xs text-offwhite placeholder:text-offwhite-dim/40 focus:outline-none focus:border-amber transition-colors font-body"
                />
              </div>
            </div>
          ))}

          {/* Quick Add Card in Grid */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="aspect-[16/10] sm:aspect-auto sm:min-h-[160px] rounded-2xl border-2 border-dashed border-charcoal-border hover:border-amber/50 bg-black/20 hover:bg-black/50 transition-all flex flex-col items-center justify-center gap-2 text-offwhite-dim hover:text-amber p-4"
          >
            <Plus className="w-6 h-6" />
            <span className="font-mono text-xs font-medium">Add More Frames</span>
            <span className="font-mono text-[10px] text-offwhite-dim/60">Multi-select supported</span>
          </button>
        </div>
      )}
    </div>
  );
}

