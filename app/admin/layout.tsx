import type { Metadata } from 'next';
import '../globals.css';
import './admin.css';
import { AdminLayoutClient } from '@/components/admin/AdminLayoutClient';

export const metadata: Metadata = {
  title: 'DealHobe Admin',
  description: 'DealHobe Admin Panel — manage content, products, and orders.',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}

