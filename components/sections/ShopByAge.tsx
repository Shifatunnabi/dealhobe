"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { staggerContainer, fadeUp, scaleIn } from "@/components/animations/variants";
import { ColorfulTitle } from "@/components/ui";

/* ── Card component ──────────────────────────────────────────── */
function AgeCard({
  group,
  index,
  priority,
}: {
  group: { range: string; image: string; href: string };
  index: number;
  priority?: boolean;
}) {
  return (
    <motion.div
      variants={scaleIn}
      custom={index}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      style={{ willChange: "transform, opacity" }}
    >
      <Link
        href={group.href}
        className="group flex flex-col items-center gap-2 md:gap-4 text-center"
      >
        {/* Circle photo */}
        <div
          className="relative w-24 h-24 md:w-44 md:h-44 rounded-full overflow-hidden shadow-card group-hover:shadow-hover transition-shadow duration-300"
          style={{ backgroundColor: "#FFD6E7" }}
        >
          <Image
            src={group.image}
            alt={group.range}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-108"
            sizes="(max-width: 640px) 96px, 176px"
            priority={priority}
            loading={priority ? undefined : "lazy"}
          />
        </div>

        {/* Age range */}
        <span className="rounded-xl border-2 border-primary-pink px-3 py-1 text-sm md:px-6 md:py-2 md:text-lg font-semibold text-primary-pink transition-colors duration-300 group-hover:bg-primary-pink group-hover:text-white">
          {group.range}
        </span>
      </Link>
    </motion.div>
  );
}

/* ── Section ─────────────────────────────────────────────────── */
export default function ShopByAge({ ages = [] }: { ages?: any[] }) {
  if (!ages.length) {
    return (
      <section id="shop-by-age" className="w-full py-section px-section bg-soft-bg">
        <div className="mx-auto max-w-7xl text-center">
          <div className="mb-4 text-center">
            <ColorfulTitle title="Shop by Age" />
          </div>
          <p className="text-sm text-text-muted">No age ranges are available right now.</p>
        </div>
      </section>
    );
  }

  return (
    <section id="shop-by-age" className="w-full pt-5 pb-10 md:py-section px-section bg-soft-bg">
      <motion.div
        className="mx-auto max-w-7xl"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "120px 0px" }}
        style={{ willChange: "transform, opacity" }}
      >
        <motion.div variants={fadeUp} className="mb-4 md:mb-12 text-center">
          <ColorfulTitle title="Shop by Age" />
        </motion.div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-6">
          {ages.map((group, i) => (
            <AgeCard
              key={group._id}
              group={{ range: group.label, image: group.imageUrl, href: `/products?age=${group._id}` }}
              index={i}
              priority={i < 2}
            />
          ))}
        </div>
      </motion.div>
    </section>
  );
}
