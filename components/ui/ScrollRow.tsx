"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

/*
 * Horizontal scrolling that works on every kind of device:
 *  - touch (phones, tablets): native swipe, nothing to do;
 *  - trackpads: native two-finger horizontal scroll;
 *  - mouse: a plain vertical wheel scrolls the row sideways while it can still move (then the page
 *    scrolls as usual), and arrow buttons appear whenever a mouse is present (`any-pointer-fine`,
 *    at any screen width) and there is more content off that edge — scrollbars are hidden site-wide;
 *  - keyboard: Tab into a link/button inside and the browser scrolls it into view; the row itself is
 *    focusable when it has nothing focusable inside, so ←/→ scroll it.
 */

type Edges = { left: boolean; right: boolean };

export function useScrollRow<T extends HTMLElement = HTMLDivElement>({ wheel = true }: { wheel?: boolean } = {}) {
  const ref = useRef<T>(null);
  const [edges, setEdges] = useState<Edges>({ left: false, right: false });

  const measure = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const left = el.scrollLeft > 2;
    const right = el.scrollLeft + el.clientWidth < el.scrollWidth - 2;
    setEdges((prev) => (prev.left === left && prev.right === right ? prev : { left, right }));
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    measure();
    // Re-measure when the row or its items change size (images loading, items added, breakpoints).
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    Array.from(el.children).forEach((c) => ro.observe(c));
    const mo = new MutationObserver(() => { Array.from(el.children).forEach((c) => ro.observe(c)); measure(); });
    mo.observe(el, { childList: true });

    const onWheel = (e: WheelEvent) => {
      // Trackpads send horizontal deltas themselves; only translate a vertical (mouse) wheel.
      if (e.ctrlKey || Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
      const max = el.scrollWidth - el.clientWidth;
      if (max <= 0) return;
      const delta = e.deltaMode === 1 ? e.deltaY * 32 : e.deltaY;
      if ((delta > 0 && el.scrollLeft < max - 1) || (delta < 0 && el.scrollLeft > 0)) {
        e.preventDefault();
        el.scrollLeft += delta;
      }
    };
    el.addEventListener("scroll", measure, { passive: true });
    if (wheel) el.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      ro.disconnect();
      mo.disconnect();
      el.removeEventListener("scroll", measure);
      el.removeEventListener("wheel", onWheel);
    };
  }, [measure, wheel]);

  const scrollPage = useCallback((dir: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({ left: dir * Math.max(120, el.clientWidth * 0.85), behavior: smooth ? "smooth" : "auto" });
  }, []);

  return { ref, edges, scrollPage };
}

/** Prev/next buttons for a scroll row; shown only to mouse users, only when there is more that way. */
export function ScrollArrows({ edges, onScroll, label = "items", size = "md", className = "", leftClassName = "left-1", rightClassName = "right-1" }: {
  edges: Edges;
  onScroll: (dir: 1 | -1) => void;
  label?: string;
  size?: "sm" | "md";
  className?: string;
  leftClassName?: string;
  rightClassName?: string;
}) {
  const dims = size === "sm" ? "h-8 w-8" : "h-10 w-10";
  const base = `absolute top-1/2 z-10 hidden -translate-y-1/2 items-center justify-center rounded-full border border-black/10 bg-white text-text-dark shadow-card transition-colors hover:text-primary-pink any-pointer-fine:flex ${dims} ${className}`;
  return (
    <>
      {edges.left && (
        <button type="button" onClick={() => onScroll(-1)} aria-label={`Scroll ${label} left`} className={`${base} ${leftClassName}`}>
          <FiChevronLeft size={size === "sm" ? 16 : 20} />
        </button>
      )}
      {edges.right && (
        <button type="button" onClick={() => onScroll(1)} aria-label={`Scroll ${label} right`} className={`${base} ${rightClassName}`}>
          <FiChevronRight size={size === "sm" ? 16 : 20} />
        </button>
      )}
    </>
  );
}

/**
 * Drop-in horizontally scrolling row. `trackClassName` styles the scrolling element (flex, gap, padding…);
 * the outer wrapper is `relative` so the arrows can sit over the row's edges.
 */
export default function ScrollRow({
  children, label, className = "", trackClassName = "", trackStyle, arrows = true, arrowSize = "md",
  leftClassName, rightClassName, focusable = false, wheel = true, role, trackLabel, ...rest
}: {
  children: ReactNode;
  /** Accessible name, e.g. "product suggestions". */
  label: string;
  className?: string;
  trackClassName?: string;
  trackStyle?: CSSProperties;
  arrows?: boolean;
  arrowSize?: "sm" | "md";
  leftClassName?: string;
  rightClassName?: string;
  /** Make the row itself a keyboard stop (use when its items aren't focusable). */
  focusable?: boolean;
  wheel?: boolean;
  /** ARIA role and name for the scrolling element itself (e.g. "tablist", "group"). */
  role?: string;
  trackLabel?: string;
} & Record<`data-${string}`, string | undefined>) {
  const { ref, edges, scrollPage } = useScrollRow<HTMLDivElement>({ wheel });
  return (
    <div className={`relative ${className}`}>
      <div ref={ref} className={trackClassName} style={trackStyle} {...rest}
        {...(focusable ? { tabIndex: 0, role: role ?? "region", "aria-label": trackLabel ?? label } : role ? { role, "aria-label": trackLabel } : {})}>
        {children}
      </div>
      {arrows && <ScrollArrows edges={edges} onScroll={scrollPage} label={label} size={arrowSize} leftClassName={leftClassName} rightClassName={rightClassName} />}
    </div>
  );
}
