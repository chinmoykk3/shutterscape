import sanitizeHtml from 'sanitize-html';
import type { NextRequest } from 'next/server';
import type { IAdmin } from './models/Admin';

export const MAX_FAILED_ATTEMPTS = 5;
export const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

/**
 * Checks whether an admin account is currently locked out due to failed attempts.
 */
export function isAccountLocked(admin: IAdmin): {
  isLocked: boolean;
  remainingMinutes: number;
} {
  if (!admin.lockUntil) {
    return { isLocked: false, remainingMinutes: 0 };
  }

  const now = Date.now();
  const lockTime = admin.lockUntil.getTime();

  if (lockTime > now) {
    const diffMs = lockTime - now;
    const remainingMinutes = Math.max(1, Math.ceil(diffMs / (60 * 1000)));
    return { isLocked: true, remainingMinutes };
  }

  return { isLocked: false, remainingMinutes: 0 };
}

/**
 * Records a failed login attempt on an admin document.
 * If failed attempts reach MAX_FAILED_ATTEMPTS, locks the account for LOCKOUT_DURATION_MS.
 */
export async function recordFailedLogin(admin: IAdmin): Promise<{
  locked: boolean;
  failedAttempts: number;
  remainingAttempts: number;
  lockUntil?: Date | null;
}> {
  admin.failedAttempts = (admin.failedAttempts || 0) + 1;

  let locked = false;
  if (admin.failedAttempts >= MAX_FAILED_ATTEMPTS) {
    admin.lockUntil = new Date(Date.now() + LOCKOUT_DURATION_MS);
    locked = true;
  }

  await admin.save();

  const remainingAttempts = Math.max(
    0,
    MAX_FAILED_ATTEMPTS - admin.failedAttempts
  );

  return {
    locked,
    failedAttempts: admin.failedAttempts,
    remainingAttempts,
    lockUntil: admin.lockUntil,
  };
}

/**
 * Resets failed login attempts and updates lastLogin timestamp on successful auth.
 */
export async function resetLoginAttempts(admin: IAdmin): Promise<void> {
  admin.failedAttempts = 0;
  admin.lockUntil = null;
  admin.lastLogin = new Date();
  await admin.save();
}

/**
 * Extracts client IP address from standard and proxy HTTP headers.
 */
export function getClientIp(request: Request | NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const ips = forwarded.split(',');
    if (ips[0]) return ips[0].trim();
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp.trim();

  const cfConnectingIp = request.headers.get('cf-connecting-ip');
  if (cfConnectingIp) return cfConnectingIp.trim();

  return '127.0.0.1';
}

/**
 * Lightweight in-memory rate limiter for serverless / edge environments.
 */
interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitRecord>();

export function checkRateLimit(
  key: string,
  maxRequests = 5,
  windowMs = 60 * 1000
): {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
} {
  const now = Date.now();
  const existing = rateLimitMap.get(key);

  // Periodic cleanup if map grows large (> 5000 keys)
  if (rateLimitMap.size > 5000) {
    for (const [k, val] of rateLimitMap.entries()) {
      if (val.resetTime <= now) {
        rateLimitMap.delete(k);
      }
    }
  }

  if (!existing || existing.resetTime <= now) {
    rateLimitMap.set(key, {
      count: 1,
      resetTime: now + windowMs,
    });
    return {
      allowed: true,
      remaining: maxRequests - 1,
      retryAfterSeconds: Math.ceil(windowMs / 1000),
    };
  }

  if (existing.count >= maxRequests) {
    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((existing.resetTime - now) / 1000)
    );
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds,
    };
  }

  existing.count += 1;
  return {
    allowed: true,
    remaining: maxRequests - existing.count,
    retryAfterSeconds: Math.ceil((existing.resetTime - now) / 1000),
  };
}

/**
 * Strips all HTML tags and converts special characters to safe text.
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return '';
  return sanitizeHtml(input, {
    allowedTags: [],
    allowedAttributes: {},
  }).trim();
}

/**
 * Cleans user-generated HTML from TipTap editor allowing only safe rich-text tags.
 */
export function sanitizeHtmlContent(html: string): string {
  if (typeof html !== 'string') return '';
  return sanitizeHtml(html, {
    allowedTags: [
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'blockquote',
      'p',
      'a',
      'ul',
      'ol',
      'nl',
      'li',
      'b',
      'i',
      'strong',
      'em',
      'strike',
      'code',
      'hr',
      'br',
      'div',
      'table',
      'thead',
      'caption',
      'tbody',
      'tr',
      'th',
      'td',
      'pre',
      'img',
      'span',
    ],
    allowedAttributes: {
      a: ['href', 'name', 'target', 'rel'],
      img: ['src', 'alt', 'title', 'width', 'height', 'loading'],
      '*': ['class', 'style'],
    },
    allowedSchemes: ['http', 'https', 'mailto'],
  });
}

/**
 * Validates that an incoming mutation request originates from the same host or allowed origin (CSRF defense).
 */
export function verifyOrigin(request: Request | NextRequest): boolean {
  const origin = request.headers.get('origin');
  const host = request.headers.get('host') || request.headers.get('x-forwarded-host');

  if (origin) {
    try {
      const originUrl = new URL(origin);
      if (host && originUrl.host === host) {
        return true;
      }
      if (process.env.NEXT_PUBLIC_APP_URL) {
        const appUrl = new URL(process.env.NEXT_PUBLIC_APP_URL);
        if (originUrl.host === appUrl.host) {
          return true;
        }
      }
      // Allow localhost in development
      if (
        process.env.NODE_ENV !== 'production' &&
        (originUrl.hostname === 'localhost' || originUrl.hostname === '127.0.0.1')
      ) {
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  const referer = request.headers.get('referer');
  if (referer) {
    try {
      const refererUrl = new URL(referer);
      if (host && refererUrl.host === host) {
        return true;
      }
      if (process.env.NEXT_PUBLIC_APP_URL) {
        const appUrl = new URL(process.env.NEXT_PUBLIC_APP_URL);
        if (refererUrl.host === appUrl.host) {
          return true;
        }
      }
      if (
        process.env.NODE_ENV !== 'production' &&
        (refererUrl.hostname === 'localhost' || refererUrl.hostname === '127.0.0.1')
      ) {
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  // Reject mutations in production if both origin and referer are missing
  if (process.env.NODE_ENV === 'production') {
    return false;
  }

  return true;
}

