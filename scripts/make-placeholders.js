/* Writes the SVG placeholder banners used by the homepage starter layout (lib/homepage/defaults.ts).
   Each one is drawn at its recommended upload size and prints that size, so admins know what to replace it with.
   Run: node scripts/make-placeholders.js */
const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, '..', 'public', 'banners', 'placeholders');
const PALETTES = [
  ['#A41B15', '#E0564F'], ['#3B0D2E', '#8E3B74'], ['#C2185B', '#F06292'], ['#B9822F', '#E9C27A'],
  ['#00796B', '#4DB6AC'], ['#6A1B9A', '#AB47BC'], ['#D84315', '#FF8A65'], ['#1A237E', '#5C6BC0'],
];

const items = [
  ...[1, 2, 3, 4].flatMap((n) => [[`hero-${n}-desktop`, 1920, 600, `Hero banner ${n}`], [`hero-${n}-mobile`, 1080, 1080, `Hero ${n} · mobile`]]),
  ['strip-desktop', 1920, 192, 'Strip banner'], ['strip-mobile', 1080, 270, 'Strip · mobile'],
  ...['Under ৳499', 'Bestsellers', 'New arrivals', 'Gift sets'].map((l, i) => [`deal-${i + 1}`, 600, 600, l]),
  ...[1, 2, 3, 4, 5, 6].map((n) => [`brand-${n}`, 800, 400, `Brand offer ${n}`]),
  ['offer-bogo', 600, 240, 'Buy 1 Get 1'], ['offer-combo', 600, 240, 'Combo deals'],
  ['offer-offers', 600, 240, 'All offers'], ['offer-clearance', 600, 240, 'Clearance sale'],
  ...[['makeup', 'Makeup'], ['skin', 'Skin Care'], ['hair', 'Hair Care'], ['k-beauty', 'K-Beauty'], ['fragrance', 'Fragrance'],
    ['bath-body', 'Bath & Body'], ['tools', 'Tools & Accessories'], ['mom-baby', 'Mom & Baby']].map(([s, l]) => [`cat-${s}`, 600, 400, l]),
  ...[['acne', 'Acne'], ['anti-aging', 'Anti-ageing'], ['dark-spots', 'Dark spots'], ['dry-skin', 'Dry skin'], ['oil-control', 'Oily skin'],
    ['pores', 'Pores'], ['dullness', 'Dullness'], ['sun-care', 'Sun care'], ['hair-fall', 'Hair fall'], ['dandruff', 'Dandruff']].map(([s, l]) => [`concern-${s}`, 400, 400, l]),
];

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

fs.mkdirSync(OUT, { recursive: true });
items.forEach(([name, w, h, label], i) => {
  const [a, b] = PALETTES[i % PALETTES.length];
  const m = Math.round(Math.min(w, h) * 0.06);
  const title = Math.round(Math.min(h * 0.22, w * 0.075));
  const sub = Math.max(12, Math.round(title * 0.42));
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs>
<rect width="${w}" height="${h}" fill="url(#g)"/>
<circle cx="${w * 0.88}" cy="${h * 0.15}" r="${Math.min(w, h) * 0.45}" fill="#fff" opacity=".08"/>
<circle cx="${w * 0.08}" cy="${h * 0.95}" r="${Math.min(w, h) * 0.35}" fill="#fff" opacity=".06"/>
<rect x="${m}" y="${m}" width="${w - 2 * m}" height="${h - 2 * m}" rx="${m * 0.6}" fill="none" stroke="#fff" stroke-opacity=".45" stroke-width="${Math.max(2, m * 0.08)}" stroke-dasharray="${m * 0.4} ${m * 0.3}"/>
<text x="50%" y="${h / 2 - sub * 0.3}" text-anchor="middle" font-family="Poppins, Arial, sans-serif" font-weight="700" font-size="${title}" fill="#fff">${esc(label)}</text>
<text x="50%" y="${h / 2 + sub * 1.3}" text-anchor="middle" font-family="Poppins, Arial, sans-serif" font-size="${sub}" fill="#fff" fill-opacity=".8">${w} × ${h} · GIF / WebP / MP4</text>
</svg>`;
  fs.writeFileSync(path.join(OUT, `${name}.svg`), svg);
});
console.log(`Wrote ${items.length} placeholders to ${OUT}`);
