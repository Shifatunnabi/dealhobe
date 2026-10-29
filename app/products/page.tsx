// Dynamic (reads searchParams) but cheap: every DB query is served from the Next.js Data Cache via
// unstable_cache() in lib/data.ts, and only slim card data is sent to the browser.
export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import ProductsPageClient from '@/components/pages/ProductsPageClient';
import { catalogSearch, catalogSeo, filterAndSort, parseCatalogQuery, PER_PAGE } from '@/lib/catalog';
import { catalogJsonLd, loadCatalog } from '@/lib/catalog-server';

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const query = parseCatalogQuery(await searchParams);
  const { items, facets } = await loadCatalog();
  const seo = catalogSeo(query, facets, filterAndSort(items, query, facets).length);
  return {
    title: { absolute: seo.title },
    description: seo.description,
    alternates: { canonical: seo.canonical },
    robots: seo.noindex ? { index: false, follow: true } : undefined,
    openGraph: { title: seo.title, description: seo.description, url: seo.canonical, type: 'website' },
  };
}

export default async function ProductsPage({ searchParams }: Props) {
  const query = parseCatalogQuery(await searchParams);
  const { items, facets } = await loadCatalog();
  const results = filterAndSort(items, query, facets);
  const seo = catalogSeo(query, facets, results.length);
  const jsonLd = catalogJsonLd({ h1: seo.h1, description: seo.description, path: seo.canonical, items: results.slice(0, PER_PAGE) });

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      {/* Remount when a server navigation changes the query (e.g. a navbar category link while already here). */}
      <ProductsPageClient key={catalogSearch(query)} items={items} facets={facets} initialQuery={query} basePath="/products" />
    </>
  );
}
