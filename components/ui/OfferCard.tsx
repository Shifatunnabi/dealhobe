"use client";

import Link from "next/link";
import Image from "next/image";
import { FiArrowRight } from "react-icons/fi";
import Countdown from "@/components/content/Countdown";
import { cn } from "@/lib/utils";

export function offerDiscountLabel(type?: "percentage" | "flat", amount?: number) {
  const n = Number(amount) || 0;
  if (n <= 0) return "";
  return type === "flat" ? `৳${Math.round(n).toLocaleString("en-IN")} off` : `${n}% off`;
}

/**
 * Offer card: photo with a discount seal, title, details, an end-date countdown and a strong CTA to
 * /products/<slug>. Used on /offers and the homepage promotions section.
 */
export default function OfferCard({
  title,
  slug,
  image,
  blurb,
  index,
  isClosed,
  discountType,
  discountAmount,
  endingDate,
  priority = false,
}: {
  title: string;
  slug: string;
  image: string;
  blurb: string;
  index: number;
  isClosed: boolean;
  /** Kept for API compatibility; entrance animation is CSS-free now (cards render instantly). */
  animateEntrance?: boolean;
  discountType?: "percentage" | "flat";
  discountAmount?: number;
  endingDate?: string | null;
  priority?: boolean;
}) {
  const discount = offerDiscountLabel(discountType, discountAmount);
  const href = isClosed ? "/products" : `/products/${slug}`;

  return (
    <article
      className={cn(
        "group relative grid overflow-hidden rounded-[22px] border bg-white shadow-tile transition-[box-shadow,transform] duration-300 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]",
        isClosed ? "border-[#EFE3E8]" : "border-[#EFE3E8] hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(59,13,46,0.12)]",
      )}
      data-index={index}
    >
      <Link href={href} tabIndex={-1} aria-hidden className="relative block aspect-[16/9] overflow-hidden bg-ivory md:aspect-auto md:min-h-[240px]">
        {image ? (
          <Image
            src={image}
            alt=""
            fill
            priority={priority}
            className={cn("object-cover transition-transform duration-700 group-hover:scale-[1.04]", isClosed && "grayscale-[60%] opacity-80")}
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 45vw, 560px"
          />
        ) : null}
        {discount && (
          <span
            className={cn(
              "absolute left-3 top-3 flex h-[72px] w-[72px] flex-col items-center justify-center rounded-full text-center leading-none shadow-[0_6px_18px_rgba(59,13,46,0.28)] md:left-4 md:top-4 md:h-20 md:w-20",
              isClosed ? "bg-white/90 text-text-muted" : "bg-plum text-white ring-2 ring-gold/70 ring-offset-2 ring-offset-plum",
            )}
          >
            <span className="font-display text-[1.35rem] font-semibold md:text-[1.6rem]">{discount.split(" ")[0]}</span>
            <span className={cn("mt-0.5 text-[10px] font-bold uppercase tracking-[0.18em]", !isClosed && "text-gold")}>off</span>
          </span>
        )}
        {isClosed && (
          <span className="absolute right-3 top-3 rounded-full bg-white/90 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-text-muted">
            Ended
          </span>
        )}
      </Link>

      <div className="flex flex-col p-5 md:p-7">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          {!isClosed && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-pink/[0.07] px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-primary-pink">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary-pink" aria-hidden /> Live offer
            </span>
          )}
          {!isClosed && endingDate && <Countdown endsAt={endingDate} />}
        </div>

        <h3 className="mt-3 font-display text-[1.4rem] font-semibold leading-snug text-text-dark md:text-[1.7rem]">
          <Link href={href} className="hover:text-primary-pink">{title}</Link>
        </h3>
        {blurb && <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-text-muted md:text-[15px]">{blurb}</p>}

        <div className="mt-auto pt-5">
          {isClosed ? (
            <Link
              href="/products"
              className="inline-flex items-center gap-2 rounded-full border border-[#E6D3DA] px-5 py-2.5 text-sm font-bold text-text-dark transition-colors hover:border-primary-pink hover:text-primary-pink"
            >
              Browse all products <FiArrowRight aria-hidden />
            </Link>
          ) : (
            <Link
              href={href}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary-pink px-6 py-3 text-sm font-bold text-white shadow-button transition-colors hover:bg-[#8E1712] sm:w-auto"
            >
              Shop this offer
              <FiArrowRight className="transition-transform group-hover:translate-x-0.5" aria-hidden />
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
