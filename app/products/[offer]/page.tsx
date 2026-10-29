// ISR: pre-build one page per offer slug; revalidate every 5 min.
export const revalidate = 300;

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAllOfferSlugs } from '@/lib/data';
import ProductsPageClient from '@/components/pages/ProductsPageClient';
import { catalogSeo, filterAndSort, parseCatalogQuery, PER_PAGE } from '@/lib/catalog';
import { catalogJsonLd, loadCatalog } from '@/lib/catalog-server';
import { shareOg, shareTwitter } from '@/lib/share';

type Props = { params: Promise<{ offer: string }> };

/** Pre-build a page for every active offer slug at build time. */
export async function generateStaticParams() {
  const slugs = await getAllOfferSlugs();
  return slugs.map((offer) => ({ offer }));
}

async function load(slug: string) {
  const { items, facets, offers } = await loadCatalog();
  const offer = offers.find((o) => o.slug === slug);
  if (!offer) return null;
  const query = parseCatalogQuery({}, offer.slug);
  const results = filterAndSort(items, query, facets);
  const seo = catalogSeo(query, facets, results.length, `/products/${offer.slug}`);
  return { items, facets, offer, query, results, seo };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await load((await params).offer);
  if (!data) return { title: 'Offer not found', robots: { index: false } };
  return {
    title: { absolute: data.seo.title },
    description: data.offer.details?.slice(0, 160) || data.seo.description,
    alternates: { canonical: `/products/${data.offer.slug}` },
    openGraph: { title: data.seo.title, description: data.seo.description, url: `/products/${data.offer.slug}`, type: 'website', ...(data.offer.thumbnailUrl ? { images: [{ url: data.offer.thumbnailUrl, alt: data.offer.title }] } : shareOg) },
    twitter: { card: 'summary_large_image', title: data.seo.title, description: data.seo.description, ...(data.offer.thumbnailUrl ? { images: [data.offer.thumbnailUrl] } : shareTwitter) },
  };
}

export default async function OfferProductsPage({ params }: Props) {
  const data = await load((await params).offer);
  if (!data) notFound();
  const path = `/products/${data.offer.slug}`;
  const jsonLd = catalogJsonLd({ h1: data.seo.h1, description: data.seo.description, path, items: data.results.slice(0, PER_PAGE) });
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      <ProductsPageClient
        items={data.items}
        facets={data.facets}
        initialQuery={data.query}
        basePath={path}
        fixedOffer={data.offer.slug}
        offerDetails={data.offer.details}
      />
    </>
  );
}
