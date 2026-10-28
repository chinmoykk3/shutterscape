import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import type { NextRequest } from 'next/server';
import { verifyOrigin } from './security';

export { verifyOrigin };

export const SESSION_COOKIE_NAME = 'shutterscape_session';
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: 'superadmin' | 'editor';
}

const JWT_SECRET_STRING =
  process.env.JWT_SECRET ||
  'shutterscape-darkroom-vault-secret-key-min-32-chars-long';

const JWT_SECRET = new TextEncoder().encode(JWT_SECRET_STRING);

/**
 * Signs a new JWT for an authenticated admin session using jose.
 */
export async function signSessionToken(payload: SessionUser): Promise<string> {
  return await new SignJWT({
    id: payload.id,
    email: payload.email,
    name: payload.name,
    role: payload.role || 'editor',
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);
}

/**
 * Verifies a JWT session token and returns the payload, or null if invalid/expired.
 */
export async function verifySessionToken(
  token: string
): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET, {
      algorithms: ['HS256'],
    });

    if (
      typeof payload.id === 'string' &&
      typeof payload.email === 'string' &&
      typeof payload.name === 'string'
    ) {
      return {
        id: payload.id,
        email: payload.email,
        name: payload.name,
        role: (payload.role as 'superadmin' | 'editor') || 'editor',
      };
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Reads and verifies the current session from Next.js server context cookies.
 */
export async function getSession(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return null;
    return await verifySessionToken(token);
  } catch {
    return null;
  }
}

/**
 * Sets the session cookie in the Next.js cookies store.
 */
export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

/**
 * Clears the session cookie from the Next.js cookies store.
 */
export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

/**
 * Helper to extract and verify session from an incoming HTTP request (e.g. in middleware or edge handlers).
 */
export async function getSessionFromRequest(
  request: NextRequest | Request
): Promise<SessionUser | null> {
  try {
    let token: string | undefined;

    if ('cookies' in request && typeof request.cookies.get === 'function') {
      token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    } else {
      const cookieHeader = request.headers.get('cookie') || '';
      const match = cookieHeader.match(
        new RegExp(`(?:^|;\\s*)${SESSION_COOKIE_NAME}=([^;]*)`)
      );
      if (match) {
        token = decodeURIComponent(match[1]);
      }
    }

    if (!token) return null;
    return await verifySessionToken(token);
  } catch {
    return null;
  }
}

/**
 * Guard function to enforce an active admin session in Server Actions and Route Handlers.
 * Polymorphic signature:
 * - requireAdmin()
 * - requireAdmin(request)
 * - requireAdmin('superadmin')
 * - requireAdmin('superadmin', request)
 */
export async function requireAdmin(
  roleOrRequest?: 'superadmin' | 'editor' | NextRequest | Request,
  maybeRequest?: NextRequest | Request
): Promise<SessionUser> {
  let role: 'superadmin' | 'editor' | undefined;
  let request: NextRequest | Request | undefined;

  if (typeof roleOrRequest === 'string') {
    role = roleOrRequest;
    request = maybeRequest;
  } else if (roleOrRequest && typeof roleOrRequest === 'object') {
    request = roleOrRequest as NextRequest | Request;
  }

  let session: SessionUser | null = null;
  if (request) {
    session = await getSessionFromRequest(request);
  } else {
    session = await getSession();
  }

  if (!session) {
    throw new Error('Unauthorized: Superadmin session required');
  }

  // Strictly enforce superadmin access across the admin area
  if (session.role !== 'superadmin') {
    throw new Error('Forbidden: Superadmin credentials required to unlock admin area');
  }

  return session;
}

/**
 * Route handler guard that checks authentication and origin, returning either the session or a 401/403 NextResponse.
 * Polymorphic signature:
 * - guardAdminApi()
 * - guardAdminApi(request)
 * - guardAdminApi('superadmin')
 * - guardAdminApi('superadmin', request)
 */
export async function guardAdminApi(
  roleOrRequest?: 'superadmin' | 'editor' | NextRequest | Request,
  maybeRequest?: NextRequest | Request
): Promise<{ session: SessionUser | null; errorResponse: import('next/server').NextResponse | null }> {
  const { NextResponse } = await import('next/server');

  let role: 'superadmin' | 'editor' | undefined;
  let request: NextRequest | Request | undefined;

  if (typeof roleOrRequest === 'string') {
    role = roleOrRequest;
    request = maybeRequest;
  } else if (roleOrRequest && typeof roleOrRequest === 'object') {
    request = roleOrRequest as NextRequest | Request;
  }

  // 1. Verify Origin for mutations
  if (request && !['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
    if (!verifyOrigin(request)) {
      return {
        session: null,
        errorResponse: NextResponse.json(
          { error: 'Forbidden: Invalid request origin (CSRF protection).' },
          { status: 403 }
        ),
      };
    }
  }

  // 2. Verify Session & Role
  try {
    const session = await requireAdmin(role, request);
    return { session, errorResponse: null };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unauthorized';
    const isForbidden = message.includes('Forbidden') || message.includes('clearance');
    return {
      session: null,
      errorResponse: NextResponse.json(
        { error: message },
        { status: isForbidden ? 403 : 401 }
      ),
    };
  }
}
