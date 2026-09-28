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
    <div data-home-reveal className="mb-6 md:mb-8">
      <div className="flex items-end justify-between gap-4">
        <div className="flex flex-wrap items-baseline gap-x-6 gap-y-2">
          <h2 className="relative inline-block pb-2 font-poppins text-xl font-extrabold uppercase tracking-wide text-text-dark md:text-3xl">
            {title}
            <span className="absolute bottom-0 left-0 h-0.5 w-full rounded-full bg-primary-pink" />
          </h2>
          {children}
        </div>
        {right && <div className="shrink-0 pb-2">{right}</div>}
      </div>
      <div className="h-px w-full bg-gray-200" />
    </div>
  );
}
