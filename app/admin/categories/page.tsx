'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import Image from 'next/image';
import { FiFolder, FiEdit2, FiTrash2, FiPlus, FiX, FiZap, FiEye, FiEyeOff } from 'react-icons/fi';
import ImageUpload from '@/components/admin/ImageUpload';
import DragHandle from '@/components/admin/DragHandle';
import { SortableList, useSortableItem } from '@/components/admin/SortableList';
import { renumbered, nextOrder, saveOrder } from '@/components/admin/reorderUtils';

interface Category {
  _id:          string;
  name:         string;
  imageUrl:     string;
  imagePublicId:string;
  order:        number;
  isHidden?:    boolean;
}

const emptyForm = { name: '', imageUrl: '', imagePublicId: '', order: 0 };

function CategoryCard({
  category, isHomepage, onNavigate, onEdit, onDelete, onToggleHidden,
}: {
  category: Category;
  isHomepage: boolean;
  onNavigate: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onToggleHidden: () => void;
}) {
  const { setNodeRef, style, isDragging, handle } = useSortableItem(category._id);
  return (
    <div
      ref={setNodeRef}
      className={`admin-item-card${isDragging ? ' is-dragging' : ''}`}
      onClick={onNavigate}
      style={{ ...style, cursor: 'pointer', opacity: category.isHidden ? 0.6 : 1 }}
      title="Manage sub-categories"
    >
      <div className="admin-item-image" style={{ position: 'relative', height: 140 }}>
        <Image src={category.imageUrl} alt={category.name} fill style={{ objectFit: 'cover' }} />
        {category.isHidden && (
          <span style={{
            position: 'absolute', bottom: 8, left: 8,
            background: 'rgba(15,8,32,0.8)', color: '#fff', fontSize: '0.65rem', fontWeight: 700,
            padding: '0.2rem 0.5rem', borderRadius: '20px',
          }}>Hidden from website</span>
        )}
        {isHomepage && !category.isHidden && (
          <span style={{
            position: 'absolute', top: 8, right: 8,
            background: 'var(--primary-pink)',
            color: '#fff', fontSize: '0.65rem', fontWeight: 700,
            padding: '0.2rem 0.5rem', borderRadius: '20px',
          }}>Homepage</span>
        )}
        <div style={{ position: 'absolute', top: 8, left: 8, background: 'rgba(255,255,255,0.9)', borderRadius: 8, padding: '0.25rem' }}>
          <DragHandle handle={handle} />
        </div>
      </div>
      <div className="admin-item-body">
        <div className="admin-item-title">{category.name}</div>
        <div className="admin-item-meta">Order: {category.order} · Click to manage sub-categories</div>
        <div className="admin-item-actions">
          <button
            className="btn-admin-secondary"
            title={category.isHidden ? 'Show on website' : 'Hide from website'}
            aria-label={category.isHidden ? 'Show on website' : 'Hide from website'}
            onClick={(e) => { e.stopPropagation(); onToggleHidden(); }}
          >
            {category.isHidden ? <FiEye size={14} /> : <FiEyeOff size={14} />}
          </button>
          <button className="btn-admin-edit" title="Edit" aria-label="Edit category" onClick={(e) => { e.stopPropagation(); onEdit(); }}><FiEdit2 size={14} /></button>
          <button className="btn-admin-danger" title="Delete" aria-label="Delete category" onClick={(e) => { e.stopPropagation(); onDelete(); }}><FiTrash2 size={14} /></button>
        </div>
      </div>
    </div>
  );
}

export default function CategoriesPage() {
  const router = useRouter();
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

  const openAdd  = () => { setEditing(null); setForm({ ...emptyForm, order: nextOrder(categories) }); setModal(true); };
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

  const toggleHidden = async (c: Category) => {
    const next = !c.isHidden;
    setCategories(list => list.map(x => (x._id === c._id ? { ...x, isHidden: next } : x)));
    const res = await fetch('/api/admin/categories', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: c._id, isHidden: next }) });
    if (!res.ok) {
      setCategories(list => list.map(x => (x._id === c._id ? { ...x, isHidden: !next } : x)));
      toast.error('Could not update category');
      return;
    }
    toast.success(next ? `${c.name} hidden from website` : `${c.name} is visible again`);
  };

  const handleReorder = (newOrder: Category[]) => {
    const prev = categories;
    const next = renumbered(newOrder);
    setCategories(next);
    saveOrder('/api/admin/categories', next).catch(() => {
      setCategories(prev);
      toast.error('Could not save the new order');
    });
  };

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title"><span className="page-icon"><FiFolder size={20} /></span> Category Management</h1>
          <p className="admin-page-subtitle">
            Manage categories for favourites section and product filters. First 4 shown on homepage, rest in slider. Drag cards to reorder.
          </p>
        </div>
        <button id="add-category-btn" className="btn-admin-primary" onClick={openAdd}>+ Add Category</button>
      </div>

      {categories.length > 4 && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          marginBottom: '1.25rem',
          background: 'rgba(255,215,61,0.08)',
          border: '1px solid rgba(255,215,61,0.25)',
          borderRadius: '12px',
          padding: '0.75rem 1rem',
          fontSize: '0.825rem',
          color: '#cc9900',
        }}>
          <FiZap size={14} style={{ flexShrink: 0 }} />
          <span>You have <strong>{categories.length}</strong> categories. The homepage shows 4 in a grid and the rest in a left/right slider.</span>
        </div>
      )}

      {loading ? (
        <div className="admin-empty"><div className="spinner" style={{ margin: '0 auto 1rem' }} /><p>Loading…</p></div>
      ) : categories.length === 0 ? (
        <div className="admin-empty">
          <div className="empty-icon"><FiFolder size={40} /></div>
          <h3>No Categories Yet</h3>
          <p>Add your first category to populate the homepage.</p>
        </div>
      ) : (
        <SortableList items={categories} onReorder={handleReorder} layout="grid" className="admin-grid">
          {categories.map((c, i) => (
            <CategoryCard
              key={c._id}
              category={c}
              isHomepage={categories.filter(x => !x.isHidden).findIndex(x => x._id === c._id) < 4 && !c.isHidden}
              onNavigate={() => router.push(`/admin/categories/${c._id}`)}
              onEdit={() => openEdit(c)}
              onDelete={() => handleDelete(c._id)}
              onToggleHidden={() => toggleHidden(c)}
            />
          ))}
        </SortableList>
      )}

      {modal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-header">
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                {editing ? <FiEdit2 size={16} /> : <FiPlus size={16} />} {editing ? 'Edit Category' : 'Add Category'}
              </span>
              <button className="modal-close" onClick={() => setModal(false)}><FiX size={16} /></button>
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
                  folder="dealhobe/categories"
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
