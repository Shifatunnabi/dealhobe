"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { FiShoppingCart } from "react-icons/fi";
import { useCart } from "@/components/cart/CartProvider";

export default function FloatingCart() {
  const { itemCount, subtotal, hydrated } = useCart();
  const count = hydrated ? itemCount : 0;
  const total = hydrated ? subtotal : 0;

  return (
    <div className="fixed right-0 top-1/2 z-40 -translate-y-1/2">
      <Link href="/cart" aria-label="View cart">

        {/* Desktop card — square, NO rounded corners per spec */}
        <motion.div
          whileHover={{ x: -4, boxShadow: "0 16px 48px rgba(85, 0, 0,0.28)" }}
          transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
          className="hidden md:flex flex-col items-center justify-center gap-1.5 w-18 py-4 bg-primary-pink text-white shadow-button cursor-pointer"
          style={{ borderRadius: "0 0 0 0" }} /* explicitly square */
        >
          <FiShoppingCart size={22} className="shrink-0" />
          <span className="font-poppins text-xl font-bold leading-none">{count}</span>
          <span className="font-poppins text-[10px] font-semibold opacity-80 leading-none">items</span>
          <div className="w-8 h-px bg-white/30 my-0.5" />
          <span className="font-poppins text-xs font-semibold leading-none">৳{total.toLocaleString()}</span>
        </motion.div>

        {/* Mobile icon — circular with badge */}
        <motion.div
          whileTap={{ scale: 0.92 }}
          transition={{ duration: 0.15 }}
          className="md:hidden relative flex h-12 w-12 items-center justify-center rounded-full bg-primary-pink text-white shadow-button mr-3 cursor-pointer"
        >
          <FiShoppingCart size={20} />

          {/* Badge */}
          <AnimatePresence>
            {count > 0 && (
              <motion.span
                key="badge"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-white text-[10px] font-bold text-primary-pink leading-none shadow"
              >
                {count}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.div>
      </Link>
    </div>
  );
}
