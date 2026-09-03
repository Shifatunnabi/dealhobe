'use client';

import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import Image from 'next/image';
import { Reorder, useDragControls } from 'framer-motion';
import { FiImage, FiVolume2, FiEdit2, FiTrash2, FiPlus, FiX } from 'react-icons/fi';
import ImageUpload from '@/components/admin/ImageUpload';
import DragHandle from '@/components/admin/DragHandle';
import { renumbered, nextOrder, useReorderPersist } from '@/components/admin/reorderUtils';

/* ── Types ─────────────────────────────────────────────────── */
interface HeroSlide { _id: string; imageUrl: string; imagePublicId: string; ctaText: string; ctaLink: string; ctaColor: string; ctaTextColor: string; order: number; isActive: boolean; }
interface TopBarText { _id: string; text: string; isActive: boolean; order: number; }

const DEFAULT_CTA_COLOR = '#A41B15';
const DEFAULT_CTA_TEXT_COLOR = '#FFFFFF';
const emptySlide = { ctaText: 'Shop Now', ctaLink: '/products', ctaColor: DEFAULT_CTA_COLOR, ctaTextColor: DEFAULT_CTA_TEXT_COLOR, imageUrl: '', imagePublicId: '', order: 0, isActive: true };
const emptyTbText = { text: '', isActive: true, order: 0 };

/* A half-typed hex ("#A9") must not be handed to a swatch or preview. */
const safeColor = (value: string, fallback: string) =>
  /^#[0-9a-fA-F]{6}$/.test(value) ? value : fallback;

