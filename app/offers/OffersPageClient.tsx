"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { FiArrowDown, FiArrowRight, FiChevronDown, FiTag } from "react-icons/fi";
import OfferCard from "@/components/ui/OfferCard";
import ProductCard from "@/components/sections/ProductCard";
import Breadcrumbs from "@/components/content/Breadcrumbs";
import type { GridProduct } from "@/lib/product-card";
import type { PlainOffer } from "@/lib/data";

export type DiscountedItem = GridProduct & { discountPct: number; effectivePrice: number; sold: number };
type OfferWithStatus = PlainOffer & { isClosed: boolean };

const PAGE = 24;
const SORTS = [
  { value: "discount", label: "Biggest discount" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "best", label: "Best selling" },
] as const;
type Sort = (typeof SORTS)[number]["value"];

function sortItems(items: DiscountedItem[], sort: Sort) {
  const list = [...items];
  switch (sort) {
    case "price-asc":
      return list.sort((a, b) => a.effectivePrice - b.effectivePrice);
    case "price-desc":
      return list.sort((a, b) => b.effectivePrice - a.effectivePrice);
    case "best":
      return list.sort((a, b) => b.sold - a.sold || b.discountPct - a.discountPct);
    default:
      return list.sort((a, b) => b.discountPct - a.discountPct || b.sold - a.sold);
  }
}

