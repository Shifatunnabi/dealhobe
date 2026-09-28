"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { cn } from "@/lib/utils";
import SectionHeader from "./SectionHeader";
import FadeImage from "@/components/ui/FadeImage";
import type { PlainBrand } from "@/lib/data";

/* ── Brand data ──────────────────────────────────────────────── */
const MOBILE_BREAKPOINT = 768;

/* ── Brand Card ──────────────────────────────────────────────── */
function BrandCard({ id, name, logo }: { id?: string; name: string; logo: string }) {
  const resolvedLogo = logo || "/placeholder.png";
  const brandParam = id || name;

  return (
    <article className="px-2 sm:px-2.5">
      <Link
        href={`/products?brand=${encodeURIComponent(brandParam)}`}
        className="group block"
      >
        <div className="relative aspect-square overflow-hidden rounded-2xl border border-primary-pink/15 bg-white shadow-card transition-shadow duration-300 group-hover:shadow-hover">
          <FadeImage
            src={resolvedLogo}
            alt={name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        </div>

        <p className="pt-3 text-center font-poppins text-base font-semibold leading-tight text-text-dark sm:text-lg">
          {name}
        </p>
      </Link>
    </article>
  );
}

function ArrowButton({
  direction,
  onClick,
  disabled,
}: {
  direction: "prev" | "next";
  onClick: () => void;
  disabled: boolean;
}) {
  const isNext = direction === "next";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={isNext ? "Show next brand" : "Show previous brand"}
      className={cn(
        "absolute top-1/2 z-20 flex -translate-y-1/2 items-center justify-center rounded-full border transition-all duration-200",
        "h-7 w-7 md:h-11 md:w-11",
        isNext ? "right-2 md:right-2" : "left-2 md:left-2",
        disabled
          ? "cursor-not-allowed border-primary-pink/20 bg-white/70 text-primary-pink/40"
          : "border-primary-pink/25 bg-white text-primary-pink shadow-soft hover:bg-primary-pink hover:text-white hover:shadow-button",
      )}
    >
      {isNext ? <FiChevronRight className="h-3.5 w-3.5 md:h-5 md:w-5" /> : <FiChevronLeft className="h-3.5 w-3.5 md:h-5 md:w-5" />}
    </button>
  );
}

/* ── Section ─────────────────────────────────────────────────── */
export default function BrandSlider({ brands = [] }: { brands?: PlainBrand[] }) {
  const [visibleCards, setVisibleCards] = useState(4);
  const [startIndex, setStartIndex] = useState(0);

  useEffect(() => {
    const updateVisibleCards = () => {
      const nextVisible = window.innerWidth < MOBILE_BREAKPOINT ? 2 : 4;

      setVisibleCards((currentVisible) => {
        if (currentVisible === nextVisible) return currentVisible;

        setStartIndex((currentIndex) => {
          const maxNextIndex = Math.max(0, brands.length - nextVisible);
          return Math.min(currentIndex, maxNextIndex);
        });

        return nextVisible;
      });
    };

    updateVisibleCards();
    window.addEventListener("resize", updateVisibleCards);
    return () => window.removeEventListener("resize", updateVisibleCards);
  }, [brands.length]);

  if (!brands.length) {
    return (
      <section className="w-full bg-soft-bg px-section py-section">
        <div className="mx-auto max-w-7xl">
          <SectionHeader title="Brands" />
          <p className="text-sm text-text-muted">No brands are available right now.</p>
        </div>
      </section>
    );
  }

  const maxIndex = Math.max(0, brands.length - visibleCards);
  const canGoPrev = startIndex > 0;
  const canGoNext = startIndex < maxIndex;

  const handlePrev = () => {
    if (!canGoPrev) return;
    setStartIndex((prev) => prev - 1);
  };

  const handleNext = () => {
    if (!canGoNext) return;
    setStartIndex((prev) => prev + 1);
  };

  return (
    <section className="w-full bg-soft-bg px-section py-section">
      <div className="mx-auto max-w-7xl">
        <SectionHeader title="Brands" />

        <div
          className="relative"
        >
          <ArrowButton direction="prev" onClick={handlePrev} disabled={!canGoPrev} />
          <ArrowButton direction="next" onClick={handleNext} disabled={!canGoNext} />

          <div className="overflow-hidden">
            <div
              className="-mx-2 flex transition-transform duration-400 ease-out sm:-mx-2.5 [--carousel-visible:2] md:[--carousel-visible:4]"
              style={{ transform: `translateX(calc(-${startIndex} * 100% / var(--carousel-visible)))` }}
            >
              {brands.map((brand, i) => (
                <div
                  key={`${brand.name}-${i}`}
                  className="shrink-0 basis-1/2 md:basis-1/4"
                >
                  <BrandCard
                    id={brand._id}
                    name={brand.name}
                    logo={brand.logoUrl}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
