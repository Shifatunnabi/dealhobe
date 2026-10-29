"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { FiBarChart2, FiSearch, FiTrendingUp, FiInbox, FiPackage, FiX } from "react-icons/fi";

interface ProductHit {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  price: number;
}

interface ReportRow {
  productId: string;
  name: string;
  qty: number;
  revenue: number;
  profit: number;
  orderCount: number;
  variants?: { label: string; orderCount: number; qty: number; revenue: number; profit: number }[];
}

interface Totals {
  qty: number;
  revenue: number;
  profit: number;
}

// Local-time YYYY-MM-DD (toISOString would shift the day for UTC+ timezones).
function toDateInput(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export default function SalesReportPage() {
  const now = new Date();
  const today = toDateInput(now);
  const firstOfMonth = toDateInput(new Date(now.getFullYear(), now.getMonth(), 1));

  const [from, setFrom] = useState(firstOfMonth);
  const [to, setTo] = useState(today);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [allProducts, setAllProducts] = useState<ProductHit[]>([]);
  const [searching, setSearching] = useState(false);
  const [productsError, setProductsError] = useState("");
  // Staged selection inside modal (before confirming)
  const [staged, setStaged] = useState<ProductHit[]>([]);
  // Confirmed selection (used for report)
  const [selected, setSelected] = useState<ProductHit[]>([]);

  // Report state
  const [rows, setRows] = useState<ReportRow[]>([]);
  const [totals, setTotals] = useState<Totals | null>(null);
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [error, setError] = useState("");

  // Products matching the search box (all products when empty)
  const hits = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? allProducts.filter((p) => p.name.toLowerCase().includes(q)) : allProducts;
  }, [allProducts, query]);

  // Open modal: pre-fill staged with current confirmed selection
  function openModal() {
    setStaged([...selected]);
    setQuery("");
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
  }

  function applyModal() {
    setSelected([...staged]);
    setModalOpen(false);
  }

  function toggleStaged(hit: ProductHit) {
    setStaged((prev) => {
      const exists = prev.find((p) => p.id === hit.id);
      return exists ? prev.filter((p) => p.id !== hit.id) : [...prev, hit];
    });
  }

  function removeSelected(id: string) {
    setSelected((prev) => prev.filter((p) => p.id !== id));
  }

  // Load every product when the modal opens; searching filters client-side
  useEffect(() => {
    if (!modalOpen) return;
    let cancelled = false;
    setSearching(true);
    setProductsError("");
    (async () => {
      try {
        const res = await fetch("/api/admin/sales-report/products");
        if (!res.ok) throw new Error();
        const data = await res.json();
        if (!cancelled) setAllProducts(Array.isArray(data) ? data : []);
      } catch {
        if (!cancelled) setProductsError("Failed to load products. Please try again.");
      } finally {
        if (!cancelled) setSearching(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [modalOpen]);

  async function runReport(overrideProducts?: string[]) {
    if (from && to && from > to) {
      setError("'From' date must be on or before 'To' date.");
      return;
    }
    setLoading(true);
    setGenerated(false);
    setError("");
    try {
      const params = new URLSearchParams();
      if (from) params.set("from", from);
      if (to) params.set("to", to);
      const ids = overrideProducts ?? selected.map((p) => p.id);
      if (ids.length) params.set("productIds", ids.join(","));
      const res = await fetch(`/api/admin/sales-report?${params}`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed to generate report");
      setRows(data.rows ?? []);
      setTotals(data.totals ?? null);
      setGenerated(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate report");
    } finally {
      setLoading(false);
    }
  }

  function generateReport() { runReport(); }
  function generateAll() { setSelected([]); runReport([]); }

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">
            <span className="page-icon"><FiBarChart2 size={20} /></span> Sales Report
          </h1>
          <p className="admin-page-subtitle">Analyse product sales within a date range.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="admin-card" style={{ marginBottom: "1.5rem" }}>
        <div className="admin-card-header"><span style={{display:"inline-flex",alignItems:"center",gap:"0.5rem"}}><FiSearch size={16} /> Filters</span></div>
        <div className="admin-card-body">
          <div className="report-filters">
            {/* Date range */}
            <div className="admin-field report-field-date">
              <label className="admin-label" htmlFor="report-from">From</label>
              <input
                id="report-from"
                type="date"
                className="admin-input"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
              />
            </div>
            <div className="admin-field report-field-date">
              <label className="admin-label" htmlFor="report-to">To</label>
              <input
                id="report-to"
                type="date"
                className="admin-input"
                value={to}
                onChange={(e) => setTo(e.target.value)}
              />
            </div>

            {/* Product selector */}
            <div className="admin-field report-field-products">
              <label className="admin-label">Products</label>
              <button
                type="button"
                className="admin-input"
                onClick={openModal}
                style={{
                  color: selected.length ? "var(--text-dark)" : "var(--text-muted)",
                }}
              >
                {selected.length
                  ? `${selected.length} product${selected.length > 1 ? "s" : ""} selected`
                  : "Click to select products…"}
              </button>
            </div>

            <div className="report-actions">
              <button
                type="button"
                className="btn-admin-secondary"
                onClick={generateAll}
                disabled={loading}
              >
                All Products
              </button>
              <button
                type="button"
                className="btn-admin-primary"
                onClick={generateReport}
                disabled={loading}
              >
                {loading ? "Generating…" : "Generate Report"}
              </button>
            </div>
          </div>

          {/* Selected product pills */}
          {selected.length > 0 && (
            <div className="admin-chip-list" style={{ marginTop: "1rem" }}>
              {selected.map((p) => (
                <span key={p.id} className="admin-chip">
                  <span>{p.name}</span>
                  <button
                    type="button"
                    onClick={() => removeSelected(p.id)}
                    aria-label={`Remove ${p.name}`}
                  >
                    ×
                  </button>
                </span>
              ))}
              <button type="button" className="admin-chip admin-chip--ghost" onClick={() => setSelected([])}>
                Clear all
              </button>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="admin-notice admin-notice--error" role="alert">
          {error}
        </div>
      )}

      {/* Report table */}
      {generated && (
        <div className="admin-card">
          <div className="admin-card-header">
            <span style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
              <FiTrendingUp size={16} /> Results
            </span>
            {totals && (
              <span style={{ fontSize: "0.82rem", fontWeight: 400, color: "var(--text-muted)" }}>
                {rows.length} product{rows.length !== 1 ? "s" : ""} · ৳
                {totals.revenue.toLocaleString()} revenue · ৳{totals.profit.toLocaleString()} profit
              </span>
            )}
          </div>

          {rows.length === 0 ? (
            <div className="admin-empty">
              <div className="empty-icon"><FiInbox size={40} /></div>
              <h3>No Sales Data</h3>
              <p>No orders matched the selected filters.</p>
            </div>
          ) : (
            <>
              <div className="admin-table-wrap" style={{ border: "none", borderRadius: 0, boxShadow: "none" }}>
                <table className="admin-table admin-table--sticky report-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th className="sticky-col">Product</th>
                      <th>Variant</th>
                      <th className="num">Orders</th>
                      <th className="num">Qty Sold</th>
                      <th className="num">Revenue (৳)</th>
                      <th className="num">Profit (৳)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, i) => {
                      // One table row per variant, kept together under the product; plain products get one row.
                      const lines = row.variants && row.variants.length > 0
                        ? row.variants
                        : [{ label: "", orderCount: row.orderCount, qty: row.qty, revenue: row.revenue, profit: row.profit }];
                      return lines.map((v, j) => (
                        <tr
                          key={row.productId + "|" + v.label}
                          className={j === 0 && i > 0 ? "group-start" : undefined}
                        >
                          {j === 0 && <td rowSpan={lines.length} style={{ verticalAlign: "top", color: "var(--text-muted)" }}>{i + 1}</td>}
                          {j === 0 && <td rowSpan={lines.length} className="sticky-col report-product" style={{ fontWeight: 600, verticalAlign: "top" }}>{row.name}</td>}
                          <td style={{ color: v.label ? undefined : "var(--text-muted)" }}>{v.label || "—"}</td>
                          <td className="num">{v.orderCount}</td>
                          <td className="num">{v.qty}</td>
                          <td className="num">৳{v.revenue.toLocaleString()}</td>
                          <td className="num" style={{ fontWeight: 600, color: v.profit < 0 ? "#A41B15" : "#15803d" }}>
                            ৳{v.profit.toLocaleString()}
                          </td>
                        </tr>
                      ));
                    })}
                  </tbody>
                  {totals && (
                    <tfoot>
                      <tr>
                        <td>&nbsp;</td>
                        <td className="sticky-col">Total</td>
                        <td colSpan={2}>&nbsp;</td>
                        <td className="num">{totals.qty}</td>
                        <td className="num">৳{totals.revenue.toLocaleString()}</td>
                        <td className="num" style={{ color: totals.profit < 0 ? "#A41B15" : "#15803d" }}>
                          ৳{totals.profit.toLocaleString()}
                        </td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </>
          )}
        </div>
      )}

      {/* Product Selection Modal */}
      {modalOpen && (
        <div
          className="modal-overlay"
          onClick={(e) => e.target === e.currentTarget && closeModal()}
        >
          <div className="modal-box modal-md" role="dialog" aria-modal="true" aria-labelledby="picker-title">
            {/* Modal header */}
            <div className="modal-header">
              <div style={{ minWidth: 0 }}>
                <h3 id="picker-title" style={{ fontSize: "1.05rem", fontWeight: 700, margin: 0 }}>
                  Select Products
                </h3>
                {staged.length > 0 && (
                  <p className="modal-subtitle">{staged.length} selected</p>
                )}
              </div>
              <button type="button" className="modal-close" onClick={closeModal} aria-label="Close">
                <FiX size={18} />
              </button>
            </div>

            <div className="modal-body modal-body--flush">
              {/* Search input */}
              <div className="picker-search">
                <input
                  autoFocus
                  type="search"
                  className="admin-input"
                  placeholder="Search to filter…"
                  aria-label="Search products"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>

              {/* Selected chips inside modal */}
              {staged.length > 0 && (
                <div className="picker-chips admin-chip-list">
                  {staged.map((p) => (
                    <span key={p.id} className="admin-chip">
                      <span>{p.name}</span>
                      <button type="button" onClick={() => toggleStaged(p)} aria-label={`Remove ${p.name}`}>
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Results list */}
              <div className="picker-list">
                {searching && (
                  <div className="picker-state">
                    <div className="spinner" style={{ margin: "0 auto 0.75rem" }} />
                    Searching…
                  </div>
                )}

                {productsError && (
                  <div className="picker-state is-error">{productsError}</div>
                )}

                {!searching && !productsError && hits.length === 0 && (
                  <div className="picker-state">
                    {query ? <>No products found for &ldquo;{query}&rdquo;</> : "No products yet."}
                  </div>
                )}

                {!searching && hits.map((hit) => {
                  const isSelected = staged.some((p) => p.id === hit.id);
                  return (
                    <button
                      type="button"
                      key={hit.id}
                      onClick={() => toggleStaged(hit)}
                      className={`picker-row ${isSelected ? "is-selected" : ""}`}
                      aria-pressed={isSelected}
                    >
                      {/* Product image */}
                      <span className="admin-thumb admin-thumb--lg" style={{ width: 48, height: 48 }}>
                        {hit.image ? (
                          <Image src={hit.image} alt="" fill sizes="48px" style={{ objectFit: "cover" }} />
                        ) : (
                          <FiPackage size={20} />
                        )}
                      </span>

                      {/* Name + price */}
                      <span style={{ flex: 1, minWidth: 0 }}>
                        <span className="picker-row-name" style={{ display: "block" }}>{hit.name}</span>
                        <span className="picker-row-sub" style={{ display: "block" }}>৳{hit.price.toLocaleString()}</span>
                      </span>

                      {/* Checkbox */}
                      <span className="picker-check" aria-hidden="true">
                        {isSelected && (
                          <svg width="12" height="9" viewBox="0 0 12 9" fill="none">
                            <path d="M1 4L4.5 7.5L11 1" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Modal footer */}
            <div className="modal-footer">
              <button type="button" className="btn-admin-secondary" onClick={closeModal}>
                Cancel
              </button>
              <button type="button" className="btn-admin-primary" onClick={applyModal}>
                Apply Selection{staged.length > 0 ? ` (${staged.length})` : ""}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
