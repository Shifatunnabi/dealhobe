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
} from '@/lib/data';
import { applyOffersToProducts, isOfferActive } from '@/lib/offers';
import { getProductCoverImage } from '@/lib/product-images';
import { isSectionLive, type HomeSection, type ProductSource } from '@/lib/homepage/types';

// Only serialize the fields the product cards render. Variants are dropped to keep the
// payload small, so the card photo (main photo, else the first variant photo) is resolved here.
function slim(products: GridProduct[], limit: number): GridProduct[] {
  return products.slice(0, limit).map((p) => {
    const { _id, slug, name, price, salePrice, quantity, hasVariants, offerDiscountType, offerDiscountAmount } = p;
    const cover = getProductCoverImage(p as Parameters<typeof getProductCoverImage>[0]);
    return { _id, slug, name, images: cover ? [cover] : [], price, salePrice, quantity, hasVariants, offerDiscountType, offerDiscountAmount };
  });
}

const SOURCES: Record<Exclude<ProductSource, 'offer'>, () => Promise<GridProduct[]>> = {
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
  const [brands, reviews, offers] = await Promise.all([
    has('brand-marquee') ? getBrands() : [],
    has('reviews') ? getFeaturedReviews() : [],
    rails.length ? getOffers() : [],
  ]);
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
    } else {
      list = await SOURCES[source]();
    }
    products[s._id] = slim(applyOffersToProducts(list, activeOffers), limit);
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
