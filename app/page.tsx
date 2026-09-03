// ISR: revalidate the homepage every 5 minutes.
// The underlying data functions (lib/data.ts) have their own TTLs; this export
// controls how often Next.js re-renders the static HTML.
export const revalidate = 300;

import HeroSection            from "@/components/sections/HeroSection";
import TopCategoriesCarousel  from "@/components/sections/TopCategoriesCarousel";
import TrendingProducts       from "@/components/sections/TrendingProducts";
import ForYouSection          from "@/components/sections/ForYouSection";
import PromotionsSection      from "@/components/sections/PromotionsSection";
import CustomerReviewsSection from "@/components/sections/CustomerReviewsSection";
import BrandSlider            from "@/components/sections/BrandSlider";

import {
  getActiveHeroSlides,
  getCategories,
  getBrands,
  getTrendingProducts,
  getNewProducts,
  getFeaturedProducts,
  getTopSellerProducts,
  getFeaturedReviews,
  getOffers,
} from '@/lib/data';
import { applyOffersToProducts, isOfferActive } from '@/lib/offers';

export default async function Home() {
  // All 9 queries run in parallel; each is independently cached with its own TTL.
  const [slides, categories, brands, trendingProducts, newProducts, featuredProducts, topSellerProducts, reviews, offers] =
    await Promise.all([
      getActiveHeroSlides(),
      getCategories(),
      getBrands(),
      getTrendingProducts(),
      getNewProducts(),
      getFeaturedProducts(),
      getTopSellerProducts(),
      getFeaturedReviews(),
      getOffers(),
    ]);

  const activeOffers = offers.filter((o) => isOfferActive(o));

  const pricedTrending   = applyOffersToProducts(trendingProducts, activeOffers);
  const pricedNew        = applyOffersToProducts(newProducts, activeOffers);
  const pricedFeatured   = applyOffersToProducts(featuredProducts, activeOffers);
  const pricedTopSellers = applyOffersToProducts(topSellerProducts, activeOffers);

  const latestOffer = offers[0] ?? null;

  return (
    <>
      <HeroSection slides={slides} />
      <TopCategoriesCarousel categories={categories} />
      <TrendingProducts products={pricedTrending} />
      <ForYouSection
        newProducts={pricedNew}
        featuredProducts={pricedFeatured}
        topSellingProducts={pricedTopSellers}
      />
      <PromotionsSection offer={latestOffer} />
      <CustomerReviewsSection reviews={reviews} />
      <BrandSlider brands={brands} />
    </>
  );
}
