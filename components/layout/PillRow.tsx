"use client";

import Link from "next/link";
import { ScrollArrows, useScrollRow } from "@/components/ui/ScrollRow";
import type { NavPill } from "@/lib/homepage/types";

/** White or near-black text, whichever reads better on the admin-chosen pill colour (WCAG contrast). */
function textOn(hex: string): string {
  const m = /^#?([\da-f]{6})$/i.exec(hex.trim());
  if (!m) return "#fff";
  const [r, g, b] = [0, 2, 4].map((i) => {
    const c = parseInt(m[1].slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  const onWhite = 1.05 / (lum + 0.05);
  const onDark = (lum + 0.05) / 0.0596; // #24121F has relative luminance ≈ 0.0096
  return onWhite >= onDark ? "#fff" : "#24121F";
}

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
            className="shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wide transition-transform hover:-translate-y-0.5 md:text-[13px]"
            style={{ backgroundColor: pill.color, color: textOn(pill.color) }}
          >
            {pill.label}
          </Link>
        ))}
      </div>
      <ScrollArrows edges={edges} onScroll={scrollPage} label="category links" size="sm" leftClassName="left-2" rightClassName="right-2" />
    </div>
  );
}
