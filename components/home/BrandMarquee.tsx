import Link from "next/link";
import Image from "next/image";
import type { PlainBrand } from "@/lib/data";

/**
 * Cloudinary logos are re-cut into one uniform 2:1 tile: trimmed of their own empty margin, scaled to the same
 * visual weight, and padded with a colour sampled from the logo's own border — so white-background logos sit on
 * white, and logos drawn on black (Fennel, ColorMe) become clean dark tiles instead of black boxes on white cards.
 * Anything else (local files, other hosts) falls back to the original, centred with padding.
 */
function tile(url: string): { src: string; uniform: boolean } {
  const m = /^(https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/)(?!.*[,/](?:c_lpad|c_pad|c_fit)[,/])(.+)$/.exec(url);
  if (!m) return { src: url, uniform: false };
  return { src: `${m[1]}e_trim:12/c_fit,w_370,h_156/c_lpad,w_520,h_260,b_auto:border/f_auto,q_auto/${m[2]}`, uniform: true };
}

/**
 * Endlessly scrolling row of brand tiles (pure CSS, pauses on hover and keyboard focus). Every tile has the same
 * 2:1 shape, so any logo keeps its proportions and the row reads as one calm, even band.
 */
export default function BrandMarquee({ brands }: { brands: PlainBrand[] }) {
  const loop = brands.length < 8 ? [...brands, ...brands, ...brands] : brands;
  const duration = `${Math.max(24, loop.length * 4)}s`;
  return (
    <div className="group relative -my-3 overflow-hidden py-3 [mask-image:linear-gradient(90deg,transparent,#000_6%,#000_94%,transparent)]">
      <ul className="marquee-track flex w-max gap-3 md:gap-4" style={{ "--marquee-dur": duration } as React.CSSProperties}>
        {[0, 1].map((copy) => loop.map((b, i) => {
          const t = tile(b.logoUrl);
          return (
            <li key={`${copy}-${b._id}-${i}`} aria-hidden={copy === 1 || undefined}>
              <Link
                href={`/products?brand=${encodeURIComponent(b.name)}`}
                tabIndex={copy === 1 ? -1 : undefined}
                className="relative block aspect-[2/1] w-40 overflow-hidden rounded-2xl border border-black/[0.06] bg-white shadow-tile transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[0_14px_30px_rgba(59,13,46,0.16)] md:w-56"
                title={b.name}
              >
                <Image
                  src={t.src}
                  alt={b.name}
                  fill
                  unoptimized
                  // Tiny files, but the marquee clips off-screen tiles so lazy loading would pop them in late.
                  loading="eager"
                  sizes="(min-width: 768px) 224px, 160px"
                  className={t.uniform ? "object-cover" : "object-contain p-5"}
                />
              </Link>
            </li>
          );
        }))}
      </ul>
    </div>
  );
}
