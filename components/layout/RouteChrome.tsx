"use client";

import { usePathname } from "next/navigation";
import Footer, { type FooterStorefront } from "@/components/layout/Footer";
import FloatingSocial from "@/components/floating/FloatingSocial";

export default function RouteChrome({ storefront }: { storefront: FooterStorefront }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");

  if (isAdminRoute) return null;

  return (
    <>
      <FloatingSocial />
      <Footer storefront={storefront} />
    </>
  );
}
