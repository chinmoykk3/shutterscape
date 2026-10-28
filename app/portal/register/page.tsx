'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Mail, Lock, Camera, BookOpen, ArrowRight, Loader2 } from 'lucide-react';
import { ShutterScapeLogo } from '@/components/ui/ShutterScapeLogo';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

const GCU_DEPARTMENTS = [
  'Computer Science & Engineering',
  'Electronics & Communication Engg',
  'Mechanical Engineering',
  'Civil Engineering',
  'Electrical Engineering',
  'Journalism & Mass Communication',
  'Psychology',
  'Business Administration (BBA/MBA)',
  'Pharmaceutical Sciences',
  'Applied Sciences & Chemistry',
  'Other / Interdisciplinary',
];

export default function MemberRegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [department, setDepartment] = useState('Computer Science & Engineering');
  const [rollNumber, setRollNumber] = useState('');
  const [cameraGear, setCameraGear] = useState('');
  const [instagramHandle, setInstagramHandle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/portal/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          password,
          department,
          rollNumber,
          cameraGear: cameraGear || 'Smartphone / Mirrorless',
          instagramHandle: instagramHandle ? (instagramHandle.startsWith('@') ? instagramHandle : `@${instagramHandle}`) : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to complete registration');
      }

      router.push('/portal');
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-offwhite flex flex-col justify-center items-center px-4 py-20 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-1/4 right-1/3 w-[500px] h-[500px] rounded-full light-leak-amber blur-[150px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] rounded-full light-leak-safelight blur-[150px] pointer-events-none" />

      {/* Center Container */}
      <div className="w-full max-w-lg relative z-10 space-y-8 animate-in fade-in zoom-in-95 duration-500">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <Link href="/" className="inline-block hover:opacity-80 transition-opacity">
            <ShutterScapeLogo variant="combined" />
          </Link>

          <div className="flex items-center justify-center gap-2 pt-2">
            <Badge variant="amber">NEW LENS // ENROLLMENT</Badge>
            <span className="font-mono text-[10px] text-offwhite-dim">COLLECTIVE 2026</span>
          </div>

          <h1 className="font-title text-2xl sm:text-3xl font-black text-offwhite">
            Join ShutterScape Collective
          </h1>
          <p className="font-body text-xs text-offwhite-dim max-w-sm mx-auto">
            Become an official member of GCU&apos;s photography society. Exhibit your perspectives, enter competitions, and master the visual craft.
          </p>
        </div>

        {/* Register Card */}
        <div className="rounded-3xl bg-[#0c0c0e]/90 border border-charcoal-border p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6">
          {error && (
            <div className="p-3.5 rounded-2xl bg-red-950/40 border border-red-500/30 text-xs font-mono text-red-300 animate-in fade-in">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="block font-mono text-[11px] uppercase tracking-wider text-offwhite-dim">
                Full Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-offwhite-dim absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Aryan Deep Singh"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-black/60 border border-charcoal-border text-xs font-mono text-offwhite focus:outline-none focus:border-amber transition-colors"
                />
              </div>
            </div>

            {/* Email & Roll Number Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block font-mono text-[11px] uppercase tracking-wider text-offwhite-dim">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-offwhite-dim absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    required
                    placeholder="name@gcuniversity.ac.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-black/60 border border-charcoal-border text-xs font-mono text-offwhite focus:outline-none focus:border-amber transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block font-mono text-[11px] uppercase tracking-wider text-offwhite-dim">
                  Roll / Enrollment No
                </label>
                <div className="relative">
                  <BookOpen className="w-4 h-4 text-offwhite-dim absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="GCU/2024/042"
                    value={rollNumber}
                    onChange={(e) => setRollNumber(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-black/60 border border-charcoal-border text-xs font-mono text-offwhite focus:outline-none focus:border-amber transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Department */}
            <div className="space-y-1.5">
              <label className="block font-mono text-[11px] uppercase tracking-wider text-offwhite-dim">
                GCU Department / Discipline *
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-black/60 border border-charcoal-border text-xs font-mono text-offwhite focus:outline-none focus:border-amber transition-colors"
              >
                {GCU_DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            {/* Camera Gear & Instagram */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block font-mono text-[11px] uppercase tracking-wider text-offwhite-dim">
                  Primary Camera / Phone
                </label>
                <div className="relative">
                  <Camera className="w-4 h-4 text-offwhite-dim absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Sony A7 / iPhone 15"
                    value={cameraGear}
                    onChange={(e) => setCameraGear(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-black/60 border border-charcoal-border text-xs font-mono text-offwhite focus:outline-none focus:border-amber transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block font-mono text-[11px] uppercase tracking-wider text-offwhite-dim">
                  Instagram Handle
                </label>
                <input
                  type="text"
                  placeholder="@yourhandle"
                  value={instagramHandle}
                  onChange={(e) => setInstagramHandle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-black/60 border border-charcoal-border text-xs font-mono text-offwhite focus:outline-none focus:border-amber transition-colors"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="block font-mono text-[11px] uppercase tracking-wider text-offwhite-dim">
                Create Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-offwhite-dim absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="password"
                  required
                  placeholder="Min 6 characters"
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
              className="w-full justify-center group mt-2"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating Member File...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Register as Club Member
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </Button>
          </form>

          {/* Already have an account */}
          <div className="pt-4 border-t border-charcoal-border/60 text-center">
            <p className="font-mono text-xs text-offwhite-dim">
              Already registered in the guild?{' '}
              <Link href="/portal/login" className="text-amber hover:underline font-bold">
                Sign in to Studio
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

