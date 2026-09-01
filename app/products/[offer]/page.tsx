// ISR: pre-build one page per offer slug; revalidate every 5 min.
export const revalidate = 300;

import { getProducts, getCategories, getAgeRanges, getBrands, getOffers, getAllOfferSlugs } from '@/lib/data';
import ProductsPageClient from '@/components/pages/ProductsPageClient';
import { applyOffersToProducts, isOfferActive } from '@/lib/offers';

/** Pre-build a page for every active offer slug at build time. */
export async function generateStaticParams() {
  const slugs = await getAllOfferSlugs();
  return slugs.map((offer) => ({ offer }));
}

export default async function OfferProductsPage({
  params,
}: {
  params: Promise<{ offer: string }>;
}) {
  const { offer } = await params;

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
    <ProductsPageClient
      products={pricedProducts}
      categories={categories}
      ages={ages}
      brands={brands}
      offers={activeOffers}
      offerParam={offer}
    />
  );
}