export default function OffersPageClient({ offers = [], products = [] }: { offers?: OfferWithStatus[]; products?: DiscountedItem[] }) {
  const [sort, setSort] = useState<Sort>("discount");
  const [shown, setShown] = useState(PAGE);

  const live = offers.filter((o) => !o.isClosed);
  const ended = offers.filter((o) => o.isClosed);
  const sorted = useMemo(() => sortItems(products, sort), [products, sort]);
  const maxPct = products.reduce((m, p) => Math.max(m, p.discountPct), 0);

  return (
    <div className="bg-soft-bg pb-24 pt-4 md:pt-6">
      <div className="shell">
        {/* Hero */}
        <header className="relative overflow-hidden rounded-[26px] bg-plum px-5 pb-7 pt-5 text-white md:px-10 md:pb-10 md:pt-7">
          <div aria-hidden className="pointer-events-none absolute -right-16 -top-24 h-80 w-80 rounded-full bg-primary-pink/50 blur-3xl" />
          <div aria-hidden className="pointer-events-none absolute -bottom-32 left-1/4 h-72 w-72 rounded-full bg-gold/20 blur-3xl" />
          <FiTag aria-hidden className="pointer-events-none absolute -right-6 bottom-[-18px] hidden h-56 w-56 rotate-12 text-white/[0.05] md:block" />

          <div className="relative">
            <Breadcrumbs tone="light" items={[{ label: "Home", href: "/" }, { label: "Offers" }]} />
            <p className="mt-6 text-[11px] font-bold uppercase tracking-[0.22em] text-gold md:mt-8">Limited-time deals</p>
            <h1 className="mt-2 max-w-2xl font-display text-[2.1rem] font-semibold leading-[1.05] text-balance md:text-[3.4rem]">
              Offers worth <em className="italic text-[#F2D9A6]">showing up</em> for.
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/75 md:text-base">
              Authentic makeup, skin care and hair care at their best prices — cash on delivery anywhere in Bangladesh.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-2 md:gap-3">
              {live.length > 0 && (
                <span className="rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-xs font-bold md:text-sm">
                  {live.length} live {live.length === 1 ? "offer" : "offers"}
                </span>
              )}
              {products.length > 0 && (
                <span className="rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-xs font-bold md:text-sm">
                  {products.length} products on sale
                </span>
              )}
              {maxPct > 0 && (
                <span className="rounded-full bg-gold px-3.5 py-1.5 text-xs font-extrabold text-plum md:text-sm">Up to {maxPct}% off</span>
              )}
              {products.length > 0 && (
                <a href="#on-sale" className="ml-auto hidden items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-plum transition-colors hover:bg-ivory sm:inline-flex">
                  Shop all deals <FiArrowDown aria-hidden />
                </a>
              )}
            </div>
          </div>
        </header>

        {/* Live offers */}
        {live.length > 0 ? (
          <section aria-labelledby="live-offers" className="mt-8 md:mt-12">
            <h2 id="live-offers" className="section-title">Live offers</h2>
            <div className={`mt-4 grid gap-4 md:mt-5 md:gap-5 ${live.length > 1 ? "xl:grid-cols-2" : ""}`}>
              {live.map((offer, i) => (
                <OfferCard
                  key={offer._id}
                  title={offer.title}
                  slug={offer.slug}
                  image={offer.thumbnailUrl}
                  blurb={offer.details}
                  index={i}
                  isClosed={false}
                  discountType={offer.discountType}
                  discountAmount={offer.discountAmount}
                  endingDate={offer.endingDate}
                  priority={i === 0}
                />
              ))}
            </div>
          </section>
        ) : (
          products.length === 0 && (
            <div className="mt-8 rounded-[22px] border border-[#F1E7EB] bg-white px-6 py-12 text-center shadow-tile">
              <p className="font-display text-2xl font-semibold text-text-dark">New offers are on the way</p>
              <p className="mx-auto mt-2 max-w-md text-sm text-text-muted">There are no live offers right now — check back soon, or explore our full collection.</p>
              <Link href="/products" className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary-pink px-6 py-3 text-sm font-bold text-white shadow-button hover:bg-[#8E1712]">
                Shop all products <FiArrowRight aria-hidden />
              </Link>
            </div>
          )
        )}

        {/* Every discounted product */}
        {products.length > 0 && (
          <section id="on-sale" aria-labelledby="on-sale-title" className="mt-10 scroll-mt-40 md:mt-14">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3 md:mb-5">
              <div>
                <h2 id="on-sale-title" className="section-title">All discounted products</h2>
                <p className="mt-1 text-sm text-text-muted">
                  {products.length} {products.length === 1 ? "product" : "products"} on sale · prices already include the discount
                </p>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <span className="text-text-muted">Sort</span>
                <span className="relative">
                  <select
                    value={sort}
                    onChange={(e) => { setSort(e.target.value as Sort); setShown(PAGE); }}
                    aria-label="Sort discounted products"
                    className="appearance-none rounded-full border border-[#EBDDE3] bg-white py-2 pl-4 pr-9 text-sm font-semibold text-text-dark outline-none focus:border-primary-pink"
                  >
                    {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                  <FiChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-muted" aria-hidden />
                </span>
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-4 xl:grid-cols-5">
              {sorted.slice(0, shown).map((p, i) => (
                <ProductCard key={p._id} product={p} priority={i < 4} />
              ))}
            </div>

            {shown < sorted.length && (
              <div className="mt-8 flex flex-col items-center gap-2">
                <p className="text-xs text-text-muted">Showing {shown} of {sorted.length}</p>
                <button
                  type="button"
                  onClick={() => setShown((n) => n + PAGE)}
                  className="inline-flex items-center gap-2 rounded-full border border-plum/20 bg-white px-7 py-3 text-sm font-bold text-plum shadow-tile transition-colors hover:border-plum hover:bg-plum hover:text-white"
                >
                  Show more deals <FiArrowDown aria-hidden />
                </button>
              </div>
            )}
          </section>
        )}

        {/* Ended offers */}
        {ended.length > 0 && (
          <section aria-labelledby="ended-offers" className="mt-12 md:mt-16">
            <h2 id="ended-offers" className="font-display text-lg font-semibold text-text-muted md:text-xl">Recently ended</h2>
            <div className="mt-4 grid gap-4 opacity-90 xl:grid-cols-2">
              {ended.map((offer, i) => (
                <OfferCard
                  key={offer._id}
                  title={offer.title}
                  slug={offer.slug}
                  image={offer.thumbnailUrl}
                  blurb={offer.details}
                  index={i}
                  isClosed
                  discountType={offer.discountType}
                  discountAmount={offer.discountAmount}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
