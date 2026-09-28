"use client";

import type { ImageLoaderProps } from "next/image";

/** Cloudinary resizes public uploads directly; Next only optimizes local files. */
export default function imageLoader({ src, width, quality }: ImageLoaderProps) {
  if (/^https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\//.test(src) && !src.includes("/s--")) {
    return src.replace("/image/upload/", `/image/upload/c_limit,w_${width}/f_auto/q_${quality || "auto"}/`);
  }
  if (src.startsWith("/") && !src.startsWith("//") && !/\.svg(?:\?|$)/i.test(src)) {
    return `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=${quality || 75}`;
  }
  // Keep signed URLs and other providers intact; do not proxy remote fetches.
  return src;
}
