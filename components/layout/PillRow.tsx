"use client";

import Link from "next/link";
import { ScrollArrows, useScrollRow } from "@/components/ui/ScrollRow";
import type { NavPill } from "@/lib/homepage/types";

/**
 * Colourful category links under the search bar. Scrolls by swipe, trackpad, mouse wheel or arrow buttons
 * (see components/ui/ScrollRow).
 */
export default function PillRow({ pills }: { pills: NavPill[] }) {
  const { ref, edges, scrollPage } = useScrollRow<HTMLDivElement>();
  const mask = `linear-gradient(90deg, ${edges.left ? "transparent, #000 48px" : "#000"}, ${edges.right ? "#000 calc(100% - 48px), transparent" : "#000"})`;

  return (
    <div className="shell relative flex h-full items-center">
      <div ref={ref} className="no-scrollbar flex h-full w-full items-center gap-2 overflow-x-auto scroll-smooth" style={{ maskImage: mask, WebkitMaskImage: mask }}>
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
      <ScrollArrows edges={edges} onScroll={scrollPage} label="category links" size="sm" leftClassName="left-2" rightClassName="right-2" />
    </div>
  );
}
