# Homepage banners

Animated banners for the homepage (hero, strip, deal tiles). Everything is rendered from HTML + CSS so brand
names, labels and copy are always exact.

```bash
node scripts/banners/render.mjs                 # all banners → public/banners/*.webp (+ public/banners/gif/*.gif)
node scripts/banners/render.mjs hero-2          # only names starting with "hero-2"
node scripts/banners/render.mjs --still hero    # one preview PNG per banner → scripts/banners/.preview/
```

- `designs.mjs` — the banners (layout, copy, colours). Edit copy/products here.
- `lib.mjs` — shared CSS, motion, product placement (`row()` auto-spaces a row of products), CTA, helpers.
- `assets/` — product cut-outs (transparent PNG). The Kodomo ones were cleaned with ChatGPT image editing
  (label art preserved); the Fennel ones were already transparent.
- `backdrops/` — empty photographic studio sets generated with ChatGPT (no products, text or logos).
- `render.mjs` — pauses every CSS animation, seeks it frame by frame, screenshots, encodes with ffmpeg.
  Needs `@playwright/test` + chromium, `ffmpeg`, and network access for Google Fonts.

Output notes
- The site serves the **animated WebP** (about 5× smaller than the GIF). GIFs are rendered at higher quality into
  `public/banners/gif/` for uploading via Admin › Homepage Builder (Cloudinary converts them for delivery);
  they are large (2–3 MB) so that folder is git-ignored.
- Every loop starts on the finished composition, plays its exit and re-entrance, and returns to it seamlessly.
- No prices appear in any banner. Fennel banners carry "Best price in Bangladesh, guaranteed."
