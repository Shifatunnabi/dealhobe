"use client";

import { motion } from "framer-motion";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { cn } from "@/lib/utils";

/* ----------------------------------------------------------------
   Types
   ---------------------------------------------------------------- */
export interface SliderControlsProps {
  onPrev:        () => void;
  onNext:        () => void;
  /** Zero-based index of the active slide */
  currentIndex?: number;
  total?:        number;
  className?:    string;
  /** Show dot-style pagination instead of "1 / N" counter */
  dots?:         boolean;
}

/* ----------------------------------------------------------------
   Sub-components
   ---------------------------------------------------------------- */
const ArrowButton = ({
  direction,
  onClick,
  label,
}: {
  direction: "prev" | "next";
  onClick:   () => void;
  label:     string;
}) => {
  const isNext = direction === "next";

  return (
    <motion.button
      whileHover={{ scale: 1.1, y: -2 }}
      whileTap={{ scale: 0.93 }}
      transition={{ duration: 0.2, ease: [0.34, 1.56, 0.64, 1] }}
      onClick={onClick}
      aria-label={label}
      className={cn(
        "flex h-11 w-11 items-center justify-center rounded-2xl transition-colors duration-200",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-pink",
        isNext
          ? "bg-gradient-primary text-white shadow-button hover:shadow-hover"
          : "border border-primary-pink/20 bg-white text-primary-pink shadow-card hover:bg-primary-pink hover:text-white",
      )}
    >
      {isNext ? <FiChevronRight size={20} /> : <FiChevronLeft size={20} />}
    </motion.button>
  );
};

/* ----------------------------------------------------------------
   Component
   ---------------------------------------------------------------- */
export default function SliderControls({
  onPrev,
  onNext,
  currentIndex,
  total,
  className,
  dots = false,
}: SliderControlsProps) {
  const showCounter = !dots && typeof currentIndex === "number" && typeof total === "number";
  const showDots    =  dots && typeof currentIndex === "number" && typeof total === "number";

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <ArrowButton direction="prev" onClick={onPrev} label="Previous" />

      {/* Counter */}
      {showCounter && (
        <span className="min-w-[3rem] text-center font-inter text-sm text-text-muted">
          {currentIndex! + 1}&nbsp;/&nbsp;{total}
        </span>
      )}

      {/* Dots */}
      {showDots && (
        <div className="flex items-center gap-1.5">
          {Array.from({ length: total! }).map((_, i) => (
            <motion.span
              key={i}
              animate={{
                width:           i === currentIndex ? 20  : 8,
                backgroundColor: i === currentIndex ? "var(--primary-pink)" : "var(--primary-pink-light)",
              }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="h-2 rounded-full"
            />
          ))}
        </div>
      )}

      <ArrowButton direction="next" onClick={onNext} label="Next" />
    </div>
  );
}
