// ISR: pre-build one page per offer slug; revalidate every 5 min.
export const revalidate = 300;

import { getProducts, getCategories, getSubCategories, getBrands, getOffers, getAllOfferSlugs } from '@/lib/data';
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

  const [products, categories, subCategories, brands, offers] = await Promise.all([
    getProducts(),
    getCategories(),
    getSubCategories(),
    getBrands(),
    getOffers(),
  ]);

  const activeOffers   = offers.filter((o) => isOfferActive(o));
  const pricedProducts = applyOffersToProducts(products, activeOffers);

  return (
    <ProductsPageClient
      products={pricedProducts}
      categories={categories}
      subCategories={subCategories}
      brands={brands}
      offers={activeOffers}
      offerParam={offer}
    />
  );
}
