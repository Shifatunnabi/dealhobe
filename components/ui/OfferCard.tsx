"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { scaleIn } from "@/components/animations/variants";

export default function OfferCard({
  title,
  slug,
  image,
  blurb,
  index,
  isClosed,
}: {
  title: string;
  slug: string;
  image: string;
  blurb: string;
  index: number;
  isClosed: boolean;
}) {
  return (
    <motion.article
      variants={scaleIn}
      initial={{ opacity: 0, y: -18 * index, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        delay: 0.16 + index * 0.07,
        duration: 0.48,
        ease: [0.34, 1.56, 0.64, 1],
      }}
      className="group overflow-hidden rounded-3xl border border-primary-pink/15 bg-white shadow-card"
    >
      <div className="relative aspect-[4/1] overflow-hidden">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 80vw"
        />
      </div>

      <div className="flex flex-col gap-3 p-5">
        <div>
          <h3 className="font-poppins text-lg font-semibold text-text-dark">
            {title}
          </h3>
          <p className="mt-1 text-sm text-text-muted">
            {blurb}
          </p>
        </div>

        {isClosed ? (
          <button
            disabled
            className="inline-flex w-fit items-center justify-center rounded-2xl border-2 border-gray-200 px-5 py-2 text-sm font-semibold text-text-muted cursor-not-allowed"
          >
            Offer Closed
          </button>
        ) : (
          <Link
            href={`/products/${slug}`}
            className="inline-flex w-fit items-center justify-center rounded-2xl border-2 border-primary-pink px-5 py-2 text-sm font-semibold text-primary-pink transition-colors hover:bg-primary-pink hover:text-white"
          >
            Explore Now
          </Link>
        )}
      </div>
    </motion.article>
  );
}
