'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { FiPlus, FiTrash2, FiX } from 'react-icons/fi';

export interface VariantOption { name: string; values: string[] }
export interface Variant {
  key: string;
  options: { name: string; value: string }[];
  price: number;
  salePrice?: number;
  costPrice?: number;
  sku: string;
  quantity: number;
  useMainImage: boolean;
  image?: string;
  imagePublicId?: string;
}

interface Props {
  options: VariantOption[];
  variants: Variant[];
  basePrice: number;
  baseCost?: number;
  mainImage?: string;
  onChange: (options: VariantOption[], variants: Variant[]) => void;
}

const SUGGESTIONS = ['Shade', 'Color', 'Size', 'Volume', 'Pack Size', 'Fragrance'];

/** Cartesian product of all option values → one variant per combination. */
export function buildVariants(options: VariantOption[], existing: Variant[], basePrice: number, baseCost = 0): Variant[] {
  const usable = options.filter(o => o.name.trim() && o.values.length > 0);
  if (usable.length === 0) return [];
  let combos: { name: string; value: string }[][] = [[]];
  for (const o of usable) {
    combos = combos.flatMap(c => o.values.map(v => [...c, { name: o.name.trim(), value: v }]));
  }
  const byKey = new Map(existing.map(v => [v.key, v]));
  return combos.map(opts => {
    const key = opts.map(o => o.value).join('|');
    const prev = byKey.get(key);
    return prev
      ? { ...prev, options: opts }
      : { key, options: opts, price: basePrice, salePrice: 0, costPrice: baseCost, sku: '', quantity: 0, useMainImage: true };
  });
}

