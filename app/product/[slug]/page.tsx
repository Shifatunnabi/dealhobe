// ISR: pre-build every product page at build time; revalidate every 5 min.
export const revalidate = 300;

import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { cache } from 'react';
import mongoose from 'mongoose';
import { FiChevronDown, FiChevronRight } from 'react-icons/fi';
import ProductDetailPageClient, { type ActiveOffer, type DetailProduct } from './ProductPageClient';
import ProductRail from '@/components/home/ProductRail';
import ProductReviews, { type ReviewItem } from '@/components/product-page/ProductReviews';
import RecentlyViewed from '@/components/product-page/RecentlyViewed';
import { plainExcerpt, splitDescription } from '@/components/product-page/description';
import {
  getProduct,
  getProducts,
  getProductReviews,
  getOffers,
  getBrands,
  getCategories,
  getSubCategories,
  getAllProductSlugs,
  getProductRatings,
  getSoldCounts,
  getStorefront,
  type PlainProduct,
} from '@/lib/data';
import { applyOffersToProduct, applyOffersToProducts, isOfferActive } from '@/lib/offers';
import { cardContext, toCardProduct } from '@/lib/product-card';
import { getProductImages } from '@/lib/product-images';

type Props = { params: Promise<{ slug: string }> };

const SITE = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://dealhobe.com.bd').replace(/\/+$/, '');
const abs = (src: string) => (src.startsWith('/') ? `${SITE}${src}` : src);
const money = (n: number) => `৳${Math.round(n).toLocaleString('en-IN')}`;
const RELATED = 12;

/** Pre-build one page per product slug at build time. */
export async function generateStaticParams() {
  const slugs = await getAllProductSlugs();
  return slugs.map((slug) => ({ slug }));
}

/** Product priced with active offers plus display names — shared by generateMetadata and the page. */
const load = cache(async (slug: string) => {
  const product = await getProduct(slug);
  if (!product) return null;
  const [offers, brands, categories, subCategories] = await Promise.all([
    getOffers(), getBrands(), getCategories(), getSubCategories(),
  ]);
  const activeOffers = offers.filter((o) => isOfferActive(o));
  const priced = applyOffersToProduct(product, activeOffers);

  // `brand` / `category` hold an id, or (older products) the display name itself.
  const isId = (v?: string) => Boolean(v && mongoose.isValidObjectId(v));
  const brandDisplay = isId(product.brand) ? brands.find((b) => b._id === product.brand)?.name ?? product.brand : product.brand;
  const categoryDisplay = isId(product.category)
    ? categories.find((c) => c._id === product.category)?.name ?? product.category
    : product.category;
  const subCategoryDisplay = isId(product.subCategory)
    ? subCategories.find((s) => s._id === product.subCategory)?.name ?? product.subCategory
    : product.subCategory;

  // Price range a shopper can pay (variants carry their own prices).
  const variants = priced.hasVariants ? priced.variants ?? [] : [];
  const pay = (v: { price: number; salePrice?: number }) => (v.salePrice && v.salePrice < v.price ? v.salePrice : v.price);
  const prices = variants.length ? variants.map(pay) : [pay(priced)];
  const stock = variants.length ? variants.reduce((n, v) => n + Math.max(0, Number(v.quantity) || 0), 0) : Number(priced.quantity) || 0;

  const offer = priced.offerId ? activeOffers.find((o) => String(o._id) === priced.offerId) : undefined;

  return {
    product: { ...priced, brandDisplay, categoryDisplay, subCategoryDisplay },
    images: getProductImages(priced).map(abs),
    low: Math.min(...prices),
    high: Math.max(...prices),
    stock,
    offer,
    activeOffers,
    brands,
    categories,
  };
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await load((await params).slug);
  if (!data) return { title: 'Product not found', robots: { index: false } };
  const { product: p, low } = data;
  const brand = p.brandDisplay && !p.name.toLowerCase().includes(p.brandDisplay.toLowerCase()) ? `${p.brandDisplay} ` : '';
  const title = `${brand}${p.name} Price in Bangladesh`;
  const lead = plainExcerpt(p.shortDescription || p.description, 120);
  const description = `${lead} Buy at ${money(low)} from DealHobe — 100% authentic, cash on delivery across Bangladesh.`;
  const path = `/product/${p.slug}`;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: 'website',
      url: path,
      title: `${brand}${p.name} – ${money(low)}`,
      description,
      siteName: 'DealHobe',
      // images: generated 1200x630 card (opengraph-image.tsx next to this file)
    },
    twitter: { card: 'summary_large_image', title: `${brand}${p.name}`, description },
    other: {
      'product:price:amount': String(low),
      'product:price:currency': 'BDT',
      'product:availability': data.stock > 0 ? 'in stock' : 'out of stock',
      ...(p.brandDisplay ? { 'product:brand': p.brandDisplay } : {}),
    },
  };
}

