"use client";

import { motion } from "framer-motion";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/utils";

/* ----------------------------------------------------------------
   Types
   ---------------------------------------------------------------- */
type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";
type ButtonSize    = "sm" | "md" | "lg";

export interface ButtonProps extends ComponentPropsWithoutRef<"button"> {
  variant?:  ButtonVariant;
  size?:     ButtonSize;
  loading?:  boolean;
  fullWidth?: boolean;
  leftIcon?:  ReactNode;
  rightIcon?: ReactNode;
}

/* ----------------------------------------------------------------
   Style maps
   ---------------------------------------------------------------- */
const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-primary-pink text-white shadow-button hover:shadow-hover hover:bg-primary-pink-dark",
  secondary:
    "bg-gradient-yellow text-text-dark shadow-card hover:shadow-hover",
  outline:
    "border-2 border-primary-pink text-primary-pink bg-transparent hover:bg-primary-pink hover:text-white",
  ghost:
    "text-primary-pink bg-transparent hover:bg-primary-pink/10",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-4 py-2.5 text-sm  min-h-[40px]  gap-1.5",
  md: "px-6 py-3   text-base min-h-[48px]  gap-2",
  lg: "px-8 py-4   text-lg  min-h-[56px]  gap-2.5",
};

/* ----------------------------------------------------------------
   Component
   ---------------------------------------------------------------- */
export default function Button({
  variant   = "primary",
  size      = "md",
  loading   = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <motion.button
      whileHover={isDisabled ? {} : { y: -2, scale: 1.03 }}
      whileTap={isDisabled   ? {} : { scale: 0.96 }}
      transition={{ duration: 0.2, ease: [0.34, 1.56, 0.64, 1] }}
      disabled={isDisabled}
      className={cn(
        // Base
        "relative inline-flex items-center justify-center",
        "rounded-2xl font-inter font-semibold tracking-wide",
        "transition-all duration-200 cursor-pointer select-none",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-pink",
        // Variant + size
        variantStyles[variant],
        sizeStyles[size],
        // Modifiers
        fullWidth  && "w-full",
        isDisabled && "opacity-60 pointer-events-none cursor-not-allowed",
        className,
      )}
      // Cast needed because motion.button types diverge from HTMLButtonElement in some versions
      {...(props as object)}
    >
      {/* Spinner overlay */}
      {loading && (
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
        </span>
      )}

      <span className={cn("flex items-center gap-inherit", loading && "opacity-0")}>
        {leftIcon}
        {children}
        {rightIcon}
      </span>
    </motion.button>
  );
}
