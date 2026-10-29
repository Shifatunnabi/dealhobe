'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useState } from 'react';
import {
  FiHome, FiTag, FiFolder, FiPackage, FiShoppingCart, FiSlash, FiBarChart2,
  FiImage, FiGift, FiFileText, FiMessageCircle, FiUsers, FiStar, FiSettings,
  FiShoppingBag, FiLogOut, FiChevronLeft, FiChevronRight, FiLayout,
} from 'react-icons/fi';
import { FiX } from 'react-icons/fi';
import type { IconType } from 'react-icons';

type NavItem = {
  href: string;
  icon: IconType;
  label: string;
  soon?: boolean;
};

const navItems: NavItem[] = [
  { href: '/admin',                icon: FiHome,          label: 'Dashboard' },
  { href: '/admin/brands',         icon: FiTag,           label: 'Brand Management' },
  { href: '/admin/categories',     icon: FiFolder,        label: 'Category Management' },
  { href: '/admin/products',       icon: FiPackage,       label: 'Product Listing' },
  { href: '/admin/orders',         icon: FiShoppingCart,  label: 'Order Management' },
  { href: '/admin/cancelled-orders', icon: FiSlash,       label: 'Cancelled Orders' },
  { href: '/admin/sales-report',   icon: FiBarChart2,     label: 'Sales Report' },
  { href: '/admin/homepage',       icon: FiLayout,        label: 'Homepage Builder' },
  { href: '/admin/hero',           icon: FiImage,         label: 'Top Bar' },
  { href: '/admin/offers',         icon: FiGift,          label: 'Offer Management' },
  { href: '/admin/blogs',          icon: FiFileText,      label: 'Blogs' },
  { href: '/admin/chat',           icon: FiMessageCircle, label: 'Chat' },
  { href: '/admin/user-directory', icon: FiUsers,         label: 'Users' },
  { href: '/admin/reviews',        icon: FiStar,          label: 'Customer Reviews' },
  { href: '/admin/settings',       icon: FiSettings,      label: 'Settings' },
];

type SidebarProps = {
  /** `rail` = persistent desktop/tablet sidebar; `drawer` = mobile off-canvas copy. */
  variant?: 'rail' | 'drawer';
  /** Called after a nav link is tapped (the drawer uses it to close itself). */
  onNavigate?: () => void;
  /** Drawer only: renders a close button in the header. */
  onClose?: () => void;
};

// 'auto' follows the viewport (full sidebar on desktop, icon rail on tablet);
// the toggle pins it to an explicit state.
type RailMode = 'auto' | 'expanded' | 'collapsed';
const RAIL_QUERY = '(max-width: 1199.98px)';

export default function AdminSidebar({ variant = 'rail', onNavigate, onClose }: SidebarProps) {
  const pathname  = usePathname();
  const [mode, setMode] = useState<RailMode>('auto');
  const isDrawer = variant === 'drawer';

  const isActive = (href: string) =>
    href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);

  const toggle = () => {
    const autoCollapsed = window.matchMedia(RAIL_QUERY).matches;
    const collapsedNow = mode === 'collapsed' || (mode === 'auto' && autoCollapsed);
    setMode(collapsedNow ? 'expanded' : 'collapsed');
  };

  return (
    <aside
      className={`admin-sidebar admin-sidebar--${variant} ${isDrawer ? '' : `is-${mode}`}`}
      aria-label="Admin navigation"
    >
      {/* Logo / Brand */}
      <div className="admin-sidebar-header">
        <Link href="/admin" className="admin-logo" onClick={onNavigate} title="DealHobe Admin">
          <span className="admin-logo-icon"><FiShoppingBag size={18} /></span>
          <span className="admin-logo-text">DealHobe <span>Admin</span></span>
        </Link>
        {isDrawer ? (
          <button type="button" className="admin-drawer-close" onClick={onClose} aria-label="Close menu">
            <FiX size={18} />
          </button>
        ) : (
          <button type="button" className="sidebar-toggle" onClick={toggle} aria-label="Toggle sidebar width">
            <FiChevronLeft size={16} className="icon-collapse" />
            <FiChevronRight size={16} className="icon-expand" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="admin-nav">
        {navItems.map(item => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.soon ? '#' : item.href}
              className={`admin-nav-item ${active ? 'active' : ''} ${item.soon ? 'disabled' : ''}`}
              title={isDrawer ? undefined : item.label}
              aria-current={active ? 'page' : undefined}
              onClick={item.soon ? e => e.preventDefault() : onNavigate}
            >
              <span className="nav-icon"><Icon size={18} /></span>
              <span className="nav-label">
                {item.label}
                {item.soon && <span className="nav-soon">Soon</span>}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="admin-sidebar-footer">
        <button
          type="button"
          className="admin-logout-btn"
          onClick={() => signOut({ callbackUrl: '/admin/login' })}
          title={isDrawer ? undefined : 'Logout'}
        >
          <span className="nav-icon"><FiLogOut size={18} /></span>
          <span className="logout-label">Logout</span>
        </button>
      </div>
    </aside>
  );
}
