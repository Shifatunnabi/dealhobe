import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";

/** Centered display-serif heading with a short accent rule, plus an optional "View all" link. */
export default function SectionHeading({
  title, subtitle, accent = "#A41B15", viewAll, children,
}: { title: string; subtitle?: string; accent?: string; viewAll?: string; children?: React.ReactNode }) {
  if (!title && !children) return null;
  return (
    <div className="mb-4 flex items-end justify-between gap-3 md:mb-6" data-home-reveal>
      <div className="min-w-0">
        <div className="flex items-center gap-2.5">
          <span aria-hidden className="h-6 w-1.5 shrink-0 rounded-full md:h-7" style={{ background: accent }} />
          <h2 className="section-title truncate">{title}</h2>
          {children}
        </div>
        {subtitle && <p className="mt-1 pl-4 text-sm text-text-muted">{subtitle}</p>}
      </div>
      {viewAll && (
        <Link
          href={viewAll}
          className="group inline-flex shrink-0 items-center gap-1.5 rounded-full border border-text-dark/10 bg-white px-3.5 py-1.5 text-xs font-semibold text-text-dark transition-colors hover:border-primary-pink hover:text-primary-pink md:text-sm"
        >
          View all
          <FiArrowRight className="transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  );
}
