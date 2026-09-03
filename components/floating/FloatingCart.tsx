"use client";

import { motion } from "framer-motion";
import { FaShoppingBag } from "react-icons/fa";
import { useCart } from "@/components/cart/CartProvider";

/**
 * Desktop-only cart widget pinned to the middle of the right edge.
 *
 * Clicking it opens the cart sidebar (the same panel `addItem` opens on
 * desktop). Hidden below md: on mobile the bottom-bar cart button plays this
 * role, and `addItem` only bumps its badge count instead of opening a panel.
 *
 * z-100 sits above the navbar (z-50) and menu drawer (z-70) but below the
 * cart sidebar (z-[200]/[201]) so it never covers the panel it opens.
 */
export default function FloatingCart() {
  const { itemCount, subtotal, hydrated, openSidebar } = useCart();

  // Render zeros until hydrated so SSR and client markup agree.
  const count = hydrated ? itemCount : 0;
  const total = hydrated ? subtotal : 0;

  return (
    <button
      type="button"
      onClick={openSidebar}
      aria-label={`Open cart, ${count} ${count === 1 ? "item" : "items"}, ৳${total.toLocaleString()}`}
      className="fixed right-0 top-1/2 z-100 hidden -translate-y-1/2 md:block cursor-pointer"
    >
      <motion.span
        whileHover={{ x: -4 }}
        whileTap={{ scale: 0.96 }}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
        className="flex w-24 flex-col items-center gap-1.5 rounded-l-2xl bg-white px-3 py-5 shadow-hover"
      >
        <FaShoppingBag size={30} className="text-text-dark" aria-hidden />

        <motion.span
          key={count}
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 22 }}
          className="font-poppins text-sm font-semibold leading-none text-text-dark"
        >
          {count} {count === 1 ? "item" : "items"}
        </motion.span>

        <span className="font-poppins text-sm font-bold leading-none text-primary-pink">
          ৳{total.toLocaleString()}
        </span>
      </motion.span>
    </button>
  );
}
