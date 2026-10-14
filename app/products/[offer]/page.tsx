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

  // Hidden categories (and their sub-categories) don't appear in storefront filters.
  const hiddenCategoryIds = new Set(categories.filter((c) => c.isHidden).map((c) => c._id));
  const visibleCategories = categories.filter((c) => !c.isHidden);
  const visibleSubCategories = subCategories.filter((s) => !hiddenCategoryIds.has(s.category));

  const activeOffers   = offers.filter((o) => isOfferActive(o));
  const pricedProducts = applyOffersToProducts(products, activeOffers);

  return (
    <ProductsPageClient
      products={pricedProducts}
      categories={visibleCategories}
      subCategories={visibleSubCategories}
      brands={brands}
      offers={activeOffers}
      offerParam={offer}
    />
  );
}
