'use client';

import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import Image from 'next/image';
import ImageUpload from '@/components/admin/ImageUpload';

interface AgeRange {
  _id:           string;
  label:         string;
  minAge:        number;
  maxAge:        number;
  imageUrl:      string;
  imagePublicId: string;
  order:         number;
}

const emptyForm = { label: '', minAge: 0, maxAge: 2, imageUrl: '', imagePublicId: '', order: 0 };

export default function AgesPage() {
  const [ages,    setAges]    = useState<AgeRange[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal,   setModal]   = useState(false);
  const [editing, setEditing] = useState<AgeRange | null>(null);
  const [form,    setForm]    = useState({ ...emptyForm });
  const [saving,  setSaving]  = useState(false);

  const load = async () => {
    setLoading(true);
    const r = await fetch('/api/admin/ages');
    setAges(await r.json());
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditing(null); setForm({ ...emptyForm }); setModal(true); };
  const openEdit = (a: AgeRange) => { setEditing(a); setForm({ label: a.label, minAge: a.minAge, maxAge: a.maxAge, imageUrl: a.imageUrl, imagePublicId: a.imagePublicId, order: a.order }); setModal(true); };

  const handleSave = async () => {
    if (!form.label || !form.imageUrl) {
      toast.error('Label and image are required');
      return;
    }
    setSaving(true);
    if (editing) {
      await fetch('/api/admin/ages', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: editing._id, ...form }) });
    } else {
      await fetch('/api/admin/ages', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    }
    setSaving(false);
    setModal(false);
    toast.success(editing ? 'Age range updated' : 'Age range added');
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this age range?')) return;
    await fetch('/api/admin/ages', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    toast.success('Age range deleted');
    load();
  };

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title"><span className="page-icon">🎂</span> Age Management</h1>
          <p className="admin-page-subtitle">Manage age ranges for Shop by Age section and product filters.</p>
        </div>
        <button id="add-age-btn" className="btn-admin-primary" onClick={openAdd}>+ Add Age Range</button>
      </div>

      {loading ? (
        <div className="admin-empty"><div className="spinner" style={{ margin: '0 auto 1rem' }} /><p>Loading…</p></div>
      ) : ages.length === 0 ? (
        <div className="admin-empty">
          <div className="empty-icon">🎂</div>
          <h3>No Age Ranges Yet</h3>
          <p>Add your first age range to get started.</p>
        </div>
      ) : (
        <div className="admin-grid">
          {ages.map(a => (
            <div key={a._id} className="admin-item-card">
              <div className="admin-item-image" style={{ position: 'relative', height: 140 }}>
                <Image src={a.imageUrl} alt={a.label} fill style={{ objectFit: 'cover' }} />
              </div>
              <div className="admin-item-body">
                <div className="admin-item-title">{a.label}</div>
                <div className="admin-item-meta">{a.minAge}–{a.maxAge} years · Order: {a.order}</div>
                <div className="admin-item-actions">
                  <button className="btn-admin-edit"   onClick={() => openEdit(a)}>✏️ Edit</button>
                  <button className="btn-admin-danger" onClick={() => handleDelete(a._id)}>🗑️ Delete</button>
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
              {editing ? '✏️ Edit Age Range' : '➕ Add Age Range'}
              <button className="modal-close" onClick={() => setModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="admin-form">
                <div className="admin-field">
                  <label className="admin-label">Label (e.g. "0–2 Years")</label>
                  <input className="admin-input" value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))} placeholder="0–2 Years" />
                </div>
                <div className="admin-form-row">
                  <div className="admin-field">
                    <label className="admin-label">Min Age</label>
                    <input type="number" className="admin-input" value={form.minAge} min={0} onChange={e => setForm(f => ({ ...f, minAge: +e.target.value }))} />
                  </div>
                  <div className="admin-field">
                    <label className="admin-label">Max Age</label>
                    <input type="number" className="admin-input" value={form.maxAge} min={0} onChange={e => setForm(f => ({ ...f, maxAge: +e.target.value }))} />
                  </div>
                </div>
                <div className="admin-field">
                  <label className="admin-label">Display Order</label>
                  <input type="number" className="admin-input" value={form.order} onChange={e => setForm(f => ({ ...f, order: +e.target.value }))} />
                </div>
                <ImageUpload
                  label="Age Range Image"
                  value={form.imageUrl}
                  folder="joytoy/ages"
                  onChange={(url, pid) => setForm(f => ({ ...f, imageUrl: url, imagePublicId: pid }))}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-admin-secondary" onClick={() => setModal(false)}>Cancel</button>
              <button className="btn-admin-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving…' : editing ? 'Update' : 'Add Age Range'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
