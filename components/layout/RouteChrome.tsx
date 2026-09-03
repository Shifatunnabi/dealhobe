"use client";

import { usePathname } from "next/navigation";
import Footer from "@/components/layout/Footer";
import FloatingSocial from "@/components/floating/FloatingSocial";
import FloatingCart from "@/components/floating/FloatingCart";

export default function RouteChrome() {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");

  if (isAdminRoute) return null;

  return (
    <>
      <FloatingCart />
      <FloatingSocial />
      <Footer />
    </>
  );
}
