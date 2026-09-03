/**
 * lib/data.ts — Centralized, cached data-fetching layer.
 *
 * Two-level cache per function:
 *   1. unstable_cache  — Next.js Data Cache (persists across requests, survives hot-reload)
 *   2. React cache()   — per-request deduplication (same function called multiple times
 *                        in one render tree hits the DB at most once)
 *
 * Cache tags (used with revalidateTag() for on-demand invalidation):
 *   'products'   products, featured, related, by-category
 *   'categories' category list
 *   'brands'     brand list
 *   'offers'     offer list
 *   'hero'       hero slides
 *   'reviews'    approved reviews (homepage + product detail)
 *   'blogs'      blog list + individual posts
 */

import { cache } from 'react';
import { unstable_cache } from 'next/cache';
import connectDB from './mongodb';
import Product from './models/Product';
import Category from './models/Category';
import SubCategory from './models/SubCategory';
import Brand from './models/Brand';
import Offer from './models/Offer';
import HeroSlide from './models/HeroSlide';
import Review from './models/Review';
import Blog from './models/Blog';
import mongoose from 'mongoose';

// ─── Plain serializable types ─────────────────────────────────────────────────
// These mirror the Mongoose interfaces but with _id as string and dates as string
// (needed because unstable_cache serialises results as JSON).

export type PlainProduct = {
  _id: string;
  name: string;
  slug: string;
  price: number;
  salePrice?: number;
  quantity: number;
  shortDescription: string;
  brand?: string;
  category: string;
  subCategory?: string;
  whyLoveIt: string[];
  description: string;
  images: string[];
  imagePublicIds: string[];
  isFeatured: boolean;
  isTrending: boolean;
  isNewArrival: boolean;
  isTopSeller: boolean;
  createdAt: string;
  updatedAt: string;
  // Applied offer fields (added by applyOffersToProduct)
  offerId?: string;
  offerDiscountType?: 'percentage' | 'flat';
  offerDiscountAmount?: number;
  // Hydrated display fields (only on detail page)
  brandDisplay?: string;
  categoryDisplay?: string;
  subCategoryDisplay?: string;
};

export type PlainCategory = {
  _id: string;
  name: string;
  imageUrl: string;
  imagePublicId: string;
  order: number;
  showOnHomepage?: boolean;
  createdAt: string;
  updatedAt: string;
};

export type PlainSubCategory = {
  _id: string;
  name: string;
  category: string;
  order: number;
  createdAt: string;
  updatedAt: string;
};

export type PlainBrand = {
  _id: string;
  name: string;
  logoUrl: string;
  logoPublicId: string;
  order: number;
  createdAt: string;
  updatedAt: string;
};

