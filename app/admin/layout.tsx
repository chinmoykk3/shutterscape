import React from 'react';
import type { Metadata } from 'next';
import { ToastProvider } from '@/components/admin/Toast';
import { AdminSidebar } from '@/components/admin/AdminSidebar';

export const metadata: Metadata = {
  title: 'The Editing Room // Curator Dashboard',
  description: 'Administrative console for ShutterScape GCU photography society.',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>
      <AdminSidebar>{children}</AdminSidebar>
    </ToastProvider>
  );
}
