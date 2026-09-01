'use client';

import { SessionProvider, useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FiMenu, FiX } from 'react-icons/fi';
import AdminSidebar from '@/components/admin/AdminSidebar';

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router                    = useRouter();
  const pathname                  = usePathname();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session && pathname !== '/admin/login') {
      router.replace('/admin/login');
    }
  }, [session, status, router, pathname]);

  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [pathname]);

  if (status === 'loading') {
    return (
      <div className="admin-loading">
        <div className="admin-spinner" />
        <p>Loading...</p>
      </div>
    );
  }

  if (!session && pathname !== '/admin/login') return null;

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  return (
    <div className="admin-shell">
      <div className="admin-desktop-sidebar">
        <AdminSidebar />
      </div>
      <button
        type="button"
        className="admin-mobile-menu-btn"
        aria-label="Open admin menu"
        onClick={() => setMobileSidebarOpen(true)}
      >
        <FiMenu size={18} />
      </button>

      <div
        className={`admin-mobile-overlay ${mobileSidebarOpen ? 'open' : ''}`}
        onClick={() => setMobileSidebarOpen(false)}
      />

      <aside className={`admin-mobile-drawer ${mobileSidebarOpen ? 'open' : ''}`}>
        <div className="admin-mobile-drawer-close-row">
          <button
            type="button"
            className="admin-mobile-drawer-close"
            aria-label="Close admin menu"
            onClick={() => setMobileSidebarOpen(false)}
          >
            <FiX size={18} />
          </button>
        </div>
        <AdminSidebar />
      </aside>

      <main className="admin-main">
        {children}
      </main>
    </div>
  );
}

export function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AuthGuard>{children}</AuthGuard>
    </SessionProvider>
  );
}
