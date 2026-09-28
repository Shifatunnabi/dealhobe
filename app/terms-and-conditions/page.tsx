import type { Metadata } from "next";
import InformationPage from "@/components/pages/InformationPage";
import { informationPages } from "@/lib/information-pages";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "Read the DealHobe shopping terms for products, prices, payment, accounts, and orders.",
  alternates: { canonical: "/terms-and-conditions" },
};

export default function Page() {
  return <InformationPage content={informationPages["terms-and-conditions"]} pathname="/terms-and-conditions" />;
}
