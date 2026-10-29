'use client';

import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { FiPlus, FiTrash2, FiArrowUp, FiArrowDown } from 'react-icons/fi';
import { DEFAULT_STOREFRONT } from '@/lib/homepage/defaults';
import type { NavPill, Storefront, TrustBadge } from '@/lib/homepage/types';
import { TRUST_ICONS } from '@/components/home/TrustBadges';

function move<T>(list: T[], i: number, dir: -1 | 1): T[] {
  const next = [...list];
  [next[i], next[i + dir]] = [next[i + dir], next[i]];
  return next;
}

/** Navbar pills, trust badges, contact details and social links shown across the storefront. */
export default function StorefrontEditor() {
  const [sf, setSf] = useState<Storefront | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/admin/homepage/storefront')
      .then((r) => (r.ok ? r.json() : DEFAULT_STOREFRONT))
      .then((d) => setSf({ ...DEFAULT_STOREFRONT, ...d, contact: { ...DEFAULT_STOREFRONT.contact, ...d.contact }, socials: { ...DEFAULT_STOREFRONT.socials, ...d.socials } }))
      .catch(() => setSf(DEFAULT_STOREFRONT));
  }, []);

  if (!sf) return <div className="admin-empty"><div className="spinner" style={{ margin: '0 auto 1rem' }} /><p>Loading…</p></div>;

  const setPill = (i: number, patch: Partial<NavPill>) => setSf({ ...sf, navPills: sf.navPills.map((p, j) => (j === i ? { ...p, ...patch } : p)) });
  const setBadge = (i: number, patch: Partial<TrustBadge>) => setSf({ ...sf, trustBadges: sf.trustBadges.map((b, j) => (j === i ? { ...b, ...patch } : b)) });

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/homepage/storefront', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(sf) });
      if (!res.ok) throw new Error('Could not save');
      setSf(await res.json());
      toast.success('Storefront saved');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="hb-storefront">
      <section className="admin-card hb-card">
        <h2 className="hb-card-title">Navbar category pills</h2>
        <p className="hb-hint">The colourful links under the search bar. They scroll sideways on phones.</p>
        <div className="hb-pill-preview">
          {sf.navPills.map((p, i) => <span key={i} style={{ background: p.color }}>{p.label || 'Label'}</span>)}
        </div>
        {sf.navPills.map((p, i) => (
          <div className="hb-row" key={i}>
            <input className="admin-input" value={p.label} onChange={(e) => setPill(i, { label: e.target.value })} placeholder="Label" aria-label="Pill label" />
            <input className="admin-input hb-grow" value={p.link} onChange={(e) => setPill(i, { link: e.target.value })} placeholder="/products?category=Makeup" aria-label="Pill link" />
            <input className="admin-input hb-color" type="color" value={p.color} onChange={(e) => setPill(i, { color: e.target.value })} aria-label="Pill colour" />
            <div className="hb-row-actions">
              <button type="button" className="hb-icon-btn" disabled={i === 0} onClick={() => setSf({ ...sf, navPills: move(sf.navPills, i, -1) })} aria-label="Move up"><FiArrowUp size={15} /></button>
              <button type="button" className="hb-icon-btn" disabled={i === sf.navPills.length - 1} onClick={() => setSf({ ...sf, navPills: move(sf.navPills, i, 1) })} aria-label="Move down"><FiArrowDown size={15} /></button>
              <button type="button" className="hb-icon-btn hb-danger" onClick={() => setSf({ ...sf, navPills: sf.navPills.filter((_, j) => j !== i) })} aria-label="Remove pill"><FiTrash2 size={15} /></button>
            </div>
          </div>
        ))}
        <button type="button" className="btn-admin-secondary" onClick={() => setSf({ ...sf, navPills: [...sf.navPills, { label: '', link: '/products', color: '#A41B15' }] })}>
          <FiPlus size={14} /> Add pill
        </button>
      </section>

      <section className="admin-card hb-card">
        <h2 className="hb-card-title">Search bar suggestions</h2>
        <p className="hb-hint">Rotate in the search bar as “Search for …”, one every few seconds. Use short, popular searches.</p>
        <div className="hb-term-list">
          {sf.searchPlaceholders.map((term, i) => (
            <span className="hb-term" key={i}>
              <input
                className="admin-input"
                value={term}
                maxLength={60}
                onChange={(e) => setSf({ ...sf, searchPlaceholders: sf.searchPlaceholders.map((x, j) => (j === i ? e.target.value : x)) })}
                aria-label={`Search suggestion ${i + 1}`}
              />
              <button type="button" className="hb-icon-btn hb-danger" onClick={() => setSf({ ...sf, searchPlaceholders: sf.searchPlaceholders.filter((_, j) => j !== i) })} aria-label="Remove suggestion"><FiTrash2 size={15} /></button>
            </span>
          ))}
        </div>
        {sf.searchPlaceholders.length < 20 && (
          <button type="button" className="btn-admin-secondary" onClick={() => setSf({ ...sf, searchPlaceholders: [...sf.searchPlaceholders, ''] })}>
            <FiPlus size={14} /> Add suggestion
          </button>
        )}
      </section>

      <section className="admin-card hb-card">
        <h2 className="hb-card-title">Trust badges</h2>
        <p className="hb-hint">Shown by the “Trust badges” homepage section.</p>
        {sf.trustBadges.map((b, i) => (
          <div className="hb-row" key={i}>
            <select className="admin-input" value={b.icon} onChange={(e) => setBadge(i, { icon: e.target.value })} aria-label="Icon">
              {Object.keys(TRUST_ICONS).map((k) => <option key={k} value={k}>{k}</option>)}
            </select>
            <input className="admin-input" value={b.title} onChange={(e) => setBadge(i, { title: e.target.value })} placeholder="Title" aria-label="Badge title" />
            <input className="admin-input hb-grow" value={b.text} onChange={(e) => setBadge(i, { text: e.target.value })} placeholder="Short line" aria-label="Badge text" />
            <div className="hb-row-actions">
              <button type="button" className="hb-icon-btn hb-danger" onClick={() => setSf({ ...sf, trustBadges: sf.trustBadges.filter((_, j) => j !== i) })} aria-label="Remove badge"><FiTrash2 size={15} /></button>
            </div>
          </div>
        ))}
        {sf.trustBadges.length < 8 && (
          <button type="button" className="btn-admin-secondary" onClick={() => setSf({ ...sf, trustBadges: [...sf.trustBadges, { icon: 'star', title: '', text: '' }] })}>
            <FiPlus size={14} /> Add badge
          </button>
        )}
      </section>

      <section className="admin-card hb-card">
        <h2 className="hb-card-title">Contact and socials</h2>
        <p className="hb-hint">Used in the top bar, menu drawer and footer. Leave a social link empty to hide its icon.</p>
        <div className="admin-form">
          <div className="admin-form-row">
            {(['phone', 'email', 'whatsapp'] as const).map((k) => (
              <div className="admin-field" key={k}>
                <label className="admin-label">{k === 'whatsapp' ? 'WhatsApp number' : k[0].toUpperCase() + k.slice(1)}</label>
                <input className="admin-input" value={sf.contact[k]} onChange={(e) => setSf({ ...sf, contact: { ...sf.contact, [k]: e.target.value } })} />
              </div>
            ))}
          </div>
          <div className="admin-field">
            <label className="admin-label">Address</label>
            <input className="admin-input" value={sf.contact.address} onChange={(e) => setSf({ ...sf, contact: { ...sf.contact, address: e.target.value } })} />
          </div>
          <div className="admin-form-row">
            {(['facebook', 'instagram', 'youtube', 'tiktok'] as const).map((k) => (
              <div className="admin-field" key={k}>
                <label className="admin-label">{k[0].toUpperCase() + k.slice(1)} URL</label>
                <input className="admin-input" value={sf.socials[k]} onChange={(e) => setSf({ ...sf, socials: { ...sf.socials, [k]: e.target.value } })} placeholder="https://" />
              </div>
            ))}
          </div>
          <div className="admin-field">
            <label className="admin-label">Footer blurb</label>
            <textarea className="admin-textarea" rows={2} value={sf.footerAbout} onChange={(e) => setSf({ ...sf, footerAbout: e.target.value })} />
          </div>
        </div>
      </section>

      <div className="hb-savebar">
        <button className="btn-admin-primary" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save storefront'}</button>
      </div>
    </div>
  );
}
