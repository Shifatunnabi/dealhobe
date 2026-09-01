"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useInView } from "framer-motion";
import {
  FiChevronDown,
  FiChevronUp,
  FiStar,
  FiBookOpen,
  FiUser,
} from "react-icons/fi";
import { fadeUp, staggerContainer } from "@/components/animations/variants";
import { ColorfulTitle } from "@/components/ui";
import { cn } from "@/lib/utils";

type PanelType = "reviews" | "tips";

const REVIEW_ITEMS = [
  { id: 1, name: "Nusrat Jahan", text: "My daughter loved the puzzle set. Quality is truly premium and delivery was super quick." },
  { id: 2, name: "Farhana Rahman", text: "Finally found imported toys that feel safe and durable. Packaging was beautiful too." },
  { id: 3, name: "Samira Akter", text: "The toy car set is exactly as shown. JoyToy customer support was very responsive." },
  { id: 4, name: "Tanjina Islam", text: "Great quality and no sharp edges. My son is obsessed with his new blocks." },
  { id: 5, name: "Ishrat Moon", text: "Reliable page. I have ordered three times and every product was authentic." },
  { id: 6, name: "Rafiya Ahmed", text: "Loved the details and finishing. Kids are happy and so am I." },
  { id: 7, name: "Tahmina Yasmin", text: "Worth every taka. Soft materials and age-appropriate toys." },
  { id: 8, name: "Amena Chowdhury", text: "Easy checkout and trusted quality. Will definitely order again." },
];

const TIP_ITEMS = [
  { id: 1, title: "Rotate Toys Weekly", detail: "Keep only a few toys visible and rotate every week to boost curiosity and reduce clutter." },
  { id: 2, title: "Create Play Zones", detail: "Set a small reading corner and a building corner so children can focus by activity type." },
  { id: 3, title: "Use Open-Ended Toys", detail: "Blocks, figurines, and art kits encourage imagination more than one-action toys." },
  { id: 4, title: "Play Together Daily", detail: "Spend 20 minutes of distraction-free play each day to strengthen bonding and confidence." },
  { id: 5, title: "Ask Reflective Questions", detail: "Questions like 'What can we build next?' improve language and problem-solving skills." },
  { id: 6, title: "Mix Indoor and Outdoor Play", detail: "Balance active movement with calm indoor play for healthier emotional regulation." },
  { id: 7, title: "Praise Effort, Not Perfection", detail: "Celebrate trying and learning to help children build resilience and independent thinking." },
  { id: 8, title: "Choose Age-Right Challenges", detail: "Slightly challenging toys keep kids engaged without causing frustration." },
];

function PromiseSquare({
  title,
  image,
}: {
  title: string;
  image: string;
}) {
  return (
    <motion.article
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      className="group relative aspect-square overflow-hidden rounded-3xl border border-primary-pink/20 shadow-card"
    >
      <Image
        src={image}
        alt={title}
        fill
        className="object-cover transition-transform duration-500 group-hover:scale-105"
        sizes="(max-width: 768px) 100vw, 50vw"
      />
      <div className="absolute inset-0 bg-linear-to-t from-black/75 via-black/20 to-transparent" />
      <div className="absolute bottom-0 left-0 p-5 md:p-6">
        <h3 className="text-2xl font-bold text-white md:text-3xl">{title}</h3>
      </div>
    </motion.article>
  );
}

function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (nextPage: number) => void;
}) {
  if (totalPages <= 1) return null;

  return (
    <div className="mt-5 flex items-center justify-center gap-2">
      {Array.from({ length: totalPages }).map((_, index) => {
        const nextPage = index + 1;
        const isActive = nextPage === page;

        return (
          <button
            key={nextPage}
            type="button"
            onClick={() => onChange(nextPage)}
            aria-label={`Go to page ${nextPage}`}
            className={cn(
              "h-8 min-w-8 rounded-full px-2 text-sm font-semibold transition-colors duration-200",
              isActive
                ? "bg-primary-pink text-white shadow-button"
                : "bg-white text-primary-pink hover:bg-primary-pink/10",
            )}
          >
            {nextPage}
          </button>
        );
      })}
    </div>
  );
}

function ReviewCard({ name, text }: { name: string; text: string }) {
  return (
    <article className="rounded-2xl border border-primary-pink/35 bg-primary-pink p-4 text-white shadow-[0_10px_25px_rgba(232,2,129,0.35)]">
      <div className="mb-2 flex items-center gap-2">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
          <FiUser className="h-4 w-4" />
        </span>
        <p className="text-sm font-semibold md:text-base">{name}</p>
      </div>
      <p className="text-sm leading-relaxed md:text-base">"{text}"</p>
    </article>
  );
}

function TipCard({ title, detail }: { title: string; detail: string }) {
  return (
    <article className="rounded-2xl border border-primary-pink/35 bg-primary-pink p-4 text-white shadow-[0_10px_25px_rgba(232,2,129,0.35)]">
      <h4 className="text-base font-bold text-white md:text-lg">{title}</h4>
      <div className="mt-2 h-px w-full bg-white/80" />
      <p className="mt-2 text-sm leading-relaxed md:text-base">{detail}</p>
    </article>
  );
}

