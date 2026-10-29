// Server-safe catalog helpers for /products and /products/[offer]: the slim per-product shape the
// client filters and sorts on, the filter state <-> URL mapping, and filter-aware SEO copy.

import type { PlainBrand, PlainCategory, PlainOffer, PlainSubCategory } from './data';
import { toCardProduct, type CardContext, type GridProduct } from './product-card';

export const SORTS = [
  { value: 'featured', label: 'Featured' },
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'discount', label: 'Biggest discount' },
  { value: 'best-selling', label: 'Best selling' },
  { value: 'top-rated', label: 'Top rated' },
] as const;
export type SortValue = (typeof SORTS)[number]['value'];

export const PRICE_BANDS = [
  { label: 'Under ৳500', min: 0, max: 500 },
  { label: '৳500 – ৳1,000', min: 500, max: 1000 },
  { label: '৳1,000 – ৳2,000', min: 1000, max: 2000 },
  { label: '৳2,000+', min: 2000, max: 0 },
];

export type ShopItem = GridProduct & {
  categoryId: string;
  subCategoryId: string;
  brandId: string;
  offerIds: string[];
  effectivePrice: number;
  discountPct: number;
  sold: number;
  featuredRank: number;
  /** Lower-cased name + brand + category text for search. */
  haystack: string;
};

export type CatalogFacets = {
  categories: { _id: string; name: string }[];
  subCategories: { _id: string; name: string; category: string }[];
  brands: { _id: string; name: string }[];
  offers: { _id: string; slug: string; title: string }[];
};

type RawProduct = Parameters<typeof toCardProduct>[0] & {
  category?: string; subCategory?: string; offerId?: string;
  isFeatured?: boolean; isTopSeller?: boolean; isTrending?: boolean; isNewArrival?: boolean;
};

export function buildShopItems(
  products: RawProduct[],
  opts: { ctx: CardContext; sold: Record<string, number>; categories: PlainCategory[]; subCategories: PlainSubCategory[]; offers: PlainOffer[] },
): ShopItem[] {
  const catName = new Map(opts.categories.map((c) => [c._id, c.name]));
  const subName = new Map(opts.subCategories.map((s) => [s._id, s.name]));
  return products.map((p) => {
    const card = toCardProduct(p, opts.ctx);
    const id = card._id;
    const effectivePrice = card.salePrice && card.salePrice < card.price ? card.salePrice : card.price;
    const offerIds = opts.offers
      .filter((o) => o.productSelection === 'all' || o.selectedProducts.map(String).includes(id))
      .map((o) => o._id);
    return {
      ...card,
      categoryId: String(p.category ?? ''),
      subCategoryId: String(p.subCategory ?? ''),
      brandId: String(p.brand ?? ''),
      offerIds,
      effectivePrice,
      discountPct: card.price > effectivePrice ? Math.round(((card.price - effectivePrice) / card.price) * 100) : 0,
      sold: opts.sold[id] ?? 0,
      featuredRank: (p.isFeatured ? 8 : 0) + (p.isTopSeller ? 4 : 0) + (p.isTrending ? 2 : 0) + (p.isNewArrival ? 1 : 0),
      haystack: [p.name, card.brandName, catName.get(String(p.category)), subName.get(String(p.subCategory))].filter(Boolean).join(' ').toLowerCase(),
    };
  });
}

export function buildFacets(categories: PlainCategory[], subCategories: PlainSubCategory[], brands: PlainBrand[], offers: PlainOffer[]): CatalogFacets {
  return {
    categories: categories.map(({ _id, name }) => ({ _id, name })),
    subCategories: subCategories.map(({ _id, name, category }) => ({ _id, name, category })),
    brands: brands.map(({ _id, name }) => ({ _id, name })),
    offers: offers.map(({ _id, slug, title }) => ({ _id, slug, title })),
  };
}

/* ── Filter state <-> URL ─────────────────────────────────────────────────── */

