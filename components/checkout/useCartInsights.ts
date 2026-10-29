"use client";

import { useEffect, useMemo, useState } from "react";
import { cartLineId, type CartItem } from "@/components/cart/CartProvider";

/* ── Free-delivery threshold (GET /api/settings, fetched once per page load) ── */

let thresholdPromise: Promise<number> | null = null;

function fetchFreeDeliveryThreshold() {
  if (!thresholdPromise) {
    thresholdPromise = fetch("/api/settings")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => Number(data?.freeDeliveryThreshold) || 0)
      .catch(() => {
        thresholdPromise = null;
        return 0;
      });
  }
  return thresholdPromise;
}

/** Order subtotal that unlocks free delivery; 0 means the offer is off. */
export function useFreeDeliveryThreshold(enabled = true) {
  const [threshold, setThreshold] = useState(0);
  useEffect(() => {
    if (!enabled) return;
    let alive = true;
    fetchFreeDeliveryThreshold().then((value) => {
      if (alive) setThreshold(value);
    });
    return () => {
      alive = false;
    };
  }, [enabled]);
  return threshold;
}

/* ── Product lookups for savings + "You may also like" ─────────────────────
 * The cart only stores the price paid, so the regular (strikethrough) price and
 * a few related products come from the existing search endpoint. Results are
 * cached in sessionStorage so a bag only costs a handful of small requests per
 * session, and only while the bag is actually on screen.
 */

export interface ProductHit {
  _id: string;
  name: string;
  slug: string;
  image: string | null;
  price: number;
  salePrice: number | null;
  hasVariants: boolean;
}

const CACHE_KEY = "dealhobe_cart_lookups_v1";
const CACHE_TTL = 15 * 60 * 1000;
const inflight = new Map<string, Promise<ProductHit[]>>();

type Cache = Record<string, { at: number; hits: ProductHit[] }>;

const readCache = (): Cache => {
  try {
    return JSON.parse(window.sessionStorage.getItem(CACHE_KEY) || "{}") as Cache;
  } catch {
    return {};
  }
};

const writeCache = (key: string, hits: ProductHit[]) => {
  try {
    const cache = readCache();
    cache[key] = { at: Date.now(), hits };
    // Keep the cache small.
    const keys = Object.keys(cache).sort((a, b) => cache[b].at - cache[a].at).slice(0, 40);
    window.sessionStorage.setItem(CACHE_KEY, JSON.stringify(Object.fromEntries(keys.map((k) => [k, cache[k]]))));
  } catch {
    /* storage full or blocked: lookups simply aren't cached */
  }
};

function searchProducts(q: string, limit: number): Promise<ProductHit[]> {
  const key = `${q.toLowerCase()}|${limit}`;
  const cached = readCache()[key];
  if (cached && Date.now() - cached.at < CACHE_TTL) return Promise.resolve(cached.hits);
  const pending = inflight.get(key);
  if (pending) return pending;

  const request = fetch(`/api/products/search?q=${encodeURIComponent(q)}&limit=${limit}`)
    .then((res) => (res.ok ? res.json() : { results: [] }))
    .then((data) => {
      const hits = (Array.isArray(data?.results) ? data.results : []) as ProductHit[];
      writeCache(key, hits);
      return hits;
    })
    .catch(() => [] as ProductHit[])
    .finally(() => inflight.delete(key));
  inflight.set(key, request);
  return request;
}

export const effectivePrice = (p: Pick<ProductHit, "price" | "salePrice">) =>
  p.salePrice && p.salePrice < p.price ? p.salePrice : p.price;

/** First meaningful word of a product name, usually the brand ("GDM", "Fennel"). */
const relatedQuery = (name: string) =>
  name
    .split(/\s+/)
    .map((w) => w.replace(/[^\p{L}\p{N}]/gu, ""))
    .find((w) => w.length >= 3) || "";

export function useCartInsights(items: CartItem[], { enabled = true, freeDeliveryGap = 0, upsell = true } = {}) {
  const [hits, setHits] = useState<Record<string, ProductHit | null>>({});
  const [related, setRelated] = useState<ProductHit[]>([]);

  const productKey = items.map((i) => `${i.productId}\u0001${i.name}`).join("\u0002");
  const newestName = items.length ? items[items.length - 1].name : "";

  // Regular price of each product in the bag.
  useEffect(() => {
    if (!enabled || !productKey) return;
    let alive = true;
    const seen = new Set<string>();
    const unique = items.filter((i) => !seen.has(i.productId) && seen.add(i.productId));
    Promise.all(
      unique.map((i) =>
        searchProducts(i.name, 4).then((res) => [i.productId, res.find((h) => h._id === i.productId) || null] as const),
      ),
    ).then((pairs) => {
      if (alive) setHits(Object.fromEntries(pairs));
    });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- keyed on productKey
  }, [enabled, productKey]);

  // Related products from the same brand as the latest addition.
  useEffect(() => {
    if (!enabled || !upsell) return;
    const q = relatedQuery(newestName);
    if (!q) return;
    let alive = true;
    searchProducts(q, 16).then((res) => {
      if (alive) setRelated(res);
    });
    return () => {
      alive = false;
    };
  }, [enabled, upsell, newestName]);

  /** Regular price per cart line, only where it is known to be higher than what the shopper pays. */
  const compareAt = useMemo(() => {
    const map: Record<string, number> = {};
    for (const item of items) {
      const hit = hits[item.productId];
      // Variant prices differ per shade/size; the search result only has the product-level price.
      if (!hit || item.variantKey || hit.hasVariants) continue;
      if (hit.price > item.unitPrice) map[cartLineId(item)] = hit.price;
    }
    return map;
  }, [items, hits]);

  const savings = useMemo(
    () => items.reduce((sum, item) => sum + Math.max(0, (compareAt[cartLineId(item)] ?? item.unitPrice) - item.unitPrice) * item.qty, 0),
    [items, compareAt],
  );

  const suggestions = useMemo(() => {
    const inBag = new Set(items.map((i) => i.productId));
    const pool = related.filter((p) => !inBag.has(p._id) && p.image && effectivePrice(p) > 0);
    const gap = freeDeliveryGap;
    return pool
      .map((p) => ({ p, price: effectivePrice(p) }))
      .sort((a, b) => {
        if (gap > 0) {
          // Items that alone close the free-delivery gap first, cheapest of those first.
          const aCloses = a.price >= gap ? 0 : 1;
          const bCloses = b.price >= gap ? 0 : 1;
          if (aCloses !== bCloses) return aCloses - bCloses;
          return aCloses === 0 ? a.price - b.price : b.price - a.price;
        }
        return (b.p.price - b.price) / b.p.price - (a.p.price - a.price) / a.p.price;
      })
      .slice(0, 8)
      .map(({ p }) => p);
  }, [items, related, freeDeliveryGap]);

  return { compareAt, savings, suggestions };
}
