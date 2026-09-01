"use client";

import { motion, useInView } from "framer-motion";
import { useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { staggerContainer } from "@/components/animations/variants";

/* ----------------------------------------------------------------
   Types
   ---------------------------------------------------------------- */
type SectionBg = "white" | "soft" | "soft-alt" | "yellow" | "dark" | "none";

export interface SectionWrapperProps {
  children:   ReactNode;
  className?: string;
  /** Pre-built background presets */
  bg?:        SectionBg;
  id?:        string;
  /** Remove default max-width container */
  fullWidth?: boolean;
}

/* ----------------------------------------------------------------
   Background map
   ---------------------------------------------------------------- */
const bgMap: Record<SectionBg, string> = {
  white:    "bg-white",
  soft:     "bg-soft-bg",
  "soft-alt": "bg-soft-bg-alt",
  yellow:   "bg-gradient-yellow",
  dark:     "bg-gradient-dark text-text-light",
  none:     "",
};

/* ----------------------------------------------------------------
   Component
   ---------------------------------------------------------------- */
export default function SectionWrapper({
  children,
  className,
  bg        = "white",
  id,
  fullWidth = false,
}: SectionWrapperProps) {
  const ref     = useRef<HTMLElement>(null);
  const inView  = useInView(ref, { once: true, margin: "-80px 0px" });

  return (
    <section
      id={id}
      ref={ref}
      className={cn("w-full py-section px-section", bgMap[bg], className)}
    >
      <motion.div
        className={cn(!fullWidth && "mx-auto max-w-7xl")}
        variants={staggerContainer}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
      >
        {children}
      </motion.div>
    </section>
  );
}
