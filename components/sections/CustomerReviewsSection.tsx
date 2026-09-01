"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useInView } from "framer-motion";
import { fadeUp, staggerContainer } from "@/components/animations/variants";
import { FiUser } from "react-icons/fi";
import { ColorfulTitle } from "@/components/ui";


function ReviewCard({ name, text }: { name: string; text: string }) {
  return (
    <article className="rounded-3xl border border-primary-pink/20 bg-white p-5 shadow-card">
      <div className="mb-3 flex items-center gap-2.5">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary-pink/10 text-primary-pink">
          <FiUser className="h-4 w-4" />
        </span>
        <p className="font-inter text-base font-semibold text-text-dark">{name}</p>
      </div>

      <p className="font-inter text-sm leading-relaxed text-text-muted md:text-base">
        &quot;{text}&quot;
      </p>
    </article>
  );
}

export default function CustomerReviewsSection({ reviews = [] }: { reviews?: any[] }) {
  const [startIndex, setStartIndex] = useState(0);

  // Imperative ref for CSS transition — avoids a second React re-render per cycle
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionRef   = useRef<HTMLElement>(null);
  // Pause the timer when the section is scrolled out of view
  const inView       = useInView(sectionRef, { once: false, margin: "-100px 0px" });

  const validReviews = reviews.length ? reviews : [];

  useEffect(() => {
    if (!inView || validReviews.length <= 1) return;

    let snapBackId: ReturnType<typeof setTimeout>;

    const timer = setInterval(() => {
      const el = containerRef.current;
      if (!el) return;

      // Slide left via CSS transition (no React re-render)
      el.style.transition = "transform 500ms cubic-bezier(0.4, 0, 0.2, 1)";
      el.style.transform  = "translateX(-25%)";

      // After the transition finishes: update index (one render) then snap back instantly
      snapBackId = setTimeout(() => {
        setStartIndex((prev) => (prev + 1) % validReviews.length);
        if (containerRef.current) {
          containerRef.current.style.transition = "none";
          containerRef.current.style.transform  = "translateX(0%)";
        }
      }, 520);
    }, 3200);

    return () => {
      clearInterval(timer);
      clearTimeout(snapBackId);
    };
  }, [inView, validReviews.length]);

  const desktopCards = useMemo(() => {
    return [0, 1, 2, 3].map(
      (offset) => validReviews[(startIndex + offset) % validReviews.length],
    );
  }, [startIndex, validReviews]);

  const mobileCard = validReviews[startIndex % validReviews.length];

  if (!validReviews.length) {
    return (
      <section className="w-full bg-soft-bg px-section py-section">
        <div className="mx-auto max-w-7xl text-center">
          <div className="mb-4 text-center">
            <ColorfulTitle title="Customer Reviews" />
          </div>
          <p className="text-sm text-text-muted">No customer reviews yet.</p>
        </div>
      </section>
    );
  }

  return (
    <section ref={sectionRef} className="w-full bg-soft-bg px-section py-section">
      <motion.div
        className="mx-auto max-w-7xl"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px 0px" }}
      >
        <motion.div variants={fadeUp} className="mb-8 text-center">
          <ColorfulTitle title="Customer Reviews" />
        </motion.div>

        {/* Desktop: imperative CSS slide */}
        <motion.div variants={fadeUp} className="hidden overflow-hidden md:block">
          <div ref={containerRef} className="flex items-stretch">
            {desktopCards.map((review, index) => (
              <div
                key={`${review._id || review.id || index}-${index}`}
                className="min-w-0 shrink-0 basis-1/3 px-2.5"
              >
                <ReviewCard name={review.customerName || review.name} text={review.review || review.text} />
              </div>
            ))}
          </div>
        </motion.div>

        {/* Mobile: Framer Motion fade-slide */}
        <motion.div variants={fadeUp} className="md:hidden">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={mobileCard._id || mobileCard.id}
              initial={{ opacity: 0, x: 80 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -80 }}
              transition={{ duration: 0.42, ease: [0.4, 0, 0.2, 1] }}
            >
              <ReviewCard name={mobileCard.customerName || mobileCard.name} text={mobileCard.review || mobileCard.text} />
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </section>
  );
}
