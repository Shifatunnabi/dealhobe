"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/** "On this page" list that highlights the section currently being read. */
export default function TocNav({ sections }: { sections: { id: string; title: string }[] }) {
  const [active, setActive] = useState(sections[0]?.id ?? "");

  useEffect(() => {
    const els = sections.map((s) => document.getElementById(s.id)).filter((el): el is HTMLElement => Boolean(el));
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      // The fixed header is 144px tall; treat the band just below it as "being read".
      { rootMargin: "-160px 0px -55% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [sections]);

  return (
    <ol className="flex flex-col border-l border-[#EADDE3]">
      {sections.map((s, i) => (
        <li key={s.id}>
          <a
            href={`#${s.id}`}
            aria-current={active === s.id ? "location" : undefined}
            className={cn(
              "-ml-px flex gap-3 border-l-2 py-2 pl-4 text-sm leading-snug transition-colors",
              active === s.id ? "border-primary-pink font-semibold text-text-dark" : "border-transparent text-text-muted hover:text-text-dark",
            )}
          >
            <span className={cn("tabular-nums text-xs font-bold", active === s.id ? "text-primary-pink" : "text-[#B9A9B2]")}>{String(i + 1).padStart(2, "0")}</span>
            {s.title}
          </a>
        </li>
      ))}
    </ol>
  );
}
