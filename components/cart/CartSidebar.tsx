"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiArrowRight, FiLock } from "react-icons/fi";
import { useCart, cartLineId } from "./CartProvider";
import { BagLine, EmptyBag, FreeDeliveryProgress, TrustRow, UpsellRow } from "@/components/checkout/BagParts";
import { useCartInsights, useFreeDeliveryThreshold } from "@/components/checkout/useCartInsights";
import { money } from "@/components/checkout/money";

export default function CartSidebar() {
  const { items, itemCount, sidebarOpen, closeSidebar, updateQty, removeItem, subtotal } = useCart();
  const threshold = useFreeDeliveryThreshold(sidebarOpen);
  const gap = threshold > 0 ? Math.max(0, threshold - subtotal) : 0;
  const { compareAt, savings, suggestions } = useCartInsights(items, { enabled: sidebarOpen, freeDeliveryGap: gap });
  const closeRef = useRef<HTMLButtonElement>(null);

  // Escape closes; lock page scroll and move focus into the drawer while open.
  useEffect(() => {
    if (!sidebarOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeSidebar();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    closeRef.current?.focus({ preventScroll: true });
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [sidebarOpen, closeSidebar]);

  return (
    <AnimatePresence>
      {sidebarOpen && (
        <>
          <motion.div
            key="cart-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[200] bg-plum/30 backdrop-blur-[2px]"
            onClick={closeSidebar}
          />

          <motion.aside
            key="cart-sidebar"
            role="dialog"
            aria-modal="true"
            aria-label="Shopping bag"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.32, ease: [0.4, 0, 0.2, 1] }}
            className="fixed right-0 top-0 z-[201] flex h-full w-full max-w-[440px] flex-col bg-soft-bg shadow-[-24px_0_60px_rgba(59,13,46,0.18)]"
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-3 border-b border-[#F1E6EA] bg-white px-5 py-3.5">
              <h2 className="font-display text-[22px] font-semibold leading-none text-text-dark">
                Your bag
                {itemCount > 0 && (
                  <span className="ml-2 align-middle font-body text-sm font-semibold text-text-muted">
                    {itemCount} item{itemCount !== 1 ? "s" : ""}
                  </span>
                )}
              </h2>
              <button
                ref={closeRef}
                onClick={closeSidebar}
                aria-label="Close bag"
                className="-mr-2 flex h-11 w-11 items-center justify-center rounded-full text-text-dark transition-colors hover:bg-plum-soft/70"
              >
                <FiX size={20} />
              </button>
            </div>

            {items.length === 0 ? (
              <div className="flex flex-1 items-center justify-center overflow-y-auto bg-white">
                <EmptyBag onNavigate={closeSidebar} compact />
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto overscroll-contain">
                  {threshold > 0 && (
                    <div className="bg-white px-5 pb-1 pt-4">
                      <FreeDeliveryProgress subtotal={subtotal} threshold={threshold} />
                    </div>
                  )}

                  <ul className="bg-white px-5">
                    <AnimatePresence initial={false}>
                      {items.map((item) => (
                        <motion.li
                          key={cartLineId(item)}
                          layout
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: 24, height: 0, paddingTop: 0, paddingBottom: 0 }}
                          transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                          className="overflow-hidden border-b border-[#F4ECEF] py-4 last:border-b-0"
                        >
                          <BagLine
                            item={item}
                            compareAt={compareAt[cartLineId(item)]}
                            onQty={(q) => updateQty(cartLineId(item), q)}
                            onRemove={() => removeItem(cartLineId(item))}
                            onNavigate={closeSidebar}
                            dense
                          />
                        </motion.li>
                      ))}
                    </AnimatePresence>
                  </ul>

                  <UpsellRow products={suggestions} freeDeliveryGap={gap} onNavigate={closeSidebar} className="px-5 pb-5 pt-5" />
                </div>

                {/* Footer */}
                <div className="border-t border-[#F1E6EA] bg-white px-5 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-4 shadow-[0_-10px_30px_rgba(59,13,46,0.06)]">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-sm font-semibold text-text-dark">
                      Subtotal
                      {savings > 0 && <span className="ml-2 text-xs font-bold text-[#1F8A4C]">You save {money(savings)}</span>}
                    </span>
                    <span className="text-xl font-extrabold tabular-nums text-text-dark">{money(subtotal)}</span>
                  </div>
                  <p className="mt-0.5 text-xs text-text-muted">
                    {threshold > 0 && gap === 0 ? (
                      <span className="font-semibold text-[#1F8A4C]">Free delivery included</span>
                    ) : (
                      "Delivery calculated at checkout · Cash on delivery"
                    )}
                  </p>

                  <Link
                    href="/checkout"
                    onClick={closeSidebar}
                    className="mt-3 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-full bg-primary-pink px-6 text-[15px] font-semibold text-white shadow-button transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-hover active:translate-y-0"
                  >
                    <FiLock size={15} />
                    Checkout securely
                    <FiArrowRight size={16} />
                  </Link>
                  <Link
                    href="/cart"
                    onClick={closeSidebar}
                    className="mt-1 flex min-h-11 items-center justify-center text-[13px] font-semibold text-text-muted underline-offset-4 transition-colors hover:text-primary-pink hover:underline"
                  >
                    View full bag
                  </Link>
                  <TrustRow compact inline className="mt-0.5" />
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
