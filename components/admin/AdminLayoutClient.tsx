'use client';

import { SessionProvider, useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { FiMenu, FiShoppingBag } from 'react-icons/fi';
import AdminSidebar from '@/components/admin/AdminSidebar';

/* Compact titles for the mobile top bar (longest prefix wins). */
const PAGE_TITLES: [prefix: string, title: string][] = [
  ['/admin/brands',           'Brands'],
  ['/admin/categories',       'Categories'],
  ['/admin/products',         'Products'],
  ['/admin/cancelled-orders', 'Cancelled Orders'],
  ['/admin/orders',           'Orders'],
  ['/admin/sales-report',     'Sales Report'],
  ['/admin/homepage',         'Homepage Builder'],
  ['/admin/hero',             'Top Bar & Hero'],
  ['/admin/offers',           'Offers'],
  ['/admin/blogs',            'Blogs'],
  ['/admin/chat',             'Chat'],
  ['/admin/user-directory',   'Users'],
  ['/admin/reviews',          'Reviews'],
  ['/admin/settings',         'Settings'],
];

function titleFor(pathname: string) {
  if (pathname === '/admin') return 'Dashboard';
  return PAGE_TITLES.find(([prefix]) => pathname.startsWith(prefix))?.[1] ?? 'Admin';
}

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router                    = useRouter();
  const pathname                  = usePathname();

  // The drawer remembers the path it was opened on, so any navigation closes it
  // without needing an effect that resets state.
  const [drawerPath, setDrawerPath] = useState<string | null>(null);
  const drawerOpen = drawerPath !== null && drawerPath === pathname;
  const closeDrawer = () => setDrawerPath(null);

  const menuBtnRef = useRef<HTMLButtonElement>(null);
  const drawerRef  = useRef<HTMLElement>(null);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session && pathname !== '/admin/login') {
      router.replace('/admin/login');
    }
  }, [session, status, router, pathname]);

  // While the drawer is open: Escape closes it, the page behind can't scroll,
  // and focus moves into the drawer (and back to the menu button afterwards).
  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setDrawerPath(null); };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    drawerRef.current?.querySelector<HTMLElement>('a, button')?.focus();
    const menuBtn = menuBtnRef.current;
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      menuBtn?.focus({ preventScroll: true });
    };
  }, [drawerOpen]);

  if (status === 'loading') {
    return (
      <div className="admin-loading">
        <div className="admin-spinner" />
        <p>Loading…</p>
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
        <AdminSidebar variant="rail" />
      </div>

      <div
        className={`admin-mobile-overlay ${drawerOpen ? 'open' : ''}`}
        onClick={closeDrawer}
        aria-hidden="true"
      />

      <aside
        id="admin-mobile-drawer"
        ref={drawerRef}
        className={`admin-mobile-drawer ${drawerOpen ? 'open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Admin menu"
        inert={!drawerOpen}
      >
        <AdminSidebar variant="drawer" onNavigate={closeDrawer} onClose={closeDrawer} />
      </aside>

      <div className="admin-column">
        <header className="admin-topbar">
          <button
            ref={menuBtnRef}
            type="button"
            className="admin-topbar-menu"
            aria-label="Open admin menu"
            aria-expanded={drawerOpen}
            aria-controls="admin-mobile-drawer"
            onClick={() => setDrawerPath(pathname)}
          >
            <FiMenu size={20} />
          </button>
          <div className="admin-topbar-title">{titleFor(pathname)}</div>
          <span className="admin-topbar-mark" aria-hidden="true"><FiShoppingBag size={16} /></span>
        </header>

        <main className="admin-main">
          <div className="admin-content">{children}</div>
        </main>
      </div>
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
