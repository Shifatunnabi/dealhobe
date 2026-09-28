"use client";

import Image, { type ImageProps } from "next/image";

/**
 * next/image wrapper for `fill`-mode card images. Shows a static placeholder
 * and a short opacity fade after loading, without rerendering every card.
 * Images remain visible before hydration and if JavaScript is unavailable.
 * Must be placed inside a `position: relative` container (same requirement
 * as `fill` images already have).
 */
export default function FadeImage({ className, onLoad, alt, ...props }: ImageProps) {
  return (
    <>
      <div aria-hidden="true" className="absolute inset-0 bg-gray-100" />
      <Image
        {...props}
        alt={alt}
        onLoad={(e) => {
          if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            e.currentTarget.animate([{ opacity: 0.6 }, { opacity: 1 }], { duration: 180, easing: "ease-out" });
          }
          onLoad?.(e);
        }}
        className={className}
      />
    </>
  );
}
