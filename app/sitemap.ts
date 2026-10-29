import type { MetadataRoute } from "next";
import { INFORMATION_LINKS } from "@/lib/information-pages";
import { getBlogs, getBrands, getCategories, getOffers, getProducts } from "@/lib/data";
import { isOfferActive } from "@/lib/offers";

// Rebuilt hourly so new products, categories, offers and posts are discoverable quickly.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://dealhobe.com.bd").replace(/\/+$/, "");
  const now = new Date();
  const [products, categories, brands, offers, blogs] = await Promise.all([
    getProducts(), getCategories(), getBrands(), getOffers(), getBlogs(),
  ]);
  const hidden = new Set(categories.filter((c) => c.isHidden).map((c) => c._id));
  const q = (k: string, v: string) => `${siteUrl}/products?${k}=${encodeURIComponent(v)}`;

  return [
    { url: siteUrl, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${siteUrl}/products`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${siteUrl}/offers`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${siteUrl}/blogs`, lastModified: now, changeFrequency: "weekly", priority: 0.6 },
    ...categories.filter((c) => !c.isHidden).map((c) => ({ url: q("category", c.name), lastModified: new Date(c.updatedAt), changeFrequency: "daily" as const, priority: 0.8 })),
    ...brands.map((b) => ({ url: q("brand", b.name), lastModified: new Date(b.updatedAt), changeFrequency: "weekly" as const, priority: 0.7 })),
    ...offers.filter((o) => isOfferActive(o)).map((o) => ({ url: `${siteUrl}/products/${o.slug}`, lastModified: new Date(o.updatedAt), changeFrequency: "daily" as const, priority: 0.8 })),
    ...products.filter((p) => !hidden.has(String(p.category))).map((p) => ({
      url: `${siteUrl}/product/${p.slug}`,
      lastModified: new Date((p as { updatedAt?: string }).updatedAt ?? now),
      changeFrequency: "weekly" as const,
      priority: 0.7,
      images: p.images?.slice(0, 1),
    })),
    ...blogs.map((b) => ({ url: `${siteUrl}/blogs/${b._id}`, lastModified: new Date(b.updatedAt), changeFrequency: "monthly" as const, priority: 0.5 })),
    ...INFORMATION_LINKS.map(({ href }) => ({ url: `${siteUrl}${href}`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.4 })),
  ];
}
