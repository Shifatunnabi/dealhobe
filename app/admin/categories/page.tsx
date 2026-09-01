'use client';

import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import Image from 'next/image';
import ImageUpload from '@/components/admin/ImageUpload';

interface Category {
  _id:          string;
  name:         string;
  imageUrl:     string;
  imagePublicId:string;
  order:        number;
}

const emptyForm = { name: '', imageUrl: '', imagePublicId: '', order: 0 };

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [modal,      setModal]      = useState(false);
  const [editing,    setEditing]    = useState<Category | null>(null);
  const [form,       setForm]       = useState({ ...emptyForm });
  const [saving,     setSaving]     = useState(false);

  const load = async () => {
    setLoading(true);
    const r = await fetch('/api/admin/categories');
    setCategories(await r.json());
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openAdd  = () => { setEditing(null); setForm({ ...emptyForm }); setModal(true); };
  const openEdit = (c: Category) => {
    setEditing(c);
    setForm({ name: c.name, imageUrl: c.imageUrl, imagePublicId: c.imagePublicId, order: c.order });
    setModal(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.imageUrl) {
      toast.error('Name and image are required');
      return;
    }
    setSaving(true);
    if (editing) {
      await fetch('/api/admin/categories', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: editing._id, ...form }) });
    } else {
      await fetch('/api/admin/categories', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    }
    setSaving(false);
    setModal(false);
    toast.success(editing ? 'Category updated' : 'Category added');
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this category?')) return;
    await fetch('/api/admin/categories', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    toast.success('Category deleted');
    load();
  };

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title"><span className="page-icon">🗂️</span> Category Management</h1>
          <p className="admin-page-subtitle">
            Manage categories for favourites section and product filters. First 4 shown on homepage, rest in slider.
          </p>
        </div>
        <button id="add-category-btn" className="btn-admin-primary" onClick={openAdd}>+ Add Category</button>
      </div>

      {categories.length > 4 && (
        <div style={{
          marginBottom: '1.25rem',
          background: 'rgba(255,215,61,0.08)',
          border: '1px solid rgba(255,215,61,0.25)',
          borderRadius: '12px',
          padding: '0.75rem 1rem',
          fontSize: '0.825rem',
          color: '#cc9900',
        }}>
          ⚡ You have <strong>{categories.length}</strong> categories. The homepage shows 4 in a grid and the rest in a left/right slider.
        </div>
      )}

      {loading ? (
        <div className="admin-empty"><div className="spinner" style={{ margin: '0 auto 1rem' }} /><p>Loading…</p></div>
      ) : categories.length === 0 ? (
        <div className="admin-empty">
          <div className="empty-icon">🗂️</div>
          <h3>No Categories Yet</h3>
          <p>Add your first category to populate the homepage.</p>
        </div>
      ) : (
        <div className="admin-grid">
          {categories.map((c, i) => (
            <div key={c._id} className="admin-item-card">
              <div className="admin-item-image" style={{ position: 'relative', height: 140 }}>
                <Image src={c.imageUrl} alt={c.name} fill style={{ objectFit: 'cover' }} />
                {i < 4 && (
                  <span style={{
                    position: 'absolute', top: 8, right: 8,
                    background: 'var(--primary-pink)',
                    color: '#fff', fontSize: '0.65rem', fontWeight: 700,
                    padding: '0.2rem 0.5rem', borderRadius: '20px',
                  }}>Homepage</span>
                )}
              </div>
              <div className="admin-item-body">
                <div className="admin-item-title">{c.name}</div>
                <div className="admin-item-meta">Order: {c.order}</div>
                <div className="admin-item-actions">
                  <button className="btn-admin-edit"   onClick={() => openEdit(c)}>✏️ Edit</button>
                  <button className="btn-admin-danger" onClick={() => handleDelete(c._id)}>🗑️ Delete</button>
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
              {editing ? '✏️ Edit Category' : '➕ Add Category'}
              <button className="modal-close" onClick={() => setModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="admin-form">
                <div className="admin-field">
                  <label className="admin-label">Category Name</label>
                  <input className="admin-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Action Figures" />
                </div>
                <div className="admin-field">
                  <label className="admin-label">Display Order</label>
                  <input type="number" className="admin-input" value={form.order} onChange={e => setForm(f => ({ ...f, order: +e.target.value }))} />
                </div>
                <ImageUpload
                  label="Category Image"
                  value={form.imageUrl}
                  folder="joytoy/categories"
                  onChange={(url, pid) => setForm(f => ({ ...f, imageUrl: url, imagePublicId: pid }))}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-admin-secondary" onClick={() => setModal(false)}>Cancel</button>
              <button className="btn-admin-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving…' : editing ? 'Update' : 'Add Category'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
