"use client";

import { useRef } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import ProductCard, { type GridProduct } from "@/components/sections/ProductCard";

/** Horizontally scrolling product row: swipe on phones, arrow buttons on desktop. */
export default function ProductRail({ products }: { products: GridProduct[] }) {
  const track = useRef<HTMLDivElement>(null);
  const scroll = (dir: 1 | -1) => {
    const el = track.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.9, behavior: "smooth" });
  };

  return (
    <div className="group relative">
      {/* The padding (cancelled by negative margins) is room for the cards' hover lift and shadow, which a
          scrolling container would otherwise clip. */}
      <div ref={track} className="no-scrollbar -mx-4 -mb-9 -mt-3 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-9 pt-3 md:-mx-5 md:scroll-px-5 md:gap-4 md:px-5">
        {products.map((p) => (
          <div key={p._id} className="w-[46%] shrink-0 snap-start sm:w-[31%] md:w-[23.5%] lg:w-[calc((100%-5*1rem)/6)]">
            <ProductCard product={p} />
          </div>
        ))}
      </div>
      <button type="button" onClick={() => scroll(-1)} aria-label="Scroll left"
        className="absolute -left-4 top-[38%] z-10 hidden h-10 w-10 items-center justify-center rounded-full bg-white text-text-dark shadow-card transition hover:text-primary-pink md:flex">
        <FiChevronLeft size={20} />
      </button>
      <button type="button" onClick={() => scroll(1)} aria-label="Scroll right"
        className="absolute -right-4 top-[38%] z-10 hidden h-10 w-10 items-center justify-center rounded-full bg-white text-text-dark shadow-card transition hover:text-primary-pink md:flex">
        <FiChevronRight size={20} />
      </button>
    </div>
  );
}
