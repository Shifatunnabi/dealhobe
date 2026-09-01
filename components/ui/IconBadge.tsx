import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/* ----------------------------------------------------------------
   Types
   ---------------------------------------------------------------- */
type IconBadgeVariant = "pink" | "yellow" | "blue" | "soft" | "dark";
type IconBadgeSize    = "sm" | "md" | "lg" | "xl";

export interface IconBadgeProps {
  icon:       ReactNode;
  variant?:   IconBadgeVariant;
  size?:      IconBadgeSize;
  className?: string;
  /** Accessible label for screen readers */
  label?:     string;
}

/* ----------------------------------------------------------------
   Style maps
   ---------------------------------------------------------------- */
const variantStyles: Record<IconBadgeVariant, string> = {
  pink:   "bg-gradient-primary   text-white shadow-button",
  yellow: "bg-gradient-yellow    text-text-dark",
  blue:   "bg-gradient-blue      text-white",
  soft:   "bg-soft-bg            text-primary-pink shadow-soft",
  dark:   "bg-dark-bg-surface    text-text-light",
};

const sizeStyles: Record<IconBadgeSize, string> = {
  sm: "h-9  w-9  text-base   rounded-xl",
  md: "h-12 w-12 text-xl     rounded-2xl",
  lg: "h-16 w-16 text-2xl    rounded-2xl",
  xl: "h-20 w-20 text-3xl    rounded-3xl",
};

/* ----------------------------------------------------------------
   Component — intentionally a server component (no hooks needed)
   ---------------------------------------------------------------- */
export default function IconBadge({
  icon,
  variant   = "pink",
  size      = "md",
  className,
  label,
}: IconBadgeProps) {
  return (
    <div
      role={label ? "img" : undefined}
      aria-label={label}
      className={cn(
        "inline-flex flex-shrink-0 items-center justify-center",
        "transition-transform duration-200 hover:scale-110",
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
    >
      {icon}
    </div>
  );
}
