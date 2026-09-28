"use client";

import Link from "next/link";
import { OfferCard } from "@/components/ui";
import SectionHeader from "./SectionHeader";
import type { PlainOffer } from "@/lib/data";

export default function PromotionsSection({ offer }: { offer?: PlainOffer | null }) {
  if (!offer) {
    return (
      <section className="w-full bg-soft-bg px-section pb-4 md:pb-6">
        <div className="mx-auto max-w-7xl">
          <SectionHeader title="Offers" />
          <p className="text-sm text-text-muted">No offers are available right now.</p>
        </div>
      </section>
    );
  }

  const endingDate = offer.endingDate ? new Date(offer.endingDate) : null;
  const isClosed = !offer.isActive || (endingDate && endingDate < new Date());

  return (
    <section className="w-full bg-soft-bg px-section pb-6 md:pb-8">
      <div
        className="mx-auto max-w-7xl"
      >
        <SectionHeader title="Offers" />

        <div className="grid grid-cols-1">
          <OfferCard
            title={offer.title}
            slug={offer.slug}
            image={offer.thumbnailUrl}
            blurb={offer.details}
            index={0}
            animateEntrance={false}
            isClosed={Boolean(isClosed)}
          />
        </div>

        <div className="mt-5 flex justify-center">
          <Link
            href="/offers"
            className="inline-flex items-center justify-center rounded-2xl border-2 border-primary-pink px-5 py-2 text-sm font-semibold text-primary-pink transition-colors hover:bg-primary-pink hover:text-white"
          >
            View All Offers
          </Link>
        </div>
      </div>
    </section>
  );
}
