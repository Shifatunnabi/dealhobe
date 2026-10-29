"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { FiChevronDown, FiFilter, FiSearch, FiX } from "react-icons/fi";
import ProductCard from "@/components/sections/ProductCard";
import {
  PER_PAGE, PRICE_BANDS, SORTS, catalogSearch, catalogSeo, filterAndSort, parseCatalogQuery, resolveQuery,
  type CatalogFacets, type CatalogQuery, type ShopItem, type SortValue,
} from "@/lib/catalog";

type Props = {
  items: ShopItem[];
  facets: CatalogFacets;
  initialQuery: CatalogQuery;
  /** "/products" or "/products/<offer-slug>" */
  basePath: string;
  /** Set on /products/[offer]: that offer is always applied. */
  fixedOffer?: string;
  offerDetails?: string;
};

const EMPTY: Omit<CatalogQuery, "sort" | "offer"> = { category: "", subcategory: "", brand: "", q: "", min: 0, max: 0, instock: false, rating: 0, page: 1 };

/* ── Small building blocks ──────────────────────────────────────────────── */

function Section({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="border-b border-[#F1E7EB] py-4 last:border-0">
      <button type="button" onClick={() => setOpen(!open)} aria-expanded={open}
        className="flex w-full items-center justify-between text-left text-sm font-bold text-text-dark">
        {title}
        <FiChevronDown className={`text-text-muted transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="mt-3">{children}</div>}
    </section>
  );
}

function Option({ active, label, count, onClick }: { active: boolean; label: string; count?: number; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={active}
      className={`flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left text-sm transition-colors ${active ? "bg-primary-pink/8 font-semibold text-primary-pink" : "text-text-dark hover:bg-black/[0.03]"}`}>
      <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${active ? "border-primary-pink bg-primary-pink" : "border-[#D9C9D0] bg-white"}`}>
        {active && <span className="h-1.5 w-1.5 rounded-sm bg-white" />}
      </span>
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {count !== undefined && <span className="text-xs text-text-muted">{count}</span>}
    </button>
  );
}

/* ── Filter panel (sidebar on desktop, bottom sheet on phones) ─────────── */

