import Link from "next/link";
import { cn } from "@/lib/utils";

export type Crumb = { label: string; href?: string };

/** Storefront breadcrumb trail (matches the /products listing). Last crumb is the current page. */
export default function Breadcrumbs({ items, className, tone = "default" }: { items: Crumb[]; className?: string; tone?: "default" | "light" }) {
  const light = tone === "light";
  return (
    <nav aria-label="Breadcrumb" className={cn("text-xs md:text-sm", light ? "text-white/70" : "text-text-muted", className)}>
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((c, i) => {
          const last = i === items.length - 1;
          return (
            <li key={`${c.label}-${i}`} className="flex items-center gap-1.5">
              {i > 0 && <span aria-hidden>/</span>}
              {c.href && !last ? (
                <Link href={c.href} className={light ? "hover:text-white" : "hover:text-primary-pink"}>{c.label}</Link>
              ) : (
                <span aria-current={last ? "page" : undefined} className={cn("font-semibold", light ? "text-white" : "text-text-dark")}>{c.label}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
