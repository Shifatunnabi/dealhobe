"use client";

import { useEffect, useState } from "react";

/**
 * "Search for <term>" where the term slides up and rotates every few seconds (terms come from
 * Admin › Homepage Builder › Storefront). Purely visual: it sits behind an empty input / inside the
 * search button and is hidden from screen readers, which get the static `label` instead.
 */
export default function AnimatedPlaceholder({ terms, prefix = "Search for", label = "Search products", className = "" }: {
  terms: string[]; prefix?: string; label?: string; className?: string;
}) {
  const [i, setI] = useState(0);

  useEffect(() => {
    if (terms.length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => { if (!document.hidden) setI((n) => (n + 1) % terms.length); }, 2600);
    return () => window.clearInterval(id);
  }, [terms.length]);

  if (!terms.length) return <span className={className}>{label}…</span>;
  const term = terms[i % terms.length];
  return (
    <span className={`pointer-events-none inline-flex min-w-0 items-center gap-1 overflow-hidden whitespace-nowrap ${className}`}>
      <span className="sr-only">{label}</span>
      <span aria-hidden className="shrink-0">{prefix}</span>
      <span aria-hidden className="relative block h-[1.4em] min-w-0 flex-1 overflow-hidden">
        <span key={term} className="search-term-in block truncate font-semibold text-primary-pink">“{term}”</span>
      </span>
    </span>
  );
}
