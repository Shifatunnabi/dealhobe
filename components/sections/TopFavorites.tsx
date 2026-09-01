"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { FiShoppingCart, FiCheck } from "react-icons/fi";
import { staggerContainer, fadeUp, scaleIn } from "@/components/animations/variants";
import { cn } from "@/lib/utils";
import { useOptionalCart } from "@/components/cart/CartProvider";


interface FavoriteProduct {
  _id: string;
  slug: string;
  name: string;
  images?: string[];
  price: number;
  salePrice?: number;
  offerDiscountType?: "percentage" | "flat";
  offerDiscountAmount?: number;
  quantity?: number;
}

/* ── Single Product Card ─────────────────────────────────────── */
function ProductCard({ product, index }: { product: FavoriteProduct; index: number }) {
  const [added, setAdded] = useState(false);
  const cart = useOptionalCart();
  const availableQty = Number(product.quantity ?? 0);
  const outOfStock = availableQty <= 0;
  const unitPrice = product.salePrice || product.price;
  const offerBadgeText = product.offerDiscountType
    ? product.offerDiscountType === "percentage"
      ? `-${product.offerDiscountAmount}%`
      : `-৳${product.offerDiscountAmount}`
    : null;

  const handleAdd = () => {
    if (outOfStock) return;
    cart?.addItem(
      {
        productId: product._id,
        slug: product.slug,
        name: product.name,
        image: product.images?.[0] || "/placeholder.png",
        unitPrice,
        qty: 1,
        maxQty: availableQty,
      },
      1,
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  };

  return (
    <motion.article
      variants={scaleIn}
      custom={index}
      className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-card transition-shadow hover:shadow-hover"
    >
      <Link href={`/product/${product.slug}`} className="flex flex-1 flex-col">
        <div className="p-3 pb-0">
          <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-gray-50">
            <Image
              src={product.images?.[0] || "/placeholder.png"}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-500 hover:scale-105"
              sizes="(max-width: 640px) 50vw, 25vw"
              loading="lazy"
            />
            {offerBadgeText && (
              <span className="absolute left-2 top-2 z-10 rounded-full bg-gradient-yellow px-2.5 py-0.5 text-xs font-inter font-semibold text-text-dark shadow-sm">
                {offerBadgeText}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-1 flex-col px-3 pt-2.5 pb-3">
          <h3 className="truncate font-inter text-sm font-semibold text-gray-900 transition-colors hover:text-primary-pink">
            {product.name}
          </h3>
          <div className="mt-auto flex items-baseline justify-start gap-1.5 whitespace-nowrap">
            <p className="font-inter text-lg font-bold text-primary-pink">
              ৳{unitPrice.toLocaleString()}.00
            </p>
            {product.salePrice && product.price > product.salePrice && (
              <span className="text-xs text-text-muted line-through">
                ৳{product.price.toLocaleString()}
              </span>
            )}
          </div>
        </div>
      </Link>

      {/* Cart button — full width, icon only, flush to card bottom */}
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={handleAdd}
        className={cn(
          "flex w-full items-center justify-center py-3.5 transition-colors duration-300",
          outOfStock
            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
            : added
            ? "bg-green-500"
            : "bg-primary-pink hover:bg-primary-pink/90",
        )}
        aria-label="Add to cart"
        disabled={outOfStock}
      >
        <span className="relative flex h-5.5 w-5.5 items-center justify-center">
          <FiCheck
            size={22}
            className={cn(
              "absolute text-white transition-opacity duration-200",
              added ? "opacity-100" : "opacity-0",
            )}
          />
          <FiShoppingCart
            size={22}
            className={cn(
              "absolute text-white transition-opacity duration-200",
              added ? "opacity-0" : "opacity-100",
            )}
          />
        </span>
      </motion.button>
    </motion.article>
  );
}

/* ── Section ─────────────────────────────────────────────────── */
export default function TopFavorites({ products = [] }: { products?: FavoriteProduct[] }) {
  const ref    = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px 0px" });

  if (!products.length) {
    return (
      <section id="top-favorites" ref={ref} className="w-full py-section px-section bg-soft-bg">
        <div className="mx-auto max-w-7xl text-center">
          <h2 className="text-section-title text-primary-pink">Top Favorites</h2>
          <p className="mt-3 text-sm text-text-muted">No featured products are available right now.</p>
          <div className="mt-8 flex justify-center">
            <Link href="/products">
              <span className="inline-flex items-center gap-2 rounded-2xl border-2 border-primary-pink bg-transparent px-8 py-3.5 font-inter text-base font-semibold text-primary-pink transition-all hover:bg-primary-pink hover:text-white cursor-pointer">
                Browse Products →
              </span>
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    //bg-[#0f172a] 
   <section id="top-favorites" ref={ref} className="w-full py-section px-section bg-soft-bg">  
      <motion.div
        className="mx-auto max-w-7xl"
        variants={staggerContainer}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
      >
        {/* Header */}
        <motion.div variants={fadeUp} className="mb-12 text-center">
          <h2 className="text-section-title text-primary-pink">
            Top Favorites
          </h2>
        </motion.div>

        {/* Grid — 2 cols mobile, 4 cols desktop */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-5">
          {products.slice(0, 8).map((product, i) => (
            <ProductCard key={product._id} product={product} index={i} />
          ))}
        </div>

        {/* View All CTA */}
        <motion.div variants={fadeUp} className="mt-12 flex justify-center">
          <Link href="/products">
            <motion.span
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.96 }}
              transition={{ duration: 0.2, ease: [0.34, 1.56, 0.64, 1] }}
              className="inline-flex items-center gap-2 rounded-2xl border-2 border-primary-pink bg-transparent px-8 py-3.5 font-inter text-base font-semibold text-primary-pink transition-all hover:bg-primary-pink hover:text-white cursor-pointer"
            >
              View All Products →
            </motion.span>
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}
