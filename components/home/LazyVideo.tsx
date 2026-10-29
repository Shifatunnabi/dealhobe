"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Muted looping banner video that never competes with first paint: it downloads only after the page has
 * finished loading, only plays while on screen, and fades in over the poster image beneath it (the poster is
 * the LCP image, frame 0 of the video, so the hand-over is seamless). Reduced-motion users keep the poster.
 */
export default function LazyVideo({ src, label, className = "" }: { src: string; label: string; className?: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const video = ref.current;
    if (!video || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let loaded = document.readyState === "complete";
    let visible = false;
    let timer: number | undefined;

    const sync = () => {
      if (!loaded) return;
      if (visible) {
        if (!video.src) { video.src = src; video.load(); }
        void video.play().catch(() => {});
      } else {
        video.pause();
      }
    };
    const onLoad = () => { timer = window.setTimeout(() => { loaded = true; sync(); }, 400); };
    if (loaded) onLoad(); else window.addEventListener("load", onLoad, { once: true });

    const io = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); }, { rootMargin: "120px 0px", threshold: 0.01 });
    io.observe(video);
    return () => { io.disconnect(); window.clearTimeout(timer); window.removeEventListener("load", onLoad); };
  }, [src]);

  return (
    <video
      ref={ref}
      className={className}
      muted loop playsInline
      preload="none"
      aria-label={label}
      onPlaying={() => setPlaying(true)}
      style={{ opacity: playing ? 1 : 0, transition: "opacity .35s ease" }}
    />
  );
}
