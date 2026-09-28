import type { Metadata } from "next";
import InformationPage from "@/components/pages/InformationPage";
import { informationPages } from "@/lib/information-pages";

export const metadata: Metadata = {
  title: "About Us",
  description: "Meet DealHobe, our mission and vision, and our approach to beauty shopping in Bangladesh.",
  alternates: { canonical: "/about-us" },
};

export default function Page() {
  return <InformationPage content={informationPages["about-us"]} pathname="/about-us" />;
}
