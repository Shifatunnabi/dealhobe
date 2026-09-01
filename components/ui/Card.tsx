"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { cardHover } from "@/components/animations/variants";

/* ----------------------------------------------------------------
   Types
   ---------------------------------------------------------------- */
type CardPadding  = "none" | "sm" | "md" | "lg";
type CardRounding = "xl" | "2xl" | "3xl";

export interface CardProps {
  children:   ReactNode;
  className?: string;
  /** Enable Framer Motion lift/scale on hover */
  hoverable?: boolean;
  padding?:   CardPadding;
  rounding?:  CardRounding;
  /** Override the default white background */
  bg?:        string;
  onClick?:   () => void;
}

/* ----------------------------------------------------------------
   Style maps
   ---------------------------------------------------------------- */
const paddingMap: Record<CardPadding, string> = {
  none: "",
  sm:   "p-4",
  md:   "p-5 md:p-6",
  lg:   "p-6 md:p-8",
};

const roundingMap: Record<CardRounding, string> = {
  xl:  "rounded-xl",
  "2xl": "rounded-2xl",
  "3xl": "rounded-3xl",
};

/* ----------------------------------------------------------------
   Component
   ---------------------------------------------------------------- */
export default function Card({
  children,
  className,
  hoverable = true,
  padding   = "md",
  rounding  = "3xl",
  bg        = "bg-white",
  onClick,
}: CardProps) {
  return (
    <motion.div
      initial="rest"
      animate="rest"
      whileHover={hoverable ? "hover" : "rest"}
      variants={hoverable ? cardHover : undefined}
      onClick={onClick}
      className={cn(
        bg,
        roundingMap[rounding],
        "shadow-card transition-shadow duration-300",
        hoverable && "cursor-pointer",
        paddingMap[padding],
        className,
      )}
    >
      {children}
    </motion.div>
  );
}
