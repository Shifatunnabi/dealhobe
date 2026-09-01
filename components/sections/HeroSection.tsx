"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { FiChevronRight } from "react-icons/fi";

/* ── Framer variants — slide left/right based on direction ────── */
const bgVariants: Variants = {
  enter:  (dir: number) => ({ x: dir > 0 ? "100%" : "-100%", opacity: 1 }),
  center: { x: 0, opacity: 1, transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] } },
  exit:   (dir: number) => ({
    x: dir > 0 ? "-100%" : "100%",
    opacity: 1,
    transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
  }),
};

/* ── Component ────────────────────────────────────────────────── */
export default function HeroSection({ slides = [] }: { slides?: any[] }) {
  const [current,   setCurrent]   = useState(0);
  const [direction, setDirection] = useState(1);
  const intervalRef               = useRef<ReturnType<typeof setInterval> | null>(null);
  const swipeThreshold            = 120;

  const validSlides = slides;

  if (!validSlides.length) {
    return (
      <section className="relative min-h-[70vh] overflow-hidden bg-gradient-to-br from-pink-100 via-white to-yellow-50">
        <div className="mx-auto flex min-h-[70vh] max-w-7xl items-center px-4 py-20 md:px-8">
          <div className="max-w-xl">
            <h1 className="text-hero-title font-semibold text-text-dark">Welcome to JoyToy</h1>
            <p className="mt-4 text-sm text-text-muted md:text-base">
              The hero banner is not available right now. Please check back soon.
            </p>
            <div className="mt-8">
              <Link href="/products">
                <motion.span
                  whileHover={{ scale: 1.04, y: -2 }}
                  whileTap={{ scale: 0.96 }}
                  transition={{ duration: 0.2, ease: [0.34, 1.56, 0.64, 1] }}
                  className="inline-flex items-center gap-2 rounded-2xl bg-primary-pink px-7 py-3.5 font-inter text-base font-semibold text-white shadow-button transition-shadow hover:shadow-hover cursor-pointer"
                >
                  Browse Products
                  <FiChevronRight size={18} />
                </motion.span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const go = useCallback((idx: number) => {
    setDirection(idx > current ? 1 : -1);
    setCurrent(idx);
  }, [current]);

  const next = useCallback(() => go((current + 1) % validSlides.length), [current, go, validSlides.length]);
  const prev = useCallback(() => go((current - 1 + validSlides.length) % validSlides.length), [current, go, validSlides.length]);

  const resetTimer = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(next, 7500);
  }, [next]);

  useEffect(() => {
    resetTimer();
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [resetTimer]);

  const slide = validSlides[current];

  return (
    <section>
      {/* ── Carousel image area — always 9:4 ───────────────────── */}
      <div className="relative w-full aspect-[9/4] overflow-hidden">
        <AnimatePresence custom={direction} initial={false}>
          <motion.div
            key={`slide-${slide._id || slide.id}`}
            custom={direction}
            variants={bgVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="absolute inset-0"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.15}
            onDragEnd={(_, info) => {
              if (info.offset.x > swipeThreshold) {
                resetTimer();
                prev();
                return;
              }
              if (info.offset.x < -swipeThreshold) {
                resetTimer();
                next();
              }
            }}
          >
            <div className="absolute inset-0">
              <Image
                src={slide.imageUrl || slide.image}
                alt={slide.title}
                fill
                className="object-cover"
                priority
                sizes="100vw"
              />
            </div>

            {/* Desktop only: gradient + text overlay */}
            <div className="hidden md:block absolute inset-x-0 bottom-0 h-[65%] bg-linear-to-t from-black/60 via-black/20 to-transparent pointer-events-none z-[5]" />
            <div className="hidden md:absolute md:inset-0 md:flex z-10 items-end pl-8 pr-8 pb-24">
              <div className="w-full max-w-7xl mx-auto">
                <div className="max-w-xl">
                  <h1 className="text-hero-title font-semibold text-white uppercase" style={{ whiteSpace: 'pre-line' }}>
                    {slide.title}
                  </h1>
                  {slide.subtitle && (
                    <p className="mt-4 text-base text-gray-200">{slide.subtitle}</p>
                  )}
                  <div className="mt-8">
                    <Link href={slide.ctaLink || "/products"}>
                      <motion.span
                        whileHover={{ scale: 1.04, y: -2 }}
                        whileTap={{ scale: 0.96 }}
                        transition={{ duration: 0.2, ease: [0.34, 1.56, 0.64, 1] }}
                        className="inline-flex items-center gap-2 rounded-2xl bg-primary-pink px-7 py-3.5 font-inter text-base font-semibold text-white shadow-button transition-shadow hover:shadow-hover cursor-pointer"
                      >
                        {slide.ctaText || "Shop Now"}
                        <FiChevronRight size={18} />
                      </motion.span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Desktop only: dots overlaid on image */}
        <div className="hidden md:flex absolute bottom-8 left-0 right-0 items-center justify-center z-10">
          <div className="flex items-center gap-2">
            {validSlides.map((_, i) => (
              <button
                key={i}
                onClick={() => { resetTimer(); go(i); }}
                aria-label={`Go to slide ${i + 1}`}
                className="group"
              >
                <motion.span
                  animate={{
                    width:           i === current ? 28 : 8,
                    backgroundColor: i === current ? "#E80281" : "rgba(255,255,255,0.4)",
                  }}
                  transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
                  className="block h-2 rounded-full"
                />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile only: title, subtitle, CTA, then dots */}
      <div className="md:hidden px-4 py-3 text-center">
        <h2 className="font-inter text-3xl font-bold text-text-dark uppercase" style={{ whiteSpace: 'pre-line' }}>
          {slide.title}
        </h2>
        {slide.subtitle && (
          <p className="mt-4 text-base text-text-muted">{slide.subtitle}</p>
        )}
        <div className="mt-5">
          <Link href={slide.ctaLink || "/products"}>
            <motion.span
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.96 }}
              transition={{ duration: 0.2, ease: [0.34, 1.56, 0.64, 1] }}
              className="inline-flex items-center gap-2 rounded-2xl bg-primary-pink px-7 py-3.5 font-inter text-base font-semibold text-white uppercase shadow-button transition-shadow hover:shadow-hover cursor-pointer"
            >
              {slide.ctaText || "Shop Now"}
              <FiChevronRight size={18} />
            </motion.span>
          </Link>
        </div>
        <div className="flex items-center justify-center gap-2 mt-5">
          {validSlides.map((_, i) => (
            <button
              key={i}
              onClick={() => { resetTimer(); go(i); }}
              aria-label={`Go to slide ${i + 1}`}
              className="group"
            >
              <motion.span
                animate={{
                  width:           i === current ? 28 : 8,
                  backgroundColor: i === current ? "#E80281" : "rgba(0,0,0,0.15)",
                }}
                transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
                className="block h-2 rounded-full"
              />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
