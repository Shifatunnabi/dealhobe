# Homepage banners

Animated banners for the homepage (hero, strip, shop tiles). Everything is rendered from HTML + CSS so brand
names, labels and copy are always exact. Heroes are 2400×750 (desktop) and 1080×1080 (phone), 24 fps.

```bash
node scripts/banners/render.mjs                 # all banners → public/banners/*.mp4 + *.poster.webp (+ public/banners/gif/*.gif)
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
- The site plays the **MP4** (smooth, a few hundred KB) and shows the matching **poster.webp** first — a sharp
  still of frame 0, which is also the LCP image. Video downloads only after page load and while on screen
  (`components/home/LazyVideo.tsx`); reduced-motion users keep the poster.
- GIFs are rendered into `public/banners/gif/` (12 fps, drift frozen, ~2 MB each) for uploading via
  Admin › Homepage Builder; that folder is git-ignored.
- Every loop starts on the finished composition, plays its exit and re-entrance, and returns to it seamlessly.
- The DealHobe logo appears on every hero as a masthead lockup (mark + wordmark on a white pill, divider, brand label).
- No prices appear in any banner. Fennel banners carry "Best price in Bangladesh, guaranteed."
- Fennel packshots are the official 371×500 originals (nothing larger is published); they are upscaled 2× with
  Lanczos + light sharpening. Send higher-resolution originals from Fennel to improve them.