export default function FeaturesSection() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px 0px" });

  const [activePanel, setActivePanel] = useState<PanelType | null>(null);
  const [reviewPage, setReviewPage] = useState(1);
  const [tipPage, setTipPage] = useState(1);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const updateIsMobile = () => setIsMobile(window.innerWidth < 768);
    updateIsMobile();
    window.addEventListener("resize", updateIsMobile);
    return () => window.removeEventListener("resize", updateIsMobile);
  }, []);

  const itemsPerPage = isMobile ? 2 : 4;

  const reviewTotalPages = Math.ceil(REVIEW_ITEMS.length / itemsPerPage);
  const tipTotalPages = Math.ceil(TIP_ITEMS.length / itemsPerPage);

  useEffect(() => {
    setReviewPage((prev) => Math.min(prev, reviewTotalPages));
    setTipPage((prev) => Math.min(prev, tipTotalPages));
  }, [reviewTotalPages, tipTotalPages]);

  const visibleReviews = useMemo(() => {
    const start = (reviewPage - 1) * itemsPerPage;
    return REVIEW_ITEMS.slice(start, start + itemsPerPage);
  }, [reviewPage, itemsPerPage]);

  const visibleTips = useMemo(() => {
    const start = (tipPage - 1) * itemsPerPage;
    return TIP_ITEMS.slice(start, start + itemsPerPage);
  }, [tipPage, itemsPerPage]);

  const togglePanel = (panel: PanelType) => {
    setActivePanel((current) => (current === panel ? null : panel));
  };

  return (
    <section ref={ref} className="w-full bg-soft-bg py-section px-section">
      <motion.div
        className="mx-auto max-w-7xl"
        variants={staggerContainer}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
      >
        <motion.div variants={fadeUp} className="mb-12 text-center">
          <ColorfulTitle title="The JoyToy Promise" />
        </motion.div>

        <motion.div variants={fadeUp} className="space-y-4 md:space-y-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
            <PromiseSquare
              title="100% Imported"
              image="/features/import.png"
            />
            <PromiseSquare
              title="Safe Materials"
              image="/features/safe.png"
            />
          </div>

          <article className="overflow-hidden rounded-3xl border border-primary-pink/30 bg-primary-pink text-white shadow-card">
            <div className="flex min-h-20 items-center gap-3 px-4 py-3 md:px-6">
              <h3 className="grow text-2xl font-semibold leading-none text-white md:text-5xl">Customer reviews</h3>
              <div className="hidden items-center gap-1 md:flex">
                {Array.from({ length: 4 }).map((_, index) => (
                  <FiStar key={index} className="h-6 w-6 fill-white text-white" />
                ))}
              </div>
              <button
                type="button"
                onClick={() => togglePanel("reviews")}
                aria-expanded={activePanel === "reviews"}
                aria-controls="joytoy-reviews-panel"
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 transition-colors duration-200 hover:bg-white/30"
              >
                {activePanel === "reviews" ? <FiChevronUp className="h-5 w-5" /> : <FiChevronDown className="h-5 w-5" />}
              </button>
            </div>

            <AnimatePresence initial={false}>
              {activePanel === "reviews" && (
                <motion.div
                  id="joytoy-reviews-panel"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.32, ease: [0.4, 0, 0.2, 1] }}
                  className="overflow-hidden border-t border-primary-pink/40 bg-soft-bg"
                >
                  <div className="m-3 rounded-2xl border-2 border-primary-pink/45 bg-soft-bg p-4 md:m-5 md:p-5">
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
                      {visibleReviews.map((review) => (
                        <ReviewCard key={review.id} name={review.name} text={review.text} />
                      ))}
                    </div>
                    <Pagination page={reviewPage} totalPages={reviewTotalPages} onChange={setReviewPage} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </article>

          <article className="overflow-hidden rounded-3xl border border-primary-pink/30 bg-primary-pink text-white shadow-card">
            <div className="flex min-h-20 items-center gap-3 px-4 py-3 md:px-6">
              <h3 className="grow text-2xl font-semibold leading-none text-white md:text-5xl">Parenting tips</h3>
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                <FiBookOpen className="h-5 w-5" />
              </div>
              <button
                type="button"
                onClick={() => togglePanel("tips")}
                aria-expanded={activePanel === "tips"}
                aria-controls="joytoy-tips-panel"
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 transition-colors duration-200 hover:bg-white/30"
              >
                {activePanel === "tips" ? <FiChevronUp className="h-5 w-5" /> : <FiChevronDown className="h-5 w-5" />}
              </button>
            </div>

            <AnimatePresence initial={false}>
              {activePanel === "tips" && (
                <motion.div
                  id="joytoy-tips-panel"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.32, ease: [0.4, 0, 0.2, 1] }}
                  className="overflow-hidden border-t border-primary-pink/40 bg-soft-bg"
                >
                  <div className="m-3 rounded-2xl border-2 border-primary-pink/45 bg-soft-bg p-4 md:m-5 md:p-5">
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
                      {visibleTips.map((tip) => (
                        <TipCard key={tip.id} title={tip.title} detail={tip.detail} />
                      ))}
                    </div>
                    <Pagination page={tipPage} totalPages={tipTotalPages} onChange={setTipPage} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </article>
        </motion.div>
      </motion.div>
    </section>
  );
}
