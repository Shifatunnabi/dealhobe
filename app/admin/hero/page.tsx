'use client';

import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { FiVolume2, FiEdit2, FiTrash2, FiPlus, FiX } from 'react-icons/fi';
import DragHandle from '@/components/admin/DragHandle';
import { SortableList, useSortableItem } from '@/components/admin/SortableList';
import { renumbered, nextOrder, saveOrder } from '@/components/admin/reorderUtils';

/* ── Types ─────────────────────────────────────────────────── */
interface TopBarText { _id: string; text: string; isActive: boolean; order: number; }

const emptyTbText = { text: '', isActive: true, order: 0 };

function TopBarRow({
  text, index, onEdit, onDelete,
}: {
  text: TopBarText;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { setNodeRef, style, isDragging, handle } = useSortableItem(text._id);
  return (
    <div ref={setNodeRef} style={style} className={`admin-card${isDragging ? ' is-dragging' : ''}`}>
      <div className="admin-card-body topbar-row">
        <DragHandle handle={handle} />
        <span className="topbar-row-index">#{index + 1}</span>
        <span className="topbar-row-text">{text.text}</span>
        <span className={`badge ${text.isActive ? 'badge-green' : 'badge-red'}`}>{text.isActive ? 'Active' : 'Hidden'}</span>
        <div className="cell-actions topbar-row-actions">
          <button className="btn-admin-edit btn-sm btn-icon"   aria-label="Edit" title="Edit" onClick={onEdit}><FiEdit2 size={14} /></button>
          <button className="btn-admin-danger btn-sm btn-icon" aria-label="Delete" title="Delete" onClick={onDelete}><FiTrash2 size={14} /></button>
        </div>
      </div>
    </div>
  );
}

/* ── Page ───────────────────────────────────────────────────── */
export default function HeroPage() {
  const [topbar,   setTopbar]   = useState<TopBarText[]>([]);
  const [loading,  setLoading]  = useState(true);

  // Topbar modal
  const [tbModal,   setTbModal]   = useState(false);
  const [editingTb, setEditingTb] = useState<TopBarText | null>(null);
  const [tbForm,    setTbForm]    = useState({ ...emptyTbText });
  const [savingTb,  setSavingTb]  = useState(false);


  const loadTopbar = async () => { const r = await fetch('/api/admin/hero/topbar');  setTopbar(await r.json()); };

  useEffect(() => {
    fetch('/api/admin/hero/topbar').then(r => r.json()).then(setTopbar).finally(() => setLoading(false));
  }, []);

  const handleReorderTopbar = (newOrder: TopBarText[]) => {
    const prev = topbar;
    const next = renumbered(newOrder);
    setTopbar(next);
    saveOrder('/api/admin/hero/topbar', next).catch(() => {
      setTopbar(prev);
      toast.error('Could not save the new order');
    });
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
          <h1 className="admin-page-title"><span className="page-icon"><FiVolume2 size={20} /></span> Top Bar</h1>
          <p className="admin-page-subtitle">Announcements shown in the strip above the header. Drag to reorder. Banners live in Homepage Builder.</p>
        </div>
        <button className="btn-admin-primary" onClick={openAddTb}>+ Add Text</button>
      </div>

      {/* Top Bar */}
      {(
        topbar.length === 0 ? (
          <div className="admin-empty">
            <div className="empty-icon"><FiVolume2 size={40} /></div>
            <h3>No Top Bar Texts</h3>
            <p>One text = static, multiple = auto-slides every 10s.</p>
          </div>
        ) : (
          <SortableList
            items={topbar}
            onReorder={handleReorderTopbar}
            style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
          >
            {topbar.map((t, i) => (
              <TopBarRow key={t._id} text={t} index={i} onEdit={() => openEditTb(t)} onDelete={() => deleteTb(t._id)} />
            ))}
          </SortableList>
        )
      )}

      {/* Topbar Modal */}
      {tbModal && (
        <div className="modal-overlay">
          <div className="modal-box" role="dialog" aria-modal="true" aria-label={editingTb ? 'Edit Top Bar Text' : 'Add Top Bar Text'}>
            <div className="modal-header">
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                {editingTb ? <FiEdit2 size={16} /> : <FiPlus size={16} />} {editingTb ? 'Edit Top Bar Text' : 'Add Top Bar Text'}
              </span>
              <button className="modal-close" aria-label="Close" onClick={() => setTbModal(false)}><FiX size={18} /></button>
            </div>
            <div className="modal-body">
              <div className="admin-form">
                <div className="admin-field">
                  <label className="admin-label">Announcement Text</label>
                  <input className="admin-input" value={tbForm.text} onChange={e => setTbForm(f => ({ ...f, text: e.target.value }))} placeholder="Free shipping on orders over ৳500!" />
                  <small className="admin-hint">One text = static, multiple = auto-slides every 10 seconds.</small>
                </div>
                <div className="admin-form-row">
                  <div className="admin-field"><label className="admin-label">Order</label><input type="number" className="admin-input" value={tbForm.order} onChange={e => setTbForm(f => ({ ...f, order: +e.target.value }))} /></div>
                  <div className="admin-field admin-field--end">
                    <label className="admin-checkbox-row">
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
