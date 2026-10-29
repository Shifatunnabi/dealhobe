"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { FiArrowLeft, FiArrowRight, FiChevronRight, FiLock } from "react-icons/fi";
import { useCart, cartLineId } from "@/components/cart/CartProvider";
import { BagLine, EmptyBag, FreeDeliveryProgress, SummaryRow, TrustRow, UpsellRow } from "@/components/checkout/BagParts";
import { useCartInsights, useFreeDeliveryThreshold } from "@/components/checkout/useCartInsights";
import { DELIVERY_CHARGE, money } from "@/components/checkout/money";

export default function CartPage() {
  const { items, hydrated, itemCount, updateQty, removeItem, subtotal } = useCart();
  const threshold = useFreeDeliveryThreshold();
  const gap = threshold > 0 ? Math.max(0, threshold - subtotal) : 0;
  const freeDelivery = threshold > 0 && gap === 0;
  const { compareAt, savings, suggestions } = useCartInsights(items, { enabled: items.length > 0, freeDeliveryGap: gap });

  const checkoutButton = (
    <Link
      href="/checkout"
      className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-full bg-primary-pink px-6 text-[15px] font-semibold text-white shadow-button transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-hover active:translate-y-0"
    >
      <FiLock size={15} />
      Checkout securely
      <FiArrowRight size={16} />
    </Link>
  );

  return (
    <div className="min-h-[70vh] bg-soft-bg pb-32 pt-5 md:pb-20 md:pt-8">
      <div className="shell">
        <nav aria-label="Breadcrumb" className="mb-3 flex items-center gap-1.5 text-xs text-text-muted">
          <Link href="/" className="transition-colors hover:text-primary-pink">Home</Link>
          <FiChevronRight size={12} />
          <span className="font-semibold text-text-dark">Bag</span>
        </nav>

        <div className="mb-5 flex flex-wrap items-end justify-between gap-3 md:mb-7">
          <h1 className="font-display text-3xl font-semibold text-text-dark md:text-[40px]">
            Your bag
            {hydrated && itemCount > 0 && (
              <span className="ml-3 align-middle font-body text-base font-semibold text-text-muted">
                {itemCount} item{itemCount !== 1 ? "s" : ""}
              </span>
            )}
          </h1>
          {items.length > 0 && (
            <Link href="/products" className="hidden items-center gap-1.5 text-sm font-semibold text-text-muted transition-colors hover:text-primary-pink md:inline-flex">
              <FiArrowLeft size={15} /> Continue shopping
            </Link>
          )}
        </div>

        {!hydrated ? (
          <div className="h-80 animate-pulse rounded-3xl bg-white/70" aria-hidden />
        ) : items.length === 0 ? (
          <div className="rounded-3xl border border-[#F1E6EA] bg-white shadow-card">
            <EmptyBag />
          </div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-8">
            {/* Items */}
            <div className="min-w-0 space-y-5">
              <FreeDeliveryProgress subtotal={subtotal} threshold={threshold} className="bg-[#FFF9EE]" />

              <motion.ul
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="rounded-3xl border border-[#F1E6EA] bg-white px-4 shadow-tile md:px-6"
              >
                <AnimatePresence initial={false}>
                  {items.map((item) => (
                    <motion.li
                      key={cartLineId(item)}
                      layout
                      exit={{ opacity: 0, x: -24, height: 0, paddingTop: 0, paddingBottom: 0 }}
                      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                      className="overflow-hidden border-b border-[#F4ECEF] py-4 last:border-b-0 md:py-5"
                    >
                      <BagLine
                        item={item}
                        compareAt={compareAt[cartLineId(item)]}
                        onQty={(q) => updateQty(cartLineId(item), q)}
                        onRemove={() => removeItem(cartLineId(item))}
                      />
                    </motion.li>
                  ))}
                </AnimatePresence>
              </motion.ul>

              <UpsellRow products={suggestions} freeDeliveryGap={gap} className="rounded-3xl border border-[#F1E6EA] bg-white p-4 shadow-tile md:p-6" />
            </div>

            {/* Summary */}
            <aside className="lg:sticky lg:top-40 lg:self-start">
              <div className="rounded-3xl border border-[#F1E6EA] bg-white p-5 shadow-card md:p-6">
                <h2 className="font-display text-xl font-semibold text-text-dark">Order summary</h2>
                <div className="mt-4 space-y-2.5">
                  <SummaryRow label={`Subtotal (${itemCount} item${itemCount !== 1 ? "s" : ""})`} value={money(subtotal)} />
                  {savings > 0 && <SummaryRow label="Your savings" value={`−${money(savings)}`} tone="savings" />}
                  <SummaryRow
                    label="Delivery"
                    hint={freeDelivery ? undefined : `Inside Dhaka ${money(DELIVERY_CHARGE.inside_dhaka)} · Outside ${money(DELIVERY_CHARGE.outside_dhaka)}`}
                    value={freeDelivery ? <span className="font-bold text-[#1F8A4C]">Free</span> : "At checkout"}
                    tone={freeDelivery ? "default" : "muted"}
                  />
                </div>
                <div className="mt-4 flex items-baseline justify-between border-t border-dashed border-[#EADDE3] pt-4">
                  <span className="font-semibold text-text-dark">{freeDelivery ? "Total" : "Estimated total"}</span>
                  <span className="text-2xl font-extrabold tabular-nums text-text-dark">{money(subtotal)}</span>
                </div>
                {savings > 0 && (
                  <p className="mt-2 rounded-xl bg-[#F1FAF4] px-3 py-2 text-center text-xs font-semibold text-[#1F8A4C]">
                    You&apos;re saving {money(savings)} on this order
                  </p>
                )}
                <div className="mt-5 hidden md:block">{checkoutButton}</div>
                <p className="mt-3 hidden text-center text-xs text-text-muted md:block">Pay with cash when your order arrives.</p>
                <TrustRow className="mt-5 border-t border-[#F4ECEF] pt-5" />
              </div>
              <Link href="/products" className="mt-4 flex min-h-11 items-center justify-center gap-1.5 text-sm font-semibold text-text-muted transition-colors hover:text-primary-pink md:hidden">
                <FiArrowLeft size={15} /> Continue shopping
              </Link>
            </aside>
          </div>
        )}
      </div>

      {/* Mobile sticky checkout bar */}
      {hydrated && items.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-[45] border-t border-[#F1E6EA] bg-white px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-2.5 shadow-[0_-8px_24px_rgba(59,13,46,0.08)] md:hidden">
          <div className="mb-2 flex items-baseline justify-between text-sm">
            <span className="text-text-muted">
              {freeDelivery ? "Total" : "Subtotal"}
              {savings > 0 && <span className="ml-1.5 font-semibold text-[#1F8A4C]">· saving {money(savings)}</span>}
            </span>
            <span className="text-lg font-extrabold tabular-nums text-text-dark">{money(subtotal)}</span>
          </div>
          {checkoutButton}
        </div>
      )}
    </div>
  );
}
