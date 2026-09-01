// ISR: revalidate offers every 5 minutes.
export const revalidate = 300;

import { getOffers } from '@/lib/data';
import OffersPageClient from './OffersPageClient';

export default async function OffersPage() {
  const offers = await getOffers();
  return <OffersPageClient offers={offers} />;
}
