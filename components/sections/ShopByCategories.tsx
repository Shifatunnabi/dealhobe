"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { staggerContainer, fadeUp, scaleIn } from "@/components/animations/variants";
import ColorfulTitle from "../ui/ColorfulTitle";

/* ── Section ─────────────────────────────────────────────────── */
export default function ShopByCategories({ categories = [] }: { categories?: any[] }) {
  if (!categories.length) {
    return (
      <section id="favourite-categories" className="w-full py-section px-section bg-soft-bg">
        <div className="mx-auto max-w-7xl text-center">
          <div className="mb-4 text-center">
            <ColorfulTitle title="Favourite Categories" />
          </div>
          <p className="text-sm text-text-muted">No categories are available right now.</p>
        </div>
      </section>
    );
  }

  return (
    <section id="favourite-categories" className="w-full py-section px-section bg-soft-bg">
      <motion.div
        className="mx-auto max-w-7xl"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px 0px" }}
      >
        <motion.div variants={fadeUp} className="mb-12 text-center">
          <ColorfulTitle title="Favourite Categories" />
        </motion.div>

        <motion.div variants={fadeUp} className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
          {categories.filter((c: any) => c.showOnHomepage !== false).slice(0, 4).map((cat: any, index: number) => (
            <motion.div
              key={cat._id}
              variants={scaleIn}
              custom={index}
              className="group flex flex-col items-center gap-3 text-center"
            >
              <Link
                href={`/products?category=${encodeURIComponent(cat.name)}`}
                aria-label={`Shop ${cat.name}`}
                className="relative w-full"
              >
                <div
                  className="relative w-full aspect-square overflow-hidden rounded-2xl"
                  style={{ backgroundColor: '#FFD6E7' }}
                >
                  <Image
                    src={cat.imageUrl}
                    alt={cat.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 25vw"
                    loading="eager"
                  />
                </div>
              </Link>

              <Link href={`/products?category=${encodeURIComponent(cat.name)}`} className="font-inter text-lg font-semibold text-text-dark">
                {cat.name}
              </Link>

              <Link
                href={`/products?category=${encodeURIComponent(cat.name)}`}
                className="inline-flex items-center justify-center rounded-lg border-2 border-primary-pink px-4 py-1.5 text-xs font-semibold text-primary-pink transition-colors duration-200 hover:bg-primary-pink hover:text-white"
              >
                Shop Now
              </Link>
            </motion.div>
          ))}
        </motion.div>

        <motion.div variants={fadeUp} className="mt-10 flex justify-center">
          <button
            onClick={() => window.dispatchEvent(new Event("joytoy-open-category-sidebar"))}
            className="inline-flex items-center justify-center rounded-2xl border-2 border-primary-pink px-6 py-2.5 text-sm font-semibold text-primary-pink transition-colors hover:bg-primary-pink hover:text-white"
          >
            View All Categories
          </button>
        </motion.div>
      </motion.div>
    </section>
  );
}
