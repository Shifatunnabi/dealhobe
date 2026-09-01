'use client';

import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import Image from 'next/image';
import ImageUpload from '@/components/admin/ImageUpload';

interface Brand {
  _id:          string;
  name:         string;
  logoUrl:      string;
  logoPublicId: string;
  order:        number;
}

const emptyForm = { name: '', logoUrl: '', logoPublicId: '', order: 0 };

export default function BrandsPage() {
  const [brands,  setBrands]  = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal,   setModal]   = useState(false);
  const [editing, setEditing] = useState<Brand | null>(null);
  const [form,    setForm]    = useState({ ...emptyForm });
  const [saving,  setSaving]  = useState(false);

  const load = async () => {
    setLoading(true);
    const r = await fetch('/api/admin/brands');
    setBrands(await r.json());
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openAdd  = () => { setEditing(null); setForm({ ...emptyForm }); setModal(true); };
  const openEdit = (b: Brand) => { setEditing(b); setForm({ name: b.name, logoUrl: b.logoUrl, logoPublicId: b.logoPublicId, order: b.order }); setModal(true); };

  const handleSave = async () => {
    if (!form.name || !form.logoUrl) {
      toast.error('Name and logo are required');
      return;
    }
    setSaving(true);
    if (editing) {
      await fetch('/api/admin/brands', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: editing._id, ...form }) });
    } else {
      await fetch('/api/admin/brands', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    }
    setSaving(false);
    setModal(false);
    toast.success(editing ? 'Brand updated' : 'Brand added');
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this brand?')) return;
    await fetch('/api/admin/brands', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    toast.success('Brand deleted');
    load();
  };

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title"><span className="page-icon">🏷️</span> Brand Management</h1>
          <p className="admin-page-subtitle">Manage brands shown in the slider and product filters.</p>
        </div>
        <button id="add-brand-btn" className="btn-admin-primary" onClick={openAdd}>+ Add Brand</button>
      </div>

      {loading ? (
        <div className="admin-empty"><div className="spinner" style={{ margin: '0 auto 1rem' }} /><p>Loading…</p></div>
      ) : brands.length === 0 ? (
        <div className="admin-empty">
          <div className="empty-icon">🏷️</div>
          <h3>No Brands Yet</h3>
          <p>Add your first brand to display it in the slider.</p>
        </div>
      ) : (
        <div className="admin-grid">
          {brands.map(b => (
            <div key={b._id} className="admin-item-card">
              <div
                className="admin-item-image"
                style={{ position: 'relative', height: 120, background: 'rgba(45,27,78,0.04)' }}
              >
                <Image src={b.logoUrl} alt={b.name} fill style={{ objectFit: 'contain', padding: '1rem' }} />
              </div>
              <div className="admin-item-body">
                <div className="admin-item-title">{b.name}</div>
                <div className="admin-item-meta">Order: {b.order}</div>
                <div className="admin-item-actions">
                  <button className="btn-admin-edit"   onClick={() => openEdit(b)}>✏️ Edit</button>
                  <button className="btn-admin-danger" onClick={() => handleDelete(b._id)}>🗑️ Delete</button>
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
              {editing ? '✏️ Edit Brand' : '➕ Add Brand'}
              <button className="modal-close" onClick={() => setModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="admin-form">
                <div className="admin-field">
                  <label className="admin-label">Brand Name</label>
                  <input className="admin-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. LEGO" />
                </div>
                <div className="admin-field">
                  <label className="admin-label">Display Order</label>
                  <input type="number" className="admin-input" value={form.order} onChange={e => setForm(f => ({ ...f, order: +e.target.value }))} />
                </div>
                <ImageUpload
                  label="Brand Logo"
                  value={form.logoUrl}
                  folder="joytoy/brands"
                  onChange={(url, pid) => setForm(f => ({ ...f, logoUrl: url, logoPublicId: pid }))}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-admin-secondary" onClick={() => setModal(false)}>Cancel</button>
              <button className="btn-admin-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving…' : editing ? 'Update' : 'Add Brand'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
