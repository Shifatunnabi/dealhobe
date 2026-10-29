"use client";

import { useEffect, useRef, useState } from "react";

/** At most this many banner videos decode at once (phones stutter with a dozen playing while scrolling). */
const MAX_PLAYING = 4;
const playing: HTMLVideoElement[] = [];
const release = (v: HTMLVideoElement) => { const i = playing.indexOf(v); if (i >= 0) playing.splice(i, 1); };
function claim(v: HTMLVideoElement) {
  release(v);
  playing.push(v);
  while (playing.length > MAX_PLAYING) playing.shift()!.pause();   // the one that started playing longest ago yields
}

/**
 * Muted looping banner video that never competes with first paint: it downloads only after the page has
 * finished loading and once it is near the screen, plays only while at least half visible (and at most
 * MAX_PLAYING at a time), and fades in over the poster image beneath it (the poster is the LCP image, frame 0
 * of the video, so the hand-over is seamless). Reduced-motion users keep the poster.
 */
export default function LazyVideo({ src, label, className = "" }: { src: string; label: string; className?: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const video = ref.current;
    if (!video || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let loaded = document.readyState === "complete";
    let near = false;
    let visible = false;
    let timer: number | undefined;

    const sync = () => {
      if (loaded && near && !video.src) { video.src = src; video.load(); }
      if (loaded && visible && video.src) { claim(video); void video.play().catch(() => {}); }
      else { release(video); video.pause(); }
    };
    const onLoad = () => { timer = window.setTimeout(() => { loaded = true; sync(); }, 400); };
    if (loaded) onLoad(); else window.addEventListener("load", onLoad, { once: true });

    const nearIO = new IntersectionObserver(([e]) => { near = near || e.isIntersecting; sync(); }, { rootMargin: "300px 0px" });
    const viewIO = new IntersectionObserver(([e]) => { visible = e.intersectionRatio >= 0.5; sync(); }, { threshold: [0, 0.5, 1] });
    nearIO.observe(video); viewIO.observe(video);
    return () => { nearIO.disconnect(); viewIO.disconnect(); release(video); window.clearTimeout(timer); window.removeEventListener("load", onLoad); };
  }, [src]);

  return (
    <video
      ref={ref}
      className={className}
      muted loop playsInline
      preload="none"
      aria-label={label}
      onPlaying={() => setShown(true)}
      style={{ opacity: shown ? 1 : 0, transition: "opacity .35s ease" }}
    />
  );
}
