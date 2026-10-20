import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET_STRING =
  process.env.JWT_SECRET ||
  'shutterscape-darkroom-vault-secret-key-min-32-chars-long';

const JWT_SECRET = new TextEncoder().encode(JWT_SECRET_STRING);
const SESSION_COOKIE_NAME = 'shutterscape_session';

/**
 * Checks whether an incoming request has a valid matching origin for CSRF protection.
 */
function isSafeOrigin(request: NextRequest): boolean {
  // Safe read-only HTTP methods
  if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
    return true;
  }

  const origin = request.headers.get('origin');
  const host = request.headers.get('host') || request.headers.get('x-forwarded-host');

  if (origin) {
    try {
      const originUrl = new URL(origin);
      if (host && originUrl.host === host) return true;
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
      if (host && refererUrl.host === host) return true;
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

  return process.env.NODE_ENV !== 'production';
}

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // 1. Enforce Origin check for mutation requests on admin routes
  if (!isSafeOrigin(request)) {
    return NextResponse.json(
      { error: 'Forbidden: Invalid request origin.' },
      { status: 403 }
    );
  }

  // Allow unauthenticated access to public admin auth API routes
  if (pathname === '/api/admin/login' || pathname === '/api/admin/logout') {
    return NextResponse.next();
  }

  const sessionToken = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  let isValidSession = false;
  let adminId: string | undefined;
  let adminEmail: string | undefined;

  if (sessionToken) {
    try {
      const { payload } = await jwtVerify(sessionToken, JWT_SECRET, {
        algorithms: ['HS256'],
      });
      if (typeof payload.id === 'string' && typeof payload.email === 'string') {
        isValidSession = true;
        adminId = payload.id;
        adminEmail = payload.email;
      }
    } catch {
      isValidSession = false;
    }
  }

  // Case 1: Visiting /admin/login while already logged in -> redirect to dashboard
  if (pathname === '/admin/login') {
    if (isValidSession) {
      const url = request.nextUrl.clone();
      url.pathname = '/admin/dashboard';
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // Case 2: Protected Admin API route (/api/admin/*)
  if (pathname.startsWith('/api/admin/')) {
    if (!isValidSession) {
      return NextResponse.json(
        { error: 'Unauthorized: Admin authentication required.' },
        { status: 401 }
      );
    }
  }

  // Case 3: Protected Admin Page route (/admin/*)
  if (pathname.startsWith('/admin')) {
    if (!isValidSession) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = '/admin/login';
      const destination = pathname + search;
      if (destination !== '/admin' && destination !== '/admin/dashboard') {
        loginUrl.searchParams.set('from', destination);
      }

      const response = NextResponse.redirect(loginUrl);
      if (sessionToken) {
        response.cookies.delete(SESSION_COOKIE_NAME);
      }
      return response;
    }
  }

  // Case 4: Valid Session - Pass through and forward headers
  const requestHeaders = new Headers(request.headers);
  if (adminId) requestHeaders.set('x-admin-id', adminId);
  if (adminEmail) requestHeaders.set('x-admin-email', adminEmail);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
