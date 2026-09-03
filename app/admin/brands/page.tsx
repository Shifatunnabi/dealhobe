'use client';

import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import Image from 'next/image';
import { Reorder, useDragControls } from 'framer-motion';
import { FiTag, FiEdit2, FiTrash2, FiPlus, FiX } from 'react-icons/fi';
import ImageUpload from '@/components/admin/ImageUpload';
import DragHandle from '@/components/admin/DragHandle';
import { renumbered, nextOrder, useReorderPersist } from '@/components/admin/reorderUtils';

interface Brand {
  _id:          string;
  name:         string;
  logoUrl:      string;
  logoPublicId: string;
  order:        number;
}

const emptyForm = { name: '', logoUrl: '', logoPublicId: '', order: 0 };

function BrandCard({ brand, onEdit, onDelete }: { brand: Brand; onEdit: () => void; onDelete: () => void }) {
  const dragControls = useDragControls();
  return (
    <Reorder.Item as="div" value={brand} dragListener={false} dragControls={dragControls} className="admin-item-card">
      <div
        className="admin-item-image"
        style={{ position: 'relative', height: 120, background: 'rgba(45,27,78,0.04)' }}
      >
        <Image src={brand.logoUrl} alt={brand.name} fill style={{ objectFit: 'contain', padding: '1rem' }} />
        <div style={{ position: 'absolute', top: 8, left: 8, background: 'rgba(255,255,255,0.9)', borderRadius: 8, padding: '0.25rem' }}>
          <DragHandle dragControls={dragControls} />
        </div>
      </div>
      <div className="admin-item-body">
        <div className="admin-item-title">{brand.name}</div>
        <div className="admin-item-meta">Order: {brand.order}</div>
        <div className="admin-item-actions">
          <button className="btn-admin-edit"   onClick={onEdit}><FiEdit2 size={13} /> Edit</button>
          <button className="btn-admin-danger" onClick={onDelete}><FiTrash2 size={13} /> Delete</button>
        </div>
      </div>
    </Reorder.Item>
  );
}

export default function BrandsPage() {
  const [brands,  setBrands]  = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal,   setModal]   = useState(false);
  const [editing, setEditing] = useState<Brand | null>(null);
  const [form,    setForm]    = useState({ ...emptyForm });
  const [saving,  setSaving]  = useState(false);
  const reorderPersist = useReorderPersist('/api/admin/brands');

  const load = async () => {
    setLoading(true);
    const r = await fetch('/api/admin/brands');
    setBrands(await r.json());
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openAdd  = () => { setEditing(null); setForm({ ...emptyForm, order: nextOrder(brands) }); setModal(true); };
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

  const handleReorder = (newOrder: Brand[]) => {
    const renumberedList = renumbered(newOrder);
    reorderPersist(brands, renumberedList);
    setBrands(renumberedList);
  };

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title"><span className="page-icon"><FiTag size={20} /></span> Brand Management</h1>
          <p className="admin-page-subtitle">Manage brands shown in the slider and product filters. Drag cards to reorder.</p>
        </div>
        <button id="add-brand-btn" className="btn-admin-primary" onClick={openAdd}>+ Add Brand</button>
      </div>

      {loading ? (
        <div className="admin-empty"><div className="spinner" style={{ margin: '0 auto 1rem' }} /><p>Loading…</p></div>
      ) : brands.length === 0 ? (
        <div className="admin-empty">
          <div className="empty-icon"><FiTag size={40} /></div>
          <h3>No Brands Yet</h3>
          <p>Add your first brand to display it in the slider.</p>
        </div>
      ) : (
        <Reorder.Group as="div" axis="y" values={brands} onReorder={handleReorder} className="admin-grid">
          {brands.map(b => (
            <BrandCard key={b._id} brand={b} onEdit={() => openEdit(b)} onDelete={() => handleDelete(b._id)} />
          ))}
        </Reorder.Group>
      )}

      {modal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-header">
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                {editing ? <FiEdit2 size={16} /> : <FiPlus size={16} />} {editing ? 'Edit Brand' : 'Add Brand'}
              </span>
              <button className="modal-close" onClick={() => setModal(false)}><FiX size={16} /></button>
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
                  folder="dealhobe/brands"
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
