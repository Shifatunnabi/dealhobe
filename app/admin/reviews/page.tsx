'use client';

import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { FaStar, FaRegStar } from 'react-icons/fa';
import { FiTrash2 } from 'react-icons/fi';

interface Review {
  _id:          string;
  customerName: string;
  rating:       number;
  review:       string;
  productId:    string;
  isApproved:   boolean;
  isFeatured:   boolean;
  createdAt:    string;
}

export default function ReviewsPage() {
  const [reviews,  setReviews]  = useState<Review[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState<'all'|'pending'|'approved'|'featured'>('all');

  const load = async () => {
    setLoading(true);
    const r = await fetch('/api/admin/reviews');
    setReviews(await r.json());
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const update = async (id: string, data: Partial<Review>) => {
    await fetch('/api/admin/reviews', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, ...data }) });
    toast.success('Review updated');
    load();
  };

  const del = async (id: string) => {
    if (!confirm('Delete this review?')) return;
    await fetch('/api/admin/reviews', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    toast.success('Review deleted');
    load();
  };

  const filtered = reviews.filter(r => {
    if (filter === 'pending')  return !r.isApproved;
    if (filter === 'approved') return r.isApproved;
    if (filter === 'featured') return r.isFeatured;
    return true;
  });

  const stars = (n: number) => (
    <>
      {Array.from({ length: 5 }, (_, i) =>
        i < n ? <FaStar key={i} size={13} /> : <FaRegStar key={i} size={13} />
      )}
    </>
  );

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title"><span className="page-icon"><FaStar size={18} /></span> Customer Reviews</h1>
          <p className="admin-page-subtitle">Moderate reviews and feature them on the homepage.</p>
        </div>
        <div className="badge badge-yellow">{reviews.filter(r => !r.isApproved).length} Pending</div>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {(['all', 'pending', 'approved', 'featured'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '0.45rem 1rem', borderRadius: '20px',
            border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem',
            background: filter === f ? 'var(--primary-pink)' : 'rgba(45,27,78,0.06)',
            color: filter === f ? '#fff' : 'var(--text-dark)',
            transition: 'all 0.2s',
          }}>
            {f === 'all' ? `All (${reviews.length})` : f === 'pending' ? `Pending (${reviews.filter(r => !r.isApproved).length})` : f === 'approved' ? `Approved (${reviews.filter(r => r.isApproved).length})` : `Featured (${reviews.filter(r => r.isFeatured).length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="admin-empty"><div className="spinner" style={{ margin: '0 auto 1rem' }} /><p>Loading…</p></div>
      ) : filtered.length === 0 ? (
        <div className="admin-empty">
          <div className="empty-icon"><FaStar size={36} /></div>
          <h3>No Reviews Here</h3>
          <p>{filter === 'pending' ? 'All reviews have been moderated.' : 'No reviews in this category.'}</p>
        </div>
      ) : (
        <div className="review-grid">
          {filtered.map(r => (
            <div key={r._id} className="review-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <div className="review-stars">{stars(r.rating)}</div>
                <div style={{ display: 'flex', gap: '0.35rem' }}>
                  {r.isApproved && <span className="badge badge-green">Approved</span>}
                  {r.isFeatured && <span className="badge badge-yellow">Featured</span>}
                  {!r.isApproved && <span className="badge badge-red">Pending</span>}
                </div>
              </div>
              <div className="review-name">{r.customerName}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                {new Date(r.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })} {new Date(r.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </div>
              <div className="review-text">{r.review}</div>
              <div className="review-actions">
                <button
                  className={r.isFeatured ? 'btn-admin-success' : 'btn-admin-secondary'}
                  onClick={() => update(r._id, { isFeatured: true, isApproved: true })}
                  style={{ fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  {r.isFeatured && <FaStar size={12} />} {r.isFeatured ? 'On Homepage' : '+ Add to Homepage'}
                </button>
                <button
                  className="btn-admin-danger"
                  onClick={() => update(r._id, { isFeatured: false, isApproved: false })}
                  style={{ fontSize: '0.75rem' }}
                >
                  Hide
                </button>
                <button className="btn-admin-danger" aria-label="Delete review" onClick={() => del(r._id)}><FiTrash2 size={13} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