export default function VariantsEditor({ options, variants, basePrice, baseCost, mainImage, onChange }: Props) {
  const [drafts, setDrafts] = useState<Record<number, string>>({});
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const uploadTarget = useRef<string>('');

  const update = (next: VariantOption[], existing: Variant[] = variants) =>
    onChange(next, buildVariants(next, existing, basePrice, baseCost));
  const [bulk, setBulk] = useState({ price: '', salePrice: '', costPrice: '', quantity: '' });
  const [editing, setEditing] = useState<{ i: number; value: string; text: string } | null>(null);

  /** Rename a value in place, carrying over each affected variant's price/SKU/stock/image. */
  const renameValue = (i: number, oldValue: string, rawNew: string) => {
    const newValue = rawNew.trim();
    setEditing(null);
    if (!newValue || newValue === oldValue || options[i].values.includes(newValue)) return;
    const next = options.map((o, idx) =>
      idx === i ? { ...o, values: o.values.map((v) => (v === oldValue ? newValue : v)) } : o,
    );
    const rekeyed = variants.map((v) => {
      if (!v.options.some((o) => o.name === options[i].name && o.value === oldValue)) return v;
      const opts = v.options.map((o) => (o.name === options[i].name && o.value === oldValue ? { ...o, value: newValue } : o));
      return { ...v, options: opts, key: opts.map((o) => o.value).join('|') };
    });
    update(next, rekeyed);
  };

  const applyToAll = () => {
    const num = (s: string) => (s.trim() === '' ? undefined : Math.max(0, +s));
    const patch: Partial<Variant> = {};
    if (num(bulk.price) !== undefined) patch.price = num(bulk.price)!;
    if (num(bulk.salePrice) !== undefined) patch.salePrice = num(bulk.salePrice)!;
    if (num(bulk.costPrice) !== undefined) patch.costPrice = num(bulk.costPrice)!;
    if (num(bulk.quantity) !== undefined) patch.quantity = num(bulk.quantity)!;
    if (Object.keys(patch).length === 0) return;
    onChange(options, variants.map((v) => ({ ...v, ...patch })));
    setBulk({ price: '', salePrice: '', costPrice: '', quantity: '' });
  };
  const patchVariant = (key: string, patch: Partial<Variant>) =>
    onChange(options, variants.map(v => (v.key === key ? { ...v, ...patch } : v)));

  const addOption = (name = '') => update([...options, { name, values: [] }]);
  const removeOption = (i: number) => update(options.filter((_, idx) => idx !== i));
  const renameOption = (i: number, name: string) =>
    update(options.map((o, idx) => (idx === i ? { ...o, name } : o)));

  const addValues = (i: number) => {
    const raw = (drafts[i] || '').split(',').map(s => s.trim()).filter(Boolean);
    if (raw.length === 0) return;
    const merged = Array.from(new Set([...options[i].values, ...raw]));
    setDrafts(d => ({ ...d, [i]: '' }));
    update(options.map((o, idx) => (idx === i ? { ...o, values: merged } : o)));
  };
  const removeValue = (i: number, value: string) =>
    update(options.map((o, idx) => (idx === i ? { ...o, values: o.values.filter(v => v !== value) } : o)));

  const upload = async (file: File) => {
    const key = uploadTarget.current;
    if (!file.type.startsWith('image/')) return;
    setUploadingKey(key);
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: reader.result, folder: 'dealhobe/products' }),
        });
        const data = await res.json();
        if (data.url) patchVariant(key, { image: data.url, imagePublicId: data.publicId, useMainImage: false });
      } finally {
        setUploadingKey(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const unused = SUGGESTIONS.filter(s => !options.some(o => o.name.toLowerCase() === s.toLowerCase()));

  return (
    <div style={{ border: '1px solid var(--border, #e5e7eb)', borderRadius: 8, padding: '1rem', display: 'grid', gap: '1rem' }}>
      <div style={{ display: 'grid', gap: '0.75rem' }}>
        {options.map((opt, i) => (
          <div key={i} style={{ display: 'grid', gap: '0.5rem', paddingBottom: '0.75rem', borderBottom: '1px dashed #ddd' }}>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                className="admin-input"
                value={opt.name}
                onChange={e => renameOption(i, e.target.value)}
                placeholder="Option name (e.g. Shade)"
                list="variant-option-suggestions"
              />
              <button type="button" className="btn-admin-danger" aria-label="Remove option" onClick={() => removeOption(i)}>
                <FiTrash2 size={14} />
              </button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {opt.values.map(v => (
                <span key={v} className="badge badge-green" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  {editing && editing.i === i && editing.value === v ? (
                    <input
                      autoFocus
                      value={editing.text}
                      onChange={e => setEditing({ ...editing, text: e.target.value })}
                      onBlur={() => renameValue(i, v, editing.text)}
                      onKeyDown={e => { if (e.key === 'Enter') renameValue(i, v, editing.text); if (e.key === 'Escape') setEditing(null); }}
                      style={{ width: Math.max(60, editing.text.length * 9), font: 'inherit', border: '1px solid #ccc', borderRadius: 4, padding: '0 4px' }}
                    />
                  ) : (
                    <span style={{ cursor: 'text' }} title="Click to rename" onClick={() => setEditing({ i, value: v, text: v })}>{v}</span>
                  )}
                  <button type="button" aria-label={`Remove ${v}`} onClick={() => removeValue(i, v)}
                    style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0, display: 'inline-flex' }}>
                    <FiX size={12} />
                  </button>
                </span>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                className="admin-input"
                value={drafts[i] || ''}
                onChange={e => setDrafts(d => ({ ...d, [i]: e.target.value }))}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addValues(i); } }}
                placeholder="Add values — comma separated, press Enter"
              />
              <button type="button" className="btn-admin-secondary" onClick={() => addValues(i)}>Add</button>
            </div>
          </div>
        ))}
        <datalist id="variant-option-suggestions">{SUGGESTIONS.map(s => <option key={s} value={s} />)}</datalist>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', alignItems: 'center' }}>
          <button type="button" className="btn-admin-secondary" onClick={() => addOption()}>
            <FiPlus size={14} /> Add option
          </button>
          {unused.map(s => (
            <button key={s} type="button" className="btn-admin-secondary"
              style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem' }} onClick={() => addOption(s)}>
              + {s}
            </button>
          ))}
        </div>
      </div>

      {variants.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Apply to all:</span>
          {([['price', 'Price'], ['salePrice', 'Sale'], ['costPrice', 'Cost'], ['quantity', 'Stock']] as const).map(([k, label]) => (
            <input key={k} type="number" min={0} className="admin-input" style={{ width: 90 }} placeholder={label}
              value={bulk[k]} onChange={e => setBulk(b => ({ ...b, [k]: e.target.value }))} />
          ))}
          <button type="button" className="btn-admin-secondary" onClick={applyToAll}>Apply</button>
        </div>
      )}

      {variants.length > 0 && (
        <div className="admin-table-wrap" style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr><th>Variant</th><th>Price (৳)</th><th>Sale (৳)</th><th>Cost (৳)</th><th>SKU</th><th>Stock</th><th>Image</th></tr>
            </thead>
            <tbody>
              {variants.map(v => {
                const img = v.useMainImage ? mainImage : v.image;
                return (
                  <tr key={v.key}>
                    <td style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>{v.options.map(o => o.value).join(' / ')}</td>
                    <td><input type="number" min={0} className="admin-input" style={{ width: 90 }} value={v.price}
                      onChange={e => patchVariant(v.key, { price: +e.target.value })} /></td>
                    <td><input type="number" min={0} className="admin-input" style={{ width: 90 }} value={v.salePrice ?? 0}
                      onChange={e => patchVariant(v.key, { salePrice: +e.target.value })} /></td>
                    <td><input type="number" min={0} className="admin-input" style={{ width: 90 }} value={v.costPrice ?? 0}
                      onChange={e => patchVariant(v.key, { costPrice: +e.target.value })} /></td>
                    <td><input className="admin-input" style={{ width: 130, fontFamily: 'monospace' }} value={v.sku}
                      onChange={e => patchVariant(v.key, { sku: e.target.value.toUpperCase() })} /></td>
                    <td><input type="number" min={0} className="admin-input" style={{ width: 80 }} value={v.quantity}
                      onChange={e => patchVariant(v.key, { quantity: Math.max(0, +e.target.value) })} /></td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div
                          onClick={() => { if (!v.useMainImage) { uploadTarget.current = v.key; fileRef.current?.click(); } }}
                          style={{ width: 40, height: 40, position: 'relative', border: '1px dashed #ccc', borderRadius: 4, overflow: 'hidden',
                            cursor: v.useMainImage ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa' }}
                          title={v.useMainImage ? 'Using main image' : 'Click to upload'}
                        >
                          {uploadingKey === v.key ? <div className="spinner" style={{ width: 14, height: 14 }} />
                            : img ? <Image src={img} alt="" fill style={{ objectFit: 'cover' }} /> : '+'}
                        </div>
                        <label className="admin-checkbox-row" style={{ whiteSpace: 'nowrap' }}>
                          <input type="checkbox" className="admin-checkbox" checked={v.useMainImage}
                            onChange={e => patchVariant(v.key, { useMainImage: e.target.checked })} />
                          <span style={{ fontSize: '0.75rem' }}>Use main image</span>
                        </label>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      {options.length > 0 && variants.length === 0 && (
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
          Name an option and add at least one value to generate variants.
        </p>
      )}

      <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }}
        onChange={e => { const f = e.target.files?.[0]; if (f) upload(f); e.target.value = ''; }} />
    </div>
  );
}
