'use client';

import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import ImageUpload from '@/components/admin/ImageUpload';

// Tiptap must be client-side only
const RichTextEditor = dynamic(() => import('@/components/admin/RichTextEditor'), { ssr: false });

interface Blog {
  _id:           string;
  title:         string;
  category:      string;
  content:       string;
  imageUrl:      string;
  imagePublicId: string;
  isFeatured:    boolean;
  publishedAt:   string;
}

const BLOG_CATEGORIES = ['Parenting', 'Education', 'Play & Development', 'Health & Safety', 'Product Reviews', 'Tips & Tricks', 'News'];
const emptyForm = { title: '', category: BLOG_CATEGORIES[0], content: '', imageUrl: '', imagePublicId: '', isFeatured: false };

function stripHtml(html: string) {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

export default function BlogsPage() {
  const [blogs,   setBlogs]   = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal,   setModal]   = useState(false);
  const [editing, setEditing] = useState<Blog | null>(null);
  const [form,    setForm]    = useState({ ...emptyForm });
  const [saving,  setSaving]  = useState(false);

  const load = async () => {
    setLoading(true);
    const r = await fetch('/api/admin/blogs');
    setBlogs(await r.json());
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditing(null); setForm({ ...emptyForm }); setModal(true); };
  const openEdit = (b: Blog) => {
    setEditing(b);
    setForm({ title: b.title, category: b.category, content: b.content, imageUrl: b.imageUrl, imagePublicId: b.imagePublicId, isFeatured: b.isFeatured });
    setModal(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.imageUrl || !form.content) {
      toast.error('Title, image, and content are required');
      return;
    }
    setSaving(true);
    if (editing) {
      await fetch('/api/admin/blogs', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: editing._id, ...form }) });
    } else {
      await fetch('/api/admin/blogs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    }
    setSaving(false);
    setModal(false);
    toast.success(editing ? 'Blog updated' : 'Blog published');
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this blog post?')) return;
    await fetch('/api/admin/blogs', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    toast.success('Blog deleted');
    load();
  };

  const toggleFeatured = async (b: Blog) => {
    await fetch('/api/admin/blogs', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: b._id, isFeatured: !b.isFeatured }) });
    load();
  };

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title"><span className="page-icon">📝</span> Blogs</h1>
          <p className="admin-page-subtitle">Write, publish, and manage blog posts for your customers.</p>
        </div>
        <button id="add-blog-btn" className="btn-admin-primary" onClick={openAdd}>+ Add New Blog</button>
      </div>

      {loading ? (
        <div className="admin-empty"><div className="spinner" style={{ margin: '0 auto 1rem' }} /><p>Loading…</p></div>
      ) : blogs.length === 0 ? (
        <div className="admin-empty">
          <div className="empty-icon">📝</div>
          <h3>No Blog Posts Yet</h3>
          <p>Click "Add New Blog" to publish your first post.</p>
        </div>
      ) : (
        <div className="blog-grid">
          {blogs.map(b => {
            const excerpt = stripHtml(b.content).slice(0, 160);
            const date    = new Date(b.publishedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
            return (
              <div key={b._id} className="blog-card">
                <div className="blog-card-image">
                  <Image src={b.imageUrl} alt={b.title} fill style={{ objectFit: 'cover' }} />
                  <span className="blog-card-cat">{b.category}</span>
                  {b.isFeatured && (
                    <span style={{ position: 'absolute', top: 8, right: 8, background: '#FFD93D', color: '#7a5c00', fontSize: '0.65rem', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: '20px' }}>⭐ Featured</span>
                  )}
                </div>
                <div className="blog-card-body">
                  <div className="blog-card-date">{date}</div>
                  <div className="blog-card-title">{b.title}</div>
                  <div className="blog-card-excerpt">{excerpt}{excerpt.length >= 160 ? '…' : ''}</div>
                  <div className="blog-card-footer">
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <button className="btn-admin-edit"   onClick={() => openEdit(b)}>✏️ Edit</button>
                      <button className="btn-admin-danger" onClick={() => handleDelete(b._id)}>🗑️</button>
                    </div>
                    <button
                      className={b.isFeatured ? 'btn-admin-success' : 'btn-admin-secondary'}
                      onClick={() => toggleFeatured(b)}
                      style={{ fontSize: '0.75rem' }}
                    >
                      {b.isFeatured ? '⭐ Featured' : '☆ Feature'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Blog Modal */}
      {modal && (
        <div className="modal-overlay">
          <div className="modal-box modal-lg">
            <div className="modal-header">
              {editing ? '✏️ Edit Blog Post' : '➕ Write New Blog Post'}
              <button className="modal-close" onClick={() => setModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="admin-form">
                <div className="admin-field">
                  <label className="admin-label">Blog Title</label>
                  <input className="admin-input" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Enter blog title…" />
                </div>

                <div className="admin-form-row">
                  <div className="admin-field">
                    <label className="admin-label">Category</label>
                    <select className="admin-select" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                      {BLOG_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="admin-field" style={{ justifyContent: 'flex-end', paddingBottom: 6 }}>
                    <label className="admin-checkbox-row" style={{ marginTop: 'auto' }}>
                      <input type="checkbox" className="admin-checkbox" checked={form.isFeatured} onChange={e => setForm(f => ({ ...f, isFeatured: e.target.checked }))} />
                      <span className="admin-label">⭐ Feature this blog on homepage</span>
                    </label>
                  </div>
                </div>

                <div className="admin-field">
                  <label className="admin-label">Content</label>
                  <RichTextEditor value={form.content} onChange={html => setForm(f => ({ ...f, content: html }))} />
                </div>

                <ImageUpload label="Blog Cover Photo" value={form.imageUrl} folder="dealhobe/blogs" onChange={(url, pid) => setForm(f => ({ ...f, imageUrl: url, imagePublicId: pid }))} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-admin-secondary" onClick={() => setModal(false)}>Cancel</button>
              <button className="btn-admin-primary" onClick={handleSave} disabled={saving}>{saving ? 'Publishing…' : editing ? 'Update Post' : 'Publish Blog'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
