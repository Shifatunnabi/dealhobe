"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { fadeUp } from "@/components/animations/variants";
import { ColorfulTitle, OfferCard } from "@/components/ui";

export default function PromotionsSection({ offer }: { offer?: any | null }) {
  if (!offer) {
    return (
      <section className="w-full bg-soft-bg px-section pb-4 md:pb-6">
        <div className="mx-auto max-w-7xl text-center">
          <p className="text-sm text-text-muted">No offers are available right now.</p>
        </div>
      </section>
    );
  }

  const endingDate = offer.endingDate ? new Date(offer.endingDate) : null;
  const isClosed = !offer.isActive || (endingDate && endingDate < new Date());

  return (
    <section className="w-full bg-soft-bg px-section pb-6 md:pb-8">
      <motion.div
        className="mx-auto max-w-7xl"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px 0px" }}
        variants={fadeUp}
      >
        <div className="mb-6 text-center">
          <ColorfulTitle title="Offers" as="h2" className="text-primary-pink" />
        </div>

        <div className="grid grid-cols-1">
          <OfferCard
            title={offer.title}
            slug={offer.slug}
            image={offer.thumbnailUrl}
            blurb={offer.details}
            index={0}
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
      </motion.div>
    </section>
  );
}
