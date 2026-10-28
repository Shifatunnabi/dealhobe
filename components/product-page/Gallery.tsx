"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { FiChevronLeft, FiChevronRight, FiMaximize2, FiX } from "react-icons/fi";
import ProductPhoto from "@/components/ui/ProductPhoto";
import { useScrollRow } from "@/components/ui/ScrollRow";
import { cn } from "@/lib/utils";

/**
 * Product gallery: a square, white, swipeable main image (native scroll-snap, so swiping costs no JS),
 * thumbnails (a column on desktop, a row on phones) and a full-screen viewer. Only the first photo
 * loads eagerly with high priority; the rest load lazily as they near the viewport.
 */
export default function Gallery({
  images,
  alt,
  focusIndex = -1,
  overlay,
}: {
  images: string[];
  alt: string;
  /** Scrolls to this photo whenever it changes (e.g. the chosen shade's photo); -1 = leave as is. */
  focusIndex?: number;
  /** Badges drawn over the main image. */
  overlay?: ReactNode;
}) {
  const track = useRef<HTMLDivElement>(null);
  // Thumbnail strip: horizontal at tablet width (mouse wheel scrolls it), vertical from lg.
  const { ref: thumbs } = useScrollRow<HTMLDivElement>();
  const frame = useRef(0);
  const [active, setActive] = useState(0);
  const [viewer, setViewer] = useState<number | null>(null);
  const many = images.length > 1;

  const go = useCallback((i: number, smooth = true) => {
    const el = track.current;
    if (!el) return;
    const n = images.length;
    const next = ((i % n) + n) % n;
    el.scrollTo({ left: next * el.clientWidth, behavior: smooth ? "smooth" : "auto" });
    setActive(next);
  }, [images.length]);

  // Follow the user's swipe.
  const onScroll = () => {
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      const el = track.current;
      if (!el || !el.clientWidth) return;
      setActive(Math.round(el.scrollLeft / el.clientWidth));
    });
  };
  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  // The scroll handler picks up the new active photo, so no state is set here.
  useEffect(() => {
    const el = track.current;
    if (el && focusIndex >= 0) el.scrollTo({ left: focusIndex * el.clientWidth, behavior: "smooth" });
  }, [focusIndex]);

  // Keep the active thumbnail visible inside its own strip (without scrolling the page).
  useEffect(() => {
    const strip = thumbs.current;
    const el = strip?.children[active] as HTMLElement | undefined;
    if (!strip || !el) return;
    const vertical = strip.scrollHeight > strip.clientHeight + 1;
    if (vertical) {
      const top = el.offsetTop - strip.offsetTop;
      if (top < strip.scrollTop || top + el.offsetHeight > strip.scrollTop + strip.clientHeight)
        strip.scrollTo({ top: top - strip.clientHeight / 2 + el.offsetHeight / 2, behavior: "smooth" });
    } else {
      const left = el.offsetLeft - strip.offsetLeft;
      if (left < strip.scrollLeft || left + el.offsetWidth > strip.scrollLeft + strip.clientWidth)
        strip.scrollTo({ left: left - strip.clientWidth / 2 + el.offsetWidth / 2, behavior: "smooth" });
    }
  }, [active, thumbs]);

  return (
    <div className="flex flex-col gap-3 lg:flex-row-reverse lg:items-start lg:gap-4">
      {/* Main image */}
      <div className="group relative aspect-square w-full min-w-0 overflow-hidden lg:flex-1 rounded-3xl border border-[#F1E7EB] bg-white shadow-tile">
        <div
          ref={track}
          onScroll={onScroll}
          className="flex h-full snap-x snap-mandatory overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          aria-roledescription="carousel"
          aria-label={`${alt} photos`}
        >
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setViewer(i)}
              className="relative h-full w-full shrink-0 snap-center cursor-zoom-in"
              aria-label={`Open photo ${i + 1} of ${images.length} full screen`}
            >
              <ProductPhoto
                src={src}
                alt={i === 0 ? alt : `${alt} – photo ${i + 1}`}
                requestWidth={1000}
                quality={100}
                loading={i === 0 ? "eager" : "lazy"}
                fetchPriority={i === 0 ? "high" : "low"}
                className="p-[6%]"
              />
            </button>
          ))}
        </div>

        {overlay}

        <button
          type="button"
          onClick={() => setViewer(active)}
          aria-label="Zoom photo"
          className="absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-full border border-[#EFE3E8] bg-white/90 text-text-dark shadow-tile backdrop-blur transition hover:border-primary-pink hover:text-primary-pink"
        >
          <FiMaximize2 size={16} />
        </button>

        {many && (
          <>
            <button
              type="button"
              onClick={() => go(active - 1)}
              aria-label="Previous photo"
              className="absolute left-3 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-[#EFE3E8] bg-white/95 text-text-dark opacity-0 shadow-tile transition hover:text-primary-pink group-hover:opacity-100 focus-visible:opacity-100 any-pointer-fine:flex"
            >
              <FiChevronLeft size={20} />
            </button>
            <button
              type="button"
              onClick={() => go(active + 1)}
              aria-label="Next photo"
              className="absolute right-3 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-[#EFE3E8] bg-white/95 text-text-dark opacity-0 shadow-tile transition hover:text-primary-pink group-hover:opacity-100 focus-visible:opacity-100 any-pointer-fine:flex"
            >
              <FiChevronRight size={20} />
            </button>
            {/* Phone: position dots */}
            <div className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-center gap-1.5 md:hidden" aria-hidden>
              {images.map((src, i) => (
                <span
                  key={src}
                  className={cn("h-1.5 rounded-full transition-all duration-300", i === active ? "w-5 bg-plum" : "w-1.5 bg-plum/20")}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Thumbnails (phones swipe and use the dots instead) */}
      {many && (
        <div
          ref={thumbs}
          className="hidden gap-2 overflow-x-auto px-0.5 py-0.5 md:flex [scrollbar-width:none] lg:max-h-[min(560px,calc(100vh-13rem))] lg:w-[76px] lg:shrink-0 lg:flex-col lg:overflow-y-auto lg:overflow-x-visible [&::-webkit-scrollbar]:hidden"
        >
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => go(i)}
              aria-label={`Show photo ${i + 1}`}
              aria-current={i === active}
              className={cn(
                "relative aspect-square w-16 shrink-0 overflow-hidden rounded-xl border bg-white transition-all duration-200 lg:w-full",
                i === active
                  ? "border-plum ring-1 ring-plum"
                  : "border-[#EFE3E8] opacity-70 hover:border-[#D9C4CD] hover:opacity-100",
              )}
            >
              <ProductPhoto src={src} alt="" requestWidth={160} className="p-1.5" />
            </button>
          ))}
        </div>
      )}

      {viewer !== null && (
        <Viewer images={images} alt={alt} start={viewer} onClose={(i) => { setViewer(null); go(i, false); }} />
      )}
    </div>
  );
}

