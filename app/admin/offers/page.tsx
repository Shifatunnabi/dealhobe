'use client';

import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import Image from 'next/image';
import ImageUpload from '@/components/admin/ImageUpload';

interface Offer {
  _id: string;
  title: string;
  slug: string;
  discountType: 'percentage' | 'flat';
  discountAmount: number;
  details: string;
  thumbnailUrl: string;
  thumbnailPublicId: string;
  productSelection: 'all' | 'selected';
  selectedProducts: string[];
  isActive: boolean;
  endingDate?: string | null;
}

const emptyForm = {
    title: '', slug: '', discountType: 'percentage', discountAmount: 0, details: '',
    thumbnailUrl: '', thumbnailPublicId: '', productSelection: 'all', selectedProducts: [], isActive: true,
    endingDate: ''
};

export default function OffersPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [products, setProducts] = useState([] as any[]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Offer | null>(null);
  const [form, setForm] = useState<any>({ ...emptyForm });
  const [saving, setSaving] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');

  const load = async () => {
    setLoading(true);
    const [oRes, pRes] = await Promise.all([
        fetch('/api/admin/offers'),
        fetch('/api/admin/products')
    ]);
    setOffers(await oRes.json());
    setProducts(await pRes.json());
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => {
      setEditing(null);
      setForm({ ...emptyForm });
      setSearchQuery('');
      setModal(true);
  };

  const openEdit = (o: Offer) => {
    setEditing(o);
    setForm({ ...o, endingDate: o.endingDate ? o.endingDate.slice(0, 10) : '' });
    setSearchQuery('');
    setModal(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.slug || form.discountAmount <= 0 || !form.thumbnailUrl) {
      toast.error('Please fill all required fields including thumbnail and discount amount.');
      return;
    }
    if (form.productSelection === 'selected' && form.selectedProducts.length === 0) {
      toast.error('Please select at least one product.');
      return;
    }

    const payload = {
      ...form,
      endingDate: form.endingDate ? new Date(form.endingDate).toISOString() : null,
    };

    setSaving(true);
    try {
        const res = await fetch('/api/admin/offers', {
            method: editing ? 'PUT' : 'POST',
            headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editing ? { id: editing._id, ...payload } : payload)
        });
        const data = await res.json();
        if(!res.ok) throw new Error(data.error || 'Failed to save');
        setSaving(false);
        setModal(false);
        toast.success(editing ? 'Offer updated' : 'Offer created');
        load();
    } catch(err: any) {
        setSaving(false);
        toast.error(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this offer?')) return;
    await fetch('/api/admin/offers', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    toast.success('Offer deleted');
    load();
  };

  const handleTitleChange = (e: any) => {
      const title = e.target.value;
      const r = Math.floor(100000 + Math.random() * 900000);
      setForm((f: any) => ({
          ...f,
          title,
          slug: !editing ? `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')}-${r}` : f.slug
      }));
  };

  const toggleProduct = (productId: string) => {
      setForm((f:any) => {
          const sel = new Set(f.selectedProducts);
          if(sel.has(productId)) sel.delete(productId);
          else sel.add(productId);
          return { ...f, selectedProducts: Array.from(sel) };
      });
  };

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title"><span className="page-icon">🎁</span> Offer Management</h1>
          <p className="admin-page-subtitle">Create discount offers and assign products to them.</p>
        </div>
        <button className="btn-admin-primary" onClick={openAdd}>+ Create New Offer</button>
      </div>

      {loading ? (
        <div className="admin-empty"><div className="spinner" style={{ margin: '0 auto 1rem' }} /><p>Loading…</p></div>
      ) : offers.length === 0 ? (
        <div className="admin-empty">
          <div className="empty-icon">🎁</div>
          <h3>No Offers Yet</h3>
          <p>Click "Create New Offer" to start your first campaign.</p>
        </div>
      ) : (
        <div className="admin-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
            {offers.map(o => {
            const endingDate = o.endingDate ? new Date(o.endingDate) : null;
            const isClosed = !o.isActive || (endingDate && endingDate < new Date());
            return (
              <div key={o._id} className="admin-item-card">
                  <div style={{ position: 'relative', height: 160 }}>
                      <Image src={o.thumbnailUrl} alt={o.title} fill style={{ objectFit: 'cover' }} />
                  <span className={`badge ${isClosed ? 'badge-red' : 'badge-green'}`} style={{ position: 'absolute', top: 8, right: 8 }}>
                    {isClosed ? 'Inactive' : 'Active'}
                      </span>
                  </div>
                  <div className="admin-item-body">
                      <div className="admin-item-title">{o.title}</div>
                      <div className="admin-item-meta">{o.details}</div>
                      <div className="admin-item-meta" style={{ marginTop: '0.25rem', fontWeight: 'bold' }}>
                          Discount: {o.discountType === 'percentage' ? `${o.discountAmount}%` : `৳${o.discountAmount}`}
                      </div>
                        {o.endingDate && (
                          <div className="admin-item-meta" style={{ marginTop: '0.25rem' }}>
                            Ends: {new Date(o.endingDate).toLocaleDateString()}
                          </div>
                        )}
                      <div className="admin-item-actions" style={{ marginTop: '0.75rem' }}>
                          <button className="btn-admin-edit" onClick={() => openEdit(o)}>✏️ Edit</button>
                          <button className="btn-admin-danger" onClick={() => handleDelete(o._id)}>🗑️ Del</button>
                      </div>
                  </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="modal-overlay">
          <div className="modal-box modal-lg" style={{ maxWidth: 800 }}>
            <div className="modal-header">
              {editing ? '✏️ Edit Offer' : '➕ Create New Offer'}
              <button className="modal-close" onClick={() => setModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="admin-form">
                <div className="admin-form-row">
                    <div className="admin-field">
                        <label className="admin-label">Offer Title</label>
                        <input className="admin-input" value={form.title} onChange={handleTitleChange} placeholder="e.g. Eid Mega Sale" />
                    </div>
                    <div className="admin-field">
                        <label className="admin-label">URL Slug</label>
                        <input className="admin-input" value={form.slug} onChange={e => setForm((f:any) => ({...f, slug: e.target.value}))} />
                    </div>
                </div>

                <div className="admin-field">
                    <label className="admin-label">Discount Type</label>
                    <div style={{display:'flex', gap:'1rem'}}>
                       <label style={{display:'flex', alignItems:'center', gap:'0.5rem', cursor:'pointer'}}>
                           <input type="radio" value="percentage" checked={form.discountType === 'percentage'} onChange={e => setForm((f:any) => ({...f, discountType: e.target.value}))} /> Percentage
                       </label>
                       <label style={{display:'flex', alignItems:'center', gap:'0.5rem', cursor:'pointer'}}>
                           <input type="radio" value="flat" checked={form.discountType === 'flat'} onChange={e => setForm((f:any) => ({...f, discountType: e.target.value}))} /> Flat Amount
                       </label>
                    </div>
                </div>

                <div className="admin-field">
                    <label className="admin-label">Discount Amount {form.discountType === 'percentage' ? '(%)' : '(৳)'}</label>
                    <input type="number" className="admin-input" value={form.discountAmount} onChange={e => setForm((f:any) => ({...f, discountAmount: +e.target.value}))} />
                </div>

                <div className="admin-field">
                  <label className="admin-label">Ending Date</label>
                  <input type="date" className="admin-input" value={form.endingDate || ''} onChange={e => setForm((f:any) => ({...f, endingDate: e.target.value}))} />
                </div>

                <div className="admin-field">
                  <label className="admin-label">Offer Details</label>
                  <textarea className="admin-textarea" value={form.details} onChange={e => setForm((f:any) => ({...f, details: e.target.value}))} rows={2} placeholder="e.g. Get 20% off on premium toys" />
                </div>

                 <ImageUpload
                   label="Offer Thumbnail"
                   value={form.thumbnailUrl}
                   folder="dealhobe/offers"
                   onChange={(url, pid) => setForm((f:any) => ({...f, thumbnailUrl: url, thumbnailPublicId: pid}))}
                 />

                 <div className="admin-field">
                    <label className="admin-label">Product Selection</label>
                    <div style={{display:'flex', gap:'1rem'}}>
                       <label style={{display:'flex', alignItems:'center', gap:'0.5rem', cursor:'pointer'}}>
                           <input type="radio" value="all" checked={form.productSelection === 'all'} onChange={e => setForm((f:any) => ({...f, productSelection: e.target.value, selectedProducts: []}))} /> All Products
                       </label>
                       <label style={{display:'flex', alignItems:'center', gap:'0.5rem', cursor:'pointer'}}>
                           <input type="radio" value="selected" checked={form.productSelection === 'selected'} onChange={e => setForm((f:any) => ({...f, productSelection: e.target.value}))} /> Selected Products Only
                       </label>
                    </div>
                </div>

                {form.productSelection === 'selected' && (
                    <div className="admin-field" style={{background: 'rgba(0,0,0,0.03)', padding: '1rem', borderRadius: 8}}>
                         <label className="admin-label">Select Products</label>
                         <input className="admin-input" style={{marginBottom: '0.5rem'}} placeholder="Search products..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                         <div style={{height: 200, overflowY: 'auto', border: '1px solid #ddd', borderRadius: 4, background: '#fff'}}>
                             {filteredProducts.map(p => (
                                 <label key={p._id} style={{display:'flex', alignItems:'center', justifyContent: 'space-between', padding: '0.5rem', borderBottom: '1px solid #f0f0f0', cursor:'pointer', background: form.selectedProducts.includes(p._id) ? '#f0f9ff' : 'transparent'}}>
                                     <div style={{display:'flex', alignItems:'center', gap:'0.5rem'}}>
                                         {p.images && p.images[0] && <Image src={p.images[0]} alt={p.name} width={30} height={30} style={{objectFit:'cover', borderRadius:4}}/>}
                                         <span style={{fontSize:'0.9rem'}}>{p.name} - ৳{p.salePrice || p.price}</span>
                                     </div>
                                     <input type="checkbox" checked={form.selectedProducts.includes(p._id)} onChange={() => toggleProduct(p._id)} />
                                 </label>
                             ))}
                             {filteredProducts.length === 0 && <div style={{padding:'1rem', textAlign:'center', color:'#999'}}>No products found</div>}
                         </div>
                         <div style={{marginTop:'0.5rem', fontSize:'0.8rem', color:'var(--text-muted)'}}>{form.selectedProducts.length} product(s) selected</div>
                    </div>
                )}

                <div className="admin-field">
                    <label className="admin-checkbox-row">
                      <input type="checkbox" className="admin-checkbox" checked={form.isActive} onChange={e => setForm((f:any) => ({ ...f, isActive: e.target.checked }))} />
                      <span className="admin-label">Active</span>
                    </label>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-admin-secondary" onClick={() => setModal(false)}>Cancel</button>
              <button className="btn-admin-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : editing ? 'Update Offer' : 'Create Offer'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
