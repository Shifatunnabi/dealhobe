'use client';

import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import Image from 'next/image';
import { FiTag, FiEdit2, FiTrash2, FiPlus, FiX } from 'react-icons/fi';
import ImageUpload from '@/components/admin/ImageUpload';
import DragHandle from '@/components/admin/DragHandle';
import { SortableList, useSortableItem } from '@/components/admin/SortableList';
import { renumbered, nextOrder, saveOrder } from '@/components/admin/reorderUtils';

interface Brand {
  _id:          string;
  name:         string;
  logoUrl:      string;
  logoPublicId: string;
  order:        number;
}

const emptyForm = { name: '', logoUrl: '', logoPublicId: '', order: 0 };

function BrandCard({ brand, onEdit, onDelete }: { brand: Brand; onEdit: () => void; onDelete: () => void }) {
  const { setNodeRef, style, isDragging, handle } = useSortableItem(brand._id);
  return (
    <div ref={setNodeRef} style={style} className={`admin-item-card${isDragging ? ' is-dragging' : ''}`}>
      <div className="admin-item-image admin-item-image--logo admin-item-image--contain">
        <Image src={brand.logoUrl} alt={brand.name} fill sizes="(max-width: 640px) 100vw, 260px" style={{ objectFit: 'contain' }} />
        <div className="admin-media-handle">
          <DragHandle handle={handle} />
        </div>
      </div>
      <div className="admin-item-body">
        <div className="admin-item-title">{brand.name}</div>
        <div className="admin-item-meta">Order: {brand.order}</div>
        <div className="admin-item-actions">
          <button className="btn-admin-edit btn-sm"   onClick={onEdit}><FiEdit2 size={13} /> Edit</button>
          <button className="btn-admin-danger btn-sm" onClick={onDelete}><FiTrash2 size={13} /> Delete</button>
        </div>
      </div>
    </div>
  );
}

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
    const prev = brands;
    const next = renumbered(newOrder);
    setBrands(next);
    saveOrder('/api/admin/brands', next).catch(() => {
      setBrands(prev);
      toast.error('Could not save the new order');
    });
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
        <SortableList items={brands} onReorder={handleReorder} layout="grid" className="admin-grid">
          {brands.map(b => (
            <BrandCard key={b._id} brand={b} onEdit={() => openEdit(b)} onDelete={() => handleDelete(b._id)} />
          ))}
        </SortableList>
      )}

      {modal && (
        <div className="modal-overlay">
          <div className="modal-box" role="dialog" aria-modal="true" aria-label={editing ? 'Edit Brand' : 'Add Brand'}>
            <div className="modal-header">
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                {editing ? <FiEdit2 size={16} /> : <FiPlus size={16} />} {editing ? 'Edit Brand' : 'Add Brand'}
              </span>
              <button className="modal-close" aria-label="Close" onClick={() => setModal(false)}><FiX size={18} /></button>
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
