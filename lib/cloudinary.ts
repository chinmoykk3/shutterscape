import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export { cloudinary };

export interface CloudinaryUploadOptions {
  folder?: string;
  allowedFormats?: string[];
  maxFileSize?: number; // bytes
}

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export function validateImageUpload(file: { type: string; size: number }): { valid: boolean; error?: string } {
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file format. Only JPG, PNG, and WebP images are allowed.',
    };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: 'File size exceeds 5MB limit.',
    };
  }

  return { valid: true };
}

export function getSignedUploadParams(folder: string = 'shutterscape') {
  const timestamp = Math.round(new Date().getTime() / 1000);
  const signature = cloudinary.utils.api_sign_request(
    {
      timestamp,
      folder,
    },
    process.env.CLOUDINARY_API_SECRET as string
  );

  return {
    timestamp,
    signature,
    apiKey: process.env.CLOUDINARY_API_KEY,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    folder,
  };
}

export function getOptimizedImageUrl(
  publicId: string,
  options: { width?: number; height?: number; crop?: string; quality?: string | number } = {}
): string {
  return cloudinary.url(publicId, {
    fetch_format: 'auto',
    quality: options.quality || 'auto',
    width: options.width,
    height: options.height,
    crop: options.crop || 'fill',
    secure: true,
  });
}