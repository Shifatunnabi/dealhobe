// ISR: revalidate the homepage every 5 minutes.
// The underlying data functions (lib/data.ts) have their own TTLs and tags (admin saves clear them on demand);
// this export controls how often Next.js re-renders the static HTML — it also re-checks section schedules.
export const revalidate = 300;

import HomeContent from "@/components/sections/HomeContent";
import SectionRenderer, { type SectionData } from "@/components/home/SectionRenderer";
import type { GridProduct } from "@/components/sections/ProductCard";

import {
  getHomeSections,
  getStorefront,
  getBrands,
  getProducts,
  getTrendingProducts,
  getNewProducts,
  getFeaturedProducts,
  getTopSellerProducts,
  getFeaturedReviews,
  getOffers,
  getProductRatings,
} from '@/lib/data';
import { applyOffersToProducts, isOfferActive } from '@/lib/offers';
import { toCardProduct, cardContext, type CardContext } from '@/lib/product-card';
import { isSectionLive, type HomeSection, type ProductSource } from '@/lib/homepage/types';

// Only serialize what the product cards render (variants etc. are dropped to keep the payload small).
function slim(products: Parameters<typeof toCardProduct>[0][], limit: number, ctx: CardContext): GridProduct[] {
  return products.slice(0, limit).map((p) => toCardProduct(p, ctx));
}

const SOURCES: Record<Exclude<ProductSource, 'offer' | 'picks'>, () => Promise<GridProduct[]>> = {
  trending: getTrendingProducts as () => Promise<GridProduct[]>,
  new:      getNewProducts as () => Promise<GridProduct[]>,
  featured: getFeaturedProducts as () => Promise<GridProduct[]>,
  top:      getTopSellerProducts as () => Promise<GridProduct[]>,
};

export default async function Home() {
  const [allSections, storefront] = await Promise.all([getHomeSections(), getStorefront()]);
  const sections = allSections.filter((s) => isSectionLive(s));
  const has = (type: HomeSection['type']) => sections.some((s) => s.type === type);
  const rails = sections.filter((s) => s.type === 'product-rail');

  // Fetch only what the live sections need; every query is cached with its own TTL.
  const [brands, reviews, offers, ratings] = await Promise.all([
    has('brand-marquee') || rails.length ? getBrands() : [],
    has('reviews') ? getFeaturedReviews() : [],
    rails.length ? getOffers() : [],
    rails.length ? getProductRatings() : {},
  ]);
  const ctx = cardContext(brands, ratings);
  const activeOffers = offers.filter((o) => isOfferActive(o));

  const products: SectionData['products'] = {};
  await Promise.all(rails.map(async (s) => {
    const source = s.settings.source ?? 'trending';
    const limit = s.settings.limit ?? 12;
    let list: GridProduct[];
    if (source === 'offer') {
      const offer = activeOffers.find((o) => o._id === s.settings.offerId);
      const all = offer ? (await getProducts()) as unknown as GridProduct[] : [];
      list = offer?.productSelection === 'selected'
        ? all.filter((p) => offer.selectedProducts.map(String).includes(String(p._id)))
        : all;
    } else if (source === 'picks') {
      const slugs = s.settings.productSlugs ?? [];
      const all = (await getProducts()) as unknown as (GridProduct & { slug: string })[];
      list = slugs.map((slug) => all.find((p) => p.slug === slug)).filter((p): p is GridProduct & { slug: string } => !!p);
    } else {
      list = await SOURCES[source]();
    }
    products[s._id] = slim(applyOffersToProducts(list, activeOffers) as Parameters<typeof toCardProduct>[0][], limit, ctx);
  }));

  const data: SectionData = { products, brands, reviews, storefront };

  return (
    <HomeContent>
      <h1 className="sr-only">DealHobe — premium cosmetics and beauty essentials in Bangladesh</h1>
      {sections.map((section, i) => (
        <SectionRenderer key={section._id} section={section} data={data} first={i < 2} />
      ))}
      <div className="h-10 md:h-16" />
    </HomeContent>
  );
}
