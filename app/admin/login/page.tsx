'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  Loader2,
  KeyRound,
} from 'lucide-react';
import { CameraReadout } from '@/components/story/CameraReadout';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get('from') || '/admin/dashboard';
  const isExpired = searchParams.get('expired') === 'true';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [totpToken, setTotpToken] = useState('');
  const [requireTotp, setRequireTotp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    isExpired ? 'Your session expired. Please log in again.' : null
  );
  const [isLocked, setIsLocked] = useState(false);
  const [remainingMinutes, setRemainingMinutes] = useState(0);

  // Countdown timer for lockout duration
  useEffect(() => {
    if (!isLocked || remainingMinutes <= 0) return;

    const timer = setInterval(() => {
      setRemainingMinutes((prev) => {
        if (prev <= 1) {
          setIsLocked(false);
          setError(null);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 60000);

    return () => clearInterval(timer);
  }, [isLocked, remainingMinutes]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || isLocked) return;

    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          totpToken: totpToken.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 423 || data.isLocked) {
          setIsLocked(true);
          setRemainingMinutes(data.remainingMinutes || 15);
        }
        if (data.requireTotp) {
          setRequireTotp(true);
        }
        setError(data.error || 'Authentication failed. Please verify credentials.');
        setLoading(false);
        return;
      }

      // Check if backend requested 2FA code before issuing session
      if (data.requireTotp) {
        setRequireTotp(true);
        setLoading(false);
        return;
      }

      // Successful login
      router.push(returnTo);
      router.refresh();
    } catch {
      setError('Connection to darkroom vault failed. Check network status.');
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto relative z-10">
      {/* Corner Viewfinder Crosshairs (Analog Camera Aesthetic) */}
      <div className="absolute -top-3 -left-3 w-6 h-6 border-t-2 border-l-2 border-amber/40 pointer-events-none" />
      <div className="absolute -top-3 -right-3 w-6 h-6 border-t-2 border-r-2 border-amber/40 pointer-events-none" />
      <div className="absolute -bottom-3 -left-3 w-6 h-6 border-b-2 border-l-2 border-amber/40 pointer-events-none" />
      <div className="absolute -bottom-3 -right-3 w-6 h-6 border-b-2 border-r-2 border-amber/40 pointer-events-none" />

      {/* Main Glassmorphic Darkroom Card */}
      <div className="rounded-3xl bg-charcoal/90 border border-charcoal-border backdrop-blur-2xl p-7 sm:p-9 shadow-[0_0_50px_rgba(0,0,0,0.85)] relative overflow-hidden">
        {/* Amber Ambient Top Highlight */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-transparent via-amber to-transparent opacity-80"
        />

        {/* Header Strip with Camera HUD */}
        <div className="flex flex-col items-center text-center space-y-4 mb-7">
          <div className="inline-flex items-center gap-2">
            <CameraReadout
              mode="VAULT LOCK"
              shutter="1/250s"
              aperture="f/2.8"
              iso="ISO 100"
            />
          </div>

          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2">
              <Badge variant="amber" pulse>
                SUPERADMIN CLEARANCE ONLY
              </Badge>
              <Badge variant="neutral">VAULT LOCK // GCU</Badge>
            </div>
            <h1 className="font-title text-2xl sm:text-3xl font-black text-offwhite tracking-tight">
              The Editing Room Vault
            </h1>
            <p className="font-body text-xs text-offwhite-dim">
              The Faculty & Admin area is strictly locked. Only authorized Superadmin credentials will release the vault lock.
            </p>
          </div>
        </div>

        {/* Role Toggle Switcher */}
        <div className="grid grid-cols-2 p-1 rounded-2xl bg-black/60 border border-charcoal-border text-xs font-mono mb-6">
          <Link
            href="/portal/login"
            className="py-2.5 px-3 rounded-xl text-offwhite-dim hover:text-amber text-center transition-colors flex items-center justify-center gap-1.5"
          >
            Student Member
          </Link>
          <div className="py-2.5 px-3 rounded-xl bg-amber text-black font-bold text-center flex items-center justify-center gap-1.5 shadow-md">
            <span className="w-1.5 h-1.5 rounded-full bg-black animate-pulse" />
            Superadmin Access
          </div>
        </div>

        {/* Error / Lockout Banner */}
        {error && (
          <div
            role="alert"
            className={`mb-6 p-4 rounded-2xl border text-xs font-mono flex items-start gap-3 transition-all ${
              isLocked
                ? 'bg-safelight/15 border-safelight/50 text-[#ff8078]'
                : 'bg-amber/10 border-amber/40 text-amber'
            }`}
          >
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold leading-relaxed">{error}</p>
              {isLocked && remainingMinutes > 0 && (
                <p className="text-[11px] text-offwhite-dim">
                  Lockout cooldown active: ~{remainingMinutes} minute(s) remaining.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Form Controls */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Input */}
          <div className="space-y-1.5">
            <label
              htmlFor="email"
              className="block font-mono text-[11px] uppercase tracking-wider text-offwhite-dim font-medium"
            >
              Superadmin ID / Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-offwhite-muted">
                <Mail className="w-4 h-4" />
              </div>
              <input
                id="email"
                type="email"
                required
                autoFocus={!requireTotp}
                autoComplete="email"
                autoCapitalize="none"
                autoCorrect="off"
                disabled={loading || isLocked || requireTotp}
                placeholder="admin@gcuniversity.ac.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-black/60 border border-charcoal-border text-offwhite placeholder:text-offwhite-muted/50 text-sm font-sans focus:outline-none focus:border-amber focus:ring-1 focus:ring-amber transition-colors disabled:opacity-50"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="block font-mono text-[11px] uppercase tracking-wider text-offwhite-dim font-medium"
              >
                Superadmin Pass / Access Key
              </label>
              <span className="font-mono text-[10px] text-offwhite-muted">
                256-BIT ENCRYPTED
              </span>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-offwhite-muted">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                disabled={loading || isLocked || requireTotp}
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-11 py-3 rounded-2xl bg-black/60 border border-charcoal-border text-offwhite placeholder:text-offwhite-muted/50 text-sm font-sans focus:outline-none focus:border-amber focus:ring-1 focus:ring-amber transition-colors disabled:opacity-50"
              />
              {!requireTotp && (
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-offwhite-muted hover:text-offwhite transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Optional TOTP 2FA Input */}
          {requireTotp && (
            <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="totpToken"
                  className="block font-mono text-[11px] uppercase tracking-wider text-amber font-semibold"
                >
                  Authenticator 6-Digit Code *
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setRequireTotp(false);
                    setTotpToken('');
                  }}
                  className="font-mono text-[10px] text-offwhite-muted hover:text-amber underline"
                >
                  Change Password
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-amber">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  id="totpToken"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  required
                  autoFocus
                  autoComplete="one-time-code"
                  disabled={loading || isLocked}
                  placeholder="123456"
                  value={totpToken}
                  onChange={(e) => setTotpToken(e.target.value.replace(/\D/g, ''))}
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-black/80 border-2 border-amber text-offwhite placeholder:text-offwhite-muted/40 font-mono text-center tracking-[0.5em] text-lg focus:outline-none focus:ring-2 focus:ring-amber shadow-[0_0_20px_rgba(245,158,11,0.2)] transition-all"
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={loading || isLocked || !email || !password || (requireTotp && totpToken.length !== 6)}
              className="w-full py-3.5 rounded-2xl shadow-[0_0_25px_rgba(245,158,11,0.25)] hover:shadow-[0_0_35px_rgba(245,158,11,0.4)]"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Developing Exposure...
                </span>
              ) : isLocked ? (
                <span className="inline-flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Darkroom Locked
                </span>
              ) : requireTotp ? (
                <span className="inline-flex items-center gap-2">
                  Verify 2FA Token
                  <ArrowRight className="w-4 h-4" />
                </span>
              ) : (
                <span className="inline-flex items-center gap-2">
                  Unlock Vault // Enter Admin Area
                  <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </Button>
          </div>
        </form>

        {/* Footer Security Badges */}
        <div className="mt-8 pt-6 border-t border-charcoal-border/70 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] font-mono text-offwhite-muted">
          <div className="inline-flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-amber" />
            <span>BRUTE-FORCE GUARD ACTIVE</span>
          </div>
          <Link
            href="/"
            className="hover:text-amber transition-colors inline-flex items-center gap-1"
          >
            ← Return to Public Gallery
          </Link>
        </div>
      </div>

      {/* Film Sprocket Strip Detail Below Card */}
      <div
        aria-hidden="true"
        className="mt-6 flex items-center justify-center gap-3 opacity-25 select-none"
      >
        <div className="w-2.5 h-3 rounded-sm bg-offwhite border border-offwhite/50" />
        <div className="w-2.5 h-3 rounded-sm bg-offwhite border border-offwhite/50" />
        <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-offwhite">
          KODAK TRI-X 400 • GCU EDITING ROOM • 36 EXP
        </span>
        <div className="w-2.5 h-3 rounded-sm bg-offwhite border border-offwhite/50" />
        <div className="w-2.5 h-3 rounded-sm bg-offwhite border border-offwhite/50" />
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <main className="relative min-h-[85vh] flex items-center justify-center px-4 py-16 sm:py-24 overflow-hidden bg-black">
      {/* Background Darkroom Safelight Glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(245,158,11,0.18)_0%,rgba(179,38,30,0.12)_45%,rgba(0,0,0,0.95)_80%)]"
      />

      {/* Camera Viewfinder Reticle Guides */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-10 border border-offwhite/[0.04] rounded-3xl hidden md:block"
      >
        <div className="absolute top-1/2 left-0 right-0 h-px bg-offwhite/[0.03]" />
        <div className="absolute top-0 bottom-0 left-1/2 w-px bg-offwhite/[0.03]" />
      </div>

      {/* Login Card with Suspense for SearchParams */}
      <Suspense
        fallback={
          <div className="w-full max-w-md mx-auto p-12 text-center font-mono text-xs text-amber animate-pulse">
            CALIBRATING DARKROOM SENSORS...
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </main>
  );
}
