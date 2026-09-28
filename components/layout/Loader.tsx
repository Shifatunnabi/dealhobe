"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";


export default function Loader() {
  const pathname = usePathname();
  const [showStartupLoader] = useState(pathname !== "/");
  // The server-rendered homepage is ready to use without a timed splash screen.
  // Keep this decision for the session so navigating away does not start a splash.
  if (!showStartupLoader) return null;
  return <StartupLoader />;
}

function StartupLoader() {
  const [visible, setVisible] = useState(true);
  const [logoUrl, setLogoUrl] = useState("/logo/main-logo.png");

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    let alive = true;
    const loadLogo = async () => {
      try {
        const res = await fetch("/api/settings");
        const data = await res.json();
        if (!alive) return;
        if (res.ok && data?.logoUrl) setLogoUrl(data.logoUrl);
      } catch {
        if (alive) setLogoUrl("/logo/main-logo.png");
      }
    };

    loadLogo();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] } }}
          className="fixed inset-0 z-9999 flex flex-col items-center justify-center bg-soft-bg"
        >
          <motion.div
            initial={{ scale: 0.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.9, ease: [0.34, 1.56, 0.64, 1] }}
            className="relative flex h-44 w-44 items-end justify-center"
          >
            <Image
              src={logoUrl}
              alt="DealHobe"
              width={144}
              height={144}
              className="w-36 h-auto object-contain"
              priority
            />
          </motion.div>

          <div className="mt-4 h-1 w-32 overflow-hidden rounded-full bg-gray-200">
            <motion.div
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 1.4, delay: 0.2, ease: "easeInOut" }}
              className="h-full rounded-full"
              style={{ backgroundColor: "#A41B15" }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
