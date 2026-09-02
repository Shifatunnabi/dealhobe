'use client';

import { useEffect, useState } from 'react';

interface Stats {
  totalAges:       number;
  totalBrands:     number;
  totalCategories: number;
  totalBlogs:      number;
  totalReviews:    number;
  pendingReviews:  number;
  totalTips:       number;
}

const statCards = (s: Stats) => [
  { icon: '🎂', label: 'Age Ranges',       value: s.totalAges,       color: 'pink',   href: '/admin/ages' },
  { icon: '🏷️', label: 'Brands',           value: s.totalBrands,     color: 'blue',   href: '/admin/brands' },
  { icon: '🗂️', label: 'Categories',       value: s.totalCategories, color: 'yellow', href: '/admin/categories' },
  { icon: '📝', label: 'Blog Posts',       value: s.totalBlogs,      color: 'purple', href: '/admin/blogs' },
  { icon: '⭐', label: 'Total Reviews',    value: s.totalReviews,    color: 'green',  href: '/admin/reviews' },
  { icon: '🔔', label: 'Pending Reviews',  value: s.pendingReviews,  color: 'yellow', href: '/admin/reviews' },
  { icon: '👶', label: 'Parenting Tips',   value: s.totalTips,       color: 'blue',   href: '/admin/parenting-tips' },
];

const quickLinks = [
  { href: '/admin/hero',           icon: '🖼️', label: 'Manage Hero',         desc: 'Update hero slides & top bar' },
  { href: '/admin/ages',           icon: '🎂', label: 'Add Age Range',        desc: 'Manage Shop by Age section' },
  { href: '/admin/blogs',          icon: '📝', label: 'Write a Blog',         desc: 'Publish tips & stories' },
  { href: '/admin/parenting-tips', icon: '👶', label: 'Add Parenting Tip',    desc: 'Share expert parenting advice' },
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
          <h1 className="admin-page-title"><span className="page-icon">🏠</span> Dashboard</h1>
          <p className="admin-page-subtitle">Welcome back! Here's what's happening at DealHobe.</p>
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
          {statCards(stats).map(s => (
            <a key={s.label} href={s.href} className="stat-card" style={{ textDecoration: 'none' }}>
              <div className={`stat-icon ${s.color}`}>{s.icon}</div>
              <div>
                <div className="stat-value">{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            </a>
          ))}
        </div>
      ) : null}

      {/* Quick action shortcuts */}
      <div className="admin-card" style={{ marginTop: '1rem' }}>
        <div className="admin-card-header">⚡ Quick Actions</div>
        <div className="admin-card-body">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: '1rem' }}>
            {quickLinks.map(l => (
              <a key={l.href} href={l.href} style={{ textDecoration: 'none' }}>
                <div className="admin-item-card" style={{ cursor: 'pointer', padding: '1.25rem' }}>
                  <div style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>{l.icon}</div>
                  <div className="admin-item-title">{l.label}</div>
                  <div className="admin-item-meta">{l.desc}</div>
                </div>
              </a>
            ))}
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
        <strong style={{ color: 'var(--accent-blue)' }}>ℹ️ Note:</strong>{' '}
          Product Listing, Order Management, and Offer Management are coming soon and will be implemented in the next phase.
      </div>*/}
    </div>
  );
}
