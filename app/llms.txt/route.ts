import { getBrands, getCategories, getOffers, getStorefront } from "@/lib/data";
import { isOfferActive } from "@/lib/offers";

// llms.txt (https://llmstxt.org): a plain-text guide that helps AI assistants describe and link to the store.
export const revalidate = 3600;

export async function GET() {
  const site = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://dealhobe.com.bd").replace(/\/+$/, "");
  const [categories, brands, offers, sf] = await Promise.all([getCategories(), getBrands(), getOffers(), getStorefront()]);
  const link = (label: string, path: string, note = "") => `- [${label}](${site}${path})${note ? `: ${note}` : ""}`;

  const body = [
    "# DealHobe",
    "",
    "> DealHobe is an online store in Bangladesh selling authentic, imported cosmetics, skincare, haircare, personal care and baby care products, with cash on delivery and delivery across Bangladesh. Prices are in Bangladeshi Taka (৳, BDT).",
    "",
    `Contact: ${sf.contact.phone} · ${sf.contact.email} · ${sf.contact.address}`,
    sf.freeDeliveryThreshold ? `Free delivery on orders over ৳${sf.freeDeliveryThreshold}.` : "",
    "",
    "## Shop",
    link("All products", "/products", "full catalogue with filters for category, brand, price and rating; sort by price, newest, discount, best selling"),
    link("Offers", "/offers", "current discounts and campaigns"),
    ...categories.filter((c) => !c.isHidden).map((c) => link(c.name, `/products?category=${encodeURIComponent(c.name)}`)),
    "",
    "## Brands",
    ...brands.map((b) => link(b.name, `/products?brand=${encodeURIComponent(b.name)}`)),
    ...(offers.some((o) => isOfferActive(o)) ? ["", "## Current offers", ...offers.filter((o) => isOfferActive(o)).map((o) => link(o.title, `/products/${o.slug}`, o.details?.slice(0, 140)))] : []),
    "",
    "## Help",
    link("Shipping & delivery", "/shipping-delivery"),
    link("Refund & return policy", "/refund-return-policy"),
    link("Terms and conditions", "/terms-and-conditions"),
    link("About us", "/about-us"),
    link("Beauty blog", "/blogs", "skincare and makeup guides"),
    "",
    "## Optional",
    link("Sitemap", "/sitemap.xml", "every product, category, brand and article URL"),
  ].filter((l) => l !== "").join("\n").replace(/\n## /g, "\n\n## ");

  return new Response(body + "\n", { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
}
