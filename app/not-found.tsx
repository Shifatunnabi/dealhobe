import type { Metadata } from "next";
import Link from "next/link";
import { FiArrowRight, FiSearch } from "react-icons/fi";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

const CATEGORIES = [
  { label: "Makeup", note: "Lips, eyes & base", href: "/products?category=Makeup" },
  { label: "Skin Care", note: "Cleansers to SPF", href: "/products?category=Skin%20Care" },
  { label: "Hair Care", note: "Wash, treat & style", href: "/products?category=Hair%20Care" },
];

export default function NotFound() {
  return (
    <div className="bg-soft-bg pb-24 pt-6 md:pt-12">
      <div className="shell">
        <div className="relative mx-auto max-w-3xl overflow-hidden rounded-[28px] border border-[#F1E7EB] bg-white px-5 py-10 text-center shadow-card md:px-14 md:py-16">
          <div aria-hidden className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full bg-blush/60 blur-3xl" />
          <div aria-hidden className="pointer-events-none absolute -bottom-24 -right-20 h-64 w-64 rounded-full bg-gold/20 blur-3xl" />

          <div className="relative">
            <p aria-hidden className="font-display text-[5.5rem] font-semibold leading-none text-primary-pink/15 md:text-[8rem]">404</p>
            <p className="-mt-3 text-[11px] font-bold uppercase tracking-[0.22em] text-gold-dark md:-mt-5">Page not found</p>
            <h1 className="mt-3 font-display text-[2rem] font-semibold leading-tight text-text-dark text-balance md:text-[2.8rem]">
              This page has wandered off.
            </h1>
            <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-text-muted">
              The link may be old or the product may have moved. Search for what you need, or start from one of our favourites.
            </p>

            <form action="/products" method="get" role="search" className="mx-auto mt-7 flex max-w-md items-center gap-2 rounded-full border border-[#E8DCE1] bg-white p-1.5 pl-4 shadow-tile focus-within:border-primary-pink">
              <FiSearch className="shrink-0 text-text-muted" aria-hidden />
              <label htmlFor="nf-q" className="sr-only">Search products</label>
              <input
                id="nf-q"
                name="q"
                type="search"
                placeholder="Search lipstick, serum, shampoo…"
                className="min-w-0 flex-1 bg-transparent text-base text-text-dark outline-none placeholder:text-[#B3A5AE]"
              />
              <button type="submit" className="shrink-0 rounded-full bg-plum px-5 py-2.5 text-sm font-bold text-white hover:opacity-90">
                Search
              </button>
            </form>

            <ul className="mt-8 grid gap-3 text-left sm:grid-cols-3">
              {CATEGORIES.map((c) => (
                <li key={c.href}>
                  <Link href={c.href} className="group flex items-center justify-between gap-2 rounded-2xl border border-[#F1E7EB] bg-soft-bg px-4 py-3.5 transition-colors hover:border-primary-pink/40 hover:bg-white">
                    <span>
                      <span className="block text-sm font-bold text-text-dark group-hover:text-primary-pink">{c.label}</span>
                      <span className="block text-xs text-text-muted">{c.note}</span>
                    </span>
                    <FiArrowRight className="shrink-0 text-text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-primary-pink" aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/products" className="inline-flex items-center gap-2 rounded-full bg-primary-pink px-6 py-3 text-sm font-bold text-white shadow-button hover:bg-[#8E1712]">
                Shop all products <FiArrowRight aria-hidden />
              </Link>
              <Link href="/offers" className="inline-flex items-center rounded-full border border-[#E6D3DA] bg-white px-6 py-3 text-sm font-bold text-text-dark hover:border-primary-pink hover:text-primary-pink">
                Today’s offers
              </Link>
              <Link href="/" className="inline-flex items-center px-3 py-3 text-sm font-semibold text-text-muted hover:text-text-dark">
                Back to home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
