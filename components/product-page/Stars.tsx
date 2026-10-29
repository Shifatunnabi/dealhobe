/** Five stars filled to `value` (0–5). Decorative: pair it with a text rating for screen readers. */
export default function Stars({ value, className = "text-sm" }: { value: number; className?: string }) {
  const pct = Math.max(0, Math.min(100, (value / 5) * 100));
  return (
    <span className={`relative inline-block leading-none tracking-[2px] ${className}`} aria-hidden>
      <span className="text-[#E8D9C7]">★★★★★</span>
      <span className="absolute inset-0 overflow-hidden whitespace-nowrap text-[#E8A317]" style={{ width: `${pct}%` }}>
        ★★★★★
      </span>
    </span>
  );
}
