"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { staggerContainer } from "@/components/animations/variants";
import SectionHeader from "./SectionHeader";
import ProductCard, { type GridProduct } from "./ProductCard";

/* ── Section — 2 rows x 4 columns, then a View All CTA ─────────── */
export default function TrendingProducts({ products = [] }: { products?: GridProduct[] }) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px 0px" });

  if (!products.length) {
    return (
      <section id="trending-products" ref={ref} className="w-full py-section px-section bg-soft-bg">
        <div className="mx-auto max-w-7xl">
          <SectionHeader title="Trending Products" />
          <p className="text-sm text-text-muted">No trending products are available right now.</p>
        </div>
      </section>
    );
  }

  return (
    <section id="trending-products" ref={ref} className="w-full py-section px-section bg-soft-bg">
      <motion.div
        className="mx-auto max-w-7xl"
        variants={staggerContainer}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
      >
        <SectionHeader title="Trending Products" />

        {/* Grid — 2 cols mobile, 4 cols desktop = 2 rows of 4 on desktop */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-5">
          {products.slice(0, 8).map((product, i) => (
            <ProductCard key={product._id} product={product} index={i} />
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
      </motion.div>
    </section>
  );
}
