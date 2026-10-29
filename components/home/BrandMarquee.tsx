"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import type { PlainBrand } from "@/lib/data";
import { ScrollArrows, useScrollRow } from "@/components/ui/ScrollRow";

/**
 * Cloudinary logos are re-cut into one uniform 2:1 tile: trimmed of their own empty margin, scaled to the same
 * visual weight, and padded with a colour sampled from the logo's own border — so white-background logos sit on
 * white, and logos drawn on black (Fennel, ColorMe) become clean dark tiles instead of black boxes on white cards.
 * Anything else (local files, other hosts) falls back to the original, centred with padding.
 */
function tile(url: string): { src: string; uniform: boolean } {
  const m = /^(https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/)(?!.*[,/](?:c_lpad|c_pad|c_fit)[,/])(.+)$/.exec(url);
  if (!m) return { src: url, uniform: false };
  return { src: `${m[1]}e_trim:12/c_fit,w_370,h_156/c_lpad,w_520,h_260,b_auto:border/f_auto,q_auto/${m[2]}`, uniform: true };
}

const SPEED = 28;        // px per second of idle drift
const IDLE_MS = 2500;    // drift resumes this long after the last touch / wheel / key / arrow
const COPIES = 3;        // the brand list is repeated so the row can wrap around invisibly

/**
 * A real horizontally scrolling row of brand tiles: swipe, trackpad, mouse wheel, arrow buttons and keyboard all
 * work (components/ui/ScrollRow), and it loops endlessly in either direction. When nobody is interacting it also
 * drifts slowly on its own — pausing on hover, focus, touch and scroll, when off-screen, and for reduced-motion users.
 */
export default function BrandMarquee({ brands }: { brands: PlainBrand[] }) {
  const { ref, edges, scrollPage } = useScrollRow<HTMLDivElement>();
  const last = useRef(0);   // timestamp of the last user interaction
  const hovered = useRef(false);

  const loop = Array.from({ length: COPIES }, () => brands).flat();

  useEffect(() => {
    const el = ref.current;
    if (!el || !brands.length) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let copyW = el.scrollWidth / COPIES;               // cached: reading scrollWidth every frame forces layout
    const oneCopy = () => copyW;
    const ro = new ResizeObserver(() => { copyW = el.scrollWidth / COPIES; });
    ro.observe(el);
    el.scrollLeft = oneCopy();                       // start in the middle copy so both directions have room

    const touch = () => { last.current = performance.now(); };
    // Jump by exactly one copy: looks identical and never runs out of row. Done once scrolling settles, so it never
    // interrupts a smooth scroll or a swipe's momentum; the hard-edge check is only a safety net.
    let settle: number | undefined;
    const wrap = () => {
      const w = oneCopy();
      if (el.scrollLeft < w * 0.5) el.scrollLeft += w;
      else if (el.scrollLeft > w * 1.5) el.scrollLeft -= w;
    };
    const onScroll = () => {
      window.clearTimeout(settle);
      settle = window.setTimeout(wrap, 160);
      if (el.scrollLeft < 2 || el.scrollLeft > el.scrollWidth - el.clientWidth - 2) wrap();
    };
    const events: [keyof HTMLElementEventMap, () => void][] = [["wheel", touch], ["touchstart", touch], ["pointerdown", touch], ["keydown", touch], ["scroll", onScroll]];
    events.forEach(([n, f]) => el.addEventListener(n, f, { passive: true }));
    const enter = () => { hovered.current = true; };
    const leave = () => { hovered.current = false; };
    el.addEventListener("mouseenter", enter); el.addEventListener("mouseleave", leave);

    let visible = false;
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0.1 });
    io.observe(el);

    // `pos` keeps sub-pixel precision (scrollLeft itself rounds); `set` is what the browser actually holds after our write,
    // so any later difference means someone else moved the row and we continue from there.
    let raf = 0, prev = performance.now(), pos = el.scrollLeft, set = el.scrollLeft;
    const tick = (now: number) => {
      const dt = Math.min(64, now - prev); prev = now;
      if (!visible || document.hidden) { raf = requestAnimationFrame(tick); return; }   // off-screen: no layout reads at all
      const idle = now - last.current > IDLE_MS && !hovered.current && !el.contains(document.activeElement) && visible && !document.hidden && !reduced;
      if (Math.abs(el.scrollLeft - set) > 1.5) pos = el.scrollLeft;
      if (idle) {
        pos += (SPEED * dt) / 1000;
        const w = oneCopy();
        if (pos > w * 1.5) pos -= w;                                  // seamless wrap while drifting
        el.scrollLeft = pos;
        set = el.scrollLeft;
      } else {
        pos = set = el.scrollLeft;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf); window.clearTimeout(settle); io.disconnect(); ro.disconnect();
      events.forEach(([n, f]) => el.removeEventListener(n, f));
      el.removeEventListener("mouseenter", enter); el.removeEventListener("mouseleave", leave);
    };
  }, [brands.length, ref]);

  if (!brands.length) return null;
  return (
    <div className="relative -my-3 py-3">
      <div
        ref={ref}
        className="no-scrollbar flex gap-3 overflow-x-auto overscroll-x-contain py-1 [mask-image:linear-gradient(90deg,transparent,#000_5%,#000_95%,transparent)] md:gap-4"
        role="region"
        aria-label="Brands"
      >
        {loop.map((b, i) => {
          const t = tile(b.logoUrl);
          const dup = i >= brands.length * (COPIES - 1) || i < brands.length;   // only the middle copy is exposed to assistive tech and tab order
          return (
            <Link
              key={`${i}-${b._id}`}
              href={`/products?brand=${encodeURIComponent(b.name)}`}
              aria-hidden={dup || undefined}
              tabIndex={dup ? -1 : undefined}
              className="relative block aspect-[2/1] w-40 shrink-0 overflow-hidden rounded-2xl border border-black/[0.06] bg-white shadow-tile transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[0_14px_30px_rgba(59,13,46,0.16)] md:w-56"
              title={b.name}
            >
              <Image
                src={t.src}
                alt={dup ? "" : b.name}
                fill
                unoptimized
                // Tiny files, and a clipped scrolling row would otherwise pop lazy images in late.
                loading="eager"
                sizes="(min-width: 768px) 224px, 160px"
                className={t.uniform ? "object-cover" : "object-contain p-5"}
                draggable={false}
              />
            </Link>
          );
        })}
      </div>
      <ScrollArrows edges={edges} onScroll={(d) => { last.current = performance.now(); scrollPage(d); }} label="brands" leftClassName="left-1 md:-left-3" rightClassName="right-1 md:-right-3" />
    </div>
  );
}
