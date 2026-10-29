// Server-safe helpers shared by the blog list and post pages.

export type BlogSummary = {
  _id: string;
  title: string;
  category: string;
  thumbnailUrl: string;
  date: string;
  readTime: number;
  excerpt: string;
  author: string;
  isFeatured: boolean;
};

/** Strip tags/entities from rich-text HTML. */
export function blogPlainText(html: string) {
  return String(html || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

export function readingTime(text: string) {
  const words = text ? text.split(" ").length : 0;
  return Math.max(1, Math.ceil(words / 200));
}

export function excerptOf(text: string, max = 160) {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  return `${cut.slice(0, cut.lastIndexOf(" ") > 80 ? cut.lastIndexOf(" ") : max).trim()}…`;
}

/** Deterministic date label (same on server and browser). */
export function formatBlogDate(value: string, month: "short" | "long" = "short") {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-GB", { day: "numeric", month, year: "numeric", timeZone: "Asia/Dhaka" });
}
