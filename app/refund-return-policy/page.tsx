import type { Metadata } from "next";
import InformationPage from "@/components/pages/InformationPage";
import { informationPages } from "@/lib/information-pages";

export const metadata: Metadata = {
  title: "Refund & Return Policy",
  description: "Find out how to request help with a damaged, incorrect, or missing item and discuss returns or refunds.",
  alternates: { canonical: "/refund-return-policy" },
};

export default function Page() {
  return <InformationPage content={informationPages["refund-return-policy"]} pathname="/refund-return-policy" />;
}
