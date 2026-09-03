'use client';

import { useEffect, useState } from 'react';
import { FiTag, FiFolder, FiFileText, FiStar, FiBell, FiImage, FiZap } from 'react-icons/fi';
import type { IconType } from 'react-icons';

interface Stats {
  totalBrands:     number;
  totalCategories: number;
  totalBlogs:      number;
  totalReviews:    number;
  pendingReviews:  number;
}

const statCards = (s: Stats) => [
  { icon: FiTag,      label: 'Brands',           value: s.totalBrands,     color: 'blue',   href: '/admin/brands' },
  { icon: FiFolder,   label: 'Categories',       value: s.totalCategories, color: 'yellow', href: '/admin/categories' },
  { icon: FiFileText, label: 'Blog Posts',       value: s.totalBlogs,      color: 'purple', href: '/admin/blogs' },
  { icon: FiStar,     label: 'Total Reviews',    value: s.totalReviews,    color: 'green',  href: '/admin/reviews' },
  { icon: FiBell,     label: 'Pending Reviews',  value: s.pendingReviews,  color: 'yellow', href: '/admin/reviews' },
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
          {statCards(stats).map(s => {
            const Icon = s.icon;
            return (
              <a key={s.label} href={s.href} className="stat-card" style={{ textDecoration: 'none' }}>
                <div className={`stat-icon ${s.color}`}><Icon size={20} /></div>
                <div>
                  <div className="stat-value">{s.value}</div>
                  <div className="stat-label">{s.label}</div>
                </div>
              </a>
            );
          })}
        </div>
      ) : null}

      {/* Quick action shortcuts */}
      <div className="admin-card" style={{ marginTop: '1rem' }}>
        <div className="admin-card-header" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FiZap size={16} /> Quick Actions
        </div>
        <div className="admin-card-body">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: '1rem' }}>
            {quickLinks.map(l => {
              const Icon = l.icon;
              return (
                <a key={l.href} href={l.href} style={{ textDecoration: 'none' }}>
                  <div className="admin-item-card" style={{ cursor: 'pointer', padding: '1.25rem' }}>
                    <div style={{ marginBottom: '0.5rem', color: 'var(--primary-pink)' }}><Icon size={26} /></div>
                    <div className="admin-item-title">{l.label}</div>
                    <div className="admin-item-meta">{l.desc}</div>
                  </div>
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
