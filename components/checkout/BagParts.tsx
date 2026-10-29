"use client";

import Link from "next/link";
import { FiCheck, FiMinus, FiPlus, FiShield, FiTruck, FiRefreshCw, FiX, FiShoppingBag, FiArrowRight } from "react-icons/fi";
import ProductPhoto from "@/components/ui/ProductPhoto";
import { cn } from "@/lib/utils";
import type { CartItem } from "@/components/cart/CartProvider";
import { money } from "./money";
import { effectivePrice, type ProductHit } from "./useCartInsights";
import ScrollRow from "@/components/ui/ScrollRow";

const LOW_STOCK = 5;

/* ── Quantity stepper ───────────────────────────────────────────────────── */

export function QtyStepper({
  value,
  max,
  onChange,
  label,
  size = "md",
}: {
  value: number;
  max?: number;
  onChange: (v: number) => void;
  label: string;
  size?: "sm" | "md";
}) {
  const atMax = typeof max === "number" && value >= max;
  const btn = cn(
    "flex items-center justify-center text-text-dark transition-colors hover:bg-plum-soft/70 active:bg-plum-soft disabled:cursor-not-allowed disabled:text-text-muted/40 disabled:hover:bg-transparent",
    size === "sm" ? "h-11 w-10 md:h-9 md:w-9" : "h-11 w-11",
  );
  return (
    <div
      role="group"
      aria-label={`Quantity for ${label}`}
      className="inline-flex items-center overflow-hidden rounded-full border border-[#E7D9DF] bg-white"
    >
      <button type="button" className={btn} onClick={() => onChange(value - 1)} disabled={value <= 1} aria-label={`Decrease quantity of ${label}`}>
        <FiMinus size={14} />
      </button>
      <span aria-live="polite" className="min-w-8 text-center text-sm font-bold tabular-nums text-text-dark">
        {value}
      </span>
      <button type="button" className={btn} onClick={() => onChange(value + 1)} disabled={atMax} aria-label={`Increase quantity of ${label}`}>
        <FiPlus size={14} />
      </button>
    </div>
  );
}

/* ── One bag line ───────────────────────────────────────────────────────── */

export function BagLine({
  item,
  compareAt,
  onQty,
  onRemove,
  onNavigate,
  dense = false,
}: {
  item: CartItem;
  compareAt?: number;
  onQty: (qty: number) => void;
  onRemove: () => void;
  onNavigate?: () => void;
  dense?: boolean;
}) {
  const href = `/product/${item.slug}`;
  const lineTotal = item.unitPrice * item.qty;
  const atMax = typeof item.maxQty === "number" && item.qty >= item.maxQty;
  const lowStock = typeof item.maxQty === "number" && item.maxQty > 0 && item.maxQty <= LOW_STOCK;

  return (
    <div className="flex gap-3 md:gap-4">
      <Link
        href={href}
        onClick={onNavigate}
        className={cn(
          "relative shrink-0 overflow-hidden rounded-xl border border-[#F1E6EA] bg-white",
          dense ? "h-[84px] w-[84px]" : "h-[92px] w-[92px] md:h-[112px] md:w-[112px]",
        )}
        aria-label={item.name}
      >
        <ProductPhoto src={item.image || "/placeholder.png"} alt={item.name} requestWidth={256} className="p-[8%]" />
      </Link>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start gap-2">
          <div className="min-w-0 flex-1">
            <Link
              href={href}
              onClick={onNavigate}
              className="line-clamp-2 text-sm font-semibold leading-snug text-text-dark transition-colors hover:text-primary-pink md:text-[15px]"
            >
              {item.name}
            </Link>
            {item.variantLabel && (
              <span className="mt-1 inline-block rounded-md bg-plum-soft/70 px-1.5 py-0.5 text-[11px] font-semibold text-plum">
                {item.variantLabel}
              </span>
            )}
            <p className="mt-1 flex flex-wrap items-baseline gap-x-1.5 text-xs text-text-muted">
              <span className="font-semibold text-text-dark">{money(item.unitPrice)}</span>
              {compareAt ? <s className="text-[#7B6A76]">{money(compareAt)}</s> : null}
              <span>each</span>
            </p>
          </div>
          <button
            type="button"
            onClick={onRemove}
            aria-label={`Remove ${item.name} from bag`}
            className="-mr-2 -mt-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-text-muted/70 transition-colors hover:bg-red-50 hover:text-primary-pink"
          >
            <FiX size={17} />
          </button>
        </div>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-x-3 gap-y-1 pt-2">
          <QtyStepper value={item.qty} max={item.maxQty} onChange={onQty} label={item.name} size="sm" />
          <div className="text-right">
            <p className="text-[15px] font-extrabold tabular-nums text-text-dark">{money(lineTotal)}</p>
            {compareAt ? (
              <p className="text-[11px] font-bold text-[#1F8A4C]">Save {money((compareAt - item.unitPrice) * item.qty)}</p>
            ) : null}
          </div>
        </div>
        {(atMax || lowStock) && (
          <p className="mt-1.5 text-[11px] font-semibold text-[#9A6A10]">
            {atMax ? `That's all we have — only ${item.maxQty} in stock` : `Only ${item.maxQty} left in stock`}
          </p>
        )}
      </div>
    </div>
  );
}

