"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FiCheck, FiShoppingBag } from "react-icons/fi";
import { useOptionalCart } from "@/components/cart/CartProvider";
import ProductPhoto from "@/components/ui/ProductPhoto";
import type { GridProduct } from "@/lib/product-card";

export type { GridProduct } from "@/lib/product-card";

const LOW_STOCK = 5;
const money = (n: number) => `৳${Math.round(n).toLocaleString("en-IN")}`;

const BADGE_STYLE: Record<NonNullable<GridProduct["badge"]>, string> = {
  Bestseller: "bg-plum text-[#E9C98C]",
  New: "bg-white text-primary-pink ring-1 ring-primary-pink/25",
  Trending: "bg-[#FFF1D6] text-[#8A5A00]",
};

function Stars({ value }: { value: number }) {
  const pct = Math.max(0, Math.min(100, (value / 5) * 100));
  return (
    <span className="relative inline-block text-[13px] leading-none tracking-[1px]" aria-hidden>
      <span className="text-[#E8D9C7]">★★★★★</span>
      <span className="absolute inset-0 overflow-hidden whitespace-nowrap text-[#E8A317]" style={{ width: `${pct}%` }}>★★★★★</span>
    </span>
  );
}

/**
 * Storefront product card ("Boutique"): white photo area so white-background packshots blend in, the photo
 * always fits whole inside a fixed square, and a cart bubble top-right. Used by every product grid and rail.
 */
export default function ProductCard({ product, priority = false }: { product: GridProduct; priority?: boolean }) {
  const cart = useOptionalCart();
  const router = useRouter();
  const [added, setAdded] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const qty = Number(product.quantity ?? 0);
  const outOfStock = qty <= 0;
  const price = product.salePrice && product.salePrice < product.price ? product.salePrice : product.price;
  const saving = product.price - price;
  const pct = saving > 0 ? Math.round((saving / product.price) * 100) : 0;
  const dv = product.hasVariants ? product.defaultVariant : undefined;
  const href = `/product/${product.slug}${dv ? `?variant=${encodeURIComponent(dv.key)}` : ""}`;
  const cover = product.images?.[0] || "/placeholder.png";

  const handleAdd = () => {
    if (outOfStock) return;
    if (product.hasVariants) {
      // Variant products add their default variant (first in stock); without variant data, open the product.
      if (!dv || dv.quantity <= 0) return router.push(href);
      cart?.addItem({
        productId: product._id, slug: product.slug, name: product.name, image: dv.image || cover,
        unitPrice: dv.price, qty: 1, maxQty: dv.quantity, variantKey: dv.key, variantLabel: dv.label,
      }, 1);
    } else {
      cart?.addItem({ productId: product._id, slug: product.slug, name: product.name, image: cover, unitPrice: price, qty: 1, maxQty: qty }, 1);
    }
    setAdded(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setAdded(false), 1800);
  };

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-[#EFE3E8] bg-white shadow-tile transition-[box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_34px_rgba(59,13,46,0.12)]">
      <Link href={href} className="flex flex-1 flex-col" aria-label={product.name}>
        <div className="relative aspect-square border-b border-[#F4ECEF] bg-white">
          <ProductPhoto
            src={cover}
            alt={product.name}
            requestWidth={480}
            loading={priority ? "eager" : "lazy"}
            fetchPriority={priority ? "high" : undefined}
            className="p-[9%]"
            imgClassName="transition-transform duration-500 group-hover:scale-[1.04]"
          />
          <span className="absolute left-2.5 top-2.5 flex flex-col items-start gap-1 md:left-3 md:top-3">
            {pct > 0 && <span className="rounded-lg bg-primary-pink px-2 py-0.5 text-[11px] font-extrabold text-white md:text-xs">-{pct}%</span>}
            {product.badge && <span className={`rounded-lg px-2 py-0.5 text-[10px] font-bold md:text-[11px] ${BADGE_STYLE[product.badge]}`}>{product.badge}</span>}
          </span>
          {outOfStock && (
            <span className="absolute inset-x-0 bottom-0 bg-white/85 py-1.5 text-center text-xs font-bold uppercase tracking-wide text-text-muted backdrop-blur-sm">
              Out of stock
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col px-3 pb-3 pt-2.5 md:px-3.5 md:pb-3.5">
          {product.brandName && (
            <span className="truncate text-[10px] font-bold uppercase tracking-[0.14em] text-gold-dark md:text-[11px]">{product.brandName}</span>
          )}
          <h3 className="mt-0.5 line-clamp-2 min-h-[2.6em] text-[13px] font-semibold leading-[1.3] text-text-dark transition-colors group-hover:text-primary-pink md:text-sm">
            {product.name}
          </h3>
          {product.rating ? (
            <span className="mt-1.5 flex items-center gap-1 text-xs font-semibold text-text-dark">
              <Stars value={product.rating} />
              {product.rating.toFixed(1)}
              <span className="font-medium text-text-muted">({product.reviewCount})</span>
            </span>
          ) : product.variantLabel ? (
            <span className="mt-1.5 text-xs text-text-muted">{product.variantLabel}</span>
          ) : null}
          <span className="mt-1.5 flex flex-wrap items-baseline gap-x-1.5">
            {product.hasVariants && <span className="text-[11px] font-medium text-text-muted">From</span>}
            <span className="text-base font-extrabold text-primary-pink md:text-lg">{money(price)}</span>
            {saving > 0 && <s className="text-xs text-[#7B6A76]">{money(product.price)}</s>}
          </span>
          {(saving > 0 || (!outOfStock && qty <= LOW_STOCK)) && (
            <span className="mt-auto flex flex-wrap items-center justify-between gap-1 pt-2 text-[11px] font-bold md:text-xs">
              {saving > 0 ? <span className="text-[#1F8A4C]">Save {money(saving)}</span> : <span />}
              {!outOfStock && qty <= LOW_STOCK && (
                <span className="rounded-md bg-[#FBF0D9] px-1.5 py-0.5 text-[#9A6A10]">Only {qty} left</span>
              )}
            </span>
          )}
        </div>
      </Link>

      <button
        type="button"
        onClick={handleAdd}
        disabled={outOfStock}
        aria-label={outOfStock ? "Out of stock" : added ? "Added to bag" : `Add ${product.name}${dv?.label ? ` (${dv.label})` : ""} to bag`}
        title={dv?.label ? `Add ${dv.label}` : undefined}
        className={`absolute right-2.5 top-2.5 flex h-9 w-9 items-center justify-center rounded-full border transition-all duration-200 active:scale-90 md:right-3 md:top-3 md:h-10 md:w-10 ${
          added
            ? "border-[#1F8A4C] bg-[#1F8A4C] text-white shadow-[0_4px_12px_rgba(31,138,76,0.3)]"
            : outOfStock
            ? "cursor-not-allowed border-black/5 bg-white/80 text-text-muted/50"
            : "border-[#EBD6DC] bg-white text-primary-pink shadow-[0_2px_8px_rgba(59,13,46,0.08)] hover:border-primary-pink hover:bg-primary-pink hover:text-white"
        }`}
      >
        {added ? <FiCheck size={18} strokeWidth={3} /> : <FiShoppingBag size={17} />}
      </button>
    </article>
  );
}
