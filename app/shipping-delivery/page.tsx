import type { Metadata } from "next";
import InformationPage from "@/components/pages/InformationPage";
import { informationPages } from "@/lib/information-pages";

export const metadata: Metadata = {
  title: "Shipping & Delivery",
  description: "Explore DealHobe delivery charges, cash on delivery, and order support across Bangladesh.",
  alternates: { canonical: "/shipping-delivery" },
};

export default function Page() {
  return <InformationPage content={informationPages["shipping-delivery"]} pathname="/shipping-delivery" />;
}
