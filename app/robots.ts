import type { MetadataRoute } from "next";

const PRIVATE = ["/admin", "/admin/", "/api/", "/cart", "/checkout", "/profile", "/orders/", "/receipt/", "/auth"];

export default function robots(): MetadataRoute.Robots {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://dealhobe.com.bd").replace(/\/+$/, "");
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: PRIVATE },
      // AI search / answer engines are explicitly welcome on public pages (AI SEO).
      { userAgent: ["GPTBot", "OAI-SearchBot", "ChatGPT-User", "ClaudeBot", "Claude-SearchBot", "PerplexityBot", "Google-Extended", "Applebot-Extended", "Bingbot"], allow: "/", disallow: PRIVATE },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
