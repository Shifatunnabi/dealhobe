'use client';

import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import Image from 'next/image';
import ImageUpload from '@/components/admin/ImageUpload';

interface ParentingTip {
  _id:           string;
  title:         string;
  details:       string;
  imageUrl:      string;
  imagePublicId: string;
  order:         number;
}

const emptyForm = { title: '', details: '', imageUrl: '', imagePublicId: '', order: 0 };

export default function ParentingTipsPage() {
  const [tips,    setTips]    = useState<ParentingTip[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal,   setModal]   = useState(false);
  const [editing, setEditing] = useState<ParentingTip | null>(null);
  const [form,    setForm]    = useState({ ...emptyForm });
  const [saving,  setSaving]  = useState(false);

  const load = async () => {
    setLoading(true);
    const r = await fetch('/api/admin/parenting-tips');
    setTips(await r.json());
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openAdd  = () => { setEditing(null); setForm({ ...emptyForm }); setModal(true); };
  const openEdit = (t: ParentingTip) => {
    setEditing(t);
    setForm({ title: t.title, details: t.details, imageUrl: t.imageUrl, imagePublicId: t.imagePublicId, order: t.order });
    setModal(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.details || !form.imageUrl) {
      toast.error('All fields are required');
      return;
    }
    setSaving(true);
    if (editing) {
      await fetch('/api/admin/parenting-tips', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: editing._id, ...form }) });
    } else {
      await fetch('/api/admin/parenting-tips', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    }
    setSaving(false);
    setModal(false);
    toast.success(editing ? 'Parenting tip updated' : 'Parenting tip added');
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this parenting tip?')) return;
    await fetch('/api/admin/parenting-tips', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    toast.success('Parenting tip deleted');
    load();
  };

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title"><span className="page-icon">👶</span> Parenting Tips</h1>
          <p className="admin-page-subtitle">Manage expert parenting tip cards shown on the homepage.</p>
        </div>
        <button id="add-tip-btn" className="btn-admin-primary" onClick={openAdd}>+ Add Parenting Tip</button>
      </div>

      {loading ? (
        <div className="admin-empty"><div className="spinner" style={{ margin: '0 auto 1rem' }} /><p>Loading…</p></div>
      ) : tips.length === 0 ? (
        <div className="admin-empty">
          <div className="empty-icon">👶</div>
          <h3>No Parenting Tips Yet</h3>
          <p>Add expert tips to inspire and help parents on the homepage.</p>
        </div>
      ) : (
        <div className="admin-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
          {tips.map(t => (
            <div key={t._id} className="admin-item-card">
              <div style={{ position: 'relative', height: 160 }}>
                <Image src={t.imageUrl} alt={t.title} fill style={{ objectFit: 'cover' }} />
              </div>
              <div className="admin-item-body">
                <div className="admin-item-title">{t.title}</div>
                <div className="admin-item-meta" style={{
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}>
                  {t.details}
                </div>
                <div className="admin-item-meta" style={{ marginTop: '0.25rem' }}>Order: {t.order}</div>
                <div className="admin-item-actions">
                  <button className="btn-admin-edit"   onClick={() => openEdit(t)}>✏️ Edit</button>
                  <button className="btn-admin-danger" onClick={() => handleDelete(t._id)}>🗑️ Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-header">
              {editing ? '✏️ Edit Parenting Tip' : '➕ Add Parenting Tip'}
              <button className="modal-close" onClick={() => setModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="admin-form">
                <div className="admin-field">
                  <label className="admin-label">Title</label>
                  <input className="admin-input" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. How to choose safe toys" />
                </div>
                <div className="admin-field">
                  <label className="admin-label">Details</label>
                  <textarea className="admin-textarea" value={form.details} onChange={e => setForm(f => ({ ...f, details: e.target.value }))} placeholder="Write the tip details…" rows={4} />
                </div>
                <div className="admin-field">
                  <label className="admin-label">Display Order</label>
                  <input type="number" className="admin-input" value={form.order} onChange={e => setForm(f => ({ ...f, order: +e.target.value }))} />
                </div>
                <ImageUpload label="Tip Image" value={form.imageUrl} folder="joytoy/tips" onChange={(url, pid) => setForm(f => ({ ...f, imageUrl: url, imagePublicId: pid }))} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-admin-secondary" onClick={() => setModal(false)}>Cancel</button>
              <button className="btn-admin-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : editing ? 'Update' : 'Add Tip'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
