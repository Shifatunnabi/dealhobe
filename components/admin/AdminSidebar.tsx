'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useState } from 'react';
import {
  FiHome, FiTag, FiFolder, FiPackage, FiShoppingCart, FiSlash, FiBarChart2,
  FiImage, FiGift, FiFileText, FiMessageCircle, FiUsers, FiStar, FiSettings,
  FiShoppingBag, FiLogOut, FiChevronLeft, FiChevronRight,
} from 'react-icons/fi';
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
  { href: '/admin/hero',           icon: FiImage,         label: 'Hero Section' },
  { href: '/admin/offers',         icon: FiGift,          label: 'Offer Management' },
  { href: '/admin/blogs',          icon: FiFileText,      label: 'Blogs' },
  { href: '/admin/chat',           icon: FiMessageCircle, label: 'Chat' },
  { href: '/admin/user-directory', icon: FiUsers,         label: 'Users' },
  { href: '/admin/reviews',        icon: FiStar,          label: 'Customer Reviews' },
  { href: '/admin/settings',       icon: FiSettings,      label: 'Settings' },
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
          <span className="admin-logo-icon"><FiShoppingBag size={20} /></span>
          {!collapsed && <span className="admin-logo-text">DealHobe <span>Admin</span></span>}
        </div>
        <button
          className="sidebar-toggle"
          onClick={() => setCollapsed(!collapsed)}
          aria-label="Toggle sidebar"
        >
          {collapsed ? <FiChevronRight size={16} /> : <FiChevronLeft size={16} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="admin-nav">
        {navItems.map(item => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.soon ? '#' : item.href}
              className={`admin-nav-item ${isActive(item.href) ? 'active' : ''} ${item.soon ? 'disabled' : ''}`}
              title={collapsed ? item.label : undefined}
              onClick={item.soon ? e => e.preventDefault() : undefined}
            >
              <span className="nav-icon"><Icon size={17} /></span>
              {!collapsed && (
                <span className="nav-label">
                  {item.label}
                  {item.soon && <span className="nav-soon">Soon</span>}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="admin-sidebar-footer">
        <button
          className="admin-logout-btn"
          onClick={() => signOut({ callbackUrl: '/admin/login' })}
          title={collapsed ? 'Logout' : undefined}
        >
          <span className="nav-icon"><FiLogOut size={17} /></span>
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
