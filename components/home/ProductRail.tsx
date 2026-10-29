"use client";

import ProductCard, { type GridProduct } from "@/components/sections/ProductCard";
import { ScrollArrows, useScrollRow } from "@/components/ui/ScrollRow";

/** Horizontally scrolling product row: swipe, trackpad, mouse wheel or arrow buttons (components/ui/ScrollRow). */
export default function ProductRail({ products, label = "products" }: { products: GridProduct[]; label?: string }) {
  const { ref, edges, scrollPage } = useScrollRow<HTMLDivElement>();

  return (
    <div className="group relative">
      {/* The padding (cancelled by negative margins) is room for the cards' hover lift and shadow, which a
          scrolling container would otherwise clip. */}
      <div ref={ref} className="no-scrollbar -mx-4 -mb-9 -mt-3 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-9 pt-3 md:-mx-5 md:scroll-px-5 md:gap-4 md:px-5">
        {products.map((p) => (
          <div key={p._id} className="w-[46%] shrink-0 snap-start sm:w-[31%] md:w-[23.5%] lg:w-[calc((100%-5*1rem)/6)]">
            <ProductCard product={p} />
          </div>
        ))}
      </div>
      <ScrollArrows edges={edges} onScroll={scrollPage} label={label} className="!top-[38%]" leftClassName="left-0 md:-left-4" rightClassName="right-0 md:-right-4" />
    </div>
  );
}
