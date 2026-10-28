"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import type { NavPill } from "@/lib/homepage/types";

/**
 * Colourful category links under the search bar. Phones swipe; on desktop the row also scrolls with the
 * mouse wheel and shows arrow buttons whenever links are hidden off either edge.
 */
export default function PillRow({ pills }: { pills: NavPill[] }) {
  const track = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ left: false, right: false });

  const measure = useCallback(() => {
    const el = track.current;
    if (!el) return;
    setEdges({ left: el.scrollLeft > 4, right: el.scrollLeft + el.clientWidth < el.scrollWidth - 4 });
  }, []);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    // Vertical wheel → horizontal scroll, but only while the row can still move that way (page scroll otherwise).
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
      const max = el.scrollWidth - el.clientWidth;
      if ((e.deltaY > 0 && el.scrollLeft < max) || (e.deltaY < 0 && el.scrollLeft > 0)) {
        e.preventDefault();
        el.scrollLeft += e.deltaY;
      }
    };
    el.addEventListener("scroll", measure, { passive: true });
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => { ro.disconnect(); el.removeEventListener("scroll", measure); el.removeEventListener("wheel", onWheel); };
  }, [measure]);

  const nudge = (dir: 1 | -1) => track.current?.scrollBy({ left: dir * track.current.clientWidth * 0.7, behavior: "smooth" });
  const mask = `linear-gradient(90deg, ${edges.left ? "transparent, #000 48px" : "#000"}, ${edges.right ? "#000 calc(100% - 48px), transparent" : "#000"})`;

  return (
    <div className="shell relative flex h-full items-center">
      {edges.left && (
        <button type="button" onClick={() => nudge(-1)} aria-label="Scroll links left"
          className="absolute left-2 z-10 hidden h-8 w-8 items-center justify-center rounded-full border border-black/10 bg-white text-text-dark shadow-card transition-colors hover:text-primary-pink md:flex">
          <FiChevronLeft size={16} />
        </button>
      )}
      <div ref={track} className="no-scrollbar flex h-full w-full items-center gap-2 overflow-x-auto scroll-smooth" style={{ maskImage: mask, WebkitMaskImage: mask }}>
        {pills.map((pill) => (
          <Link
            key={pill.label + pill.link}
            href={pill.link}
            className="shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wide text-white transition-transform hover:-translate-y-0.5 md:text-[13px]"
            style={{ backgroundColor: pill.color }}
          >
            {pill.label}
          </Link>
        ))}
      </div>
      {edges.right && (
        <button type="button" onClick={() => nudge(1)} aria-label="Scroll links right"
          className="absolute right-2 z-10 hidden h-8 w-8 items-center justify-center rounded-full border border-black/10 bg-white text-text-dark shadow-card transition-colors hover:text-primary-pink md:flex">
          <FiChevronRight size={16} />
        </button>
      )}
    </div>
  );
}
