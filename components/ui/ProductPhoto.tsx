"use client";

import imageLoader from "@/lib/image-loader";
import { cn } from "@/lib/utils";

/**
 * A product photo shown at its own size at most — scaled down to fit its box, never stretched
 * up or cropped — centred on white. A square photo fills the box; any other shape sits in the
 * middle of it. Fills the nearest `position: relative` parent.
 *
 * A plain <img> with a single URL (no srcset) is deliberate: the browser then sizes it by the
 * file's real pixels, so a small photo is never enlarged. `requestWidth` caps the download
 * (Cloudinary never upscales past the original).
 */
export default function ProductPhoto({
  src,
  alt,
  requestWidth,
  quality,
  loading = "lazy",
  fetchPriority,
  className,
  imgClassName,
}: {
  src: string;
  alt: string;
  requestWidth: number;
  /** 100 = Cloudinary's best automatic quality (main gallery); default is its standard auto quality. */
  quality?: number;
  loading?: "lazy" | "eager";
  fetchPriority?: "high" | "low" | "auto";
  className?: string;
  imgClassName?: string;
}) {
  return (
    <div className={cn("absolute inset-0 flex items-center justify-center bg-white", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element -- see component comment */}
      <img
        src={imageLoader({ src, width: requestWidth, quality })}
        alt={alt}
        loading={loading}
        fetchPriority={fetchPriority}
        decoding="async"
        className={cn("block h-auto max-h-full w-auto max-w-full", imgClassName)}
      />
    </div>
  );
}
