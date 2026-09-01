// ISR: revalidate the homepage every 5 minutes.
// The underlying data functions (lib/data.ts) have their own TTLs; this export
// controls how often Next.js re-renders the static HTML.
export const revalidate = 300;

import HeroSection            from "@/components/sections/HeroSection";
import ShopByAge              from "@/components/sections/ShopByAge";
import TopFavorites           from "@/components/sections/TopFavorites";
import ShopByCategories       from "@/components/sections/ShopByCategories";
import PromotionsSection      from "@/components/sections/PromotionsSection";
import CustomerReviewsSection from "@/components/sections/CustomerReviewsSection";
import ParentingTipsSection   from "@/components/sections/ParentingTipsSection";
import BrandSlider            from "@/components/sections/BrandSlider";

import {
  getActiveHeroSlides,
  getAgeRanges,
  getCategories,
  getBrands,
  getFeaturedProducts,
  getFeaturedReviews,
  getParentingTips,
  getOffers,
} from '@/lib/data';
import { applyOffersToProducts, isOfferActive } from '@/lib/offers';

export default async function Home() {
  // All 8 queries run in parallel; each is independently cached with its own TTL.
  const [slides, ages, categories, brands, products, reviews, tips, offers] =
    await Promise.all([
      getActiveHeroSlides(),
      getAgeRanges(),
      getCategories(),
      getBrands(),
      getFeaturedProducts(),
      getFeaturedReviews(),
      getParentingTips(),
      getOffers(),
    ]);

  const activeOffers   = offers.filter((o) => isOfferActive(o));
  const pricedProducts = applyOffersToProducts(products, activeOffers);
  const latestOffer    = offers[0] ?? null;

  return (
    <>
      <HeroSection slides={slides} />
      <ShopByAge ages={ages} />
      <TopFavorites products={pricedProducts} />
      <ShopByCategories categories={categories} />
      <PromotionsSection offer={latestOffer} />
      <CustomerReviewsSection reviews={reviews} />
      <ParentingTipsSection tips={tips} />
      <BrandSlider brands={brands} />
    </>
  );
}
