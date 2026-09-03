"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiTrash2, FiMinus, FiPlus, FiArrowRight, FiShoppingBag } from "react-icons/fi";
import { useCart } from "./CartProvider";

export default function CartSidebar() {
  const { items, sidebarOpen, closeSidebar, updateQty, removeItem, subtotal } = useCart();

  return (
    <AnimatePresence>
      {sidebarOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="cart-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[200] bg-black/30 backdrop-blur-sm hidden md:block"
            onClick={closeSidebar}
          />

          {/* Sidebar panel */}
          <motion.aside
            key="cart-sidebar"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.32, ease: [0.4, 0, 0.2, 1] }}
            className="fixed right-0 top-0 z-[201] hidden h-full w-[380px] flex-col bg-white shadow-hover md:flex"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <h2 className="font-poppins text-lg font-semibold text-text-dark">Your Cart</h2>
              <button
                onClick={closeSidebar}
                aria-label="Close cart"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-text-muted transition-colors hover:border-primary-pink hover:text-primary-pink"
              >
                <FiX size={16} />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
                  <FiShoppingBag size={40} className="text-gray-200" />
                  <p className="font-poppins text-sm text-text-muted">Your cart is empty</p>
                </div>
              ) : (
                <AnimatePresence initial={false}>
                  <div className="flex flex-col gap-3">
                    {items.map((item) => {
                      const rowTotal = item.unitPrice * item.qty;
                      return (
                        <motion.div
                          key={item.productId}
                          layout
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: 24, height: 0, marginBottom: 0 }}
                          transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                          className="relative overflow-hidden rounded-2xl border border-gray-100 bg-soft-bg p-3"
                        >
                          {/* Delete button — top right */}
                          <button
                            onClick={() => removeItem(item.productId)}
                            aria-label={`Remove ${item.name}`}
                            className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-300 transition-colors hover:border-red-300 hover:text-red-400"
                          >
                            <FiTrash2 size={13} />
                          </button>

                          <div className="flex gap-3 pr-8">
                            {/* Image */}
                            <Link href={`/product/${item.slug}`} onClick={closeSidebar} className="shrink-0">
                              <div className="relative h-16 w-16 overflow-hidden rounded-xl bg-white shadow-soft">
                                <Image
                                  src={item.image}
                                  alt={item.name}
                                  fill
                                  className="object-cover"
                                  sizes="64px"
                                />
                              </div>
                            </Link>

                            {/* Name + price */}
                            <div className="min-w-0 flex-1">
                              <Link href={`/product/${item.slug}`} onClick={closeSidebar}>
                                <p className="line-clamp-2 font-poppins text-sm font-semibold leading-snug text-text-dark hover:text-primary-pink transition-colors">
                                  {item.name}
                                </p>
                              </Link>
                              <p className="mt-0.5 font-poppins text-xs text-text-muted">
                                ৳{item.unitPrice.toLocaleString()} each
                              </p>
                            </div>
                          </div>

                          {/* Qty stepper + row total — bottom right */}
                          <div className="mt-2.5 flex items-center justify-between">
                            <div className="inline-flex items-center overflow-hidden rounded-xl border border-gray-200 bg-white">
                              <button
                                onClick={() => updateQty(item.productId, item.qty - 1)}
                                className="flex h-7 w-7 items-center justify-center text-text-muted transition-colors hover:text-primary-pink"
                                aria-label="Decrease"
                              >
                                <FiMinus size={12} />
                              </button>
                              <span className="flex h-7 w-8 items-center justify-center border-x border-gray-200 font-poppins text-xs font-bold text-text-dark tabular-nums">
                                {item.qty}
                              </span>
                              <button
                                onClick={() => updateQty(item.productId, item.qty + 1)}
                                disabled={item.maxQty !== undefined && item.qty >= item.maxQty}
                                className="flex h-7 w-7 items-center justify-center text-text-muted transition-colors hover:text-primary-pink disabled:opacity-40"
                                aria-label="Increase"
                              >
                                <FiPlus size={12} />
                              </button>
                            </div>
                            <p className="font-poppins text-sm font-bold text-primary-pink">
                              ৳{rowTotal.toLocaleString()}
                            </p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </AnimatePresence>
              )}
            </div>

            {/* Footer — subtotal + checkout */}
            {items.length > 0 && (
              <div className="border-t border-gray-100 px-5 py-4">
                <div className="mb-4 flex items-center justify-between">
                  <span className="font-poppins text-sm text-text-muted">Subtotal</span>
                  <span className="font-poppins text-lg font-bold text-text-dark">
                    ৳{subtotal.toLocaleString()}
                  </span>
                </div>

                <Link href="/checkout" onClick={closeSidebar}>
                  <motion.div
                    whileHover={{ y: -2, boxShadow: "0 16px 48px rgba(164, 27, 21, 0.28)" }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ duration: 0.2 }}
                    className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-gradient-primary py-3.5 font-poppins font-semibold text-white shadow-button transition-shadow"
                  >
                    Proceed to Checkout
                    <FiArrowRight size={16} />
                  </motion.div>
                </Link>

                <Link
                  href="/cart"
                  onClick={closeSidebar}
                  className="mt-3 flex items-center justify-center font-poppins text-xs text-text-muted transition-colors hover:text-primary-pink"
                >
                  View full cart
                </Link>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
