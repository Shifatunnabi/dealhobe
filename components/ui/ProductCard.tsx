"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { cardHover } from "@/components/animations/variants";
import Button from "./Button";

/* ----------------------------------------------------------------
   Types
   ---------------------------------------------------------------- */
export interface ProductCardProps {
  id:             string;
  name:           string;
  price:          number;
  originalPrice?: number;
  image:          string;
  /** Top-left ribbon text e.g. "New", "Best Seller" */
  badge?:         string;
  offerBadgeText?: string;
  className?:     string;
  onAddToCart?:   (id: string) => void;
}

/* ----------------------------------------------------------------
   Component
   ---------------------------------------------------------------- */
export default function ProductCard({
  id,
  name,
  price,
  originalPrice,
  image,
  badge,
  offerBadgeText,
  className,
  onAddToCart,
}: ProductCardProps) {

  return (
    <motion.article
      initial="rest"
      animate="rest"
      whileHover="hover"
      variants={cardHover}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-3xl bg-white shadow-card",
        className,
      )}
    >
      {/* ---- Badges ---- */}
      {badge && (
        <span className="absolute left-3 top-3 z-10 rounded-full bg-gradient-primary px-3 py-1 text-xs font-poppins font-semibold text-white shadow-button">
          {badge}
        </span>
      )}
      {offerBadgeText && (
        <span className={`absolute ${badge ? "right-3" : "left-3"} top-3 z-10 rounded-full bg-gradient-yellow px-3 py-1 text-xs font-poppins font-semibold text-text-dark shadow-button`}>
          {offerBadgeText}
        </span>
      )}

      {/* ---- Product image ---- */}
      <div className="relative aspect-square w-full overflow-hidden bg-soft-bg">
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
      </div>

      {/* ---- Card body ---- */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        <h3 className="text-card-title truncate text-text-dark">{name}</h3>

        <div className="mt-auto flex items-baseline gap-2 whitespace-nowrap">
          <span className="font-poppins text-xl font-bold text-primary-pink">
            ${price.toFixed(2)}
          </span>
          {originalPrice && (
            <span className="text-sm text-text-muted line-through">
              ${originalPrice.toFixed(2)}
            </span>
          )}
        </div>

        <Button
          variant="primary"
          size="sm"
          fullWidth
          onClick={() => onAddToCart?.(id)}
        >
          Add to Cart
        </Button>
      </div>
    </motion.article>
  );
}