/** Full-screen photo viewer: arrows, swipe, Esc to close. */
function Viewer({ images, alt, start, onClose }: { images: string[]; alt: string; start: number; onClose: (i: number) => void }) {
  const [i, setI] = useState(start);
  const touchX = useRef<number | null>(null);
  // Centred when the thumbnails fit; scrollable (wheel included) and never cut off when they don't.
  const { ref: viewerThumbs } = useScrollRow<HTMLDivElement>();
  const n = images.length;
  const step = useCallback((d: number) => setI((c) => (((c + d) % n) + n) % n), [n]);
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose(i);
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [i, onClose, step]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${alt} – photo ${i + 1} of ${n}`}
      className="fixed inset-0 z-[120] flex flex-col bg-white"
      onTouchStart={(e) => { touchX.current = e.touches[0].clientX; }}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
        touchX.current = null;
      }}
    >
      <div className="flex items-center justify-between px-4 py-3 md:px-6">
        <span className="text-sm font-semibold text-text-muted">{i + 1} / {n}</span>
        <button
          type="button"
          autoFocus
          onClick={() => onClose(i)}
          aria-label="Close"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-soft-bg text-text-dark hover:bg-blush"
        >
          <FiX size={20} />
        </button>
      </div>
      <div className="relative min-h-0 flex-1">
        <ProductPhoto key={images[i]} src={images[i]} alt={alt} requestWidth={1600} quality={100} loading="eager" className="p-4 md:p-10" />
        {n > 1 && (
          <>
            <button type="button" onClick={() => step(-1)} aria-label="Previous photo"
              className="absolute left-3 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-[#EFE3E8] bg-white text-text-dark shadow-tile hover:text-primary-pink md:left-8">
              <FiChevronLeft size={22} />
            </button>
            <button type="button" onClick={() => step(1)} aria-label="Next photo"
              className="absolute right-3 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-[#EFE3E8] bg-white text-text-dark shadow-tile hover:text-primary-pink md:right-8">
              <FiChevronRight size={22} />
            </button>
          </>
        )}
      </div>
      {n > 1 && (
        <div ref={viewerThumbs} className="flex justify-center-safe gap-2 overflow-x-auto px-4 py-3 [scrollbar-width:none]">
          {images.map((src, k) => (
            <button key={src} type="button" onClick={() => setI(k)} aria-label={`Show photo ${k + 1}`}
              className={cn("relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border bg-white", k === i ? "border-plum ring-1 ring-plum" : "border-[#EFE3E8] opacity-70")}>
              <ProductPhoto src={src} alt="" requestWidth={160} className="p-1" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
