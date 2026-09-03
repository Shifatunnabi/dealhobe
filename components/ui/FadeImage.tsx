"use client";

import { useState } from "react";
import Image, { type ImageProps } from "next/image";
import { cn } from "@/lib/utils";

/**
 * next/image wrapper for `fill`-mode card images. Shows a pulsing skeleton
 * and fades the image in once it finishes loading, instead of the photo
 * popping in abruptly the instant the network fetch completes — that abrupt
 * pop, happening while the card's own scroll-in animation plays, is what
 * reads as a stutter while scrolling through product/category grids.
 * Must be placed inside a `position: relative` container (same requirement
 * as `fill` images already have).
 */
export default function FadeImage({ className, onLoad, ...props }: ImageProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <>
      {!loaded && <div className="absolute inset-0 animate-pulse bg-gray-100" />}
      {/* Opacity fade lives on this wrapper, not the <Image> itself — the
          image usually carries its own `transition-transform` (hover scale),
          and Tailwind's per-property transition utilities can't safely
          coexist on one element since only one `transition-property` wins. */}
      <div className={cn("absolute inset-0 transition-opacity duration-500", loaded ? "opacity-100" : "opacity-0")}>
        <Image
          {...props}
          onLoad={(e) => {
            setLoaded(true);
            onLoad?.(e);
          }}
          className={className}
        />
      </div>
    </>
  );
}
