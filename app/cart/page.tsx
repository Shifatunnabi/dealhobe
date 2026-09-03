"use client";

import { useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiTrash2,
  FiChevronRight,
  FiShoppingBag,
  FiArrowRight,
  FiCheck,
  FiShoppingCart,
} from "react-icons/fi";
import { cn } from "@/lib/utils";
import { fadeUp } from "@/components/animations/variants";
import { ColorfulTitle } from "@/components/ui";
import { useCart } from "@/components/cart/CartProvider";

/* ─── Types ─────────────────────────────────────────────────── */
/* ─── Qty Stepper ────────────────────────────────────────────── */
function QtyStepper({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="inline-flex items-center overflow-hidden rounded-xl border border-gray-200 bg-soft-bg">
      <button
        onClick={() => onChange(Math.max(1, value - 1))}
        className="flex h-8 w-8 items-center justify-center text-text-muted transition-colors hover:bg-primary-pink/8 hover:text-primary-pink active:bg-primary-pink/15"
        aria-label="Decrease quantity"
      >
        <span className="font-poppins text-base font-bold leading-none select-none">−</span>
      </button>
      <div className="flex h-8 w-9 items-center justify-center border-x border-gray-200 bg-white font-poppins text-sm font-bold text-text-dark tabular-nums">
        {value}
      </div>
      <button
        onClick={() => onChange(value + 1)}
        className="flex h-8 w-8 items-center justify-center text-text-muted transition-colors hover:bg-primary-pink/8 hover:text-primary-pink active:bg-primary-pink/15"
        aria-label="Increase quantity"
      >
        <span className="font-poppins text-base font-bold leading-none select-none">+</span>
      </button>
    </div>
  );
}

