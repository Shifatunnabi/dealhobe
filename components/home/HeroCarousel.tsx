"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

/**
 * Native scroll-snap carousel: swipe is the browser's own (smooth on phones, no JS drag math),
 * autoplay only nudges scrollLeft. Slides are server-rendered children, so the first banner paints
 * before hydration.
 */
export default function HeroCarousel({ children, count, autoplayMs = 6000 }: { children: React.ReactNode; count: number; autoplayMs?: number }) {
  const track = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const goTo = useCallback((i: number) => {
    const el = track.current;
    if (!el) return;
    const next = (i + count) % count;
    const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollTo({ left: next * el.clientWidth, behavior: smooth ? "smooth" : "instant" });
  }, [count]);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setIndex(Math.round(el.scrollLeft / Math.max(1, el.clientWidth))));
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => { el.removeEventListener("scroll", onScroll); cancelAnimationFrame(raf); };
  }, []);

  useEffect(() => {
    if (count < 2 || paused || !autoplayMs) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => { if (!document.hidden) goTo(index + 1); }, autoplayMs);
    return () => window.clearInterval(id);
  }, [count, paused, autoplayMs, index, goTo]);

  return (
    <div
      className="group relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured offers"
    >
      <div ref={track} className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain rounded-2xl md:rounded-3xl">
        {children}
      </div>

      {count > 1 && (
        <>
          <button type="button" onClick={() => goTo(index - 1)} aria-label="Previous slide"
            className="absolute left-3 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-text-dark opacity-0 shadow-card backdrop-blur transition-opacity group-hover:opacity-100 focus-visible:opacity-100 any-pointer-fine:flex">
            <FiChevronLeft size={22} />
          </button>
          <button type="button" onClick={() => goTo(index + 1)} aria-label="Next slide"
            className="absolute right-3 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-text-dark opacity-0 shadow-card backdrop-blur transition-opacity group-hover:opacity-100 focus-visible:opacity-100 any-pointer-fine:flex">
            <FiChevronRight size={22} />
          </button>
          <div className="mt-3 flex justify-center gap-1.5">
            {Array.from({ length: count }, (_, i) => (
              <button key={i} type="button" onClick={() => goTo(i)} aria-label={`Go to slide ${i + 1}`} aria-current={i === index}
                className="flex h-6 min-w-6 items-center justify-center">
                <span className={`block h-1.5 rounded-full transition-all duration-300 ${i === index ? "w-7 bg-primary-pink" : "w-1.5 bg-primary-pink/25"}`} />
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
