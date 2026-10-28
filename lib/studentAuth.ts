import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import type { NextRequest } from 'next/server';

export const MEMBER_COOKIE_NAME = 'shutterscape_member_session';
export const MEMBER_SESSION_MAX_AGE = 60 * 60 * 24 * 14; // 14 days

export interface MemberSessionUser {
  id: string;
  email: string;
  name: string;
  department?: string;
  role: 'member' | 'student';
}

const JWT_SECRET_STRING =
  process.env.JWT_SECRET ||
  'shutterscape-darkroom-vault-secret-key-min-32-chars-long';

const JWT_SECRET = new TextEncoder().encode(JWT_SECRET_STRING);

/**
 * Signs a new JWT for an authenticated student/member session.
 */
export async function signMemberToken(payload: MemberSessionUser): Promise<string> {
  return await new SignJWT({
    id: payload.id,
    email: payload.email,
    name: payload.name,
    department: payload.department || 'General',
    role: payload.role || 'member',
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('14d')
    .sign(JWT_SECRET);
}

/**
 * Verifies a member JWT session token.
 */
export async function verifyMemberToken(token: string): Promise<MemberSessionUser | null> {
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
        department: typeof payload.department === 'string' ? payload.department : undefined,
        role: (payload.role as 'member' | 'student') || 'member',
      };
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Reads and verifies the current member session from Next.js server context cookies.
 */
export async function getMemberSession(): Promise<MemberSessionUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(MEMBER_COOKIE_NAME)?.value;
    if (!token) return null;
    return await verifyMemberToken(token);
  } catch {
    return null;
  }
}

/**
 * Sets the member session cookie.
 */
export async function setMemberSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(MEMBER_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: MEMBER_SESSION_MAX_AGE,
  });
}

/**
 * Clears the member session cookie.
 */
export async function clearMemberSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(MEMBER_COOKIE_NAME);
}

/**
 * Helper to extract and verify member session from an incoming HTTP request.
 */
export async function getMemberSessionFromRequest(
  request: NextRequest | Request
): Promise<MemberSessionUser | null> {
  try {
    let token: string | undefined;

    if ('cookies' in request && typeof request.cookies.get === 'function') {
      token = request.cookies.get(MEMBER_COOKIE_NAME)?.value;
    } else {
      const cookieHeader = request.headers.get('cookie') || '';
      const match = cookieHeader.match(
        new RegExp(`(?:^|;\\s*)${MEMBER_COOKIE_NAME}=([^;]*)`)
      );
      if (match) {
        token = decodeURIComponent(match[1]);
      }
    }

    if (!token) return null;
    return await verifyMemberToken(token);
  } catch {
    return null;
  }
}

/**
 * Route guard requiring a logged-in member.
 */
export async function requireMember(
  request?: NextRequest | Request
): Promise<MemberSessionUser> {
  let session: MemberSessionUser | null = null;
  if (request) {
    session = await getMemberSessionFromRequest(request);
  } else {
    session = await getMemberSession();
  }

  if (!session) {
    throw new Error('Unauthorized: Member login required');
  }

  return session;
}

