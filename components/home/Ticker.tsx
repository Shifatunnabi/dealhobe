import Link from "next/link";

/**
 * Scrolling promise line. Plain live text moved by a CSS transform animation, so the browser's compositor draws it
 * at the screen's full refresh rate (a video of scrolling text steps at its own frame rate and judders) and the type
 * stays crisp at any size. Speed is constant (≈ 45 px/s) whatever the content length; it pauses on hover, keyboard
 * focus and for reduced-motion users (who get a static, wrapped line instead).
 */
const PX_PER_ITEM = 330;   // generous average width of one item incl. its separator
const SPEED = 45;          // px per second

export default function Ticker({ items, link, label }: { items: string[]; link?: string; label: string }) {
  const list = items.filter(Boolean);
  if (!list.length) return null;
  // The row is repeated so one copy always fills the viewport, then the whole track slides by exactly one copy.
  const reps = Math.max(2, Math.ceil(1900 / (list.length * PX_PER_ITEM)));
  const copy = Array.from({ length: reps }, () => list).flat();
  const duration = `${Math.max(20, Math.round((copy.length * PX_PER_ITEM) / SPEED))}s`;

  const row = (hidden: boolean) => (
    <ul className="flex shrink-0 items-center" aria-hidden={hidden || undefined}>
      {copy.map((t, i) => (
        <li key={i} className="flex items-center whitespace-nowrap">
          <span className="px-7 text-[12px] font-bold uppercase tracking-[0.14em] text-ivory md:px-9 md:text-[13px]">{t}</span>
          <span aria-hidden className="h-1.5 w-1.5 rotate-45 bg-gold" />
        </li>
      ))}
    </ul>
  );

  const body = (
    <div className="ticker group relative flex h-10 items-center overflow-hidden rounded-xl bg-plum md:h-11" style={{ "--ticker-dur": duration } as React.CSSProperties}>
      <div className="ticker-track flex w-max">{row(false)}{row(true)}</div>
      {/* edge fade so text slides in and out instead of being cut */}
      <span aria-hidden className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-plum to-transparent" />
      <span aria-hidden className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-plum to-transparent" />
    </div>
  );

  return link ? <Link href={link} aria-label={label} className="block">{body}</Link> : <div role="note" aria-label={label}>{body}</div>;
}
