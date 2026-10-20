import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a Date into Indian Standard Time (Asia/Kolkata) human-readable string
 */
export function formatDate(date: string | Date, includeTime = false): string {
  const parsed = new Date(date);
  if (isNaN(parsed.getTime())) return 'Invalid Date';

  const options: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Kolkata',
    ...(includeTime ? { hour: '2-digit', minute: '2-digit', hour12: true } : {}),
  };

  return new Intl.DateTimeFormat('en-IN', options).format(parsed);
}

/**
 * Computes whether an activity date is upcoming in Asia/Kolkata timezone
 * Rule: date >= now (Asia/Kolkata)
 */
export function isUpcomingDate(date: string | Date): boolean {
  const target = new Date(date).getTime();
  const nowISTString = new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
  const nowIST = new Date(nowISTString).getTime();
  return target >= nowIST;
}

/**
 * Generates an ultra-lightweight darkroom shimmer base64 SVG placeholder for next/image
 */
export function getDarkroomBlurPlaceholder(width = 16, height = 10): string {
  const svg = `<svg width="${width}" height="${height}" version="1.1" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop stop-color="#070708" offset="0%"/><stop stop-color="#18181c" offset="50%"/><stop stop-color="#0d0d10" offset="100%"/></linearGradient></defs><rect width="${width}" height="${height}" fill="url(#g)"/></svg>`;
  const base64 =
    typeof window === 'undefined'
      ? Buffer.from(svg).toString('base64')
      : window.btoa(svg);
  return `data:image/svg+xml;base64,${base64}`;
}

/**
 * Converts a string into a URL-friendly kebab-case slug
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}