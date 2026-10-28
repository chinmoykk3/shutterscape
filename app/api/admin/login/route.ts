import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { connectToDatabase } from '@/lib/db';
import { Admin } from '@/lib/models/Admin';
import { AuditLog } from '@/lib/models/AuditLog';
import { LoginSchema } from '@/lib/validations';
import {
  getClientIp,
  checkRateLimit,
  isAccountLocked,
  recordFailedLogin,
  resetLoginAttempts,
} from '@/lib/security';
import { signSessionToken, setSessionCookie } from '@/lib/auth';
import { verifyTotpToken } from '@/lib/totp';

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);

    // 1. IP Rate Limiting (max 10 requests per minute per IP)
    const rateCheck = checkRateLimit(`login_ip_${ip}`, 10, 60 * 1000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error: `Too many login attempts. Access throttled. Please wait ${rateCheck.retryAfterSeconds} seconds.`,
          retryAfterSeconds: rateCheck.retryAfterSeconds,
        },
        {
          status: 429,
          headers: { 'Retry-After': String(rateCheck.retryAfterSeconds) },
        }
      );
    }

    // 2. Parse & Validate Payload
    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json(
        { error: 'Invalid JSON request payload.' },
        { status: 400 }
      );
    }

    const validation = LoginSchema.safeParse(body);
    if (!validation.success) {
      const issue = validation.error.issues[0]?.message || 'Invalid input credentials.';
      return NextResponse.json({ error: issue }, { status: 400 });
    }

    const { email, password, totpToken } = validation.data;
    const normalizedEmail = email.toLowerCase().trim();

    // 3. Connect DB
    await connectToDatabase();

    // 4. Find Admin Record
    const admin = await Admin.findOne({ email: normalizedEmail });

    if (!admin) {
      // Prevent user enumeration by taking standard timing & recording audit
      await AuditLog.create({
        action: 'login',
        entity: 'Auth',
        details: {
          success: false,
          reason: 'Account not found',
          emailAttempted: normalizedEmail,
        },
        ipAddress: ip,
      });

      return NextResponse.json(
        { error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    // 5. Check if Account is Locked
    const lockStatus = isAccountLocked(admin);
    if (lockStatus.isLocked) {
      await AuditLog.create({
        adminId: admin._id,
        action: 'lockout',
        entity: 'Auth',
        entityId: admin._id.toString(),
        details: {
          reason: 'Attempt while locked out',
          remainingMinutes: lockStatus.remainingMinutes,
        },
        ipAddress: ip,
      });

      return NextResponse.json(
        {
          error: `Darkroom Vault Locked: Too many failed attempts. Try again in ${lockStatus.remainingMinutes} minute(s).`,
          isLocked: true,
          remainingMinutes: lockStatus.remainingMinutes,
        },
        { status: 423 }
      );
    }

    // 6. Verify Password
    const passwordMatch = await bcrypt.compare(password, admin.passwordHash);

    if (!passwordMatch) {
      const failInfo = await recordFailedLogin(admin);

      await AuditLog.create({
        adminId: admin._id,
        action: failInfo.locked ? 'lockout' : 'login',
        entity: 'Auth',
        entityId: admin._id.toString(),
        details: {
          success: false,
          failedAttempts: failInfo.failedAttempts,
          locked: failInfo.locked,
        },
        ipAddress: ip,
      });

      if (failInfo.locked) {
        return NextResponse.json(
          {
            error:
              'Darkroom Vault Locked: Exceeded 5 failed attempts. Account suspended for 15 minutes.',
            isLocked: true,
            remainingMinutes: 15,
          },
          { status: 423 }
        );
      }

      return NextResponse.json(
        {
          error: `Invalid email or password. ${failInfo.remainingAttempts} attempt(s) remaining before security lockout.`,
          remainingAttempts: failInfo.remainingAttempts,
        },
        { status: 401 }
      );
    }

    // 7. Verify Superadmin Clearance — Only superadmin can unlock the admin area
    if (admin.role !== 'superadmin') {
      await AuditLog.create({
        adminId: admin._id,
        action: 'login',
        entity: 'Auth',
        entityId: admin._id.toString(),
        details: {
          success: false,
          reason: 'Access denied: Superadmin role required',
          roleAttempted: admin.role,
        },
        ipAddress: ip,
      });

      return NextResponse.json(
        {
          error:
            'Access Restricted: The Faculty & Admin Editing Room requires Superadmin authorization.',
        },
        { status: 403 }
      );
    }

    // 8. Verify Optional TOTP 2FA if configured
    if (admin.totpSecret) {
      if (!totpToken) {
        return NextResponse.json(
          {
            requireTotp: true,
            message: 'Two-factor authenticator code required.',
          },
          { status: 200 }
        );
      }

      const isTotpValid = verifyTotpToken(admin.totpSecret, totpToken);
      if (!isTotpValid) {
        const failInfo = await recordFailedLogin(admin);
        return NextResponse.json(
          {
            error: `Invalid 2FA authentication code. ${failInfo.remainingAttempts} attempt(s) remaining.`,
            requireTotp: true,
          },
          { status: 401 }
        );
      }
    }

    // 8. Successful Authentication
    await resetLoginAttempts(admin);

    await AuditLog.create({
      adminId: admin._id,
      action: 'login',
      entity: 'Auth',
      entityId: admin._id.toString(),
      details: {
        success: true,
        role: admin.role || 'editor',
      },
      ipAddress: ip,
    });

    // 9. Sign JWT and Set Session Cookie
    const token = await signSessionToken({
      id: admin._id.toString(),
      email: admin.email,
      name: admin.name,
      role: admin.role || 'editor',
    });

    await setSessionCookie(token);

    return NextResponse.json({
      success: true,
      user: {
        id: admin._id.toString(),
        email: admin.email,
        name: admin.name,
        role: admin.role || 'editor',
      },
      message: 'Access granted. Welcome to The Editing Room.',
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal darkroom server error. Please try again.' },
      { status: 500 }
    );
  }
}