/* ── Free-delivery progress ─────────────────────────────────────────────── */

export function FreeDeliveryProgress({ subtotal, threshold, className }: { subtotal: number; threshold: number; className?: string }) {
  if (!threshold || threshold <= 0) return null;
  const remaining = Math.max(0, threshold - subtotal);
  const pct = Math.min(100, Math.round((subtotal / threshold) * 100));
  const unlocked = remaining === 0;

  return (
    <div className={cn("rounded-2xl border px-4 py-3", unlocked ? "border-[#CDEBD8] bg-[#F1FAF4]" : "border-[#F0E2C6] bg-[#FFF9EE]", className)}>
      <p className="flex items-center gap-2 text-[13px] font-medium text-text-dark" aria-live="polite">
        {unlocked ? (
          <>
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#1F8A4C] text-white">
              <FiCheck size={12} strokeWidth={3} />
            </span>
            <span>
              You&apos;ve unlocked <strong className="font-bold text-[#1F8A4C]">free delivery</strong>
            </span>
          </>
        ) : (
          <>
            <FiTruck size={16} className="shrink-0 text-gold-dark" />
            <span>
              Add <strong className="font-bold text-primary-pink">{money(remaining)}</strong> more for{" "}
              <strong className="font-bold">free delivery</strong>
            </span>
          </>
        )}
      </p>
      <div
        className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-white/90 ring-1 ring-black/[0.04]"
        role="progressbar"
        aria-label="Progress to free delivery"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
      >
        <div
          className={cn("h-full rounded-full transition-[width] duration-500 ease-out", unlocked ? "bg-[#1F8A4C]" : "bg-gradient-to-r from-gold to-primary-pink")}
          style={{ width: `${Math.max(pct, 4)}%` }}
        />
      </div>
    </div>
  );
}

/* ── Reassurance ────────────────────────────────────────────────────────── */

const TRUST = [
  { icon: FiShield, title: "100% authentic", sub: "Genuine products only" },
  { icon: FiTruck, title: "Cash on delivery", sub: "Pay when it arrives" },
  { icon: FiRefreshCw, title: "Easy returns", sub: "Help if anything's wrong" },
] as const;

export function TrustRow({ compact = false, inline = false, className }: { compact?: boolean; inline?: boolean; className?: string }) {
  if (inline)
    return (
      <ul className={cn("flex flex-wrap items-center justify-center gap-x-4 gap-y-1", className)}>
        {TRUST.map(({ icon: Icon, title }) => (
          <li key={title} className="flex items-center gap-1.5 text-[11.5px] font-semibold text-text-muted">
            <Icon size={13} className="text-plum" />
            {title}
          </li>
        ))}
      </ul>
    );
  return (
    <ul className={cn("grid grid-cols-3 gap-2", className)}>
      {TRUST.map(({ icon: Icon, title, sub }) => (
        <li key={title} className="flex flex-col items-center gap-1 text-center">
          <span className={cn("flex items-center justify-center rounded-full bg-plum-soft/70 text-plum", compact ? "h-8 w-8" : "h-10 w-10")}>
            <Icon size={compact ? 14 : 16} />
          </span>
          <span className="text-[11px] font-bold leading-tight text-text-dark md:text-xs">{title}</span>
          {!compact && <span className="text-[10.5px] leading-tight text-text-muted">{sub}</span>}
        </li>
      ))}
    </ul>
  );
}

/* ── Summary line ───────────────────────────────────────────────────────── */

export function SummaryRow({
  label,
  value,
  tone = "default",
  hint,
}: {
  label: React.ReactNode;
  value: React.ReactNode;
  tone?: "default" | "savings" | "muted";
  hint?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3 text-sm">
      <span className={cn(tone === "savings" ? "font-semibold text-[#1F8A4C]" : "text-text-muted")}>
        {label}
        {hint && <span className="block text-[11px] font-normal text-text-muted/80">{hint}</span>}
      </span>
      <span
        className={cn(
          "shrink-0 tabular-nums",
          tone === "savings" ? "font-bold text-[#1F8A4C]" : tone === "muted" ? "text-text-muted" : "font-semibold text-text-dark",
        )}
      >
        {value}
      </span>
    </div>
  );
}