export type CatalogQuery = {
  category: string;     // category name or id, as in the URL
  subcategory: string;
  brand: string;
  offer: string;        // offer id or slug
  q: string;
  sort: SortValue;
  min: number;
  max: number;          // 0 = no upper bound
  instock: boolean;
  rating: number;       // minimum stars, 0 = any
  page: number;
};

type Params = { get(key: string): string | null } | Record<string, string | string[] | undefined>;
const read = (sp: Params, key: string): string => {
  if (typeof (sp as { get?: unknown }).get === 'function') return (sp as { get(k: string): string | null }).get(key) ?? '';
  const v = (sp as Record<string, string | string[] | undefined>)[key];
  return (Array.isArray(v) ? v[0] : v) ?? '';
};

export function parseCatalogQuery(sp: Params, fixedOffer = ''): CatalogQuery {
  const sort = read(sp, 'sort') as SortValue;
  return {
    category: read(sp, 'category'),
    subcategory: read(sp, 'subcategory'),
    brand: read(sp, 'brand'),
    offer: fixedOffer || read(sp, 'offer'),
    q: read(sp, 'q').trim().slice(0, 100),
    sort: SORTS.some((s) => s.value === sort) ? sort : 'featured',
    min: Math.max(0, Number(read(sp, 'min')) || 0),
    max: Math.max(0, Number(read(sp, 'max')) || 0),
    instock: read(sp, 'instock') === '1',
    rating: Math.min(5, Math.max(0, Number(read(sp, 'rating')) || 0)),
    page: Math.max(1, Math.floor(Number(read(sp, 'page')) || 1)),
  };
}

/** Query string for a catalog state (defaults are left out so URLs stay short and canonical). */
export function catalogSearch(q: CatalogQuery, fixedOffer = ''): string {
  const p = new URLSearchParams();
  if (q.category) p.set('category', q.category);
  if (q.subcategory) p.set('subcategory', q.subcategory);
  if (q.brand) p.set('brand', q.brand);
  if (q.offer && q.offer !== fixedOffer) p.set('offer', q.offer);
  if (q.q) p.set('q', q.q);
  if (q.min) p.set('min', String(q.min));
  if (q.max) p.set('max', String(q.max));
  if (q.instock) p.set('instock', '1');
  if (q.rating) p.set('rating', String(q.rating));
  if (q.sort !== 'featured') p.set('sort', q.sort);
  if (q.page > 1) p.set('page', String(q.page));
  const s = p.toString();
  return s ? `?${s}` : '';
}

/* ── Resolving + SEO copy ─────────────────────────────────────────────────── */

const byIdOrName = <T extends { _id: string; name: string }>(list: T[], v: string) =>
  v ? list.find((x) => x._id === v || x.name.toLowerCase() === v.toLowerCase()) : undefined;

export function resolveQuery(q: CatalogQuery, f: CatalogFacets) {
  const category = byIdOrName(f.categories, q.category);
  const sub = q.subcategory ? f.subCategories.find((s) => s._id === q.subcategory || s.name.toLowerCase() === q.subcategory.toLowerCase()) : undefined;
  const brand = byIdOrName(f.brands, q.brand);
  const offer = q.offer ? f.offers.find((o) => o._id === q.offer || o.slug === q.offer) : undefined;
  return { category, sub, brand, offer };
}

