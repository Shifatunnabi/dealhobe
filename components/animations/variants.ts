/**
 * JoyToy Framer Motion Variants
 *
 * Duration rules:
 *   micro-interactions → 0.2s
 *   hover animations   → 0.3s
 *   section reveals    → 0.6s
 *
 * All animations use named easing curves from the design system.
 */
import type { Variants, Transition } from "framer-motion";

/* ----------------------------------------------------------------
   Shared easing references (mirrors CSS vars)
   ---------------------------------------------------------------- */
const easeSmooth: [number, number, number, number] = [0.4, 0, 0.2, 1];
const easeBounce: [number, number, number, number] = [0.34, 1.56, 0.64, 1];
const easeSpring: [number, number, number, number] = [0.175, 0.885, 0.32, 1.275];

/* ----------------------------------------------------------------
   Section / scroll-triggered reveals
   ---------------------------------------------------------------- */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: easeSmooth } as Transition,
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.5, ease: easeSmooth } as Transition,
  },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96, y: 8 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.4, ease: easeSmooth } as Transition,
  },
};

export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: easeSmooth } as Transition,
  },
};

export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: easeSmooth } as Transition,
  },
};

/* ----------------------------------------------------------------
   Stagger container — wraps lists of animated children
   ---------------------------------------------------------------- */
export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

export const staggerFast: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0,
    },
  },
};

/* ----------------------------------------------------------------
   Hover animations (used with initial="rest" whileHover="hover")
   ---------------------------------------------------------------- */

/** Lifts the element 4px on hover */
export const hoverLift: Variants = {
  rest:  { y: 0, transition: { duration: 0.3, ease: easeSmooth } },
  hover: { y: -4, transition: { duration: 0.3, ease: easeSmooth } },
};

/** Scales element slightly on hover */
export const scaleHover: Variants = {
  rest:  { scale: 1,    transition: { duration: 0.3, ease: easeBounce } },
  hover: { scale: 1.05, transition: { duration: 0.3, ease: easeBounce } },
};

/**
 * Full card hover effect — lift + scale
 * Apply with initial="rest" animate="rest" whileHover="hover"
 */
export const cardHover: Variants = {
  rest: {
    y: 0,
    scale: 1,
    transition: { duration: 0.3, ease: easeSmooth },
  },
  hover: {
    y: -8,
    scale: 1.02,
    transition: { duration: 0.3, ease: easeSmooth },
  },
};

/* ----------------------------------------------------------------
   Button / CTA micro-interactions (duration: 0.2s)
   ---------------------------------------------------------------- */
export const buttonTap = {
  whileTap:   { scale: 0.96 },
  whileHover: { scale: 1.03, y: -2 },
  transition: { duration: 0.2, ease: easeBounce },
} as const;

/* ----------------------------------------------------------------
   Loader / page transition
   ---------------------------------------------------------------- */
export const loaderExit: Variants = {
  visible: { opacity: 1 },
  hidden: {
    opacity: 0,
    transition: { duration: 0.45, ease: easeSmooth, delay: 0.15 },
  },
};

export const popIn: Variants = {
  hidden: { opacity: 0, scale: 0.6 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: easeSpring },
  },
};
