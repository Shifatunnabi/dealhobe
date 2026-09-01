'use client';

import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import MultiImageUpload from '@/components/admin/MultiImageUpload';

const RichTextEditor = dynamic(() => import('@/components/admin/RichTextEditor'), { ssr: false });

interface Product {
  _id: string;
  sku: string;
  name: string;
  slug: string;
  price: number;
  salePrice: number;
  quantity: number;
  shortDescription: string;
  brand: string;
  ageRange: string;
  category: string;
  toysFor: string;
  whyLoveIt: string[];
  description: string;
  images: string[];
  imagePublicIds: string[];
  isFeatured: boolean;
}

const generateSku = () => 'JT-' + Math.random().toString(36).substring(2, 10).toUpperCase();

const emptyForm = {
    sku: '', name: '', slug: '', price: 0, salePrice: 0, quantity: 0, shortDescription: '',
    brand: '', ageRange: '', category: '', toysFor: 'both', whyLoveIt: [], description: '',
    images: [], imagePublicIds: [], isFeatured: false
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<any>({ ...emptyForm });
  const [saving, setSaving] = useState(false);

  // Reference data
  const [brands, setBrands] = useState([] as any[]);
  const [ages, setAges] = useState([] as any[]);
  const [categories, setCategories] = useState([] as any[]);

  const [whyLoveItInput, setWhyLoveItInput] = useState('');

  const load = async () => {
    setLoading(true);
    const [pRes, bRes, aRes, cRes] = await Promise.all([
        fetch('/api/admin/products'),
        fetch('/api/admin/brands'),
        fetch('/api/admin/ages'),
        fetch('/api/admin/categories')
    ]);
    setProducts(await pRes.json());
    setBrands(await bRes.json());
    setAges(await aRes.json());
    setCategories(await cRes.json());
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => {
      setEditing(null);
      setForm({
          ...emptyForm,
          sku: generateSku(),
          brand: brands.length > 0 ? brands[0]._id : '',
          ageRange: ages.length > 0 ? ages[0]._id : '',
          category: categories.length > 0 ? categories[0]._id : ''
      });
      setModal(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({ ...p });
    setModal(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.slug || form.price <= 0 || !form.brand || !form.ageRange || !form.category) {
      toast.error('Please fill all required fields');
      return;
    }
    setSaving(true);
    try {
        const res = await fetch('/api/admin/products', {
            method: editing ? 'PUT' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(editing ? { id: editing._id, ...form } : form)
        });
        const data = await res.json();
        if(!res.ok) throw new Error(data.error || 'Failed to save');
        setSaving(false);
        setModal(false);
        toast.success(editing ? 'Product updated' : 'Product created');
        load();
    } catch(err: any) {
        setSaving(false);
        toast.error(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    await fetch('/api/admin/products', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    toast.success('Product deleted');
    load();
  };

  const toggleFeatured = async (p: Product) => {
    await fetch('/api/admin/products', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: p._id, isFeatured: !p.isFeatured }) });
    load();
  };

  const handleNameChange = (e: any) => {
      const name = e.target.value;
      setForm((f: any) => ({
          ...f,
          name,
          slug: !editing ? name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') : f.slug
      }));
  };

  const addWhyLoveIt = () => {
      if(whyLoveItInput.trim() && form.whyLoveIt.length < 5) {
          setForm((f:any) => ({ ...f, whyLoveIt: [...f.whyLoveIt, whyLoveItInput.trim()] }));
          setWhyLoveItInput('');
      }
  };
  const removeWhyLoveIt = (i: number) => {
      setForm((f:any) => {
          const newWli = [...f.whyLoveIt];
          newWli.splice(i, 1);
          return { ...f, whyLoveIt: newWli };
      });
  };

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title"><span className="page-icon">📦</span> Product Listing</h1>
          <p className="admin-page-subtitle">Manage inventory, prices, and product details.</p>
        </div>
        <button className="btn-admin-primary" onClick={openAdd}>+ Add New Product</button>
      </div>

      {loading ? (
        <div className="admin-empty"><div className="spinner" style={{ margin: '0 auto 1rem' }} /><p>Loading…</p></div>
      ) : products.length === 0 ? (
        <div className="admin-empty">
          <div className="empty-icon">📦</div>
          <h3>No Products Yet</h3>
          <p>Click "Add New Product" to populate your store inventory.</p>
        </div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Category</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => {
                  const cat = categories.find(c => c._id === p.category)?.name || 'Unknown';
                  return (
                      <tr key={p._id}>
                        <td style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            {p.images && p.images.length > 0 && (
                                <div style={{width: 40, height: 40, position: 'relative', borderRadius: 4, overflow: 'hidden'}}>
                                    <Image src={p.images[0]} alt={p.name} fill style={{objectFit:'cover'}} />
                                </div>
                            )}
                            <div>
                                <div style={{fontWeight: 600}}>{p.name}</div>
                                <div style={{fontSize: '0.75rem', color: 'var(--text-muted)'}}>{p.slug}</div>
                                {p.sku && <div style={{fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'monospace'}}>{p.sku}</div>}
                            </div>
                        </td>
                        <td>৳{p.salePrice || p.price} {p.salePrice && <span style={{textDecoration:'line-through', color:'var(--text-muted)', fontSize: '0.75em'}}>৳{p.price}</span>}</td>
                        <td>
                            {p.quantity === 0 ? <span className="badge badge-red">Out of Stock</span> :
                             p.quantity < 10 ? <span className="badge badge-yellow">Low: {p.quantity}</span> :
                             <span className="badge badge-green">In Stock: {p.quantity}</span>}
                        </td>
                        <td>{cat}</td>
                        <td>
                            <div className="admin-item-actions">
                                <button className="btn-admin-edit" onClick={() => openEdit(p)}>✏️ Edit</button>
                                <button className="btn-admin-danger" onClick={() => handleDelete(p._id)}>🗑️ Del</button>
                                <button
                                    className={p.isFeatured ? 'btn-admin-success' : 'btn-admin-secondary'}
                                    onClick={() => toggleFeatured(p)}
                                    style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: 4 }}
                                >
                                    {p.isFeatured ? '⭐ On Home' : '☆ Add to Home'}
                                </button>
                            </div>
                        </td>
                      </tr>
                  );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="modal-overlay">
          <div className="modal-box modal-lg" style={{ maxWidth: 900 }}>
            <div className="modal-header">
              {editing ? '✏️ Edit Product' : '➕ Add New Product'}
              <button className="modal-close" onClick={() => setModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="admin-form">
                <div className="admin-form-row">
                    <div className="admin-field">
                        <label className="admin-label">Product Name</label>
                        <input className="admin-input" value={form.name} onChange={handleNameChange} placeholder="Educational Toy" />
                    </div>
                    <div className="admin-field">
                        <label className="admin-label">URL Slug</label>
                        <input className="admin-input" value={form.slug} onChange={e => setForm((f:any) => ({...f, slug: e.target.value}))} />
                    </div>
                </div>

                <div className="admin-form-row">
                    <div className="admin-field">
                        <label className="admin-label">SKU</label>
                        <div style={{display:'flex', gap:'0.5rem'}}>
                            <input
                                className="admin-input"
                                value={form.sku}
                                onChange={e => setForm((f:any) => ({...f, sku: e.target.value.toUpperCase()}))}
                                placeholder="Auto-generated if left empty"
                                style={{fontFamily:'monospace'}}
                            />
                            <button type="button" className="btn-admin-secondary" onClick={() => setForm((f:any) => ({...f, sku: generateSku()}))}>Generate</button>
                        </div>
                    </div>
                    <div className="admin-field" />
                </div>

                <div className="admin-form-row">
                    <div className="admin-field">
                        <label className="admin-label">Price (৳)</label>
                        <input type="number" className="admin-input" value={form.price} onChange={e => setForm((f:any) => ({...f, price: +e.target.value}))} />
                    </div>
                    <div className="admin-field">
                        <label className="admin-label">Sale Price (৳ - Optional)</label>
                        <input type="number" className="admin-input" value={form.salePrice} onChange={e => setForm((f:any) => ({...f, salePrice: +e.target.value}))} />
                    </div>
                </div>

                <div className="admin-form-row">
                    <div className="admin-field">
                        <label className="admin-label">Quantity in Stock</label>
                        <input type="number" className="admin-input" value={form.quantity} onChange={e => setForm((f:any) => ({...f, quantity: +e.target.value}))} />
                    </div>
                    <div className="admin-field">
                        <label className="admin-label">Toys For</label>
                        <select className="admin-select" value={form.toysFor} onChange={e => setForm((f:any) => ({...f, toysFor: e.target.value}))}>
                            <option value="both">Boys & Girls</option>
                            <option value="boys">Boys</option>
                            <option value="girls">Girls</option>
                        </select>
                    </div>
                </div>

                <div className="admin-form-row">
                    <div className="admin-field">
                        <label className="admin-label">Brand</label>
                        <select className="admin-select" value={form.brand} onChange={e => setForm((f:any) => ({...f, brand: e.target.value}))}>
                            <option value="">Select Brand...</option>
                            {brands.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                        </select>
                    </div>
                    <div className="admin-field">
                        <label className="admin-label">Age Range</label>
                        <select className="admin-select" value={form.ageRange} onChange={e => setForm((f:any) => ({...f, ageRange: e.target.value}))}>
                            <option value="">Select Age...</option>
                            {ages.map(a => <option key={a._id} value={a._id}>{a.label}</option>)}
                        </select>
                    </div>
                </div>

                 <div className="admin-field">
                    <label className="admin-label">Category</label>
                    <select className="admin-select" value={form.category} onChange={e => setForm((f:any) => ({...f, category: e.target.value}))}>
                        <option value="">Select Category...</option>
                        {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                    </select>
                </div>

                <div className="admin-field">
                  <label className="admin-label">Short Description</label>
                  <textarea className="admin-textarea" value={form.shortDescription} onChange={e => setForm((f:any) => ({...f, shortDescription: e.target.value}))} rows={2} />
                </div>

                <div className="admin-field">
                   <label className="admin-label">Why they will love it (Max 5)</label>
                   <div style={{display:'flex', gap:'0.5rem', marginBottom: '0.5rem'}}>
                       <input className="admin-input" placeholder="Add a reason and press enter..." value={whyLoveItInput} onChange={e=>setWhyLoveItInput(e.target.value)} onKeyDown={e => { if(e.key === 'Enter') { e.preventDefault(); addWhyLoveIt(); } }} disabled={form.whyLoveIt.length >= 5} />
                       <button type="button" className="btn-admin-secondary" onClick={addWhyLoveIt} disabled={form.whyLoveIt.length >= 5}>Add</button>
                   </div>
                   <div style={{display:'flex', gap:'0.5rem', flexWrap:'wrap'}}>
                       {form.whyLoveIt.map((w: string, i: number) => (
                           <span key={i} className="badge badge-pink" style={{padding: '0.4rem 0.6rem'}}>
                               {w} <span onClick={()=>removeWhyLoveIt(i)} style={{marginLeft:'0.5rem', cursor:'pointer'}}>&times;</span>
                           </span>
                       ))}
                   </div>
                </div>

                <div className="admin-field">
                  <label className="admin-label">Product Description (Rich Text)</label>
                  <RichTextEditor value={form.description} onChange={html => setForm((f:any) => ({ ...f, description: html }))} />
                </div>

                <MultiImageUpload
                   images={form.images.map((url:string, i:number) => ({ url, publicId: form.imagePublicIds[i] }))}
                   onChange={imgs => setForm((f:any) => ({ ...f, images: imgs.map(i=>i.url), imagePublicIds: imgs.map(i=>i.publicId) }))}
                   folder="joytoy/products"
                   label="Product Images"
                />

                <div className="admin-field">
                    <label className="admin-checkbox-row">
                      <input type="checkbox" className="admin-checkbox" checked={form.isFeatured} onChange={e => setForm((f:any) => ({ ...f, isFeatured: e.target.checked }))} />
                      <span className="admin-label">⭐ Add to Homepage</span>
                    </label>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-admin-secondary" onClick={() => setModal(false)}>Cancel</button>
              <button className="btn-admin-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : editing ? 'Update Product' : 'Add Product'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
