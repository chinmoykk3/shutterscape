'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Calendar,
  Image as ImageIcon,
  BookOpen,
  Users,
  Film,
  Inbox,
  UserCheck,
  Sliders,
  ShieldAlert,
  LogOut,
  Menu,
  X,
  ExternalLink,
} from 'lucide-react';
import { ShutterScapeLogo } from '@/components/ui/ShutterScapeLogo';
import { Badge } from '@/components/ui/Badge';

const NAV_ITEMS = [
  { href: '/admin/dashboard', label: 'Overview', icon: LayoutDashboard, frame: '00' },
  { href: '/admin/activities', label: 'Activities', icon: Calendar, frame: '01' },
  { href: '/admin/gallery', label: 'Gallery', icon: ImageIcon, frame: '02' },
  { href: '/admin/stories', label: 'Photo Stories', icon: BookOpen, frame: '03' },
  { href: '/admin/members', label: 'Members & Faculty', icon: Users, frame: '04' },
  { href: '/admin/scenes', label: 'Story Scenes', icon: Film, frame: '05' },
  { href: '/admin/submissions', label: 'Submissions', icon: Inbox, frame: '06' },
  { href: '/admin/admins', label: 'Admins & Roster', icon: UserCheck, frame: '07' },
  { href: '/admin/settings', label: 'Site Settings', icon: Sliders, frame: '08' },
  { href: '/admin/audit-logs', label: 'Audit Trail', icon: ShieldAlert, frame: '09' },
];

export function AdminSidebar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // If on login page, render children directly without admin sidebar
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      router.push('/admin/login');
      router.refresh();
    } catch {
      router.push('/admin/login');
    }
  };

  const navContent = (
    <div className="flex flex-col h-full bg-charcoal border-r border-charcoal-border select-none">
      {/* Brand & Mode Header */}
      <div className="p-6 border-b border-charcoal-border/80 space-y-3">
        <Link
          href="/admin/dashboard"
          onClick={() => setMobileOpen(false)}
          className="inline-block"
        >
          <ShutterScapeLogo variant="combined" />
        </Link>
        <div className="flex items-center justify-between">
          <Badge variant="amber" pulse>
            THE EDITING ROOM
          </Badge>
          <div className="flex items-center gap-1.5 font-mono text-[10px] text-safelight">
            <span className="w-1.5 h-1.5 rounded-full bg-safelight animate-pulse" />
            <span>SAFELIGHT ON</span>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/admin/dashboard' && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-mono transition-all ${
                isActive
                  ? 'bg-amber text-black font-semibold shadow-[0_0_20px_rgba(245,158,11,0.25)]'
                  : 'text-offwhite-muted hover:text-offwhite hover:bg-charcoal-subtle'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 ${isActive ? 'text-black' : 'text-offwhite-dim'}`}
                />
                <span>{item.label}</span>
              </div>
              <span
                className={`text-[10px] tabular-nums ${
                  isActive ? 'text-black/60' : 'text-offwhite-dim/40'
                }`}
              >
                {item.frame}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Footer Utility Actions */}
      <div className="p-4 border-t border-charcoal-border/80 space-y-2">
        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-mono text-offwhite-muted hover:text-offwhite hover:bg-charcoal-subtle transition-colors"
        >
          <span className="inline-flex items-center gap-2">
            <ExternalLink className="w-3.5 h-3.5 text-amber" />
            Public Story
          </span>
          <span className="text-[10px] text-amber">LIVE ↗</span>
        </Link>

        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-mono text-safelight hover:bg-safelight/15 transition-colors disabled:opacity-50"
        >
          <span className="inline-flex items-center gap-2">
            <LogOut className="w-3.5 h-3.5" />
            {loggingOut ? 'Closing Vault...' : 'Exit Editing Room'}
          </span>
          <span className="text-[10px] opacity-60">ESC</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-offwhite flex flex-col md:flex-row">
      {/* Desktop Sticky Sidebar */}
      <aside
        aria-label="Admin Navigation"
        className="hidden md:block w-64 lg:w-72 shrink-0 h-screen sticky top-0 z-30"
      >
        {navContent}
      </aside>

      {/* Mobile Header Bar */}
      <header className="md:hidden sticky top-0 z-40 bg-charcoal/95 border-b border-charcoal-border backdrop-blur-md px-4 py-3 flex items-center justify-between">
        <ShutterScapeLogo variant="combined" />
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle editing room menu"
          className="p-2 rounded-xl bg-charcoal border border-charcoal-border text-offwhite"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Mobile Slide-out Drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative w-72 max-w-[80vw] h-full z-10">
            {navContent}
          </div>
        </div>
      )}

      {/* Main Content Workspace */}
      <main className="flex-1 p-4 sm:p-6 lg:p-10 max-w-7xl mx-auto w-full overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