/* ─── Cart Page ──────────────────────────────────────────────── */
export default function CartPage() {
  const { items, updateQty, removeItem, subtotal } = useCart();
  const cartItems = items;

  const itemCount = useMemo(
    () => cartItems.reduce((s, i) => s + i.qty, 0),
    [cartItems],
  );

  return (
    <div className="min-h-screen bg-soft-bg pt-34 pb-24">
      <div className="mx-auto max-w-5xl px-section">

        {/* ── Page Header ────────────────────────────────────── */}
        <motion.div
          className="mb-10 text-center"
          initial="hidden"
          animate="visible"
          variants={fadeUp}
        >
          {/* Breadcrumb */}
          <nav className="mb-5 flex items-center justify-center gap-2 text-small text-text-muted">
            <Link href="/" className="transition-colors hover:text-primary-pink">
              Home
            </Link>
            <FiChevronRight size={12} />
            <span className="font-semibold text-text-dark">Cart</span>
          </nav>

          <ColorfulTitle title="Your Shopping Cart" as="h1" className="text-primary-pink" />
          <p className="mt-2 font-poppins text-sm text-text-muted">
            {cartItems.length === 0
              ? "Your cart is empty — go explore something fun!"
              : `You have ${itemCount} item${itemCount !== 1 ? "s" : ""} in your cart.`}
          </p>
        </motion.div>

        {/* ── Empty State ─────────────────────────────────────── */}
        {cartItems.length === 0 ? (
          <motion.div
            className="flex flex-col items-center gap-5 py-24 text-center"
            initial="hidden"
            animate="visible"
            variants={fadeUp}
          >
            <span className="text-7xl">🛒</span>
            <p className="font-poppins text-xl text-text-muted">
              Nothing here yet — time to start shopping!
            </p>
            <Link
              href="/products"
              className="flex items-center gap-2 rounded-2xl bg-gradient-primary px-8 py-3 font-poppins font-semibold text-white shadow-button transition-shadow hover:shadow-hover"
            >
              <FiShoppingBag size={16} />
              Shop Now
            </Link>
          </motion.div>
        ) : (
          <div className="flex flex-col">

            <motion.div
              className="overflow-hidden rounded-3xl bg-white shadow-card"
              initial="hidden"
              animate="visible"
              variants={fadeUp}
            >
              {/* ── Cart Table ──────────────────────────────────── */}
              <div className="hidden grid-cols-[minmax(0,2.5fr)_1fr_auto_1fr_auto] gap-4 border-b border-gray-100 bg-soft-bg px-6 py-4 md:grid">
                {["Product", "Price", "Quantity", "Total", ""].map((col) => (
                  <span
                    key={col}
                    className="font-poppins text-xs font-semibold uppercase tracking-wider text-text-muted"
                  >
                    {col}
                  </span>
                ))}
              </div>

              <AnimatePresence initial={false}>
                {cartItems.map((item, i) => (
                  <motion.div
                    key={item.productId}
                    layout
                    initial={{ opacity: 0, y: -12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -24, height: 0, marginBottom: 0 }}
                    transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                    className={cn(
                      "overflow-hidden",
                      i < cartItems.length - 1 ? "border-b border-gray-100" : "",
                    )}
                  >
                    {/* ── Desktop row ── */}
                    <div className="hidden grid-cols-[minmax(0,2.5fr)_1fr_auto_1fr_auto] gap-4 items-center px-6 py-5 md:grid">
                      {/* Product cell */}
                      <div className="flex min-w-0 items-center gap-4">
                        <Link href={`/product/${item.slug}`} className="shrink-0">
                          <div className="relative h-16 w-16 overflow-hidden rounded-xl bg-gray-50 shadow-soft transition-transform duration-300 hover:scale-105">
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              className="object-cover"
                              sizes="64px"
                            />
                          </div>
                        </Link>
                        <div className="min-w-0">
                          <Link href={`/product/${item.slug}`}>
                            <p className="font-poppins text-sm font-semibold leading-snug text-text-dark hover:text-primary-pink transition-colors line-clamp-2">
                              {item.name}
                            </p>
                          </Link>
                        </div>
                      </div>

                      {/* Unit price */}
                      <p className="font-poppins text-base font-semibold text-text-dark">
                        ৳{item.unitPrice.toLocaleString()}
                      </p>

                      {/* Qty stepper */}
                      <QtyStepper
                        value={item.qty}
                        onChange={(v) => updateQty(item.productId, v)}
                      />

                      {/* Row total */}
                      <p className="font-poppins text-base font-bold text-primary-pink">
                        ৳{(item.unitPrice * item.qty).toLocaleString()}
                      </p>

                      {/* Delete */}
                      <button
                        onClick={() => removeItem(item.productId)}
                        className="rounded-xl p-2 text-gray-300 transition-colors duration-200 hover:bg-red-50 hover:text-red-400"
                        aria-label={`Remove ${item.name} from cart`}
                      >
                        <FiTrash2 size={17} />
                      </button>
                    </div>

                    {/* ── Mobile row ── */}
                    <div className="flex gap-3 px-4 py-4 md:hidden">
                      <Link href={`/product/${item.slug}`} className="shrink-0">
                        <div className="relative h-20 w-20 overflow-hidden rounded-xl bg-gray-50 shadow-soft">
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                            sizes="80px"
                          />
                        </div>
                      </Link>
                      <div className="min-w-0 flex-1">
                        <Link href={`/product/${item.slug}`}>
                          <p className="line-clamp-2 font-poppins text-sm font-semibold leading-snug text-text-dark">
                            {item.name}
                          </p>
                        </Link>
                        <p className="mt-0.5 font-poppins text-xs text-text-muted">
                          &nbsp;
                        </p>
                        <div className="mt-2.5 flex items-center justify-between gap-2">
                          <QtyStepper
                            value={item.qty}
                            onChange={(v) => updateQty(item.productId, v)}
                          />
                          <p className="font-poppins text-base font-bold text-primary-pink">
                            ৳{(item.unitPrice * item.qty).toLocaleString()}
                          </p>
                          <button
                            onClick={() => removeItem(item.productId)}
                            className="rounded-xl p-1.5 text-gray-300 transition-colors hover:bg-red-50 hover:text-red-400"
                            aria-label={`Remove ${item.name}`}
                          >
                            <FiTrash2 size={15} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              <hr className="border-gray-200" />

              {/* ── Order Summary ────────────────────────────────── */}
              <div className="p-6">
                <h2 className="mb-5 font-poppins text-xl font-semibold text-text-dark">
                  Order Summary
                </h2>

                <div className="space-y-3">
                  {/* Subtotal */}
                  <div className="flex items-center justify-between">
                    <span className="font-poppins text-sm text-text-muted">
                      Subtotal
                    </span>
                    <span className="font-poppins font-semibold text-text-dark">
                      ৳{subtotal.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Total */}
                <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
                  <span className="font-poppins text-lg font-bold text-text-dark">
                    Total
                  </span>
                  <span className="font-poppins text-2xl font-bold text-primary-pink">
                    ৳{subtotal.toLocaleString()}
                  </span>
                </div>

                {/* Checkout button */}
                <Link href="/checkout">
                  <motion.div
                    whileHover={{ y: -2, boxShadow: "0 16px 48px rgba(164, 27, 21, 0.28)" }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ duration: 0.2 }}
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-primary py-3.5 font-poppins font-semibold text-white shadow-button transition-shadow cursor-pointer"
                  >
                    Proceed to Checkout
                    <FiArrowRight size={16} />
                  </motion.div>
                </Link>

                {/* Continue shopping */}
                <Link
                  href="/products"
                  className="mt-3 flex items-center justify-center gap-1.5 font-poppins text-xs text-black transition-colors hover:text-primary-pink"
                >
                  <FiShoppingCart size={12} />
                  Continue Shopping
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
