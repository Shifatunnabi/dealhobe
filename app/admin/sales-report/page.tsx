"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

interface ProductHit {
  name: string;
  slug: string;
  image: string | null;
  price: number;
}

interface ReportRow {
  name: string;
  qty: number;
  revenue: number;
  orderCount: number;
}

interface Totals {
  qty: number;
  revenue: number;
}

export default function SalesReportPage() {
  const today = new Date().toISOString().slice(0, 10);
  const firstOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    .toISOString()
    .slice(0, 10);

  const [from, setFrom] = useState(firstOfMonth);
  const [to, setTo] = useState(today);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<ProductHit[]>([]);
  const [searching, setSearching] = useState(false);
  // Staged selection inside modal (before confirming)
  const [staged, setStaged] = useState<ProductHit[]>([]);
  // Confirmed selection (used for report)
  const [selected, setSelected] = useState<ProductHit[]>([]);

  // Report state
  const [rows, setRows] = useState<ReportRow[]>([]);
  const [totals, setTotals] = useState<Totals | null>(null);
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);

  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Open modal: pre-fill staged with current confirmed selection
  function openModal() {
    setStaged([...selected]);
    setQuery("");
    setHits([]);
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
      const exists = prev.find((p) => p.slug === hit.slug);
      return exists ? prev.filter((p) => p.slug !== hit.slug) : [...prev, hit];
    });
  }

  function removeSelected(slug: string) {
    setSelected((prev) => prev.filter((p) => p.slug !== slug));
  }

  // Debounced search — empty query shows latest 20 products
  useEffect(() => {
    if (!modalOpen) return;
    if (searchTimer.current) clearTimeout(searchTimer.current);
    const delay = query.length === 0 ? 0 : 300;
    setSearching(true);
    searchTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/products/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setHits(data);
      } finally {
        setSearching(false);
      }
    }, delay);
    return () => {
      if (searchTimer.current) clearTimeout(searchTimer.current);
    };
  }, [query, modalOpen]);

  async function runReport(overrideProducts?: string[]) {
    setLoading(true);
    setGenerated(false);
    try {
      const params = new URLSearchParams();
      if (from) params.set("from", from);
      if (to) params.set("to", to);
      const names = overrideProducts ?? selected.map((p) => p.name);
      if (names.length) params.set("products", names.join(","));
      const res = await fetch(`/api/admin/sales-report?${params}`);
      const data = await res.json();
      setRows(data.rows ?? []);
      setTotals(data.totals ?? null);
      setGenerated(true);
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
            <span className="page-icon">📊</span> Sales Report
          </h1>
          <p className="admin-page-subtitle">Analyse product sales within a date range.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="admin-card" style={{ marginBottom: "1.5rem" }}>
        <div className="admin-card-header">🔍 Filters</div>
        <div className="admin-card-body">
          <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", alignItems: "flex-end" }}>
            {/* Date range */}
            <div className="admin-field" style={{ flex: "1 1 160px" }}>
              <label className="admin-label">From</label>
              <input
                type="date"
                className="admin-input"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
              />
            </div>
            <div className="admin-field" style={{ flex: "1 1 160px" }}>
              <label className="admin-label">To</label>
              <input
                type="date"
                className="admin-input"
                value={to}
                onChange={(e) => setTo(e.target.value)}
              />
            </div>

            {/* Product selector */}
            <div className="admin-field" style={{ flex: "2 1 260px" }}>
              <label className="admin-label">Products</label>
              <button
                type="button"
                className="admin-input"
                onClick={openModal}
                style={{
                  textAlign: "left",
                  cursor: "pointer",
                  color: selected.length ? "var(--text-dark)" : "var(--text-muted)",
                }}
              >
                {selected.length
                  ? `${selected.length} product${selected.length > 1 ? "s" : ""} selected`
                  : "Click to select products…"}
              </button>
            </div>

            <button
              type="button"
              className="btn-admin-secondary"
              onClick={generateAll}
              disabled={loading}
              style={{ flexShrink: 0 }}
            >
              All Products
            </button>
            <button
              type="button"
              className="btn-admin-primary"
              onClick={generateReport}
              disabled={loading}
              style={{ flexShrink: 0 }}
            >
              {loading ? "Generating…" : "Generate Report"}
            </button>
          </div>

          {/* Selected product pills */}
          {selected.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "1rem" }}>
              {selected.map((p) => (
                <span
                  key={p.slug}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    padding: "0.25rem 0.75rem",
                    background: "rgba(85, 0, 0,0.08)",
                    border: "1px solid rgba(85, 0, 0,0.2)",
                    borderRadius: "20px",
                    fontSize: "0.8rem",
                    color: "var(--text-dark)",
                  }}
                >
                  {p.name}
                  <button
                    onClick={() => removeSelected(p.slug)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "#550000",
                      fontSize: "0.9rem",
                      lineHeight: 1,
                      padding: 0,
                    }}
                    aria-label={`Remove ${p.name}`}
                  >
                    ×
                  </button>
                </span>
              ))}
              <button
                onClick={() => setSelected([])}
                style={{
                  background: "none",
                  border: "1px solid rgba(45,27,78,0.15)",
                  borderRadius: "20px",
                  padding: "0.25rem 0.75rem",
                  fontSize: "0.75rem",
                  cursor: "pointer",
                  color: "var(--text-muted)",
                }}
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Report table */}
      {generated && (
        <div className="admin-card">
          <div className="admin-card-header">
            📈 Results
            {totals && (
              <span style={{ fontSize: "0.85rem", fontWeight: 400, color: "var(--text-muted)" }}>
                {rows.length} product{rows.length !== 1 ? "s" : ""} · ৳
                {totals.revenue.toLocaleString()} total revenue
              </span>
            )}
          </div>

          {rows.length === 0 ? (
            <div className="admin-empty" style={{ padding: "3rem" }}>
              <div className="empty-icon">📭</div>
              <h3>No Sales Data</h3>
              <p>No orders matched the selected filters.</p>
            </div>
          ) : (
            <>
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Product</th>
                      <th>Orders</th>
                      <th>Qty Sold</th>
                      <th>Revenue (৳)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, i) => (
                      <tr key={row.name}>
                        <td>{i + 1}</td>
                        <td style={{ fontWeight: 600 }}>{row.name}</td>
                        <td>{row.orderCount}</td>
                        <td>{row.qty}</td>
                        <td>৳{row.revenue.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                  {totals && (
                    <tfoot>
                      <tr style={{ fontWeight: 700, background: "rgba(85, 0, 0,0.04)" }}>
                        <td colSpan={3}>Total</td>
                        <td>{totals.qty}</td>
                        <td>৳{totals.revenue.toLocaleString()}</td>
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
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15,8,32,0.65)",
            backdropFilter: "blur(4px)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
          }}
          onClick={(e) => e.target === e.currentTarget && closeModal()}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "20px",
              width: "100%",
              maxWidth: "560px",
              maxHeight: "80vh",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 24px 64px rgba(15,8,32,0.4)",
              overflow: "hidden",
            }}
          >
            {/* Modal header */}
            <div
              style={{
                padding: "1.25rem 1.5rem",
                borderBottom: "1px solid rgba(45,27,78,0.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexShrink: 0,
              }}
            >
              <div>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-dark)", margin: 0 }}>
                  Select Products
                </h3>
                {staged.length > 0 && (
                  <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", margin: "0.15rem 0 0" }}>
                    {staged.length} selected
                  </p>
                )}
              </div>
              <button
                onClick={closeModal}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "1.5rem",
                  cursor: "pointer",
                  color: "var(--text-muted)",
                  lineHeight: 1,
                }}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            {/* Search input */}
            <div style={{ padding: "1rem 1.5rem 0.75rem", flexShrink: 0 }}>
              <input
                autoFocus
                type="text"
                className="admin-input"
                placeholder="Search to filter…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>

            {/* Selected chips inside modal */}
            {staged.length > 0 && (
              <div
                style={{
                  padding: "0 1.5rem 0.75rem",
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "0.4rem",
                  flexShrink: 0,
                }}
              >
                {staged.map((p) => (
                  <span
                    key={p.slug}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.3rem",
                      padding: "0.2rem 0.6rem",
                      background: "rgba(85, 0, 0,0.08)",
                      border: "1px solid rgba(85, 0, 0,0.2)",
                      borderRadius: "20px",
                      fontSize: "0.75rem",
                      color: "var(--text-dark)",
                    }}
                  >
                    {p.name}
                    <button
                      onClick={() => toggleStaged(p)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "#550000",
                        fontSize: "0.9rem",
                        lineHeight: 1,
                        padding: 0,
                      }}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Results list */}
            <div style={{ flex: 1, overflowY: "auto", padding: "0 1rem 1rem" }}>
              {searching && (
                <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>
                  <div className="spinner" style={{ margin: "0 auto 0.75rem" }} />
                  Searching…
                </div>
              )}

              {!searching && hits.length === 0 && query.length >= 2 && (
                <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)", fontSize: "0.9rem" }}>
                  No products found for &ldquo;{query}&rdquo;
                </div>
              )}

              {hits.map((hit) => {
                const isSelected = staged.some((p) => p.slug === hit.slug);
                return (
                  <div
                    key={hit.slug}
                    onClick={() => toggleStaged(hit)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                      padding: "0.75rem 0.5rem",
                      borderRadius: "12px",
                      cursor: "pointer",
                      background: isSelected ? "rgba(85, 0, 0,0.06)" : "transparent",
                      border: isSelected
                        ? "1px solid rgba(85, 0, 0,0.2)"
                        : "1px solid transparent",
                      marginBottom: "0.35rem",
                      transition: "all 0.15s",
                    }}
                  >
                    {/* Product image */}
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: "10px",
                        overflow: "hidden",
                        flexShrink: 0,
                        background: "rgba(45,27,78,0.06)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {hit.image ? (
                        <Image
                          src={hit.image}
                          alt={hit.name}
                          width={48}
                          height={48}
                          style={{ objectFit: "cover", width: "100%", height: "100%" }}
                        />
                      ) : (
                        <span style={{ fontSize: "1.5rem" }}>📦</span>
                      )}
                    </div>

                    {/* Name + price */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontWeight: 600,
                          fontSize: "0.875rem",
                          color: "var(--text-dark)",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {hit.name}
                      </div>
                      <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "0.1rem" }}>
                        ৳{hit.price.toLocaleString()}
                      </div>
                    </div>

                    {/* Checkbox */}
                    <div
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: "6px",
                        border: isSelected
                          ? "2px solid #550000"
                          : "2px solid rgba(45,27,78,0.2)",
                        background: isSelected ? "#550000" : "transparent",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        transition: "all 0.15s",
                      }}
                    >
                      {isSelected && (
                        <svg width="12" height="9" viewBox="0 0 12 9" fill="none">
                          <path d="M1 4L4.5 7.5L11 1" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal footer */}
            <div
              style={{
                padding: "1rem 1.5rem",
                borderTop: "1px solid rgba(45,27,78,0.08)",
                display: "flex",
                gap: "0.75rem",
                justifyContent: "flex-end",
                flexShrink: 0,
              }}
            >
              <button className="btn-admin-secondary" onClick={closeModal}>
                Cancel
              </button>
              <button className="btn-admin-primary" onClick={applyModal}>
                Apply Selection{staged.length > 0 ? ` (${staged.length})` : ""}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
