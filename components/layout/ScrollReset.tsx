"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export default function ScrollReset() {
  const pathname = usePathname();
  const previousPathname = useRef(pathname);

  useEffect(() => {
    // Preserve scrolling that started before hydration on the initial page load.
    if (previousPathname.current === pathname) return;
    previousPathname.current = pathname;
    // Do not animate a reset against an in-progress user scroll or hash navigation.
    if (!window.location.hash) window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);

  return null;
}
