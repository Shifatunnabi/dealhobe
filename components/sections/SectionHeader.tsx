import type { ReactNode } from "react";

/**
 * Compact left-aligned section header shared by Top Categories, Trending
 * Products and For You — title left, optional control (arrows) right, and a
 * full-width rule underneath the whole row. `children` renders inline right
 * after the title (used by For You's tab row).
 */
export default function SectionHeader({
  title,
  right,
  children,
}: {
  title: string;
  right?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div data-home-reveal className="mb-4 md:mb-6">
      <div className="flex items-end justify-between gap-4">
        <div className="flex flex-wrap items-baseline gap-x-6 gap-y-2">
          <h2 className="section-title flex items-center gap-2.5">
            <span aria-hidden className="h-6 w-1.5 shrink-0 rounded-full bg-primary-pink md:h-7" />
            {title}
          </h2>
          {children}
        </div>
        {right && <div className="shrink-0">{right}</div>}
      </div>
    </div>
  );
}