function FilterPanel({ query, facets, items, fixedOffer, set }: {
  query: CatalogQuery; facets: CatalogFacets; items: ShopItem[]; fixedOffer?: string;
  set: (patch: Partial<CatalogQuery>) => void;
}) {
  const [brandSearch, setBrandSearch] = useState("");
  const [minInput, setMinInput] = useState(query.min ? String(query.min) : "");
  const [maxInput, setMaxInput] = useState(query.max ? String(query.max) : "");
  const [lastRange, setLastRange] = useState(`${query.min}-${query.max}`);
  // Keep the typed price inputs in step when the range changes elsewhere (chips, Clear all).
  if (lastRange !== `${query.min}-${query.max}`) {
    setLastRange(`${query.min}-${query.max}`);
    setMinInput(query.min ? String(query.min) : "");
    setMaxInput(query.max ? String(query.max) : "");
  }

  const { category, brand } = resolveQuery(query, facets);
  // Option counts: how many products each choice would show, given every *other* active filter.
  const countBy = (cleared: Partial<CatalogQuery>, key: (p: ShopItem) => string) => {
    const map = new Map<string, number>();
    for (const p of filterAndSort(items, { ...query, ...cleared, page: 1 }, facets)) map.set(key(p), (map.get(key(p)) ?? 0) + 1);
    return map;
  };
  const catCounts = countBy({ category: "", subcategory: "" }, (p) => p.categoryId);
  const subCounts = countBy({ subcategory: "" }, (p) => p.subCategoryId);
  const brandCounts = countBy({ brand: "" }, (p) => p.brandId);
  const subs = category ? facets.subCategories.filter((s) => s.category === category._id && subCounts.get(s._id)) : [];
  const brands = facets.brands
    .filter((b) => brandCounts.get(b._id) || brand?._id === b._id)
    .filter((b) => !brandSearch || b.name.toLowerCase().includes(brandSearch.toLowerCase()));

  const applyPrice = () => set({ min: Math.max(0, Number(minInput) || 0), max: Math.max(0, Number(maxInput) || 0) });

  return (
    <div>
      <Section title="Category">
        <div className="flex flex-col gap-0.5">
          {facets.categories.filter((c) => catCounts.get(c._id) || category?._id === c._id).map((c) => (
            <div key={c._id}>
              <Option active={category?._id === c._id} label={c.name} count={catCounts.get(c._id) ?? 0}
                onClick={() => set({ category: category?._id === c._id ? "" : c.name, subcategory: "" })} />
              {category?._id === c._id && subs.length > 0 && (
                <div className="ml-5 mt-0.5 flex flex-col gap-0.5 border-l border-[#F1E7EB] pl-2">
                  {subs.map((s) => (
                    <Option key={s._id} active={query.subcategory === s._id} label={s.name} count={subCounts.get(s._id)}
                      onClick={() => set({ subcategory: query.subcategory === s._id ? "" : s._id })} />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </Section>

      <Section title="Brand">
        {facets.brands.length > 8 && (
          <label className="mb-2 flex items-center gap-2 rounded-lg border border-[#EBDDE3] bg-white px-2.5 py-1.5">
            <FiSearch className="text-text-muted" size={14} />
            <input value={brandSearch} onChange={(e) => setBrandSearch(e.target.value)} placeholder="Find a brand"
              className="w-full bg-transparent text-sm outline-none" aria-label="Find a brand" />
          </label>
        )}
        <div className="flex max-h-64 flex-col gap-0.5 overflow-y-auto">
          {brands.map((b) => (
            <Option key={b._id} active={brand?._id === b._id} label={b.name} count={brandCounts.get(b._id) ?? 0}
              onClick={() => set({ brand: brand?._id === b._id ? "" : b.name })} />
          ))}
        </div>
      </Section>

      <Section title="Price">
        <div className="flex flex-wrap gap-1.5">
          {PRICE_BANDS.map((b) => {
            const on = query.min === b.min && query.max === b.max;
            return (
              <button key={b.label} type="button" onClick={() => set(on ? { min: 0, max: 0 } : { min: b.min, max: b.max })} aria-pressed={on}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${on ? "border-primary-pink bg-primary-pink text-white" : "border-[#EBDDE3] bg-white text-text-dark hover:border-primary-pink/50"}`}>
                {b.label}
              </button>
            );
          })}
        </div>
        <form className="mt-3 flex items-center gap-2" onSubmit={(e) => { e.preventDefault(); applyPrice(); }}>
          <input inputMode="numeric" value={minInput} onChange={(e) => setMinInput(e.target.value.replace(/\D/g, ""))} placeholder="Min ৳" aria-label="Minimum price"
            className="w-full min-w-0 rounded-lg border border-[#EBDDE3] bg-white px-2.5 py-2 text-sm outline-none focus:border-primary-pink" />
          <span className="text-text-muted">–</span>
          <input inputMode="numeric" value={maxInput} onChange={(e) => setMaxInput(e.target.value.replace(/\D/g, ""))} placeholder="Max ৳" aria-label="Maximum price"
            className="w-full min-w-0 rounded-lg border border-[#EBDDE3] bg-white px-2.5 py-2 text-sm outline-none focus:border-primary-pink" />
          <button type="submit" className="shrink-0 rounded-lg bg-plum px-3 py-2 text-xs font-bold text-white">Go</button>
        </form>
      </Section>

      <Section title="Rating">
        <div className="flex flex-col gap-0.5">
          {[4, 3].map((r) => (
            <Option key={r} active={query.rating === r} label={`${"★".repeat(r)}${"☆".repeat(5 - r)} & up`} onClick={() => set({ rating: query.rating === r ? 0 : r })} />
          ))}
        </div>
      </Section>

      <Section title="Availability">
        <Option active={query.instock} label="In stock only" onClick={() => set({ instock: !query.instock })} />
      </Section>

      {!fixedOffer && facets.offers.length > 0 && (
        <Section title="Offers">
          <div className="flex flex-col gap-0.5">
            {facets.offers.map((o) => {
              const on = query.offer === o._id || query.offer === o.slug;
              return <Option key={o._id} active={on} label={o.title} onClick={() => set({ offer: on ? "" : o.slug })} />;
            })}
          </div>
        </Section>
      )}
    </div>
  );
}

/* ── Page ───────────────────────────────────────────────────────────────── */

export default function ProductsPageClient({ items, facets, initialQuery, basePath, fixedOffer = "", offerDetails }: Props) {
  const [query, setQuery] = useState<CatalogQuery>(initialQuery);
  const [sheet, setSheet] = useState(false);
  const gridTop = useRef<HTMLDivElement>(null);

  // Back/forward between filter states we pushed.
  useEffect(() => {
    const onPop = () => setQuery(parseCatalogQuery(new URLSearchParams(window.location.search), fixedOffer));
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [fixedOffer]);

  const set = useCallback((patch: Partial<CatalogQuery>, opts: { push?: boolean; scroll?: boolean } = {}) => {
    const next = { ...query, ...patch, page: patch.page ?? 1 };
    // History API (not router.push): updates the address bar for sharing/back without a server round trip.
    const url = `${basePath}${catalogSearch(next, fixedOffer)}`;
    if (opts.push) window.history.pushState(null, "", url); else window.history.replaceState(null, "", url);
    setQuery(next);
    // A filter/sort change while scrolled deep into the list jumps back to the top of the results.
    const scrolledPast = patch.page === undefined && (gridTop.current?.getBoundingClientRect().top ?? 0) < 0;
    if (opts.scroll || scrolledPast) gridTop.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [query, basePath, fixedOffer]);

  const results = useMemo(() => filterAndSort(items, query, facets), [items, query, facets]);
  const seo = useMemo(() => catalogSeo(query, facets, results.length, basePath), [query, facets, results.length, basePath]);
  useEffect(() => { document.title = seo.title; }, [seo.title]);

  // Infinite scroll: `page` is how many batches are shown (1..page), kept in the URL so reloads,
  // shared links and the back button restore the same position.
  const pages = Math.max(1, Math.ceil(results.length / PER_PAGE));
  const page = Math.min(query.page, pages);
  const shown = results.slice(0, page * PER_PAGE);
  const hasMore = page < pages;
  const sentinel = useRef<HTMLDivElement>(null);
  const loadMore = useCallback(() => { if (hasMore) set({ page: page + 1 }); }, [hasMore, page, set]);

  useEffect(() => {
    const el = sentinel.current;
    if (!el || !hasMore) return;
    // Start the next batch well before the shopper reaches the end, so scrolling never stalls.
    const io = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) loadMore(); }, { rootMargin: "900px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, [hasMore, loadMore]);

  useEffect(() => {
    document.body.style.overflow = sheet ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [sheet]);

  const { category, sub, brand, offer } = resolveQuery(query, facets);
  const chips: { label: string; clear: Partial<CatalogQuery> }[] = [
    ...(query.q ? [{ label: `“${query.q}”`, clear: { q: "" } }] : []),
    ...(category ? [{ label: category.name, clear: { category: "", subcategory: "" } }] : []),
    ...(sub ? [{ label: sub.name, clear: { subcategory: "" } }] : []),
    ...(brand ? [{ label: brand.name, clear: { brand: "" } }] : []),
    ...(offer && !fixedOffer ? [{ label: offer.title, clear: { offer: "" } }] : []),
    ...(query.min || query.max ? [{ label: query.max ? `৳${query.min} – ৳${query.max}` : `৳${query.min}+`, clear: { min: 0, max: 0 } }] : []),
    ...(query.rating ? [{ label: `${query.rating}★ & up`, clear: { rating: 0 } }] : []),
    ...(query.instock ? [{ label: "In stock", clear: { instock: false } }] : []),
  ];
  const clearAll = () => set({ ...EMPTY, offer: fixedOffer ? query.offer : "" });
  const nextHref = `${basePath}${catalogSearch({ ...query, page: page + 1 }, fixedOffer)}`;

  const panel = <FilterPanel query={query} facets={facets} items={items} fixedOffer={fixedOffer} set={(p) => set(p)} />;

  return (
    <div className="min-h-screen bg-soft-bg pb-24 pt-4 md:pt-6">
      <div className="shell">
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="mb-3 text-xs text-text-muted md:text-sm">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li><Link href="/" className="hover:text-primary-pink">Home</Link></li>
            <li aria-hidden>/</li>
            <li>{category || brand || offer || query.q ? <Link href="/products" className="hover:text-primary-pink">Products</Link> : <span className="font-semibold text-text-dark">Products</span>}</li>
            {(category || brand || offer) && !query.q && (<><li aria-hidden>/</li><li className="font-semibold text-text-dark">{seo.h1}</li></>)}
          </ol>
        </nav>

        {/* Header */}
        <header className="mb-4 flex flex-wrap items-end justify-between gap-3 md:mb-6">
          <div className="min-w-0">
            <h1 className="font-display text-[1.75rem] font-bold leading-tight text-text-dark md:text-4xl">{seo.h1}</h1>
            <p className="mt-1 text-sm text-text-muted">
              {results.length} {results.length === 1 ? "product" : "products"}
              {offerDetails ? <> · {offerDetails}</> : <> · 100% authentic · Cash on delivery</>}
            </p>
          </div>
          <label className="hidden items-center gap-2 text-sm md:flex">
            <span className="text-text-muted">Sort by</span>
            <span className="relative">
              <select value={query.sort} onChange={(e) => set({ sort: e.target.value as SortValue })}
                className="appearance-none rounded-full border border-[#EBDDE3] bg-white py-2 pl-4 pr-9 text-sm font-semibold text-text-dark outline-none focus:border-primary-pink">
                {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
              <FiChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-muted" />
            </span>
          </label>
        </header>

        {/* Mobile toolbar */}
        <div className="sticky top-36 z-30 -mx-4 mb-3 flex gap-2 border-y border-[#F1E7EB] bg-soft-bg/95 px-4 py-2 backdrop-blur md:hidden">
          <button type="button" onClick={() => setSheet(true)}
            className="flex flex-1 items-center justify-center gap-2 rounded-full border border-[#EBDDE3] bg-white py-2.5 text-sm font-bold text-text-dark">
            <FiFilter size={15} /> Filter{chips.length ? ` (${chips.length})` : ""}
          </button>
          <span className="relative flex-1">
            <select value={query.sort} onChange={(e) => set({ sort: e.target.value as SortValue })} aria-label="Sort products"
              className="w-full appearance-none rounded-full border border-[#EBDDE3] bg-white py-2.5 pl-4 pr-8 text-center text-sm font-bold text-text-dark outline-none">
              {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
            <FiChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-muted" />
          </span>
        </div>

        {/* Active filter chips */}
        {chips.length > 0 && (
          <div className="mb-4 flex flex-wrap items-center gap-2">
            {chips.map((c) => (
              <button key={c.label} type="button" onClick={() => set(c.clear)} aria-label={`Remove filter ${c.label}`}
                className="inline-flex items-center gap-1.5 rounded-full bg-plum px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90">
                {c.label} <FiX size={13} aria-hidden />
              </button>
            ))}
            <button type="button" onClick={clearAll} className="px-2 text-xs font-bold text-primary-pink hover:underline">Clear all</button>
          </div>
        )}

        <div className="flex items-start gap-6">
          {/* Desktop filters */}
          <aside className="sticky top-40 hidden max-h-[calc(100vh-11rem)] w-64 shrink-0 overflow-y-auto rounded-2xl border border-[#F1E7EB] bg-white px-4 py-1 shadow-tile md:block" aria-label="Filters">
            {panel}
          </aside>

          <div className="min-w-0 flex-1" ref={gridTop} style={{ scrollMarginTop: "11rem" }}>
            <h2 className="sr-only">Products</h2>
            {shown.length ? (
              <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 xl:grid-cols-4">
                {shown.map((p, i) => <li key={p._id}><ProductCard product={p} priority={i < 4} /></li>)}
              </ul>
            ) : (
              <div className="rounded-2xl border border-dashed border-[#E6D6DD] bg-white px-6 py-16 text-center">
                <p className="font-display text-2xl font-semibold text-text-dark">No products match these filters</p>
                <p className="mt-2 text-sm text-text-muted">Try removing a filter or searching for something broader.</p>
                <button type="button" onClick={clearAll} className="mt-5 rounded-full bg-primary-pink px-5 py-2.5 text-sm font-bold text-white shadow-button">Clear all filters</button>
              </div>
            )}

            <div ref={sentinel} aria-hidden />
            <div className="mt-8 flex flex-col items-center gap-3" aria-live="polite">
              <p className="text-sm text-text-muted">Showing {shown.length} of {results.length} products</p>
              {results.length > 0 && (
                <span className="h-1 w-48 overflow-hidden rounded-full bg-[#F1E7EB]">
                  <span className="block h-full rounded-full bg-primary-pink transition-[width] duration-500" style={{ width: `${(shown.length / results.length) * 100}%` }} />
                </span>
              )}
              {hasMore && (
                // A real link to the next batch: crawlers follow it, keyboard users can press it, and it is the
                // fallback if automatic loading is unavailable.
                <a href={nextHref} rel="next" onClick={(e) => { e.preventDefault(); loadMore(); }}
                  className="rounded-full border border-[#EBDDE3] bg-white px-6 py-2.5 text-sm font-bold text-text-dark transition-colors hover:border-primary-pink hover:text-primary-pink">
                  Load more products
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile filter sheet */}
      {sheet && (
        <div className="fixed inset-0 z-[90] md:hidden" role="dialog" aria-modal="true" aria-label="Filters">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSheet(false)} />
          <div className="absolute inset-x-0 bottom-0 flex max-h-[88vh] flex-col rounded-t-3xl bg-white shadow-hover">
            <div className="flex items-center justify-between border-b border-[#F1E7EB] px-5 py-4">
              <span className="font-display text-xl font-semibold">Filters</span>
              <button type="button" onClick={() => setSheet(false)} aria-label="Close filters" className="flex h-10 w-10 items-center justify-center rounded-full bg-soft-bg"><FiX /></button>
            </div>
            <div className="flex-1 overflow-y-auto px-5">{panel}</div>
            <div className="flex gap-3 border-t border-[#F1E7EB] px-5 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
              <button type="button" onClick={clearAll} className="flex-1 rounded-full border border-[#EBDDE3] py-3 text-sm font-bold text-text-dark">Clear</button>
              <button type="button" onClick={() => setSheet(false)} className="flex-[2] rounded-full bg-primary-pink py-3 text-sm font-bold text-white shadow-button">
                Show {results.length} products
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
