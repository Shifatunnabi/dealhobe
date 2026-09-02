"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { motion, useInView as useFramerInView } from "framer-motion";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { cn } from "@/lib/utils";
import { ColorfulTitle } from "@/components/ui";

/* ── Brand data ──────────────────────────────────────────────── */
const BRANDS = [
  { name: "Barbie",     logo: "/brands/1.png" },
  { name: "Disney",     logo: "/brands/2.png" },
  { name: "Hot Wheels", logo: "/brands/3.png" },
  { name: "Lego",       logo: "/brands/4.png" },
  { name: "Funko",      logo: "/brands/5.png" },
];

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
          <Image
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
export default function BrandSlider({ brands = [] }: { brands?: any[] }) {
  const ref    = useRef<HTMLElement>(null);
  const inView = useFramerInView(ref as React.RefObject<Element>, { once: true, margin: "-60px 0px" });
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
      <section ref={ref} className="w-full bg-soft-bg px-section py-section">
        <div className="mx-auto max-w-7xl text-center">
          <div className="mb-4 text-center">
            <ColorfulTitle title="Brands" />
          </div>
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
    <section ref={ref} className="w-full bg-soft-bg px-section py-section">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          className="mb-10 text-center"
        >
          <ColorfulTitle title="Brands" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1], delay: 0.08 }}
          className="relative"
        >
          <ArrowButton direction="prev" onClick={handlePrev} disabled={!canGoPrev} />
          <ArrowButton direction="next" onClick={handleNext} disabled={!canGoNext} />

          <div className="overflow-hidden">
            <div
              className="-mx-2 flex transition-transform duration-400 ease-out sm:-mx-2.5"
              style={{ transform: `translateX(-${(startIndex * 100) / visibleCards}%)` }}
            >
              {brands.map((brand, i) => (
                <div
                  key={`${brand.name}-${i}`}
                  className="shrink-0"
                  style={{ flexBasis: `${100 / visibleCards}%` }}
                >
                  <BrandCard
                    id={brand._id}
                    name={brand.name}
                    logo={brand.logoUrl || brand.imageUrl}
                  />
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
