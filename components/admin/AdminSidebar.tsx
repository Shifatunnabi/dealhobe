'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useState } from 'react';

type NavItem = {
  href: string;
  icon: string;
  label: string;
  soon?: boolean;
};

const navItems: NavItem[] = [
  { href: '/admin',                icon: '🏠', label: 'Dashboard' },
  { href: '/admin/ages',           icon: '🎂', label: 'Age Management' },
  { href: '/admin/brands',         icon: '🏷️', label: 'Brand Management' },
  { href: '/admin/categories',     icon: '🗂️', label: 'Category Management' },
  { href: '/admin/products',       icon: '📦', label: 'Product Listing' },
  { href: '/admin/orders',         icon: '🛒', label: 'Order Management' },
  { href: '/admin/cancelled-orders', icon: '🚫', label: 'Cancelled Orders' },
  { href: '/admin/sales-report',   icon: '📊', label: 'Sales Report' },
  { href: '/admin/hero',           icon: '🖼️', label: 'Hero Section' },
  { href: '/admin/offers',         icon: '🎁', label: 'Offer Management' },
  { href: '/admin/blogs',          icon: '📝', label: 'Blogs' },
  { href: '/admin/chat',           icon: '💬', label: 'Chat' },
  { href: '/admin/user-directory', icon: '👥', label: 'Users' },
  { href: '/admin/reviews',        icon: '⭐', label: 'Customer Reviews' },
  { href: '/admin/parenting-tips', icon: '👶', label: 'Parenting Tips' },
  { href: '/admin/settings',       icon: '⚙️', label: 'Settings' },
];

export default function AdminSidebar() {
  const pathname  = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (href: string) =>
    href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);

  return (
    <aside className={`admin-sidebar ${collapsed ? 'collapsed' : ''}`}>
      {/* Logo / Brand */}
      <div className="admin-sidebar-header">
        <div className="admin-logo">
          <span className="admin-logo-icon">🧸</span>
          {!collapsed && <span className="admin-logo-text">JoyToy <span>Admin</span></span>}
        </div>
        <button
          className="sidebar-toggle"
          onClick={() => setCollapsed(!collapsed)}
          aria-label="Toggle sidebar"
        >
          {collapsed ? '›' : '‹'}
        </button>
      </div>

      {/* Navigation */}
      <nav className="admin-nav">
        {navItems.map(item => (
          <Link
            key={item.href}
            href={item.soon ? '#' : item.href}
            className={`admin-nav-item ${isActive(item.href) ? 'active' : ''} ${item.soon ? 'disabled' : ''}`}
            title={collapsed ? item.label : undefined}
            onClick={item.soon ? e => e.preventDefault() : undefined}
          >
            <span className="nav-icon">{item.icon}</span>
            {!collapsed && (
              <span className="nav-label">
                {item.label}
                {item.soon && <span className="nav-soon">Soon</span>}
              </span>
            )}
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div className="admin-sidebar-footer">
        <button
          className="admin-logout-btn"
          onClick={() => signOut({ callbackUrl: '/admin/login' })}
          title={collapsed ? 'Logout' : undefined}
        >
          <span className="nav-icon">🚪</span>
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
