'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import Image from 'next/image';
import { FiArrowLeft, FiEdit2, FiTrash2, FiPlus, FiX, FiFolder, FiTag } from 'react-icons/fi';
import { Reorder, useDragControls } from 'framer-motion';
import DragHandle from '@/components/admin/DragHandle';
import { renumbered, nextOrder, useReorderPersist } from '@/components/admin/reorderUtils';

interface Category { _id: string; name: string; imageUrl: string; }
interface SubCategory { _id: string; name: string; category: string; order: number; }

const emptyForm = { name: '', order: 0 };

function SubCategoryRow({
  subCategory, onEdit, onDelete,
}: {
  subCategory: SubCategory;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const dragControls = useDragControls();
  return (
    <Reorder.Item as="tr" value={subCategory} dragListener={false} dragControls={dragControls}>
      <td style={{ width: 32 }}><DragHandle dragControls={dragControls} /></td>
      <td style={{ fontWeight: 600 }}>{subCategory.name}</td>
      <td>{subCategory.order}</td>
      <td>
        <div className="admin-item-actions">
          <button className="btn-admin-edit" aria-label="Edit sub-category" onClick={onEdit}>
            <FiEdit2 size={14} />
          </button>
          <button className="btn-admin-danger" aria-label="Delete sub-category" onClick={onDelete}>
            <FiTrash2 size={14} />
          </button>
        </div>
      </td>
    </Reorder.Item>
  );
}

export default function CategorySubCategoriesPage() {
  const params = useParams();
  const router = useRouter();
  const categoryId = String(params.id);

  const [category,      setCategory]      = useState<Category | null>(null);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [modal,         setModal]         = useState(false);
  const [editing,       setEditing]       = useState<SubCategory | null>(null);
  const [form,          setForm]          = useState({ ...emptyForm });
  const [saving,        setSaving]        = useState(false);
  const reorderPersist = useReorderPersist('/api/admin/subcategories');

  const load = async () => {
    setLoading(true);
    const [catsRes, subsRes] = await Promise.all([
      fetch('/api/admin/categories'),
      fetch(`/api/admin/subcategories?category=${categoryId}`),
    ]);
    const cats: Category[] = await catsRes.json();
    setCategory(cats.find((c) => c._id === categoryId) ?? null);
    setSubCategories(await subsRes.json());
    setLoading(false);
  };

  useEffect(() => { load(); }, [categoryId]);

  const openAdd = () => { setEditing(null); setForm({ ...emptyForm, order: nextOrder(subCategories) }); setModal(true); };
  const openEdit = (s: SubCategory) => { setEditing(s); setForm({ name: s.name, order: s.order }); setModal(true); };

  const handleReorder = (newOrder: SubCategory[]) => {
    const renumberedList = renumbered(newOrder);
    reorderPersist(subCategories, renumberedList);
    setSubCategories(renumberedList);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error('Name is required');
      return;
    }
    setSaving(true);
    if (editing) {
      await fetch('/api/admin/subcategories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editing._id, ...form }),
      });
    } else {
      await fetch('/api/admin/subcategories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, category: categoryId }),
      });
    }
    setSaving(false);
    setModal(false);
    toast.success(editing ? 'Sub-category updated' : 'Sub-category added');
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this sub-category?')) return;
    await fetch('/api/admin/subcategories', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    toast.success('Sub-category deleted');
    load();
  };

  if (loading) return <div className="admin-empty"><div className="spinner" style={{ margin: '0 auto 1rem' }} /><p>Loading…</p></div>;

  if (!category) {
    return (
      <div className="admin-empty">
        <div className="empty-icon"><FiFolder size={40} /></div>
        <h3>Category Not Found</h3>
        <button className="btn-admin-secondary" style={{ marginTop: '1rem' }} onClick={() => router.push('/admin/categories')}>
          Back to Categories
        </button>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={() => router.push('/admin/categories')}
        className="btn-admin-secondary"
        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1.25rem' }}
      >
        <FiArrowLeft size={14} /> Back to Categories
      </button>

      <div className="admin-page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ position: 'relative', width: 56, height: 56, borderRadius: 12, overflow: 'hidden', flexShrink: 0 }}>
            <Image src={category.imageUrl} alt={category.name} fill style={{ objectFit: 'cover' }} />
          </div>
          <div>
            <h1 className="admin-page-title">{category.name}</h1>
            <p className="admin-page-subtitle">Sub-categories under this category. Name only — no photo needed. Drag rows to reorder.</p>
          </div>
        </div>
        <button className="btn-admin-primary" onClick={openAdd}>+ Add Sub-category</button>
      </div>

      {subCategories.length === 0 ? (
        <div className="admin-empty">
          <div className="empty-icon"><FiTag size={40} /></div>
          <h3>No Sub-categories Yet</h3>
          <p>Add the first sub-category under {category.name}.</p>
        </div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: 32 }}></th>
                <th>Name</th>
                <th>Order</th>
                <th>Actions</th>
              </tr>
            </thead>
            <Reorder.Group as="tbody" axis="y" values={subCategories} onReorder={handleReorder}>
              {subCategories.map((s) => (
                <SubCategoryRow
                  key={s._id}
                  subCategory={s}
                  onEdit={() => openEdit(s)}
                  onDelete={() => handleDelete(s._id)}
                />
              ))}
            </Reorder.Group>
          </table>
        </div>
      )}

      {modal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-header">
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                {editing ? <FiEdit2 size={16} /> : <FiPlus size={16} />} {editing ? 'Edit Sub-category' : `Add Sub-category to ${category.name}`}
              </span>
              <button className="modal-close" onClick={() => setModal(false)}><FiX size={16} /></button>
            </div>
            <div className="modal-body">
              <div className="admin-form">
                <div className="admin-field">
                  <label className="admin-label">Sub-category Name</label>
                  <input
                    className="admin-input"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. Lipstick"
                    autoFocus
                  />
                </div>
                <div className="admin-field">
                  <label className="admin-label">Display Order</label>
                  <input
                    type="number"
                    className="admin-input"
                    value={form.order}
                    onChange={(e) => setForm((f) => ({ ...f, order: +e.target.value }))}
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-admin-secondary" onClick={() => setModal(false)}>Cancel</button>
              <button className="btn-admin-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving…' : editing ? 'Update' : 'Add Sub-category'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
