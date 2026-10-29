"use client";

import { useEffect, useState } from "react";

const pad = (n: number) => String(n).padStart(2, "0");

/** Flash-sale timer pill. Renders nothing once the deadline passes (and on the server, to avoid a hydration mismatch). */
export default function Countdown({ to }: { to: string }) {
  const [left, setLeft] = useState<number | null>(null);

  useEffect(() => {
    const end = new Date(to).getTime();
    const tick = () => setLeft(Math.max(0, end - Date.now()));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [to]);

  if (left === null || left <= 0) return null;
  const s = Math.floor(left / 1000);
  const parts = [
    [Math.floor(s / 86400), "d"],
    [Math.floor((s % 86400) / 3600), "h"],
    [Math.floor((s % 3600) / 60), "m"],
    [s % 60, "s"],
  ] as const;
  const shown = parts[0][0] > 0 ? parts : parts.slice(1);

  return (
    <span className="inline-flex shrink-0 items-center gap-1" aria-label="Time left">
      {shown.map(([v, u]) => (
        <span key={u} className="inline-flex min-w-9 items-baseline justify-center rounded-lg bg-plum px-1.5 py-1 font-mono text-sm font-bold tabular-nums text-white">
          {pad(v)}<span className="ml-0.5 text-[10px] font-medium text-gold">{u}</span>
        </span>
      ))}
    </span>
  );
}
