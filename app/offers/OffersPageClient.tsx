"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { FiChevronRight } from "react-icons/fi";
import { fadeUp, staggerContainer } from "@/components/animations/variants";

import { ColorfulTitle, OfferCard } from "@/components/ui";

export default function OffersPageClient({ offers = [] }: { offers?: any[] }) {
  const now = new Date();
  return (
    <main className="min-h-screen bg-soft-bg py-24">
      <motion.section
        className="mx-auto w-full max-w-7xl px-section"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <motion.header variants={fadeUp} className="mb-10 pt-8 text-center">
          <nav
            aria-label="breadcrumb"
            className="mb-5 flex items-center justify-center gap-2 text-small text-text-muted"
          >
            <Link href="/" className="transition-colors hover:text-primary-pink">
              Home
            </Link>
            <FiChevronRight size={12} />
            <span className="font-semibold text-text-dark">Offers</span>
          </nav>
          <ColorfulTitle title="Offers" as="h1" className="text-primary-pink" />
          <p className="mx-auto mt-3 max-w-2xl text-sm text-text-muted md:text-base">
            Grab limited-time toy offers crafted for joyful play, safer choices, and smart savings for every family.
          </p>
        </motion.header>

        {offers.length === 0 ? (
           <div className="text-center py-12 text-text-muted">No active offers at the moment. Please check back later!</div>
        ) : (
          <motion.div variants={fadeUp} className="grid grid-cols-1 gap-4 md:gap-5">
            {offers.map((offer, index) => {
              const endingDate = offer.endingDate ? new Date(offer.endingDate) : null;
              const isClosed = !offer.isActive || (endingDate && endingDate < now);
              return (
              <OfferCard
                key={offer._id}
                title={offer.title}
                slug={offer.slug}
                image={offer.thumbnailUrl}
                blurb={offer.details}
                index={index}
                isClosed={Boolean(isClosed)}
              />
            );
            })}
          </motion.div>
        )}
      </motion.section>
    </main>
  );
}
