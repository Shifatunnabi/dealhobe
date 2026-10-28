import Link from "next/link";
import Image from "next/image";
import type { PlainBrand } from "@/lib/data";

/**
 * Endlessly scrolling row of brand logos (pure CSS, pauses on hover and keyboard focus). Logos sit in fixed 2:1 cards
 * with object-contain, so any logo shape keeps its proportions.
 */
export default function BrandMarquee({ brands }: { brands: PlainBrand[] }) {
  const loop = brands.length < 8 ? [...brands, ...brands, ...brands] : brands;
  const duration = `${Math.max(20, loop.length * 3)}s`;
  return (
    <div className="group relative -my-3 overflow-hidden py-3 [mask-image:linear-gradient(90deg,transparent,#000_6%,#000_94%,transparent)]">
      <ul className="marquee-track flex w-max gap-3 md:gap-4" style={{ "--marquee-dur": duration } as React.CSSProperties}>
        {[0, 1].map((copy) => loop.map((b, i) => (
          <li key={`${copy}-${b._id}-${i}`} aria-hidden={copy === 1 || undefined}>
            <Link
              href={`/products?brand=${encodeURIComponent(b._id)}`}
              tabIndex={copy === 1 ? -1 : undefined}
              className="relative block aspect-[2/1] w-32 overflow-hidden rounded-xl border border-black/5 bg-white shadow-tile transition-transform hover:-translate-y-0.5 md:w-44"
              title={b.name}
            >
              <Image src={b.logoUrl} alt={b.name} fill sizes="176px" className="object-contain p-3" />
            </Link>
          </li>
        )))}
      </ul>
    </div>
  );
}
