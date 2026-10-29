// ISR: revalidate offers every 5 minutes.
export const revalidate = 300;

import type { Metadata } from 'next';
import { getOffers } from '@/lib/data';
import { loadCatalog } from '@/lib/catalog-server';
import { isOfferActive } from '@/lib/offers';
import { slimCard } from '@/components/content/slim';
import OffersPageClient, { type DiscountedItem } from './OffersPageClient';
import { shareOg, shareTwitter } from '@/lib/share';

export const metadata: Metadata = {
  title: 'Offers & Deals on Authentic Cosmetics',
  description:
    'Live beauty offers at DealHobe — discounts on authentic makeup, skin care and hair care, with cash on delivery across Bangladesh.',
  alternates: { canonical: '/offers' },
  openGraph: {
    title: 'Offers & Deals | DealHobe Bangladesh',
    description: 'Limited-time discounts on authentic cosmetics. Cash on delivery across Bangladesh.',
    url: '/offers',
    type: 'website',
    ...shareOg,
  },
  twitter: { card: 'summary_large_image', ...shareTwitter },
};

export default async function OffersPage() {
  const [offers, { items }] = await Promise.all([getOffers(), loadCatalog()]);

  // Every product currently on discount, biggest saving first. Only the slim card fields go to the browser.
  const discounted: DiscountedItem[] = items
    .filter((p) => p.discountPct > 0)
    .sort((a, b) => b.discountPct - a.discountPct || b.sold - a.sold)
    .map((p) => ({ ...slimCard(p), discountPct: p.discountPct, effectivePrice: p.effectivePrice, sold: p.sold }));

  // Decided on the server (page revalidates every 5 min) with the same rule the catalog uses for pricing.
  const withStatus = offers.map((o) => ({ ...o, isClosed: !isOfferActive(o) }));

  return <OffersPageClient offers={withStatus} products={discounted} />;
}
