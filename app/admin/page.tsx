'use client';

import { useEffect, useState } from 'react';
import { FiTag, FiFolder, FiFileText, FiStar, FiBell, FiImage, FiZap, FiAlertTriangle } from 'react-icons/fi';
import type { IconType } from 'react-icons';

interface Stats {
  totalBrands:     number;
  totalCategories: number;
  totalBlogs:      number;
  totalReviews:    number;
  pendingReviews:  number;
  lowStockCount?:  number;
  lowStock?:       { productId: string; name: string; variant?: string; quantity: number }[];
}

const statCards = (s: Stats) => [
  { icon: FiTag,      label: 'Brands',           value: s.totalBrands,     color: 'blue',   href: '/admin/brands' },
  { icon: FiFolder,   label: 'Categories',       value: s.totalCategories, color: 'yellow', href: '/admin/categories' },
  { icon: FiFileText, label: 'Blog Posts',       value: s.totalBlogs,      color: 'purple', href: '/admin/blogs' },
  { icon: FiStar,     label: 'Total Reviews',    value: s.totalReviews,    color: 'green',  href: '/admin/reviews' },
  { icon: FiBell,     label: 'Pending Reviews',  value: s.pendingReviews,  color: 'yellow', href: '/admin/reviews' },
  { icon: FiAlertTriangle, label: 'Low / Out of Stock', value: s.lowStockCount ?? 0, color: 'yellow', href: '/admin/products' },
];

const quickLinks: { href: string; icon: IconType; label: string; desc: string }[] = [
  { href: '/admin/hero',  icon: FiImage,    label: 'Manage Hero', desc: 'Update hero slides & top bar' },
  { href: '/admin/blogs', icon: FiFileText, label: 'Write a Blog', desc: 'Publish tips & stories' },
];

export default function AdminDashboard() {
  const [stats,   setStats]   = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(r => r.json())
      .then(d => setStats(d))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* Page header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title"><span className="page-icon"><FiZap size={20} /></span> Dashboard</h1>
          <p className="admin-page-subtitle">Welcome back! Here&apos;s what&apos;s happening at DealHobe.</p>
        </div>
      </div>

      {/* Stat grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          <div className="spinner" style={{ margin: '0 auto 1rem' }} />
          Loading stats…
        </div>
      ) : stats ? (
        <div className="stat-grid">
          {statCards(stats).map(s => {
            const Icon = s.icon;
            return (
              <a key={s.label} href={s.href} className="stat-card">
                <div className={`stat-icon ${s.color}`}><Icon size={20} /></div>
                <div style={{ minWidth: 0 }}>
                  <div className="stat-value">{s.value}</div>
                  <div className="stat-label">{s.label}</div>
                </div>
              </a>
            );
          })}
        </div>
      ) : null}

      {/* Low stock (variant-aware) */}
      {stats?.lowStock && stats.lowStock.length > 0 && (
        <div className="admin-card">
          <div className="admin-card-header">
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}><FiAlertTriangle size={16} /> Low Stock</span>
          </div>
          <div className="admin-table-wrap" style={{ border: 'none', borderRadius: 0, boxShadow: 'none' }}>
            <table className="admin-table">
              <thead><tr><th>Product</th><th>Variant</th><th className="num">Left</th></tr></thead>
              <tbody>
                {stats.lowStock.map((r, i) => (
                  <tr key={`${r.productId}-${i}`}>
                    <td className="cell-title" style={{ fontWeight: 500 }}>{r.name}</td>
                    <td>{r.variant || '—'}</td>
                    <td className="num">{r.quantity === 0 ? <span className="badge badge-red">Out of stock</span> : <span className="badge badge-yellow">{r.quantity}</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Quick action shortcuts */}
      <div className="admin-card" style={{ marginTop: '1rem' }}>
        <div className="admin-card-header">
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}><FiZap size={16} /> Quick Actions</span>
        </div>
        <div className="admin-card-body">
          <div className="admin-grid">
            {quickLinks.map(l => {
              const Icon = l.icon;
              return (
                <a key={l.href} href={l.href} className="admin-item-card quick-link">
                  <span className="quick-link-icon"><Icon size={20} /></span>
                  <span style={{ minWidth: 0 }}>
                    <span className="admin-item-title" style={{ display: 'block' }}>{l.label}</span>
                    <span className="admin-item-meta" style={{ display: 'block', margin: 0 }}>{l.desc}</span>
                  </span>
                </a>
              );
            })}
          </div>
        </div>
      </div>

      {/* Info note
      <div style={{
        marginTop: '2rem',
        background: 'rgba(61,167,228,0.07)',
        border: '1px solid rgba(61,167,228,0.2)',
        borderRadius: '14px',
        padding: '1.25rem 1.5rem',
        fontSize: '0.875rem',
        color: 'var(--text-muted)',
      }}>
        <strong style={{ color: 'var(--accent-blue)' }}>Note:</strong>{' '}
          Product Listing, Order Management, and Offer Management are coming soon and will be implemented in the next phase.
      </div>*/}
    </div>
  );
}
