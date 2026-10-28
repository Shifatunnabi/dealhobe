// Server-safe: builds the slim, serializable product shape every storefront product card renders.
// Shared by server pages and client components, so it must not be a "use client" module.

import { getProductCoverImage } from './product-images';

export type CardBadge = 'Bestseller' | 'New' | 'Trending';

export interface GridProduct {
  _id: string;
  slug: string;
  name: string;
  images?: string[];
  price: number;
  salePrice?: number;
  offerDiscountType?: 'percentage' | 'flat';
  offerDiscountAmount?: number;
  quantity?: number;
  hasVariants?: boolean;
  brandName?: string;
  rating?: number;
  reviewCount?: number;
  /** Set from the product's Top seller / New arrival / Trending toggles in Admin › Product Listing. */
  badge?: CardBadge;
  /** e.g. "4 shades" — from the product's first variant option. */
  variantLabel?: string;
  createdAt?: string;
}

type Source = {
  _id: string | { toString(): string };
  slug: string;
  name: string;
  price: number;
  salePrice?: number;
  quantity?: number;
  hasVariants?: boolean;
  brand?: string;
  isTopSeller?: boolean;
  isNewArrival?: boolean;
  isTrending?: boolean;
  offerDiscountType?: 'percentage' | 'flat';
  offerDiscountAmount?: number;
  variantOptions?: { name: string; values: string[] }[];
  variants?: { quantity?: number }[];
  createdAt?: string;
  images?: string[];
};

export type CardContext = {
  brandNames: Map<string, string>;
  ratings: Record<string, { avg: number; count: number }>;
};

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;

function variantLabel(options?: Source['variantOptions']): string | undefined {
  const first = options?.find((o) => o.values?.length > 1);
  if (!first) return undefined;
  const name = first.name.trim().toLowerCase();
  const word = /shade|colou?r/.test(name) ? 'shade' : /size|volume|ml|weight/.test(name) ? 'size' : name || 'option';
  return plural(first.values.length, word);
}

export function toCardProduct(p: Source, ctx: CardContext): GridProduct {
  const id = String(p._id);
  const cover = getProductCoverImage(p as Parameters<typeof getProductCoverImage>[0]);
  const rating = ctx.ratings[id];
  // Variant products keep stock per variant; the card only needs "any left" and "how few".
  const quantity = p.hasVariants && Array.isArray(p.variants)
    ? p.variants.reduce((sum, v) => sum + Math.max(0, Number(v.quantity) || 0), 0)
    : p.quantity;
  return {
    _id: id,
    slug: p.slug,
    name: p.name,
    images: cover ? [cover] : [],
    price: p.price,
    salePrice: p.salePrice,
    quantity,
    hasVariants: p.hasVariants,
    offerDiscountType: p.offerDiscountType,
    offerDiscountAmount: p.offerDiscountAmount,
    // `brand` holds a Brand id, or (older products) the brand name itself.
    brandName: p.brand ? ctx.brandNames.get(String(p.brand)) ?? (/^[a-f0-9]{24}$/i.test(p.brand) ? undefined : p.brand) : undefined,
    rating: rating?.avg,
    reviewCount: rating?.count,
    badge: p.isTopSeller ? 'Bestseller' : p.isNewArrival ? 'New' : p.isTrending ? 'Trending' : undefined,
    variantLabel: variantLabel(p.variantOptions),
    createdAt: p.createdAt,
  };
}

/** Lookup tables for toCardProduct from the cached brand list and ratings. */
export function cardContext(brands: { _id: string; name: string }[], ratings: CardContext['ratings']): CardContext {
  return { brandNames: new Map(brands.map((b) => [String(b._id), b.name])), ratings };
}
