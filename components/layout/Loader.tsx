import { cn } from "@/lib/utils";

/*
 * Lightweight route skeletons (no JS, no images, no splash). They mirror the real page layouts so
 * content swaps in without a jump. Used by the app/**\/loading.tsx files.
 */

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "rounded-xl bg-[linear-gradient(110deg,#F3EAEE_8%,#FBF5F7_18%,#F3EAEE_33%)] bg-[length:200%_100%] animate-[shimmer_1.4s_linear_infinite] motion-reduce:animate-none",
        className,
      )}
    />
  );
}

function Frame({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="bg-soft-bg pb-24 pt-4 md:pt-6" role="status" aria-busy="true" aria-live="polite">
      <span className="sr-only">{label}</span>
      <div className="shell">{children}</div>
    </div>
  );
}

/** Matches components/sections/ProductCard. */
export function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#EFE3E8] bg-white shadow-tile">
      <Skeleton className="aspect-square rounded-none" />
      <div className="flex flex-col gap-2 p-3 md:p-3.5">
        <Skeleton className="h-2.5 w-1/3 rounded-md" />
        <Skeleton className="h-3.5 w-full rounded-md" />
        <Skeleton className="h-3.5 w-2/3 rounded-md" />
        <Skeleton className="mt-1 h-5 w-1/2 rounded-md" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8, className }: { count?: number; className?: string }) {
  return (
    <div className={cn("grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-4", className)}>
      {Array.from({ length: count }, (_, i) => <ProductCardSkeleton key={i} />)}
    </div>
  );
}

/** /products (and offer listings): breadcrumb, title, filter sidebar, card grid. */
export function ProductsPageSkeleton() {
  return (
    <Frame label="Loading products">
      <Skeleton className="h-3.5 w-36 rounded-md" />
      <Skeleton className="mt-4 h-9 w-56 md:h-10 md:w-72" />
      <Skeleton className="mt-2 h-4 w-48 rounded-md" />
      <div className="mt-5 flex gap-2 md:hidden">
        <Skeleton className="h-10 flex-1 rounded-full" />
        <Skeleton className="h-10 flex-1 rounded-full" />
      </div>
      <div className="mt-5 flex items-start gap-6 md:mt-6">
        <div className="hidden w-64 shrink-0 flex-col gap-4 rounded-2xl border border-[#F1E7EB] bg-white p-4 shadow-tile md:flex">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="flex flex-col gap-2.5">
              <Skeleton className="h-4 w-24 rounded-md" />
              <Skeleton className="h-3 w-full rounded-md" />
              <Skeleton className="h-3 w-5/6 rounded-md" />
              <Skeleton className="h-3 w-4/6 rounded-md" />
            </div>
          ))}
        </div>
        <ProductGridSkeleton className="min-w-0 flex-1 lg:grid-cols-3 xl:grid-cols-4" count={8} />
      </div>
    </Frame>
  );
}

/** /offers: plum hero, offer cards, discounted product grid. */
export function OffersPageSkeleton() {
  return (
    <Frame label="Loading offers">
      <div className="rounded-[26px] bg-plum/90 px-5 pb-8 pt-6 md:px-10 md:pb-10">
        <div className="h-3 w-24 rounded bg-white/15" />
        <div className="mt-8 h-3 w-32 rounded bg-white/15" />
        <div className="mt-3 h-10 w-4/5 max-w-xl rounded-lg bg-white/15 md:h-14" />
        <div className="mt-3 h-4 w-3/5 max-w-md rounded bg-white/10" />
        <div className="mt-6 flex gap-2">
          <div className="h-8 w-28 rounded-full bg-white/10" />
          <div className="h-8 w-36 rounded-full bg-white/10" />
        </div>
      </div>
      <Skeleton className="mt-10 h-7 w-40" />
      <div className="mt-5 grid overflow-hidden rounded-[22px] border border-[#EFE3E8] bg-white md:grid-cols-[0.9fr_1.1fr]">
        <Skeleton className="aspect-[16/9] rounded-none md:aspect-auto md:min-h-[240px]" />
        <div className="flex flex-col gap-3 p-5 md:p-7">
          <Skeleton className="h-5 w-40 rounded-full" />
          <Skeleton className="h-7 w-3/4" />
          <Skeleton className="h-4 w-full rounded-md" />
          <Skeleton className="h-4 w-2/3 rounded-md" />
          <Skeleton className="mt-4 h-11 w-44 rounded-full" />
        </div>
      </div>
      <Skeleton className="mt-12 h-7 w-56" />
      <ProductGridSkeleton className="mt-5 xl:grid-cols-5" count={10} />
    </Frame>
  );
}

/** /blogs: masthead, lead story with side picks, story grid. */
export function BlogsPageSkeleton() {
  return (
    <Frame label="Loading stories">
      <Skeleton className="h-3.5 w-32 rounded-md" />
      <div className="mt-8 border-b border-[#EADDE3] pb-8">
        <Skeleton className="h-3 w-40 rounded-md" />
        <Skeleton className="mt-3 h-12 w-72 md:h-16 md:w-[28rem]" />
      </div>
      <div className="mt-10 grid gap-8 lg:grid-cols-[1.65fr_1fr] lg:gap-12">
        <div>
          <Skeleton className="aspect-[16/10] rounded-[22px]" />
          <Skeleton className="mt-5 h-3 w-24 rounded-md" />
          <Skeleton className="mt-3 h-9 w-5/6" />
          <Skeleton className="mt-3 h-4 w-full rounded-md" />
        </div>
        <div className="flex flex-col gap-6">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="flex gap-4">
              <Skeleton className="h-24 w-28 shrink-0" />
              <div className="flex flex-1 flex-col gap-2">
                <Skeleton className="h-3 w-20 rounded-md" />
                <Skeleton className="h-4 w-full rounded-md" />
                <Skeleton className="h-4 w-3/4 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </Frame>
  );
}

/** Generic storefront page: hero band, a row of tiles, a product rail. */
export default function Loader() {
  return (
    <Frame label="Loading">
      <Skeleton className="aspect-[16/10] w-full rounded-[22px] md:aspect-[16/5]" />
      <div className="mt-6 grid grid-cols-4 gap-3 md:grid-cols-8 md:gap-4">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className={cn("flex flex-col items-center gap-2", i >= 4 && "hidden md:flex")}>
            <Skeleton className="aspect-square w-full rounded-full" />
            <Skeleton className="h-3 w-3/4 rounded-md" />
          </div>
        ))}
      </div>
      <Skeleton className="mt-10 h-7 w-52" />
      <ProductGridSkeleton className="mt-5 lg:grid-cols-5" count={5} />
    </Frame>
  );
}
