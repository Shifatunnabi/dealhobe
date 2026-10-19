"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import SectionHeader from "./SectionHeader";
import ProductCard, { type GridProduct } from "./ProductCard";
import { HOMEPAGE_GRID_CLASS, HOMEPAGE_GRID_ITEMS } from "@/lib/homepage-grid";

/* ── Section — 12 products (see lib/homepage-grid.ts), then a View All CTA ── */
export default function TrendingProducts({ products = [] }: { products?: GridProduct[] }) {

  if (!products.length) {
    return (
      <section id="trending-products" className="w-full py-section px-section bg-soft-bg">
        <div className="mx-auto max-w-7xl">
          <SectionHeader title="Trending Products" />
          <p className="text-sm text-text-muted">No trending products are available right now.</p>
        </div>
      </section>
    );
  }

  return (
    <section id="trending-products" className="w-full py-section px-section bg-soft-bg">
      <div
        className="mx-auto max-w-7xl"
      >
        <SectionHeader title="Trending Products" />

        {/* Grid — 6 rows of 2 on mobile, 3 rows of 4 from md up */}
        <div className={HOMEPAGE_GRID_CLASS}>
          {products.slice(0, HOMEPAGE_GRID_ITEMS).map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>

        <div className="mt-10 flex justify-center">
          <Link href="/products">
            <motion.span
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.96 }}
              transition={{ duration: 0.2, ease: [0.34, 1.56, 0.64, 1] }}
              className="inline-flex items-center gap-2 rounded-2xl border-2 border-primary-pink bg-transparent px-8 py-3.5 font-poppins text-base font-semibold text-primary-pink transition-all hover:bg-primary-pink hover:text-white cursor-pointer"
            >
              View All Products →
            </motion.span>
          </Link>
        </div>
      </div>
    </section>
  );
}
