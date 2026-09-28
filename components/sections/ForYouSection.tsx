"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import SectionHeader from "./SectionHeader";
import ProductCard, { type GridProduct } from "./ProductCard";

type TabKey = "new" | "featured" | "topSellers";

const TABS: { key: TabKey; label: string }[] = [
  { key: "new",         label: "New" },
  { key: "featured",    label: "Featured" },
  { key: "topSellers",  label: "Top Sellers" },
];

export default function ForYouSection({
  newProducts = [],
  featuredProducts = [],
  topSellingProducts = [],
}: {
  newProducts?: GridProduct[];
  featuredProducts?: GridProduct[];
  topSellingProducts?: GridProduct[];
}) {
  const [activeTab, setActiveTab] = useState<TabKey>("new");

  const productsByTab: Record<TabKey, GridProduct[]> = {
    new: newProducts,
    featured: featuredProducts,
    topSellers: topSellingProducts,
  };
  const activeProducts = productsByTab[activeTab];

  const hasAny = newProducts.length || featuredProducts.length || topSellingProducts.length;
  if (!hasAny) {
    return (
      <section id="for-you" className="w-full py-section px-section bg-soft-bg">
        <div className="mx-auto max-w-7xl">
          <SectionHeader title="For You" />
          <p className="text-sm text-text-muted">No products are available right now.</p>
        </div>
      </section>
    );
  }

  return (
    <section id="for-you" className="w-full py-section px-section bg-soft-bg">
      <div
        className="mx-auto max-w-7xl"
      >
        <SectionHeader title="For You">
          <div className="flex items-center gap-5">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  "relative pb-2 font-poppins text-sm font-semibold uppercase tracking-wide transition-colors md:text-base",
                  activeTab === tab.key ? "text-primary-pink" : "text-text-muted hover:text-text-dark",
                )}
              >
                {tab.label}
                {activeTab === tab.key && (
                  <motion.span
                    layoutId="for-you-tab-underline"
                    className="absolute bottom-0 left-0 h-0.5 w-full rounded-full bg-primary-pink"
                    transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                  />
                )}
              </button>
            ))}
          </div>
        </SectionHeader>

        {activeProducts.length ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-5">
            {activeProducts.slice(0, 8).map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-text-muted">No products in this tab yet.</p>
        )}

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
