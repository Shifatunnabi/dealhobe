'use client';

import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

interface Category { _id: string; name: string; }
interface Summary { totalOrders: number; totalRevenue: number; totalItems: number; }
interface SkuRow { sku: string; productName: string; unitsSold: number; revenue: number; }
interface CategoryRow { categoryId: string; categoryName: string; unitsSold: number; revenue: number; }
interface DayRow { date: string; orders: number; revenue: number; }
interface ReportData {
  summary: Summary;
  bySku: SkuRow[];
  byCategory: CategoryRow[];
  byDay: DayRow[];
}

export default function ReportsPage() {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [sku, setSku] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ReportData | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [generatedAt, setGeneratedAt] = useState('');
  const [appliedFilters, setAppliedFilters] = useState({ from: '', to: '', sku: '', category: '' });

  useEffect(() => {
    fetch('/api/admin/categories').then(r => r.json()).then(setCategories).catch(() => {});
  }, []);

  const generate = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (from) params.set('from', from);
      if (to) params.set('to', to);
      if (sku.trim()) params.set('sku', sku.trim().toUpperCase());
      if (categoryId) params.set('categoryId', categoryId);
      const res = await fetch(`/api/admin/reports?${params}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to generate report');
      setData(json);
      setGeneratedAt(new Date().toLocaleString());
      setAppliedFilters({
        from,
        to,
        sku: sku.trim().toUpperCase(),
        category: categories.find(c => c._id === categoryId)?.name || '',
      });
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filterSummary = [
    appliedFilters.from && `From: ${appliedFilters.from}`,
    appliedFilters.to && `To: ${appliedFilters.to}`,
    appliedFilters.sku && `SKU: ${appliedFilters.sku}`,
    appliedFilters.category && `Category: ${appliedFilters.category}`,
  ].filter(Boolean).join('  |  ');

  return (
    <div>
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          .admin-sidebar, .admin-desktop-sidebar, .admin-mobile-menu-btn,
          .admin-mobile-overlay, .admin-mobile-drawer { display: none !important; }
          .admin-main { margin: 0 !important; padding: 0.5rem 1rem !important; }
          .admin-shell { display: block !important; }
          .admin-card { break-inside: avoid; border: 1px solid #ccc !important; box-shadow: none !important; margin-bottom: 1rem !important; }
          .admin-card-header { background: #f5f5f5 !important; color: #000 !important; }
        }
        .print-only { display: none; }
      `}} />

      <div className="admin-page-header no-print">
        <div>
          <h1 className="admin-page-title"><span className="page-icon">📊</span> Sales Reports</h1>
          <p className="admin-page-subtitle">Generate order and sales reports filtered by date range, SKU, or category.</p>
        </div>
        {data && (
          <button className="btn-admin-secondary" onClick={() => window.print()}>🖨️ Print Report</button>
        )}
      </div>

      {/* Print-only header */}
      <div className="print-only" style={{ marginBottom: '1.5rem', borderBottom: '2px solid #333', paddingBottom: '0.75rem' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: '0 0 0.25rem' }}>DealHobe — Sales Report</h2>
        <p style={{ margin: '0 0 0.2rem', fontSize: '0.85rem', color: '#555' }}>Generated: {generatedAt}</p>
        {filterSummary && (
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#555' }}>Filters: {filterSummary}</p>
        )}
      </div>

      {/* Filters */}
      <div className="admin-card no-print" style={{ marginBottom: '1.5rem' }}>
        <div className="admin-card-header">🔍 Report Filters</div>
        <div className="admin-card-body">
          <div className="admin-form-row">
            <div className="admin-field">
              <label className="admin-label">From Date</label>
              <input type="date" className="admin-input" value={from} onChange={e => setFrom(e.target.value)} />
            </div>
            <div className="admin-field">
              <label className="admin-label">To Date</label>
              <input type="date" className="admin-input" value={to} onChange={e => setTo(e.target.value)} />
            </div>
          </div>
          <div className="admin-form-row">
            <div className="admin-field">
              <label className="admin-label">Filter by SKU</label>
              <input
                className="admin-input"
                value={sku}
                onChange={e => setSku(e.target.value)}
                placeholder="e.g. JT-ABC12345 — leave blank for all"
                style={{ fontFamily: 'monospace' }}
              />
            </div>
            <div className="admin-field">
              <label className="admin-label">Filter by Category</label>
              <select className="admin-select" value={categoryId} onChange={e => setCategoryId(e.target.value)}>
                <option value="">All Categories</option>
                {categories.map(c => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button className="btn-admin-primary" onClick={generate} disabled={loading}>
              {loading ? 'Generating…' : '📊 Generate Report'}
            </button>
            <button
              className="btn-admin-secondary"
              onClick={() => { setFrom(''); setTo(''); setSku(''); setCategoryId(''); }}
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {!data && !loading && (
        <div className="admin-empty no-print">
          <div className="empty-icon">📊</div>
          <h3>No Report Generated</h3>
          <p>Set your filters and click "Generate Report" to view sales data.</p>
        </div>
      )}

      {data && (
        <>
          {/* Summary cards */}
          <div className="admin-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', marginBottom: '1.5rem' }}>
            <div className="admin-card">
              <div className="admin-card-header">📋 Total Orders</div>
              <div className="admin-card-body" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2.25rem', fontWeight: 700 }}>{data.summary.totalOrders}</div>
              </div>
            </div>
            <div className="admin-card">
              <div className="admin-card-header">💰 Total Revenue</div>
              <div className="admin-card-body" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2.25rem', fontWeight: 700 }}>৳{data.summary.totalRevenue.toLocaleString()}</div>
              </div>
            </div>
            <div className="admin-card">
              <div className="admin-card-header">📦 Items Sold</div>
              <div className="admin-card-body" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2.25rem', fontWeight: 700 }}>{data.summary.totalItems}</div>
              </div>
            </div>
          </div>

          {/* Sales by Day */}
          <div className="admin-card" style={{ marginBottom: '1.5rem' }}>
            <div className="admin-card-header">📅 Sales by Day</div>
            <div className="admin-card-body">
              {data.byDay.length === 0 ? (
                <p style={{ color: 'var(--text-muted)' }}>No orders in the selected period.</p>
              ) : (
                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Orders</th>
                        <th>Revenue (৳)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.byDay.map(row => (
                        <tr key={row.date}>
                          <td>{row.date}</td>
                          <td>{row.orders}</td>
                          <td>৳{row.revenue.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr style={{ fontWeight: 700 }}>
                        <td>Total</td>
                        <td>{data.summary.totalOrders}</td>
                        <td>৳{data.summary.totalRevenue.toLocaleString()}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Sales by SKU */}
          <div className="admin-card" style={{ marginBottom: '1.5rem' }}>
            <div className="admin-card-header">🏷️ Sales by SKU</div>
            <div className="admin-card-body">
              {data.bySku.length === 0 ? (
                <p style={{ color: 'var(--text-muted)' }}>No SKU data for the selected filters.</p>
              ) : (
                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>SKU</th>
                        <th>Product Name</th>
                        <th>Units Sold</th>
                        <th>Revenue (৳)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.bySku.map(row => (
                        <tr key={row.sku}>
                          <td><span className="badge badge-pink" style={{ fontFamily: 'monospace' }}>{row.sku}</span></td>
                          <td>{row.productName}</td>
                          <td>{row.unitsSold}</td>
                          <td>৳{row.revenue.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Sales by Category */}
          <div className="admin-card" style={{ marginBottom: '1.5rem' }}>
            <div className="admin-card-header">🗂️ Sales by Category</div>
            <div className="admin-card-body">
              {data.byCategory.length === 0 ? (
                <p style={{ color: 'var(--text-muted)' }}>No category data for the selected filters.</p>
              ) : (
                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Category</th>
                        <th>Units Sold</th>
                        <th>Revenue (৳)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.byCategory.map(row => (
                        <tr key={row.categoryId}>
                          <td>{row.categoryName}</td>
                          <td>{row.unitsSold}</td>
                          <td>৳{row.revenue.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