/** H1, <title>, meta description and robots/canonical decisions for the current filters. */
export function catalogSeo(q: CatalogQuery, f: CatalogFacets, count: number, basePath = '/products') {
  const { category, sub, brand, offer } = resolveQuery(q, f);
  const subject = sub?.name ?? category?.name;
  let h1 = 'All products';
  if (offer) h1 = offer.title;
  else if (brand && subject) h1 = `${brand.name} ${subject}`;
  else if (brand) h1 = `${brand.name} products`;
  else if (subject) h1 = subject;
  if (q.q) h1 = `Results for “${q.q}”`;

  const where = 'in Bangladesh';
  const title = q.q
    ? `${q.q} — search results | DealHobe`
    : offer
    ? `${offer.title} — offer prices ${where} | DealHobe`
    : h1 === 'All products'
    ? `Shop authentic cosmetics & beauty products online ${where} | DealHobe`
    : `Buy ${h1} online ${where} — best price | DealHobe`;

  const description = q.q
    ? `${count} products matching “${q.q}” at DealHobe. Authentic cosmetics with cash on delivery across Bangladesh.`
    : `Shop ${count} authentic ${h1 === 'All products' ? 'cosmetics and beauty products' : h1} online ${where} at DealHobe. Best prices, genuine products, cash on delivery and fast nationwide shipping.`;

  // Index clean category / brand / offer listings; keep search, price, sort and stacked-filter
  // variations out of the index (they canonicalise to the clean listing).
  const canonical = new URLSearchParams();
  if (category && !brand) canonical.set('category', category.name);
  if (sub && !brand) canonical.set('subcategory', sub._id);
  if (brand && !category && !sub) canonical.set('brand', brand.name);
  if (offer && basePath === '/products') canonical.set('offer', offer.slug);
  const facetsUsed = [category || sub, brand].filter(Boolean).length;
  const noindex = !!q.q || facetsUsed > 1 || q.min > 0 || q.max > 0 || q.rating > 0 || q.instock;
  const c = canonical.toString();

  // Infinite scroll shows batches 1..page, so deeper ?page= URLs repeat earlier products: canonicalise without it.
  return { h1, title, description, canonical: `${basePath}${c ? `?${c}` : ''}`, noindex };
}

/* ── Filtering + sorting (shared by server and client so both agree) ──────── */

export function filterAndSort(items: ShopItem[], q: CatalogQuery, f: CatalogFacets): ShopItem[] {
  const { category, sub, brand, offer } = resolveQuery(q, f);
  const tokens = q.q.toLowerCase().split(/\s+/).filter(Boolean);
  const list = items.filter((p) =>
    (!category || p.categoryId === category._id) &&
    (!q.subcategory || p.subCategoryId === (sub?._id ?? q.subcategory)) &&
    (!q.brand || p.brandId === (brand?._id ?? q.brand) || p.brandName?.toLowerCase() === q.brand.toLowerCase()) &&
    (!q.offer || (offer ? p.offerIds.includes(offer._id) : false)) &&
    (!q.min || p.effectivePrice >= q.min) &&
    (!q.max || p.effectivePrice <= q.max) &&
    (!q.instock || Number(p.quantity) > 0) &&
    (!q.rating || (p.rating ?? 0) >= q.rating) &&
    tokens.every((t) => p.haystack.includes(t)),
  );
  const inStockFirst = (a: ShopItem, b: ShopItem) => Number(Number(b.quantity) > 0) - Number(Number(a.quantity) > 0);
  const cmp: Record<SortValue, (a: ShopItem, b: ShopItem) => number> = {
    featured: (a, b) => inStockFirst(a, b) || b.featuredRank - a.featuredRank || b.sold - a.sold,
    newest: (a, b) => String(b.createdAt ?? '').localeCompare(String(a.createdAt ?? '')),
    'price-asc': (a, b) => a.effectivePrice - b.effectivePrice,
    'price-desc': (a, b) => b.effectivePrice - a.effectivePrice,
    discount: (a, b) => b.discountPct - a.discountPct || b.sold - a.sold,
    'best-selling': (a, b) => b.sold - a.sold || (b.reviewCount ?? 0) - (a.reviewCount ?? 0),
    'top-rated': (a, b) => (b.rating ?? 0) - (a.rating ?? 0) || (b.reviewCount ?? 0) - (a.reviewCount ?? 0),
  };
  return [...list].sort(cmp[q.sort]);
}

export const PER_PAGE = 24;
