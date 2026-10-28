"use client";

import { useEffect, useState } from "react";

const TYPE_MS = 55;   // per letter typed
const ERASE_MS = 28;  // per letter erased
const HOLD_MS = 1300; // full term stays visible
const GAP_MS = 250;   // empty pause before the next term

/**
 * "Search for <term>" where each term is typed out, held, then erased letter by letter (terms come from
 * Admin › Homepage Builder › Storefront). Purely visual: it sits behind an empty input / inside the
 * search button and is hidden from screen readers, which get the static `label` instead.
 */
export default function AnimatedPlaceholder({ terms, prefix = "Search for", label = "Search products", className = "" }: {
  terms: string[]; prefix?: string; label?: string; className?: string;
}) {
  const [index, setIndex] = useState(0);
  const [shown, setShown] = useState(0);        // letters currently visible
  const [erasing, setErasing] = useState(false);
  const [still, setStill] = useState(false);    // reduced motion: show whole terms, no typing

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setStill(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const term = terms.length ? terms[index % terms.length] : "";

  useEffect(() => {
    if (!term || still) return;
    let delay: number;
    let step: () => void;
    if (!erasing && shown < term.length) {
      delay = TYPE_MS; step = () => setShown((n) => n + 1);
    } else if (!erasing) {
      delay = HOLD_MS; step = () => setErasing(true);
    } else if (shown > 0) {
      delay = ERASE_MS; step = () => setShown((n) => n - 1);
    } else {
      delay = GAP_MS; step = () => { setErasing(false); setIndex((n) => (n + 1) % terms.length); };
    }
    const id = window.setTimeout(() => { if (!document.hidden) step(); else setShown(term.length); }, delay);
    return () => window.clearTimeout(id);
  }, [term, shown, erasing, still, terms.length]);

  if (!terms.length) return <span className={className}>{label}…</span>;
  const text = still ? term : term.slice(0, shown);
  return (
    <span className={`pointer-events-none inline-flex min-w-0 items-center gap-1 overflow-hidden whitespace-nowrap ${className}`}>
      <span className="sr-only">{label}</span>
      <span aria-hidden className="shrink-0">{prefix}</span>
      <span aria-hidden className="min-w-0 truncate font-semibold text-primary-pink">
        {text}
        {!still && <span className="typing-caret" />}
      </span>
    </span>
  );
}
