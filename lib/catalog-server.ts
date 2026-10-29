import { cache } from 'react';
import { getBrands, getCategories, getOffers, getProductRatings, getProducts, getSoldCounts, getSubCategories } from './data';
import { applyOffersToProducts, isOfferActive } from './offers';
import { cardContext } from './product-card';
import { buildFacets, buildShopItems, type ShopItem } from './catalog';

/** Everything /products needs, built once per request (shared by generateMetadata and the page). */
export const loadCatalog = cache(async () => {
  const [products, categories, subCategories, brands, offers, ratings, sold] = await Promise.all([
    getProducts(), getCategories(), getSubCategories(), getBrands(), getOffers(), getProductRatings(), getSoldCounts(),
  ]);
  // Hidden categories (and their sub-categories and products) stay out of the storefront.
  const hidden = new Set(categories.filter((c) => c.isHidden).map((c) => c._id));
  const visibleCategories = categories.filter((c) => !c.isHidden);
  const visibleSubs = subCategories.filter((s) => !hidden.has(s.category));
  const activeOffers = offers.filter((o) => isOfferActive(o));
  const priced = applyOffersToProducts(products.filter((p) => !hidden.has(String(p.category))), activeOffers);
  const items: ShopItem[] = buildShopItems(priced as Parameters<typeof buildShopItems>[0], {
    ctx: cardContext(brands, ratings), sold, categories: visibleCategories, subCategories: visibleSubs, offers: activeOffers,
  });
  return { items, facets: buildFacets(visibleCategories, visibleSubs, brands, activeOffers), offers: activeOffers };
});

const siteUrl = () => (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://dealhobe.com.bd').replace(/\/+$/, '');

/** CollectionPage + ItemList + BreadcrumbList JSON-LD for a listing page (helps search and AI answer engines). */
export function catalogJsonLd(opts: { h1: string; description: string; path: string; items: ShopItem[] }) {
  const base = siteUrl();
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        name: opts.h1,
        description: opts.description,
        url: `${base}${opts.path}`,
        isPartOf: { '@type': 'WebSite', name: 'DealHobe', url: base },
        mainEntity: {
          '@type': 'ItemList',
          numberOfItems: opts.items.length,
          itemListElement: opts.items.map((p, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            url: `${base}/product/${p.slug}`,
            name: p.name,
            ...(p.images?.[0] ? { image: p.images[0].startsWith('/') ? `${base}${p.images[0]}` : p.images[0] } : {}),
          })),
        },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: base },
          { '@type': 'ListItem', position: 2, name: 'Products', item: `${base}/products` },
          ...(opts.h1 !== 'All products' ? [{ '@type': 'ListItem', position: 3, name: opts.h1, item: `${base}${opts.path}` }] : []),
        ],
      },
    ],
  };
}
