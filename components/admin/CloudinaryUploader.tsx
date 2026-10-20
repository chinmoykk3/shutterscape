'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { X, Loader2, Camera, RefreshCw } from 'lucide-react';
import { useToast } from './Toast';

export interface ImageAsset {
  url: string;
  publicId: string;
  blurDataURL?: string;
  width?: number;
  height?: number;
}

interface CloudinaryUploaderProps {
  value?: ImageAsset | null;
  onChange: (asset: ImageAsset | null) => void;
  folder?: string;
  label?: string;
  helperText?: string;
  aspectRatio?: 'square' | 'video' | 'portrait' | 'auto';
  className?: string;
}

export function CloudinaryUploader({
  value,
  onChange,
  folder = 'shutterscape',
  label = 'Frame Exposure (Image)',
  helperText = 'JPG, PNG, or WebP up to 5MB. Uploaded to Cloudinary with secure signature.',
  aspectRatio = 'auto',
  className = '',
}: CloudinaryUploaderProps) {
  const { error: toastError, success: toastSuccess } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const aspectClass =
    aspectRatio === 'square'
      ? 'aspect-square'
      : aspectRatio === 'video'
      ? 'aspect-video'
      : aspectRatio === 'portrait'
      ? 'aspect-[3/4]'
      : 'min-h-[220px]';

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toastError('Invalid file type. Please upload a JPG, PNG, or WebP photo.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toastError('File exceeds 5MB limit. Please compress the photograph.');
      return;
    }

    setUploading(true);
    setProgress(15);

    try {
      // 1. Fetch signed upload credentials from our API
      const signRes = await fetch('/api/admin/upload/sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folder }),
      });

      if (!signRes.ok) {
        throw new Error('Failed to acquire darkroom signature for upload.');
      }

      const signData = await signRes.json();
      setProgress(40);

      // 2. Upload directly to Cloudinary
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

      if (!cloudRes.ok) {
        throw new Error('Cloudinary exposure upload failed.');
      }

      const cloudData = await cloudRes.json();
      setProgress(90);

      // 3. Generate dynamic tiny blur placeholder using Cloudinary transform
      const blurUrl = cloudData.secure_url.replace(
        '/upload/',
        '/upload/w_20,c_fill,e_blur:1000,f_auto,q_1/'
      );

      const newAsset: ImageAsset = {
        url: cloudData.secure_url,
        publicId: cloudData.public_id,
        blurDataURL: blurUrl,
        width: cloudData.width,
        height: cloudData.height,
      };

      onChange(newAsset);
      toastSuccess('Photograph exposed and saved to cloud storage.');
    } catch (err: unknown) {
      console.error('Upload failed:', err);
      const message = err instanceof Error ? err.message : 'Exposure processing failed.';
      toastError(message);
    } finally {
      setUploading(false);
      setProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!value) return;

    const publicId = value.publicId;
    onChange(null);

    try {
      await fetch(`/api/admin/upload?publicId=${encodeURIComponent(publicId)}`, {
        method: 'DELETE',
      });
      toastSuccess('Asset cleared from darkroom.');
    } catch {
      // If server deletion fails, client-side reference is already cleared
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="block font-mono text-[11px] uppercase tracking-wider text-offwhite-dim font-medium">
            {label}
          </label>
          {value && (
            <span className="font-mono text-[10px] text-amber">
              EXPOSURE LOCKED
            </span>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />

      {value ? (
        <div
          className={`relative rounded-2xl overflow-hidden border border-amber/40 bg-black group ${aspectClass}`}
        >
          <Image
            src={value.url}
            alt="Asset Preview"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />

          {/* Analog Viewfinder HUD Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-4">
            <div className="flex justify-between items-start">
              <span className="px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md text-[10px] font-mono text-amber border border-amber/30">
                {value.width && value.height
                  ? `${value.width} × ${value.height} PX`
                  : '35MM FORMAT'}
              </span>
              <button
                type="button"
                onClick={handleRemove}
                aria-label="Remove photo"
                className="p-1.5 rounded-xl bg-safelight/80 hover:bg-safelight text-white transition-colors shadow-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 rounded-xl bg-charcoal/90 hover:bg-charcoal text-offwhite text-xs font-mono border border-charcoal-border backdrop-blur-md inline-flex items-center gap-2 shadow-lg hover:border-amber transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5 text-amber" />
                Swap Negative
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div
          onClick={() => !uploading && fileInputRef.current?.click()}
          className={`cursor-pointer rounded-2xl border-2 border-dashed border-charcoal-border hover:border-amber/60 bg-charcoal/40 hover:bg-charcoal/70 transition-all flex flex-col items-center justify-center p-6 text-center space-y-3 group ${aspectClass}`}
        >
          {uploading ? (
            <div className="space-y-3 flex flex-col items-center">
              <Loader2 className="w-8 h-8 text-amber animate-spin" />
              <div className="space-y-1 font-mono text-xs">
                <p className="text-amber">Developing Exposure ({progress}%)...</p>
                <p className="text-offwhite-muted text-[10px]">
                  Encrypting signature & transmitting negative
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="p-3.5 rounded-2xl bg-charcoal border border-charcoal-border group-hover:border-amber/40 group-hover:scale-105 transition-all">
                <Camera className="w-6 h-6 text-offwhite-dim group-hover:text-amber transition-colors" />
              </div>
              <div className="space-y-1">
                <p className="font-mono text-xs text-offwhite group-hover:text-amber transition-colors font-medium">
                  Click to expose photo or drag & drop
                </p>
                <p className="font-body text-[11px] text-offwhite-muted max-w-xs">
                  {helperText}
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
