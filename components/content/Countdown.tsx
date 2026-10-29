"use client";

import { useSyncExternalStore } from "react";
import { FiClock } from "react-icons/fi";
import { cn } from "@/lib/utils";

/* One shared 1-second clock for every countdown on the page (no per-card timers, no setState in effects). */
let now = Date.now();
let timer: ReturnType<typeof setInterval> | undefined;
const listeners = new Set<() => void>();

function subscribe(cb: () => void) {
  listeners.add(cb);
  now = Date.now();
  if (!timer) {
    timer = setInterval(() => {
      now = Date.now();
      listeners.forEach((l) => l());
    }, 1000);
  }
  return () => {
    listeners.delete(cb);
    if (!listeners.size && timer) {
      clearInterval(timer);
      timer = undefined;
    }
  };
}

/** Current time on the client, `null` during SSR/hydration so server and client markup match. */
export function useNow(): number | null {
  return useSyncExternalStore(subscribe, () => now, () => null);
}

const pad = (n: number) => String(n).padStart(2, "0");

/** "Ends in 2d 04h 12m" style countdown. Shows the end date when it's far away; turns urgent under 24h. */
export default function Countdown({ endsAt, className, tone = "default" }: { endsAt: string; className?: string; tone?: "default" | "light" }) {
  const t = useNow();
  const end = new Date(endsAt).getTime();
  if (Number.isNaN(end)) return null;

  const dateLabel = new Date(end).toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "Asia/Dhaka" });
  const light = tone === "light";

  // Before hydration: a stable, non-ticking label.
  if (t === null) {
    return (
      <span className={cn("inline-flex items-center gap-1.5 text-xs font-semibold", light ? "text-white/85" : "text-text-muted", className)}>
        <FiClock size={13} aria-hidden /> Ends {dateLabel}
      </span>
    );
  }

  const left = end - t;
  if (left <= 0) {
    return (
      <span className={cn("inline-flex items-center gap-1.5 text-xs font-semibold", light ? "text-white/70" : "text-text-muted", className)}>
        <FiClock size={13} aria-hidden /> Offer ended
      </span>
    );
  }

  const d = Math.floor(left / 86_400_000);
  const h = Math.floor((left % 86_400_000) / 3_600_000);
  const m = Math.floor((left % 3_600_000) / 60_000);
  const s = Math.floor((left % 60_000) / 1000);
  const urgent = left < 86_400_000;

  if (d > 14) {
    return (
      <span className={cn("inline-flex items-center gap-1.5 text-xs font-semibold", light ? "text-white/85" : "text-text-muted", className)}>
        <FiClock size={13} aria-hidden /> Ends {dateLabel}
      </span>
    );
  }

  const units: [number, string][] = d > 0 ? [[d, "d"], [h, "h"], [m, "m"]] : [[h, "h"], [m, "m"], [s, "s"]];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 text-xs font-semibold",
        urgent ? (light ? "text-[#FFD9A8]" : "text-primary-pink") : light ? "text-white/85" : "text-text-dark",
        className,
      )}
      aria-label={`Offer ends in ${d ? `${d} days ` : ""}${h} hours ${m} minutes`}
    >
      <FiClock size={13} aria-hidden className={urgent ? "animate-pulse" : undefined} />
      <span aria-hidden>Ends in</span>
      <span aria-hidden className="flex items-center gap-1 tabular-nums">
        {units.map(([v, u]) => (
          <span key={u} className={cn("rounded-md px-1.5 py-0.5 text-[11px] font-extrabold", light ? "bg-white/15" : urgent ? "bg-primary-pink/10" : "bg-plum/[0.06]")}>
            {u === "d" ? v : pad(v)}{u}
          </span>
        ))}
      </span>
    </span>
  );
}
