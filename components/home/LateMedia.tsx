"use client";

import { useEffect, useRef, useState, type ComponentProps } from "react";
import BannerMedia from "./BannerMedia";
import { ratioCss } from "@/lib/homepage/types";

/**
 * A banner that is not needed for first paint (later hero slides, tiles below the fold, the strip).
 * It renders only the shape-locked placeholder until the page has finished loading (plus a short pause)
 * or until the placeholder scrolls into view — so these images never compete with the first banner for
 * bandwidth, which is what drives Largest Contentful Paint on slow connections.
 */
export default function LateMedia(props: ComponentProps<typeof BannerMedia>) {
  const [ready, setReady] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let timer: number | undefined;
    const arm = () => { timer = window.setTimeout(() => setReady(true), 900); };
    if (document.readyState === "complete") arm();
    else window.addEventListener("load", arm, { once: true });

    const el = box.current;
    const io = el && "IntersectionObserver" in window
      ? new IntersectionObserver(([entry]) => { if (entry.isIntersecting) setReady(true); })
      : null;
    if (el && io) io.observe(el);
    return () => { window.removeEventListener("load", arm); window.clearTimeout(timer); io?.disconnect(); };
  }, []);

  if (ready) return <BannerMedia {...props} priority={false} />;
  const style = { "--ar": ratioCss(props.ratio), ...(props.mobileRatio ? { "--ar-m": ratioCss(props.mobileRatio) } : {}) } as React.CSSProperties;
  return <div ref={box} className={`ar-box ${props.className ?? ""}`} style={style} role="img" aria-label={props.alt} />;
}
