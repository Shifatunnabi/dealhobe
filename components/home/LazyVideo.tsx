"use client";

import { useEffect, useRef } from "react";

/**
 * Muted looping banner video that only downloads once it nears the viewport and only plays while visible
 * (hidden carousel slides and sections far below the fold cost nothing). `eager` is for the first hero banner.
 */
export default function LazyVideo({ src, label, eager, className }: { src: string; label: string; eager?: boolean; className?: string }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        if (!video.src) { video.src = src; video.load(); }
        if (!reduced) void video.play().catch(() => {});
      } else {
        video.pause();
      }
    }, { rootMargin: eager ? "0px" : "200px 0px", threshold: 0.01 });
    observer.observe(video);
    return () => observer.disconnect();
  }, [src, eager]);

  return (
    <video
      ref={ref}
      className={className}
      src={eager ? src : undefined}
      muted loop playsInline
      preload={eager ? "auto" : "none"}
      aria-label={label}
    />
  );
}
