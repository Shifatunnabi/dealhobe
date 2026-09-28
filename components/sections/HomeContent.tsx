"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { MotionConfig } from "framer-motion";

/** Keep content visible during hydration; reveal only the small section headings. */
export default function HomeContent({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!root || !window.IntersectionObserver) return;

    const animations = new Set<Animation>();
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        observer.unobserve(entry.target);
        if (preference.matches) continue;
        const animation = entry.target.animate(
          [{ opacity: 0.65, transform: "translateY(8px)" }, { opacity: 1, transform: "none" }],
          { duration: 240, easing: "ease-out" },
        );
        animations.add(animation);
        animation.onfinish = () => animations.delete(animation);
      }
    }, { rootMargin: "120px 0px" });

    for (const heading of root.querySelectorAll("[data-home-reveal]")) {
      // Never hide or animate content already on screen on the first load.
      if (heading.getBoundingClientRect().top >= window.innerHeight) observer.observe(heading);
    }
    const cancelAnimations = () => {
      if (preference.matches) animations.forEach((animation) => animation.cancel());
    };
    preference.addEventListener("change", cancelAnimations);
    return () => {
      observer.disconnect();
      animations.forEach((animation) => animation.cancel());
      preference.removeEventListener("change", cancelAnimations);
    };
  }, []);

  return <MotionConfig reducedMotion="user"><div ref={ref} className="homepage">{children}</div></MotionConfig>;
}