/** Same sub-category, then category, then brand; in-stock and best sellers first. */
function pickRelated(all: PlainProduct[], current: PlainProduct, hiddenCategories: Set<string>) {
  const scored = all
    .filter((p) => p._id !== current._id && !hiddenCategories.has(String(p.category)))
    .map((p) => {
      const stock = p.hasVariants && p.variants?.length ? p.variants.reduce((n, v) => n + (Number(v.quantity) || 0), 0) : Number(p.quantity) || 0;
      const match =
        (current.subCategory && p.subCategory === current.subCategory ? 4 : 0) +
        (p.category === current.category ? 2 : 0) +
        (current.brand && p.brand === current.brand ? 1 : 0);
      const pop = (p.isTopSeller ? 4 : 0) + (p.isTrending ? 2 : 0) + (p.isFeatured ? 1 : 0);
      return { p, match, inStock: stock > 0, pop };
    })
    .sort((a, b) => Number(b.match > 0) - Number(a.match > 0) || Number(b.inStock) - Number(a.inStock) || b.match - a.match || b.pop - a.pop);
  return scored.slice(0, RELATED).map((s) => s.p);
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const data = await load(slug);
  if (!data) notFound();
  const { product, images, low, high, stock, offer, activeOffers, brands, categories } = data;

  const [allProducts, reviews, ratings, sold, storefront] = await Promise.all([
    getProducts(),
    getProductReviews(product._id),
    getProductRatings(),
    getSoldCounts(),
    getStorefront(),
  ]);

  const ctx = cardContext(brands, ratings);
  const hidden = new Set(categories.filter((c) => c.isHidden).map((c) => c._id));
  const related = applyOffersToProducts(pickRelated(allProducts, product, hidden), activeOffers).map((p) => toCardProduct(p, ctx));
  const currentCard = toCardProduct(product, ctx);

  // Customer emails stay out of the static HTML; the reviews widget fetches them only for logged-in shoppers.
  const reviewItems: ReviewItem[] = reviews.map((r) => ({
    _id: r._id, customerName: r.customerName, rating: r.rating, review: r.review, createdAt: r.createdAt,
  }));
  const rating = reviews.length
    ? { avg: Math.round((reviews.reduce((n, r) => n + (Number(r.rating) || 0), 0) / reviews.length) * 10) / 10, count: reviews.length }
    : { avg: 0, count: 0 };

  const activeOffer: ActiveOffer = offer
    ? { title: offer.title, slug: offer.slug, endsAt: offer.endingDate ?? null }
    : null;

  // Only what the buy box needs crosses to the client (no description HTML, public ids, timestamps…).
  const clientProduct: DetailProduct = {
    _id: product._id, name: product.name, slug: product.slug, sku: (product as { sku?: string }).sku,
    price: product.price, salePrice: product.salePrice, quantity: product.quantity,
    shortDescription: product.shortDescription, images: product.images,
    hasVariants: product.hasVariants, variantOptions: product.variantOptions,
    variants: product.hasVariants ? product.variants?.map(({ key, options, price, salePrice, sku, quantity, useMainImage, image }) => ({ key, options, price, salePrice, sku, quantity, useMainImage, image })) : undefined,
    isTopSeller: product.isTopSeller, isNewArrival: product.isNewArrival, isTrending: product.isTrending,
    brandDisplay: product.brandDisplay, categoryDisplay: product.categoryDisplay, subCategoryDisplay: product.subCategoryDisplay,
  };

  const sku = (product as { sku?: string }).sku;
  const sections = splitDescription(product.description);
  const url = `${SITE}/product/${product.slug}`;
  const categoryHref = product.categoryDisplay ? `/products?category=${encodeURIComponent(product.categoryDisplay)}` : '/products';
  const subHref = product.subCategoryDisplay
    ? `${categoryHref}&subcategory=${encodeURIComponent(product.subCategoryDisplay)}`
    : null;

  /* ── Structured data ── */
  const availability = stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock';
  const seller = { '@type': 'Organization', name: 'DealHobe' };
  const priceValidUntil = offer?.endingDate ? new Date(offer.endingDate).toISOString().slice(0, 10) : undefined;
  const variantCount = product.hasVariants ? product.variants?.length ?? 0 : 0;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Product',
        '@id': `${url}#product`,
        name: product.name,
        url,
        image: images.length ? images : undefined,
        description: plainExcerpt(product.description || product.shortDescription, 5000) || undefined,
        sku: sku || undefined,
        category: [product.categoryDisplay, product.subCategoryDisplay].filter(Boolean).join(' > ') || undefined,
        ...(product.brandDisplay ? { brand: { '@type': 'Brand', name: product.brandDisplay } } : {}),
        offers:
          low !== high
            ? {
                '@type': 'AggregateOffer',
                priceCurrency: 'BDT',
                lowPrice: low,
                highPrice: high,
                offerCount: variantCount,
                availability,
                url,
                seller,
              }
            : {
                '@type': 'Offer',
                priceCurrency: 'BDT',
                price: low,
                availability,
                itemCondition: 'https://schema.org/NewCondition',
                url,
                seller,
                ...(priceValidUntil ? { priceValidUntil } : {}),
              },
        ...(rating.count
          ? {
              aggregateRating: { '@type': 'AggregateRating', ratingValue: rating.avg, reviewCount: rating.count, bestRating: 5, worstRating: 1 },
              review: reviews.slice(0, 5).map((r) => ({
                '@type': 'Review',
                author: { '@type': 'Person', name: r.customerName || 'Customer' },
                datePublished: r.createdAt?.slice(0, 10),
                reviewBody: r.review,
                reviewRating: { '@type': 'Rating', ratingValue: r.rating, bestRating: 5, worstRating: 1 },
              })),
            }
          : {}),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: SITE },
          { '@type': 'ListItem', position: 2, name: 'Products', item: `${SITE}/products` },
          ...(product.categoryDisplay
            ? [{ '@type': 'ListItem', position: 3, name: product.categoryDisplay, item: `${SITE}${categoryHref}` }]
            : []),
          { '@type': 'ListItem', position: product.categoryDisplay ? 4 : 3, name: product.name, item: url },
        ],
      },
    ],
  };

  return (
    <div className="min-h-screen bg-soft-bg pb-24 md:pb-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />

      <div className="shell pt-4 md:pt-6">
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="mb-4 text-xs text-text-muted md:mb-6 md:text-sm">
          <ol className="flex min-w-0 items-center gap-1.5 overflow-hidden whitespace-nowrap">
            <li><Link href="/" className="hover:text-primary-pink">Home</Link></li>
            <li aria-hidden><FiChevronRight size={12} /></li>
            {product.categoryDisplay ? (
              <li><Link href={categoryHref} className="hover:text-primary-pink">{product.categoryDisplay}</Link></li>
            ) : (
              <li><Link href="/products" className="hover:text-primary-pink">Products</Link></li>
            )}
            {subHref && (
              <>
                <li aria-hidden><FiChevronRight size={12} /></li>
                <li><Link href={subHref} className="hover:text-primary-pink">{product.subCategoryDisplay}</Link></li>
              </>
            )}
            <li aria-hidden className="hidden sm:block"><FiChevronRight size={12} /></li>
            <li className="hidden min-w-0 truncate font-semibold text-text-dark sm:block" aria-current="page">{product.name}</li>
          </ol>
        </nav>

        <ProductDetailPageClient
          product={clientProduct}
          offer={activeOffer}
          rating={rating}
          sold={sold[product._id] ?? 0}
          freeDeliveryThreshold={storefront.freeDeliveryThreshold}
          whatsapp={storefront.contact?.whatsapp}
        />
      </div>

      {/* Product information */}
      {sections.length > 0 && (
        <section className="shell mt-12 md:mt-20" aria-labelledby="about-product">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gold-dark">The details</p>
              <h2 id="about-product" className="mt-2 font-display text-[1.75rem] font-semibold leading-tight text-text-dark md:text-[2.25rem]">
                About {product.name}
              </h2>
              {product.shortDescription && <p className="mt-3 text-[15px] leading-relaxed text-text-muted">{product.shortDescription}</p>}
              <dl className="mt-6 grid grid-cols-2 gap-3 text-sm">
                {[
                  ['Brand', product.brandDisplay],
                  ['Category', product.subCategoryDisplay || product.categoryDisplay],
                  ['SKU', sku],
                  ['Options', variantCount ? `${variantCount} variants` : undefined],
                ]
                  .filter(([, v]) => v)
                  .map(([k, v]) => (
                    <div key={k} className="rounded-2xl border border-[#F1E7EB] bg-white px-4 py-3">
                      <dt className="text-[11px] font-bold uppercase tracking-wider text-text-muted">{k}</dt>
                      <dd className="mt-0.5 truncate font-semibold text-text-dark">{v}</dd>
                    </div>
                  ))}
              </dl>
            </div>

            <div className="divide-y divide-[#F1E7EB] overflow-hidden rounded-3xl border border-[#F1E7EB] bg-white shadow-tile">
              {sections.map((s, i) => (
                <details key={s.id} name="product-info" open={i === 0} className="group">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-base font-bold text-text-dark transition-colors hover:text-primary-pink md:px-7 md:py-5 [&::-webkit-details-marker]:hidden">
                    {s.title}
                    <FiChevronDown className="shrink-0 text-text-muted transition-transform duration-200 group-open:rotate-180" aria-hidden />
                  </summary>
                  <div
                    className="px-5 pb-6 text-[15px] leading-relaxed text-text-muted md:px-7 [&_a]:text-primary-pink [&_a]:underline [&_h2]:mb-2 [&_h2]:mt-4 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-text-dark [&_h3]:mb-2 [&_h3]:mt-4 [&_h3]:font-bold [&_h3]:text-text-dark [&_li]:mb-1 [&_ol]:mb-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_p:last-child]:mb-0 [&_p]:mb-3 [&_strong]:text-text-dark [&_ul]:mb-3 [&_ul]:list-disc [&_ul]:pl-5"
                    dangerouslySetInnerHTML={{ __html: s.html }}
                  />
                </details>
              ))}
              <details name="product-info" className="group">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-base font-bold text-text-dark transition-colors hover:text-primary-pink md:px-7 md:py-5 [&::-webkit-details-marker]:hidden">
                  Delivery &amp; returns
                  <FiChevronDown className="shrink-0 text-text-muted transition-transform duration-200 group-open:rotate-180" aria-hidden />
                </summary>
                <div className="space-y-3 px-5 pb-6 text-[15px] leading-relaxed text-text-muted md:px-7">
                  <p>
                    We deliver across Bangladesh: <strong className="text-text-dark">৳95 inside Dhaka</strong> and{' '}
                    <strong className="text-text-dark">৳120 outside Dhaka</strong>
                    {storefront.freeDeliveryThreshold > 0 && <>, and free on orders of {money(storefront.freeDeliveryThreshold)} or more</>}.
                    Pay in cash when your order arrives.
                  </p>
                  <p>
                    Received a damaged or incorrect item? Contact us with your order number and we&apos;ll make it right. See our{' '}
                    <Link href="/shipping-delivery" className="text-primary-pink underline">shipping</Link> and{' '}
                    <Link href="/refund-return-policy" className="text-primary-pink underline">return policy</Link>.
                  </p>
                </div>
              </details>
            </div>
          </div>
        </section>
      )}

      {/* Reviews */}
      <section id="reviews" className="shell mt-14 scroll-mt-40 md:mt-20" aria-labelledby="reviews-title">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gold-dark">Reviews</p>
        <h2 id="reviews-title" className="mb-6 mt-2 font-display text-[1.75rem] font-semibold leading-tight text-text-dark md:mb-8 md:text-[2.25rem]">
          What customers say
        </h2>
        <ProductReviews productId={product._id} productName={product.name} initial={reviewItems} />
      </section>

      {/* You may also like */}
      {related.length > 0 && (
        <section className="shell mt-14 md:mt-20" aria-labelledby="also-like">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gold-dark">Picked for you</p>
              <h2 id="also-like" className="mt-2 font-display text-[1.75rem] font-semibold leading-tight text-text-dark md:text-[2.25rem]">
                You may also like
              </h2>
            </div>
            <Link href={categoryHref} className="inline-flex shrink-0 items-center gap-1 text-sm font-bold text-primary-pink hover:underline">
              View all <FiChevronRight aria-hidden />
            </Link>
          </div>
          <ProductRail products={related} />
        </section>
      )}

      <div className="mt-4">
        <RecentlyViewed current={currentCard} />
      </div>
    </div>
  );
}
