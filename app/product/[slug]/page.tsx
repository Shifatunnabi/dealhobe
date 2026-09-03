// ISR: pre-build every product page at build time; revalidate every 5 min.
export const revalidate = 300;

import { notFound } from 'next/navigation';
import mongoose from 'mongoose';
import ProductDetailPageClient from './ProductPageClient';
import {
  getProduct,
  getRelatedProducts,
  getProductReviews,
  getOffers,
  getBrands,
  getCategories,
  getSubCategories,
  getAllProductSlugs,
} from '@/lib/data';
import { applyOffersToProduct, applyOffersToProducts, isOfferActive } from '@/lib/offers';

/** Pre-build one page per product slug at build time. */
export async function generateStaticParams() {
  const slugs = await getAllProductSlugs();
  return slugs.map((slug) => ({ slug }));
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const product = await getProduct(slug);

  if (!product) {
    // Try notFound() first; fall back to empty client render for safety
    notFound();
  }

  // Run all remaining queries in parallel — all served from the Data Cache
  const [relatedProducts, reviews, offers, allBrands, allCategories, allSubCategories] =
    await Promise.all([
      getRelatedProducts(product.category, product._id),
      getProductReviews(product._id),
      getOffers(),
      getBrands(),
      getCategories(),
      getSubCategories(),
    ]);

  const activeOffers   = offers.filter((o) => isOfferActive(o));
  const pricedProduct  = applyOffersToProduct(product, activeOffers);
  const pricedRelated  = applyOffersToProducts(relatedProducts, activeOffers);

  // Resolve display names from cached collections — avoids separate DB lookups
  const isId = (v?: string) => Boolean(v && mongoose.isValidObjectId(v));
  const brandDisplay    = isId(product.brand)
    ? (allBrands.find((b) => b._id === product.brand)?.name ?? product.brand)
    : product.brand;
  const categoryDisplay = isId(product.category)
    ? (allCategories.find((c) => c._id === product.category)?.name ?? product.category)
    : product.category;
  const subCategoryDisplay = isId(product.subCategory)
    ? (allSubCategories.find((s) => s._id === product.subCategory)?.name ?? product.subCategory)
    : product.subCategory;

  const hydratedProduct = { ...pricedProduct, brandDisplay, categoryDisplay, subCategoryDisplay };

  return (
    <ProductDetailPageClient
      product={hydratedProduct}
      relatedProducts={pricedRelated}
      reviews={reviews}
    />
  );
}
