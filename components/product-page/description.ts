// Server-safe helpers for the product detail page's info panels (no "use client").

export type InfoSection = { id: string; title: string; html: string };

/** Section headings an admin may type inside the rich-text description, mapped to their own panel. */
const KNOWN: { id: string; title: string; match: RegExp }[] = [
  { id: "how-to-use", title: "How to use", match: /^(how to (use|apply)|directions?( for use)?|usage|application)\b/i },
  { id: "ingredients", title: "Ingredients", match: /^(key )?ingredients?\b/i },
  { id: "benefits", title: "Benefits", match: /^(key )?(benefits?|features?|highlights?)\b/i },
];

const text = (html: string) =>
  html.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();

/**
 * Splits the admin's rich-text description into panels. A heading (h1–h4, or a paragraph that is only
 * bold text) reading "How to use", "Ingredients" or "Benefits" starts its own panel; everything else
 * stays under "Description". Descriptions without such headings come back as a single panel.
 */
export function splitDescription(html: string | undefined | null): InfoSection[] {
  const source = String(html ?? "").trim();
  if (!source) return [];
  const heading = /<(h[1-4])[^>]*>([\s\S]*?)<\/\1>|<p[^>]*>\s*<(strong|b)>([\s\S]*?)<\/\3>\s*:?\s*<\/p>/gi;

  const sections: InfoSection[] = [];
  let current: InfoSection = { id: "description", title: "Description", html: "" };
  let last = 0;
  for (const m of source.matchAll(heading)) {
    const label = text(m[2] ?? m[4] ?? "").replace(/:$/, "");
    const known = KNOWN.find((k) => k.match.test(label));
    if (!known) continue;
    current.html += source.slice(last, m.index);
    sections.push(current);
    current = { id: known.id, title: known.title, html: "" };
    last = (m.index ?? 0) + m[0].length;
  }
  current.html += source.slice(last);
  sections.push(current);

  // Merge duplicates (e.g. two "Ingredients" headings) and drop empty panels.
  const merged = new Map<string, InfoSection>();
  for (const s of sections) {
    if (!text(s.html)) continue;
    const prev = merged.get(s.id);
    if (prev) prev.html += s.html;
    else merged.set(s.id, { ...s });
  }
  return [...merged.values()];
}

/** Plain-text excerpt for meta descriptions and JSON-LD. */
export function plainExcerpt(html: string | undefined | null, max = 160): string {
  const t = text(String(html ?? ""));
  if (t.length <= max) return t;
  const cut = t.slice(0, max - 1);
  return `${cut.slice(0, Math.max(cut.lastIndexOf(" "), max - 20)).replace(/[,.;:\s]+$/, "")}…`;
}
