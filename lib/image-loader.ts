import type { ImageLoaderProps } from "next/image";

/** Cloudinary resizes public uploads directly; Next only optimizes local files. */
export default function imageLoader({ src, width, quality }: ImageLoaderProps) {
  if (/^https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\//.test(src) && !src.includes("/s--")) {
    // quality 100 means "as sharp as possible": Cloudinary's best automatic quality, never a fixed lossy number.
    const q = quality && quality >= 100 ? "auto:best" : quality || "auto";
    return src.replace("/image/upload/", `/image/upload/c_limit,w_${width}/f_auto/q_${q}/`);
  }
  if (src.startsWith("/") && !src.startsWith("//") && !/\.svg(?:\?|$)/i.test(src)) {
    return `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=${quality || 75}`;
  }
  // Keep signed URLs and other providers intact; do not proxy remote fetches.
  return src;
}
