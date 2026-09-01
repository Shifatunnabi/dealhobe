"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView } from "framer-motion";
import { fadeUp, staggerContainer } from "@/components/animations/variants";
import { ColorfulTitle } from "@/components/ui";

export default function ParentingTipsSection({ tips = [] }: { tips?: any[] }) {
  const [index, setIndex] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const inView     = useInView(sectionRef, { once: false, margin: "-100px 0px" });

  const filteredTips = Array.isArray(tips) ? tips.filter(Boolean) : [];
  const validTips = filteredTips;

  useEffect(() => {
    setIndex(0);
  }, [validTips.length]);

  useEffect(() => {
    if (!inView || validTips.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % validTips.length);
    }, 3600);

    return () => clearInterval(timer);
  }, [inView, validTips.length]);

  if (!validTips.length) {
    return (
      <section className="w-full bg-soft-bg px-section pb-section">
        <div className="mx-auto max-w-7xl text-center">
          <div className="mb-4 text-center">
            <ColorfulTitle title="Parenting Tips" />
          </div>
          <p className="text-sm text-text-muted">No parenting tips are available right now.</p>
        </div>
      </section>
    );
  }

  const tip = validTips[index];
  if (!tip) return null;

  return (
    <section ref={sectionRef} className="w-full overflow-x-hidden bg-soft-bg px-section pb-section">
      <motion.div
        className="mx-auto max-w-7xl"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px 0px" }}
      >
        <motion.div variants={fadeUp} className="mb-8 text-center">
          <ColorfulTitle title="Parenting Tips" />
        </motion.div>

        <motion.div variants={fadeUp} className="overflow-hidden">
          <AnimatePresence mode="wait" initial={false}>
            <motion.article
              key={tip._id || tip.id}
              initial={{ opacity: 0, x: 42 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -42 }}
              transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
              className="overflow-hidden rounded-3xl border border-primary-pink/20 bg-white shadow-card md:min-h-48"
            >
              <div className="flex flex-col sm:flex-row">
                <div className="relative h-52 w-full shrink-0 sm:h-auto sm:w-[40%] md:min-h-48">
                  <Image
                    src={tip.imageUrl || tip.image || "/features/parent.png"}
                    alt={tip.title || "Parenting tip"}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, 40vw"
                  />
                </div>

                <div className="flex flex-1 items-center p-5 sm:p-7">
                  <div>
                    <h3 className="font-inter text-xl font-bold text-text-dark sm:text-2xl">
                      {tip.title}
                    </h3>
                    <p className="mt-3 font-inter text-sm leading-relaxed text-text-muted sm:text-base">
                      {tip.details || tip.text}
                    </p>
                  </div>
                </div>
              </div>
            </motion.article>
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </section>
  );
}