/* ── "You may also like" ────────────────────────────────────────────────── */

export function UpsellRow({
  products,
  freeDeliveryGap = 0,
  onNavigate,
  className,
}: {
  products: ProductHit[];
  freeDeliveryGap?: number;
  onNavigate?: () => void;
  className?: string;
}) {
  if (!products.length) return null;
  return (
    <section className={className} aria-label="You may also like">
      <div className="mb-2.5 flex items-baseline justify-between gap-3">
        <h3 className="font-display text-base font-semibold text-text-dark md:text-lg">
          {freeDeliveryGap > 0 ? "Complete your routine" : "You may also like"}
        </h3>
      </div>
      <ScrollRow label="product suggestions" arrowSize="sm" trackClassName="no-scrollbar -mx-1 flex snap-x snap-proximity gap-2.5 overflow-x-auto px-1 pb-1">
        {products.map((p) => {
          const price = effectivePrice(p);
          return (
            <Link
              key={p._id}
              href={`/product/${p.slug}`}
              onClick={onNavigate}
              className="group w-[124px] shrink-0 snap-start overflow-hidden rounded-xl border border-[#EFE3E8] bg-white shadow-tile transition-shadow hover:shadow-card"
            >
              <span className="relative block aspect-square border-b border-[#F4ECEF] bg-white">
                <ProductPhoto src={p.image || "/placeholder.png"} alt={p.name} requestWidth={256} className="p-[10%]" imgClassName="transition-transform duration-300 group-hover:scale-105" />
                {freeDeliveryGap > 0 && price >= freeDeliveryGap && (
                  <span className="absolute inset-x-1.5 bottom-1.5 rounded-md bg-[#F1FAF4] py-0.5 text-center text-[9.5px] font-bold text-[#1F8A4C]">+ Free delivery</span>
                )}
              </span>
              <span className="block px-2 pb-2 pt-1.5">
                <span className="line-clamp-2 min-h-[2.5em] text-[11.5px] font-semibold leading-[1.25] text-text-dark">{p.name}</span>
                <span className="mt-1 flex items-baseline gap-1">
                  {p.hasVariants && <span className="text-[10px] text-text-muted">From</span>}
                  <span className="text-[13px] font-extrabold text-primary-pink">{money(price)}</span>
                  {price < p.price && <s className="text-[10px] text-[#7B6A76]">{money(p.price)}</s>}
                </span>
              </span>
            </Link>
          );
        })}
      </ScrollRow>
    </section>
  );
}

/* ── Empty bag ──────────────────────────────────────────────────────────── */

export function EmptyBag({ onNavigate, compact = false }: { onNavigate?: () => void; compact?: boolean }) {
  return (
    <div className={cn("flex flex-col items-center text-center", compact ? "px-6 py-14" : "px-6 py-16 md:py-20")}>
      <div className="relative mb-6">
        <span className="absolute -inset-3 rounded-full bg-blush/40 blur-xl" aria-hidden />
        <span className="relative flex h-24 w-24 items-center justify-center rounded-full border border-[#F1DDE4] bg-gradient-to-b from-white to-[#FCEFF3] text-primary-pink shadow-tile">
          <FiShoppingBag size={36} strokeWidth={1.6} />
        </span>
      </div>
      <h2 className={cn("font-display font-semibold text-text-dark", compact ? "text-2xl" : "text-3xl md:text-4xl")}>Your bag is empty</h2>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-text-muted">
        Discover skincare, makeup and everyday beauty — 100% authentic, delivered to your door with cash on delivery.
      </p>
      <div className="mt-7 flex w-full max-w-xs flex-col gap-2.5">
        <Link
          href="/products"
          onClick={onNavigate}
          className="flex min-h-12 items-center justify-center gap-2 rounded-full bg-primary-pink px-6 text-[15px] font-semibold text-white shadow-button transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-hover active:translate-y-0"
        >
          Start shopping <FiArrowRight size={16} />
        </Link>
        <Link
          href="/offers"
          onClick={onNavigate}
          className="flex min-h-12 items-center justify-center rounded-full border border-[#E7D9DF] bg-white px-6 text-sm font-semibold text-text-dark transition-colors hover:border-primary-pink hover:text-primary-pink"
        >
          See today&apos;s offers
        </Link>
      </div>
    </div>
  );
}
