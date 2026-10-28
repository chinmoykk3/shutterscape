'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock, Mail, ArrowRight, Loader2 } from 'lucide-react';
import { ShutterScapeLogo } from '@/components/ui/ShutterScapeLogo';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export default function MemberLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/portal/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to sign in');
      }

      router.push('/portal');
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-offwhite flex flex-col justify-center items-center px-4 py-20 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] rounded-full light-leak-amber blur-[150px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full light-leak-safelight blur-[150px] pointer-events-none" />

      {/* Center Container */}
      <div className="w-full max-w-md relative z-10 space-y-8 animate-in fade-in zoom-in-95 duration-500">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <Link href="/" className="inline-block hover:opacity-80 transition-opacity">
            <ShutterScapeLogo variant="combined" />
          </Link>

          <div className="flex items-center justify-center gap-2 pt-2">
            <Badge variant="amber">STUDENT // MEMBER STUDIO</Badge>
            <span className="font-mono text-[10px] text-offwhite-dim">FRAME 05</span>
          </div>

          <h1 className="font-title text-2xl sm:text-3xl font-black text-offwhite">
            Lensman Access
          </h1>
          <p className="font-body text-xs text-offwhite-dim max-w-xs mx-auto">
            Log in to submit your photographs, track curatorial reviews, and curate your club portfolio.
          </p>
        </div>

        {/* Login Card */}
        <div className="rounded-3xl bg-[#0c0c0e]/90 border border-charcoal-border p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6">
          {/* Role Toggle Switcher */}
          <div className="grid grid-cols-2 p-1 rounded-2xl bg-black/60 border border-charcoal-border text-xs font-mono">
            <div className="py-2.5 px-3 rounded-xl bg-amber text-black font-bold text-center flex items-center justify-center gap-1.5 shadow-md">
              <span className="w-1.5 h-1.5 rounded-full bg-black animate-pulse" />
              Student Member
            </div>
            <Link
              href="/admin/login"
              className="py-2.5 px-3 rounded-xl text-offwhite-dim hover:text-amber text-center transition-colors flex items-center justify-center gap-1.5"
            >
              Faculty / Admin
            </Link>
          </div>

          {error && (
            <div className="p-3.5 rounded-2xl bg-red-950/40 border border-red-500/30 text-xs font-mono text-red-300 animate-in fade-in">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="block font-mono text-[11px] uppercase tracking-wider text-offwhite-dim">
                Student / Member Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-offwhite-dim absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  required
                  placeholder="student@gcuniversity.ac.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-black/60 border border-charcoal-border text-xs font-mono text-offwhite focus:outline-none focus:border-amber transition-colors"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block font-mono text-[11px] uppercase tracking-wider text-offwhite-dim">
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-offwhite-dim absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-black/60 border border-charcoal-border text-xs font-mono text-offwhite focus:outline-none focus:border-amber transition-colors"
                />
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full justify-center group"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Calibrating Shutter...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Enter Member Studio
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </Button>
          </form>

          {/* Registration link */}
          <div className="pt-4 border-t border-charcoal-border/60 text-center space-y-2">
            <p className="font-mono text-xs text-offwhite-dim">
              New photographer at GCU?{' '}
              <Link href="/portal/register" className="text-amber hover:underline font-bold">
                Join the Collective
              </Link>
            </p>
            <p className="font-mono text-[10px] text-offwhite-dim/60">
              Are you a faculty curator or club admin?{' '}
              <Link href="/admin/login" className="text-offwhite-dim hover:text-amber underline">
                Admin Darkroom
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