export type PlainOffer = {
  _id: string;
  title: string;
  slug: string;
  discountType: 'percentage' | 'flat';
  discountAmount: number;
  details: string;
  thumbnailUrl: string;
  thumbnailPublicId: string;
  productSelection: 'all' | 'selected';
  selectedProducts: string[];
  isActive: boolean;
  endingDate?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PlainHeroSlide = {
  _id: string;
  imageUrl: string;
  imagePublicId: string;
  ctaText: string;
  ctaLink: string;
  ctaColor: string;
  ctaTextColor: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type PlainReview = {
  _id: string;
  customerName: string;
  customerId: string;
  customerEmail: string;
  rating: number;
  review: string;
  productId: string;
  isApproved: boolean;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
};

export type PlainBlog = {
  _id: string;
  title: string;
  category: string;
  content: string;
  imageUrl: string;
  imagePublicId: string;
  isFeatured: boolean;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
};

// ─── Serialisation helper ─────────────────────────────────────────────────────

function s<T>(data: T): T {
  return JSON.parse(JSON.stringify(data));
}

// ═══════════════════════════════════════════════════════════════════════════════
// PRODUCTS
// ═══════════════════════════════════════════════════════════════════════════════

const _getAllProducts = unstable_cache(
  async (): Promise<PlainProduct[]> => {
    await connectDB();
    const docs = await Product.find().lean();
    return s(docs) as unknown as PlainProduct[];
  },
  ['products-all'],
  { revalidate: 60, tags: ['products'] }
);
/** All products (listings page). Cached 60 s, tag: products. */
export const getProducts = cache(_getAllProducts);

const _getFeaturedProducts = unstable_cache(
  async (): Promise<PlainProduct[]> => {
    await connectDB();
    const docs = await Product.find({ isFeatured: true }).lean();
    return s(docs) as unknown as PlainProduct[];
  },
  ['products-featured'],
  { revalidate: 300, tags: ['products'] }
);
/** Featured products (homepage). Cached 5 min, tag: products. */
export const getFeaturedProducts = cache(_getFeaturedProducts);

// Admin-controlled homepage placement tags — one cached query per tag,
// mirroring getFeaturedProducts. Set from the product form or the quick-toggle
// buttons on the admin product list.
const _getTrendingProducts = unstable_cache(
  async (): Promise<PlainProduct[]> => {
    await connectDB();
    const docs = await Product.find({ isTrending: true }).lean();
    return s(docs) as unknown as PlainProduct[];
  },
  ['products-trending'],
  { revalidate: 300, tags: ['products'] }
);
/** Trending products (homepage). Cached 5 min, tag: products. */
export const getTrendingProducts = cache(_getTrendingProducts);

const _getNewProducts = unstable_cache(
  async (): Promise<PlainProduct[]> => {
    await connectDB();
    const docs = await Product.find({ isNewArrival: true }).sort({ createdAt: -1 }).lean();
    return s(docs) as unknown as PlainProduct[];
  },
  ['products-new'],
  { revalidate: 300, tags: ['products'] }
);
/** Admin-flagged new products (homepage "For You" New tab). Cached 5 min, tag: products. */
export const getNewProducts = cache(_getNewProducts);

const _getTopSellerProducts = unstable_cache(
  async (): Promise<PlainProduct[]> => {
    await connectDB();
    const docs = await Product.find({ isTopSeller: true }).lean();
    return s(docs) as unknown as PlainProduct[];
  },
  ['products-top-sellers'],
  { revalidate: 300, tags: ['products'] }
);
/** Admin-flagged top sellers (homepage "For You" Top Seller tab). Cached 5 min, tag: products. */
export const getTopSellerProducts = cache(_getTopSellerProducts);

const _getProduct = unstable_cache(
  async (slug: string): Promise<PlainProduct | null> => {
    await connectDB();
    const doc = await Product.findOne({ slug }).lean();
    return doc ? (s(doc) as unknown as PlainProduct) : null;
  },
  ['product'],
  { revalidate: 300, tags: ['products'] }
);
/** Single product by slug. Cached 5 min, tag: products. */
export const getProduct = cache(_getProduct);

const _getRelatedProducts = unstable_cache(
  async (category: string, excludeId: string): Promise<PlainProduct[]> => {
    await connectDB();
    const query: Record<string, unknown> = { category };
    if (mongoose.isValidObjectId(excludeId)) {
      query._id = { $ne: excludeId };
    }
    const docs = await Product.find(query).limit(4).lean();
    return s(docs) as unknown as PlainProduct[];
  },
  ['related-products'],
  { revalidate: 300, tags: ['products'] }
);
/** Up to 4 related products in the same category. Cached 5 min, tag: products. */
export const getRelatedProducts = cache(_getRelatedProducts);

const _getAllProductSlugs = unstable_cache(
  async (): Promise<string[]> => {
    await connectDB();
    const docs = await Product.find({}, 'slug').lean();
    return docs.map((d) => d.slug as string);
  },
  ['products-slugs'],
  { revalidate: 3600, tags: ['products'] }
);
/** All product slugs — used by generateStaticParams. Cached 1 h. */
export const getAllProductSlugs = cache(_getAllProductSlugs);

// ═══════════════════════════════════════════════════════════════════════════════
// CATEGORIES
// ═══════════════════════════════════════════════════════════════════════════════

const _getCategories = unstable_cache(
  async (): Promise<PlainCategory[]> => {
    await connectDB();
    const docs = await Category.find().sort({ order: 1, createdAt: -1 }).lean();
    return s(docs) as unknown as PlainCategory[];
  },
  ['categories'],
  { revalidate: 3600, tags: ['categories'] }
);
/** All categories. Cached 1 h (rarely changes), tag: categories. */
export const getCategories = cache(_getCategories);

const _getSubCategories = unstable_cache(
  async (): Promise<PlainSubCategory[]> => {
    await connectDB();
    const docs = await SubCategory.find().sort({ order: 1, createdAt: -1 }).lean();
    return s(docs) as unknown as PlainSubCategory[];
  },
  ['subcategories'],
  { revalidate: 3600, tags: ['categories'] }
);
/** All sub-categories. Cached 1 h, tag: categories. */
export const getSubCategories = cache(_getSubCategories);

// ═══════════════════════════════════════════════════════════════════════════════
// BRANDS
// ═══════════════════════════════════════════════════════════════════════════════

const _getBrands = unstable_cache(
  async (): Promise<PlainBrand[]> => {
    await connectDB();
    const docs = await Brand.find().sort({ order: 1, createdAt: -1 }).lean();
    return s(docs) as unknown as PlainBrand[];
  },
  ['brands'],
  { revalidate: 3600, tags: ['brands'] }
);
/** All brands. Cached 1 h, tag: brands. */
export const getBrands = cache(_getBrands);

// ═══════════════════════════════════════════════════════════════════════════════
// OFFERS
// ═══════════════════════════════════════════════════════════════════════════════

const _getOffers = unstable_cache(
  async (): Promise<PlainOffer[]> => {
    await connectDB();
    const docs = await Offer.find().sort({ createdAt: -1 }).lean();
    return s(docs) as unknown as PlainOffer[];
  },
  ['offers'],
  { revalidate: 300, tags: ['offers'] }
);
/** All offers. Cached 5 min, tag: offers. */
export const getOffers = cache(_getOffers);

const _getAllOfferSlugs = unstable_cache(
  async (): Promise<string[]> => {
    await connectDB();
    const docs = await Offer.find({}, 'slug').lean();
    return docs.map((d) => d.slug as string);
  },
  ['offers-slugs'],
  { revalidate: 3600, tags: ['offers'] }
);
/** All offer slugs — used by generateStaticParams. Cached 1 h. */
export const getAllOfferSlugs = cache(_getAllOfferSlugs);

// ═══════════════════════════════════════════════════════════════════════════════
// HERO SLIDES
// ═══════════════════════════════════════════════════════════════════════════════

const _getActiveHeroSlides = unstable_cache(
  async (): Promise<PlainHeroSlide[]> => {
    await connectDB();
    const docs = await HeroSlide.find({ isActive: true }).sort({ order: 1 }).lean();
    return s(docs) as unknown as PlainHeroSlide[];
  },
  ['hero-slides'],
  { revalidate: 3600, tags: ['hero'] }
);
/** Active hero slides. Cached 1 h, tag: hero. */
export const getActiveHeroSlides = cache(_getActiveHeroSlides);

// ═══════════════════════════════════════════════════════════════════════════════
// REVIEWS
// ═══════════════════════════════════════════════════════════════════════════════

const _getFeaturedReviews = unstable_cache(
  async (): Promise<PlainReview[]> => {
    await connectDB();
    const docs = await Review.find({ isApproved: true, isFeatured: true }).lean();
    return s(docs) as unknown as PlainReview[];
  },
  ['reviews-featured'],
  { revalidate: 3600, tags: ['reviews'] }
);
/** Featured + approved reviews (homepage carousel). Cached 1 h, tag: reviews. */
export const getFeaturedReviews = cache(_getFeaturedReviews);

const _getProductReviews = unstable_cache(
  async (productId: string): Promise<PlainReview[]> => {
    await connectDB();
    const docs = await Review.find({ productId, isApproved: true })
      .sort({ createdAt: -1 })
      .lean();
    return s(docs) as unknown as PlainReview[];
  },
  ['product-reviews'],
  { revalidate: 300, tags: ['reviews'] }
);
/** Approved reviews for one product. Cached 5 min, tag: reviews. */
export const getProductReviews = cache(_getProductReviews);

// ═══════════════════════════════════════════════════════════════════════════════
// BLOGS
// ═══════════════════════════════════════════════════════════════════════════════

const _getBlogs = unstable_cache(
  async (): Promise<PlainBlog[]> => {
    await connectDB();
    const docs = await Blog.find().sort({ publishedAt: -1 }).lean();
    return s(docs) as unknown as PlainBlog[];
  },
  ['blogs'],
  { revalidate: 3600, tags: ['blogs'] }
);
/** All blog posts (list page). Cached 1 h, tag: blogs. */
export const getBlogs = cache(_getBlogs);

const _getBlog = unstable_cache(
  async (blogId: string): Promise<PlainBlog | null> => {
    await connectDB();
    const doc = await Blog.findById(blogId).lean();
    return doc ? (s(doc) as unknown as PlainBlog) : null;
  },
  ['blog'],
  { revalidate: 3600, tags: ['blogs'] }
);
/** Single blog post by ID. Cached 1 h, tag: blogs. */
export const getBlog = cache(_getBlog);

const _getAllBlogIds = unstable_cache(
  async (): Promise<string[]> => {
    await connectDB();
    const docs = await Blog.find({}, '_id').lean();
    return docs.map((d) => String(d._id));
  },
  ['blogs-ids'],
  { revalidate: 3600, tags: ['blogs'] }
);
/** All blog IDs — used by generateStaticParams. Cached 1 h. */
export const getAllBlogIds = cache(_getAllBlogIds);
