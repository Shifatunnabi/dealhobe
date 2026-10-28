"use client";

import { useEffect, useMemo, useSyncExternalStore } from "react";
import ProductRail from "@/components/home/ProductRail";
import type { GridProduct } from "@/lib/product-card";

const KEY = "dealhobe_recently_viewed_v1";
const MAX = 12;

// Storage can be blocked (private mode, quotas, disabled cookies), so every access is guarded.
const readRaw = () => {
  try { return window.localStorage.getItem(KEY) || ""; } catch { return ""; }
};
const parse = (raw: string): GridProduct[] => {
  try {
    const list = JSON.parse(raw || "[]");
    return Array.isArray(list) ? list.filter((p) => p && typeof p.slug === "string" && typeof p.name === "string") : [];
  } catch {
    return [];
  }
};
const subscribe = (cb: () => void) => {
  window.addEventListener("storage", cb);
  return () => window.removeEventListener("storage", cb);
};

/**
 * Remembers this product in the browser and shows the shopper's other recently viewed products.
 * Renders nothing on the server and until there is something to show.
 */
export default function RecentlyViewed({ current }: { current: GridProduct }) {
  const raw = useSyncExternalStore(subscribe, readRaw, () => "");
  const items = useMemo(() => parse(raw).filter((p) => p._id !== current._id).slice(0, MAX), [raw, current._id]);

  useEffect(() => {
    try {
      const next = [current, ...parse(readRaw()).filter((p) => p._id !== current._id)].slice(0, MAX);
      window.localStorage.setItem(KEY, JSON.stringify(next));
    } catch { /* storage full or blocked */ }
  }, [current]);

  // One lone card in a scrolling rail looks unfinished; wait until there are two.
  if (items.length < 2) return null;
  return (
    <section className="shell py-10 md:py-14" aria-labelledby="recently-viewed">
      <h2 id="recently-viewed" className="mb-5 font-display text-[1.75rem] font-semibold leading-tight text-text-dark md:text-[2.25rem]">
        Recently viewed
      </h2>
      <ProductRail products={items} />
    </section>
  );
}
