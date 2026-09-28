"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { cn } from "@/lib/utils";
import SectionHeader from "./SectionHeader";
import FadeImage from "@/components/ui/FadeImage";
import type { PlainCategory } from "@/lib/data";

const MOBILE_BREAKPOINT = 768;

/** Paired chevron control — mirrors the arrow pill from the design: one
 *  rounded box, two buttons split by a divider, right of the section title. */
function ArrowPill({
  onPrev,
  onNext,
  canPrev,
  canNext,
}: {
  onPrev: () => void;
  onNext: () => void;
  canPrev: boolean;
  canNext: boolean;
}) {
  return (
    <div className="flex items-center overflow-hidden rounded-xl border border-gray-200">
      <button
        type="button"
        onClick={onPrev}
        disabled={!canPrev}
        aria-label="Show previous categories"
        className={cn(
          "flex h-9 w-9 items-center justify-center transition-colors md:h-10 md:w-10",
          canPrev ? "text-text-dark hover:bg-gray-50" : "cursor-not-allowed text-gray-300",
        )}
      >
        <FiChevronLeft size={18} />
      </button>
      <div className="h-5 w-px bg-gray-200" />
      <button
        type="button"
        onClick={onNext}
        disabled={!canNext}
        aria-label="Show next categories"
        className={cn(
          "flex h-9 w-9 items-center justify-center transition-colors md:h-10 md:w-10",
          canNext ? "text-text-dark hover:bg-gray-50" : "cursor-not-allowed text-gray-300",
        )}
      >
        <FiChevronRight size={18} />
      </button>
    </div>
  );
}

function CategoryCard({ cat }: { cat: PlainCategory }) {
  return (
    <div className="group flex flex-col items-center gap-3 px-2 text-center">
      <Link
        href={`/products?category=${encodeURIComponent(cat.name)}`}
        aria-label={`Shop ${cat.name}`}
        className="relative w-full"
      >
        <div
          className="relative w-full aspect-square overflow-hidden rounded-2xl"
          style={{ backgroundColor: "#FFD6E7" }}
        >
          <FadeImage
            src={cat.imageUrl}
            alt={cat.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, 25vw"
            loading="lazy"
          />
        </div>
      </Link>

      <Link
        href={`/products?category=${encodeURIComponent(cat.name)}`}
        className="font-poppins text-base font-semibold text-text-dark md:text-lg"
      >
        {cat.name}
      </Link>

      <Link
        href={`/products?category=${encodeURIComponent(cat.name)}`}
        className="inline-flex items-center justify-center rounded-lg border-2 border-primary-pink px-4 py-1.5 text-xs font-semibold text-primary-pink transition-colors duration-200 hover:bg-primary-pink hover:text-white"
      >
        Shop Now
      </Link>
    </div>
  );
}

/* ── Section ─────────────────────────────────────────────────── */
export default function TopCategoriesCarousel({ categories = [] }: { categories?: PlainCategory[] }) {
  const [visibleCards, setVisibleCards] = useState(4);
  const [startIndex, setStartIndex] = useState(0);

  const visibleCategories = categories.filter((c) => c.showOnHomepage !== false);

  useEffect(() => {
    const updateVisibleCards = () => {
      const nextVisible = window.innerWidth < MOBILE_BREAKPOINT ? 2 : 4;
      setVisibleCards((current) => {
        if (current === nextVisible) return current;
        setStartIndex((idx) => Math.min(idx, Math.max(0, visibleCategories.length - nextVisible)));
        return nextVisible;
      });
    };
    updateVisibleCards();
    window.addEventListener("resize", updateVisibleCards);
    return () => window.removeEventListener("resize", updateVisibleCards);
  }, [visibleCategories.length]);

  const openCategorySidebar = () => window.dispatchEvent(new Event("dealhobe-open-category-sidebar"));

  if (!visibleCategories.length) {
    return (
      <section id="top-categories" className="w-full py-section px-section bg-soft-bg">
        <div className="mx-auto max-w-7xl">
          <SectionHeader title="Top Categories" />
          <p className="text-sm text-text-muted">No categories are available right now.</p>
        </div>
      </section>
    );
  }

  const maxIndex = Math.max(0, visibleCategories.length - visibleCards);
  const canPrev = startIndex > 0;
  const canNext = startIndex < maxIndex;

  return (
    <section id="top-categories" className="w-full py-section px-section bg-soft-bg">
      <div className="mx-auto max-w-7xl">
        <SectionHeader
          title="Top Categories"
          right={
            maxIndex > 0 ? (
              <ArrowPill
                onPrev={() => setStartIndex((i) => Math.max(0, i - 1))}
                onNext={() => setStartIndex((i) => Math.min(maxIndex, i + 1))}
                canPrev={canPrev}
                canNext={canNext}
              />
            ) : undefined
          }
        />

        <div
          className="overflow-hidden"
        >
          <div
            className="-mx-2 flex transition-transform duration-400 ease-out [--carousel-visible:2] md:[--carousel-visible:4]"
            style={{ transform: `translateX(calc(-${startIndex} * 100% / var(--carousel-visible)))` }}
          >
            {visibleCategories.map((cat) => (
              <div key={cat._id} className="shrink-0 basis-1/2 md:basis-1/4">
                <CategoryCard cat={cat} />
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 flex justify-center">
          <button
            onClick={openCategorySidebar}
            className="inline-flex items-center justify-center rounded-2xl border-2 border-primary-pink px-6 py-2.5 text-sm font-semibold text-primary-pink transition-colors hover:bg-primary-pink hover:text-white"
          >
            View All Categories
          </button>
        </div>
      </div>
    </section>
  );
}
