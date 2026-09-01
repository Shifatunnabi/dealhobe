// This page is inherently dynamic (reads searchParams), so Next.js renders it
// on every request.  The DB queries below are served from the Next.js Data Cache
// via unstable_cache() in lib/data.ts — no database hit unless the TTL has
// expired or a revalidateTag('products') call has fired.
export const dynamic = 'force-dynamic';

import { Suspense } from "react";
import { getProducts, getCategories, getAgeRanges, getBrands, getOffers } from '@/lib/data';
import ProductsPageClient from '@/components/pages/ProductsPageClient';
import { applyOffersToProducts, isOfferActive } from '@/lib/offers';

export default async function ProductsPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams  = await props.searchParams;
  const offerParam    = typeof searchParams.offer  === 'string' ? searchParams.offer  : undefined;
  const searchQuery   = typeof searchParams.q      === 'string' ? searchParams.q      : undefined;

  // All cached — parallel fetch from Next.js Data Cache or MongoDB
  const [products, categories, ages, brands, offers] = await Promise.all([
    getProducts(),
    getCategories(),
    getAgeRanges(),
    getBrands(),
    getOffers(),
  ]);

  const activeOffers   = offers.filter((o) => isOfferActive(o));
  const pricedProducts = applyOffersToProducts(products, activeOffers);

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-soft-bg pt-26 flex items-center justify-center">
          <span className="font-inter text-xl text-text-muted">Loading…</span>
        </div>
      }
    >
      <ProductsPageClient
        products={pricedProducts}
        categories={categories}
        ages={ages}
        brands={brands}
        offers={activeOffers}
        offerParam={offerParam}
        searchQuery={searchQuery}
      />
    </Suspense>
  );
}