/* Native colour picker paired with a hex field, kept in sync. */
function ColorField({
  label, value, fallback, onChange,
}: { label: string; value: string; fallback: string; onChange: (v: string) => void }) {
  return (
    <div className="admin-field">
      <label className="admin-label">{label}</label>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <input
          type="color"
          aria-label={label}
          value={safeColor(value, fallback)}
          onChange={e => onChange(e.target.value.toUpperCase())}
          style={{ width: 48, height: 40, padding: 2, borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', cursor: 'pointer', flexShrink: 0 }}
        />
        <input
          className="admin-input"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={fallback}
          style={{ flex: 1, minWidth: 0 }}
        />
      </div>
    </div>
  );
}

function HeroSlideCard({
  slide, onEdit, onDelete,
}: {
  slide: HeroSlide;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const dragControls = useDragControls();
  return (
    <Reorder.Item as="div" value={slide} dragListener={false} dragControls={dragControls} className="admin-item-card">
      <div style={{ position: 'relative', height: 160 }}>
        <Image src={slide.imageUrl} alt={slide.ctaText || 'Hero slide'} fill style={{ objectFit: 'cover' }} />
        <span className={`badge ${slide.isActive ? 'badge-green' : 'badge-red'}`} style={{ position: 'absolute', top: 8, right: 8 }}>
          {slide.isActive ? 'Active' : 'Hidden'}
        </span>
        <div style={{ position: 'absolute', top: 8, left: 8, background: 'rgba(255,255,255,0.9)', borderRadius: 8, padding: '0.25rem' }}>
          <DragHandle dragControls={dragControls} />
        </div>
      </div>
      <div className="admin-item-body">
        <div className="admin-item-title">
          <span
            style={{
              display: 'inline-flex', alignItems: 'center', borderRadius: 10,
              padding: '0.35rem 0.85rem', fontSize: '0.8rem', fontWeight: 600,
              background: safeColor(slide.ctaColor, DEFAULT_CTA_COLOR),
              color: safeColor(slide.ctaTextColor, DEFAULT_CTA_TEXT_COLOR),
            }}
          >
            {slide.ctaText || 'Shop Now'}
          </span>
        </div>
        <div className="admin-item-meta">→ {slide.ctaLink || '/products'}</div>
        <div className="admin-item-meta">
          Order: {slide.order} · bg {safeColor(slide.ctaColor, DEFAULT_CTA_COLOR)} · text {safeColor(slide.ctaTextColor, DEFAULT_CTA_TEXT_COLOR)}
        </div>
        <div className="admin-item-actions">
          <button className="btn-admin-edit"   onClick={onEdit}><FiEdit2 size={13} /> Edit</button>
          <button className="btn-admin-danger" onClick={onDelete}><FiTrash2 size={13} /> Delete</button>
        </div>
      </div>
    </Reorder.Item>
  );
}

function TopBarRow({
  text, index, onEdit, onDelete,
}: {
  text: TopBarText;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const dragControls = useDragControls();
  return (
    <Reorder.Item as="div" value={text} dragListener={false} dragControls={dragControls} className="admin-card">
      <div className="admin-card-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
          <DragHandle dragControls={dragControls} />
          <span style={{ fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.8rem', minWidth: 20 }}>#{index + 1}</span>
          <span style={{ flex: 1 }}>{text.text}</span>
          <span className={`badge ${text.isActive ? 'badge-green' : 'badge-red'}`}>{text.isActive ? 'Active' : 'Hidden'}</span>
        </div>
        <div className="admin-item-actions">
          <button className="btn-admin-edit"   aria-label="Edit" onClick={onEdit}><FiEdit2 size={13} /></button>
          <button className="btn-admin-danger" aria-label="Delete" onClick={onDelete}><FiTrash2 size={13} /></button>
        </div>
      </div>
    </Reorder.Item>
  );
}

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

  const reorderPersistSlides = useReorderPersist('/api/admin/hero/slides');
  const reorderPersistTopbar = useReorderPersist('/api/admin/hero/topbar');

  const loadSlides = async () => { const r = await fetch('/api/admin/hero/slides'); setSlides(await r.json()); };
  const loadTopbar = async () => { const r = await fetch('/api/admin/hero/topbar');  setTopbar(await r.json()); };

  useEffect(() => {
    Promise.all([loadSlides(), loadTopbar()]).finally(() => setLoading(false));
  }, []);

  const handleReorderSlides = (newOrder: HeroSlide[]) => {
    const renumberedList = renumbered(newOrder);
    reorderPersistSlides(slides, renumberedList);
    setSlides(renumberedList);
  };
  const handleReorderTopbar = (newOrder: TopBarText[]) => {
    const renumberedList = renumbered(newOrder);
    reorderPersistTopbar(topbar, renumberedList);
    setTopbar(renumberedList);
  };

  /* Slides CRUD */
  const openAddSlide  = () => { setEditingSlide(null); setSlideForm({ ...emptySlide, order: nextOrder(slides) }); setSlideModal(true); };
  const openEditSlide = (s: HeroSlide) => {
    setEditingSlide(s);
    setSlideForm({ ctaText: s.ctaText, ctaLink: s.ctaLink, ctaColor: s.ctaColor || DEFAULT_CTA_COLOR, ctaTextColor: s.ctaTextColor || DEFAULT_CTA_TEXT_COLOR, imageUrl: s.imageUrl, imagePublicId: s.imagePublicId, order: s.order, isActive: s.isActive });
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
  const openAddTb  = () => { setEditingTb(null); setTbForm({ ...emptyTbText, order: nextOrder(topbar) }); setTbModal(true); };
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
          <h1 className="admin-page-title"><span className="page-icon"><FiImage size={20} /></span> Hero Section</h1>
          <p className="admin-page-subtitle">Manage hero slides and top bar announcements. Drag to reorder.</p>
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
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.5rem 1.2rem', borderRadius: '10px', border: 'none', cursor: 'pointer',
            fontWeight: 600, fontSize: '0.875rem',
            background: tab === t ? 'var(--primary-pink)' : 'rgba(45,27,78,0.06)',
            color: tab === t ? '#fff' : 'var(--text-dark)',
            transition: 'all 0.2s',
          }}>
            {t === 'slides' ? <FiImage size={15} /> : <FiVolume2 size={15} />}
            {t === 'slides' ? 'Hero Slides' : 'Top Bar Texts'}
          </button>
        ))}
      </div>

      {/* Hero Slides */}
      {tab === 'slides' && (
        slides.length === 0 ? (
          <div className="admin-empty">
            <div className="empty-icon"><FiImage size={40} /></div>
            <h3>No Hero Slides</h3>
            <p>Add your first hero slide to update the homepage banner.</p>
          </div>
        ) : (
          <Reorder.Group
            as="div"
            axis="y"
            values={slides}
            onReorder={handleReorderSlides}
            className="admin-grid"
            style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}
          >
            {slides.map(s => (
              <HeroSlideCard key={s._id} slide={s} onEdit={() => openEditSlide(s)} onDelete={() => deleteSlide(s._id)} />
            ))}
          </Reorder.Group>
        )
      )}

      {/* Top Bar */}
      {tab === 'topbar' && (
        topbar.length === 0 ? (
          <div className="admin-empty">
            <div className="empty-icon"><FiVolume2 size={40} /></div>
            <h3>No Top Bar Texts</h3>
            <p>One text = static, multiple = auto-slides every 10s.</p>
          </div>
        ) : (
          <Reorder.Group
            as="div"
            axis="y"
            values={topbar}
            onReorder={handleReorderTopbar}
            style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
          >
            {topbar.map((t, i) => (
              <TopBarRow key={t._id} text={t} index={i} onEdit={() => openEditTb(t)} onDelete={() => deleteTb(t._id)} />
            ))}
          </Reorder.Group>
        )
      )}

      {/* Slide Modal */}
      {slideModal && (
        <div className="modal-overlay">
          <div className="modal-box modal-lg">
            <div className="modal-header">
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                {editingSlide ? <FiEdit2 size={16} /> : <FiPlus size={16} />} {editingSlide ? 'Edit Hero Slide' : 'Add Hero Slide'}
              </span>
              <button className="modal-close" onClick={() => setSlideModal(false)}><FiX size={16} /></button>
            </div>
            <div className="modal-body">
              <div className="admin-form">
                <ImageUpload label="Slide Image" value={slideForm.imageUrl} folder="dealhobe/hero" onChange={(url, pid) => setSlideForm(f => ({ ...f, imageUrl: url, imagePublicId: pid }))} />
                <div className="admin-form-row">
                  <div className="admin-field"><label className="admin-label">Button Text</label><input className="admin-input" value={slideForm.ctaText} onChange={e => setSlideForm(f => ({ ...f, ctaText: e.target.value }))} placeholder="Shop Now" /></div>
                  <div className="admin-field"><label className="admin-label">Button Link</label><input className="admin-input" value={slideForm.ctaLink} onChange={e => setSlideForm(f => ({ ...f, ctaLink: e.target.value }))} placeholder="/products" /></div>
                </div>
                <div className="admin-form-row">
                  <ColorField
                    label="Button Colour"
                    value={slideForm.ctaColor}
                    fallback={DEFAULT_CTA_COLOR}
                    onChange={v => setSlideForm(f => ({ ...f, ctaColor: v }))}
                  />
                  <ColorField
                    label="Button Text Colour"
                    value={slideForm.ctaTextColor}
                    fallback={DEFAULT_CTA_TEXT_COLOR}
                    onChange={v => setSlideForm(f => ({ ...f, ctaTextColor: v }))}
                  />
                </div>
                <div className="admin-field">
                  <label className="admin-label">Preview</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', borderRadius: 12, background: 'rgba(45,27,78,0.05)' }}>
                    <span
                      style={{
                        display: 'inline-flex', alignItems: 'center', borderRadius: 12,
                        padding: '0.6rem 1.2rem', fontWeight: 600, fontSize: '0.875rem',
                        whiteSpace: 'nowrap',
                        background: safeColor(slideForm.ctaColor, DEFAULT_CTA_COLOR),
                        color: safeColor(slideForm.ctaTextColor, DEFAULT_CTA_TEXT_COLOR),
                      }}
                    >
                      {slideForm.ctaText || 'Shop Now'}
                    </span>
                  </div>
                  <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>The slide shows only the photo and this button — no heading or subtitle.</small>
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
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                {editingTb ? <FiEdit2 size={16} /> : <FiPlus size={16} />} {editingTb ? 'Edit Top Bar Text' : 'Add Top Bar Text'}
              </span>
              <button className="modal-close" onClick={() => setTbModal(false)}><FiX size={16} /></button>
            </div>
            <div className="modal-body">
              <div className="admin-form">
                <div className="admin-field">
                  <label className="admin-label">Announcement Text</label>
                  <input className="admin-input" value={tbForm.text} onChange={e => setTbForm(f => ({ ...f, text: e.target.value }))} placeholder="Free shipping on orders over ৳500!" />
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
