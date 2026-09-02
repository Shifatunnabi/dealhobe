'use client';

import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import Image from 'next/image';
import ImageUpload from '@/components/admin/ImageUpload';

/* ── Types ─────────────────────────────────────────────────── */
interface HeroSlide { _id: string; imageUrl: string; imagePublicId: string; title: string; subtitle: string; ctaText: string; ctaLink: string; order: number; isActive: boolean; }
interface TopBarText { _id: string; text: string; isActive: boolean; order: number; }

const emptySlide = { title: '', subtitle: '', ctaText: 'Shop Now', ctaLink: '/products', imageUrl: '', imagePublicId: '', order: 0, isActive: true };
const emptyTbText = { text: '', isActive: true, order: 0 };

/* ── Page ───────────────────────────────────────────────────── */
export default function HeroPage() {
  const [slides,   setSlides]   = useState<HeroSlide[]>([]);
  const [topbar,   setTopbar]   = useState<TopBarText[]>([]);
  const [tab,      setTab]      = useState<'slides'|'topbar'>('slides');
  const [loading,  setLoading]  = useState(true);

  // Slides modal
  const [slideModal,   setSlideModal]   = useState(false);
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);
  const [slideForm,    setSlideForm]    = useState({ ...emptySlide });
  const [savingSlide,  setSavingSlide]  = useState(false);

  // Topbar modal
  const [tbModal,   setTbModal]   = useState(false);
  const [editingTb, setEditingTb] = useState<TopBarText | null>(null);
  const [tbForm,    setTbForm]    = useState({ ...emptyTbText });
  const [savingTb,  setSavingTb]  = useState(false);

  const loadSlides = async () => { const r = await fetch('/api/admin/hero/slides'); setSlides(await r.json()); };
  const loadTopbar = async () => { const r = await fetch('/api/admin/hero/topbar');  setTopbar(await r.json()); };

  useEffect(() => {
    Promise.all([loadSlides(), loadTopbar()]).finally(() => setLoading(false));
  }, []);

  /* Slides CRUD */
  const openAddSlide  = () => { setEditingSlide(null); setSlideForm({ ...emptySlide }); setSlideModal(true); };
  const openEditSlide = (s: HeroSlide) => {
    setEditingSlide(s);
    setSlideForm({ title: s.title, subtitle: s.subtitle, ctaText: s.ctaText, ctaLink: s.ctaLink, imageUrl: s.imageUrl, imagePublicId: s.imagePublicId, order: s.order, isActive: s.isActive });
    setSlideModal(true);
  };
  const saveSlide = async () => {
    if (!slideForm.imageUrl) {
      toast.error('Image is required');
      return;
    }
    setSavingSlide(true);
    if (editingSlide) {
      await fetch('/api/admin/hero/slides', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: editingSlide._id, ...slideForm }) });
    } else {
      await fetch('/api/admin/hero/slides', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(slideForm) });
    }
    setSavingSlide(false); setSlideModal(false);
    toast.success(editingSlide ? 'Slide updated' : 'Slide added');
    loadSlides();
  };
  const deleteSlide = async (id: string) => {
    if (!confirm('Delete this slide?')) return;
    await fetch('/api/admin/hero/slides', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    toast.success('Slide deleted');
    loadSlides();
  };

  /* Topbar CRUD */
  const openAddTb  = () => { setEditingTb(null); setTbForm({ ...emptyTbText }); setTbModal(true); };
  const openEditTb = (t: TopBarText) => { setEditingTb(t); setTbForm({ text: t.text, isActive: t.isActive, order: t.order }); setTbModal(true); };
  const saveTb = async () => {
    if (!tbForm.text) {
      toast.error('Text is required');
      return;
    }
    setSavingTb(true);
    if (editingTb) {
      await fetch('/api/admin/hero/topbar', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: editingTb._id, ...tbForm }) });
    } else {
      await fetch('/api/admin/hero/topbar', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(tbForm) });
    }
    setSavingTb(false); setTbModal(false);
    toast.success(editingTb ? 'Top bar text updated' : 'Top bar text added');
    loadTopbar();
  };
  const deleteTb = async (id: string) => {
    if (!confirm('Delete this text?')) return;
    await fetch('/api/admin/hero/topbar', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    toast.success('Top bar text deleted');
    loadTopbar();
  };

  if (loading) return <div className="admin-empty"><div className="spinner" style={{ margin: '0 auto 1rem' }} /><p>Loading…</p></div>;

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title"><span className="page-icon">🖼️</span> Hero Section</h1>
          <p className="admin-page-subtitle">Manage hero slides and top bar announcements.</p>
        </div>
        {tab === 'slides'
          ? <button className="btn-admin-primary" onClick={openAddSlide}>+ Add Slide</button>
          : <button className="btn-admin-primary" onClick={openAddTb}>+ Add Text</button>
        }
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {(['slides', 'topbar'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '0.5rem 1.2rem', borderRadius: '10px', border: 'none', cursor: 'pointer',
            fontWeight: 600, fontSize: '0.875rem',
            background: tab === t ? 'var(--primary-pink)' : 'rgba(45,27,78,0.06)',
            color: tab === t ? '#fff' : 'var(--text-dark)',
            transition: 'all 0.2s',
          }}>
            {t === 'slides' ? '🖼️ Hero Slides' : '📣 Top Bar Texts'}
          </button>
        ))}
      </div>

      {/* Hero Slides */}
      {tab === 'slides' && (
        slides.length === 0 ? (
          <div className="admin-empty">
            <div className="empty-icon">🖼️</div>
            <h3>No Hero Slides</h3>
            <p>Add your first hero slide to update the homepage banner.</p>
          </div>
        ) : (
          <div className="admin-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
            {slides.map(s => (
              <div key={s._id} className="admin-item-card">
                <div style={{ position: 'relative', height: 160 }}>
                  <Image src={s.imageUrl} alt={s.title || 'Hero slide'} fill style={{ objectFit: 'cover' }} />
                  <span className={`badge ${s.isActive ? 'badge-green' : 'badge-red'}`} style={{ position: 'absolute', top: 8, right: 8 }}>
                    {s.isActive ? 'Active' : 'Hidden'}
                  </span>
                </div>
                <div className="admin-item-body">
                  <div className="admin-item-title">{s.title || '(No title)'}</div>
                  <div className="admin-item-meta">{s.subtitle || ''} · Order: {s.order}</div>
                  {s.ctaText && <div className="admin-item-meta">CTA: {s.ctaText} → {s.ctaLink}</div>}
                  <div className="admin-item-actions">
                    <button className="btn-admin-edit"   onClick={() => openEditSlide(s)}>✏️ Edit</button>
                    <button className="btn-admin-danger" onClick={() => deleteSlide(s._id)}>🗑️ Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Top Bar */}
      {tab === 'topbar' && (
        topbar.length === 0 ? (
          <div className="admin-empty">
            <div className="empty-icon">📣</div>
            <h3>No Top Bar Texts</h3>
            <p>One text = static, multiple = auto-slides every 10s.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {topbar.map((t, i) => (
              <div key={t._id} className="admin-card">
                <div className="admin-card-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', padding: '1rem 1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
                    <span style={{ fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.8rem', minWidth: 20 }}>#{i+1}</span>
                    <span style={{ flex: 1 }}>{t.text}</span>
                    <span className={`badge ${t.isActive ? 'badge-green' : 'badge-red'}`}>{t.isActive ? 'Active' : 'Hidden'}</span>
                  </div>
                  <div className="admin-item-actions">
                    <button className="btn-admin-edit"   onClick={() => openEditTb(t)}>✏️</button>
                    <button className="btn-admin-danger" onClick={() => deleteTb(t._id)}>🗑️</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Slide Modal */}
      {slideModal && (
        <div className="modal-overlay">
          <div className="modal-box modal-lg">
            <div className="modal-header">
              {editingSlide ? '✏️ Edit Hero Slide' : '➕ Add Hero Slide'}
              <button className="modal-close" onClick={() => setSlideModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="admin-form">
                <ImageUpload label="Slide Image" value={slideForm.imageUrl} folder="dealhobe/hero" onChange={(url, pid) => setSlideForm(f => ({ ...f, imageUrl: url, imagePublicId: pid }))} />
                <div className="admin-field"><label className="admin-label">Title</label><input className="admin-input" value={slideForm.title} onChange={e => setSlideForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Explore Our World of Toys" /></div>
                <div className="admin-field"><label className="admin-label">Subtitle</label><input className="admin-input" value={slideForm.subtitle} onChange={e => setSlideForm(f => ({ ...f, subtitle: e.target.value }))} placeholder="e.g. Premium imported toys for every child" /></div>
                <div className="admin-form-row">
                  <div className="admin-field"><label className="admin-label">CTA Button Text</label><input className="admin-input" value={slideForm.ctaText} onChange={e => setSlideForm(f => ({ ...f, ctaText: e.target.value }))} /></div>
                  <div className="admin-field"><label className="admin-label">CTA Link</label><input className="admin-input" value={slideForm.ctaLink} onChange={e => setSlideForm(f => ({ ...f, ctaLink: e.target.value }))} /></div>
                </div>
                <div className="admin-form-row">
                  <div className="admin-field"><label className="admin-label">Order</label><input type="number" className="admin-input" value={slideForm.order} onChange={e => setSlideForm(f => ({ ...f, order: +e.target.value }))} /></div>
                  <div className="admin-field" style={{ justifyContent: 'flex-end', paddingBottom: 6 }}>
                    <label className="admin-checkbox-row" style={{ marginTop: 'auto' }}>
                      <input type="checkbox" className="admin-checkbox" checked={slideForm.isActive} onChange={e => setSlideForm(f => ({ ...f, isActive: e.target.checked }))} />
                      <span className="admin-label">Active</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-admin-secondary" onClick={() => setSlideModal(false)}>Cancel</button>
              <button className="btn-admin-primary" onClick={saveSlide} disabled={savingSlide}>{savingSlide ? 'Saving…' : editingSlide ? 'Update' : 'Add Slide'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Topbar Modal */}
      {tbModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-header">
              {editingTb ? '✏️ Edit Top Bar Text' : '➕ Add Top Bar Text'}
              <button className="modal-close" onClick={() => setTbModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="admin-form">
                <div className="admin-field">
                  <label className="admin-label">Announcement Text</label>
                  <input className="admin-input" value={tbForm.text} onChange={e => setTbForm(f => ({ ...f, text: e.target.value }))} placeholder="🚀 Free shipping on orders over ৳500!" />
                  <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>One text = static, multiple = auto-slides every 10 seconds.</small>
                </div>
                <div className="admin-form-row">
                  <div className="admin-field"><label className="admin-label">Order</label><input type="number" className="admin-input" value={tbForm.order} onChange={e => setTbForm(f => ({ ...f, order: +e.target.value }))} /></div>
                  <div className="admin-field" style={{ justifyContent: 'flex-end', paddingBottom: 6 }}>
                    <label className="admin-checkbox-row" style={{ marginTop: 'auto' }}>
                      <input type="checkbox" className="admin-checkbox" checked={tbForm.isActive} onChange={e => setTbForm(f => ({ ...f, isActive: e.target.checked }))} />
                      <span className="admin-label">Active</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-admin-secondary" onClick={() => setTbModal(false)}>Cancel</button>
              <button className="btn-admin-primary" onClick={saveTb} disabled={savingTb}>{savingTb ? 'Saving…' : editingTb ? 'Update' : 'Add Text'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
