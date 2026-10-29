# Art direction: brand, offer, category and concern tiles

Sits beside the seven heroes (see README.md). Shared system: Fraunces (display, tight tracking, italic for the one accented word), Plus Jakarta Sans (labels), pill buttons, flat or photographic backdrops, cut-out products with soft contact shadows, copy fixed in the loop (only products float, backdrops drift). No prices anywhere. The "Best price in Bangladesh, guaranteed." line appears only on tiles that show a Fennel product (the owner's Fennel promise is not extended to other brands). Heroes keep the DealHobe logo lockup; tiles do not need it.

Grid coherence: within each group the type size, text position and corner treatment are consistent, but backdrop, colour and composition change tile to tile, so a row never reads as one template repeated.

## 1. Top brands (6 tiles, 2:1, 1200x600)
Brand-story tiles: kicker (category), brand name as the headline, one supporting line, pill button. Text left, products right, each with its own art style.
| Tile | Style | Products | Copy |
|---|---|---|---|
| brand-1 | Flat paper-cut sky: sun, clouds, butter hill | Kodomo shampoo, powder, lotion, hair & body wash | Kodomo / Gentle care for little ones. |
| brand-2 | Flat colour swatches (lip and blush shades), ivory | Fennel lip tint, lipstick, blush, mascara | Fennel colour. + guarantee |
| brand-3 | Lilac arch with stepped stone plinths | Fennel melasma, spotless brightening, anti-acne serums | Fennel skin. + guarantee |
| brand-4 | Photographic leaf-shadow plaster wall and limestone ledge (generated, empty) | GDM hair cleansing, hair oil, anti-acne, spotless serums | GDM / Everyday skin and hair essentials. |
| brand-5 | Brand-blue block plus pale catalogue panel, packshots blended with multiply | Kidlon essential gift set, baby cream, jelly, baby lotion | Kidlon / Baby essentials & gift sets. |
| brand-6 | Teal typographic tile, single product | Mistine Acne Clear facial foam | Mistine / Acne Clear facial foam. |
Skipped: Top Clean (its only photo is a text logo, no packshot); ColorMe (no products).

## 2. Limited-time offers (4 tiles, 5:2, 900x360)
Secondary, lighter than heroes: pale or flat card, one big word, small arrow chip, 1-2 products. No deal mechanics, no numbers. Source of truth: the store has not confirmed BOGO, combo or clearance deals.
- offer-bogo -> "Gift sets" (Kodomo gift set), peach. Link /products?q=gift
- offer-combo -> "Combos" (Kidlon feeding and care kits), mint. Link /products?q=combo (Kidlon has real "combo" products)
- offer-offers -> "Offers" (Fennel, Kodomo), brand red + gold, guarantee. Link /offers
- offer-clearance -> "New in" (GDM, Fennel, Kodomo), plum + gold, guarantee. Link /products. File name is historical; it is not a clearance tile.

## 3. Shop by category (6 tiles built, 3:2, 900x600)
Title top-left (Fraunces 50-58px), tagline under it, products bottom-right standing on a ground strip. Each has a different set: satin (makeup), wet glass (skin), mustard circle (hair), lavender ripples (bath & body), arch window (mom & baby), mint (personal care).
Deliberately dropped: K-Beauty, Fragrance, Tools & Accessories: no catalogue products (the pages would be empty) and we did not fake products. Their placeholder SVGs stay on disk; defaults.ts now shows the six real catalogue categories in a 3-column grid (2 on phones). Add them back when stock exists.
Guarantee line sits under titles of tiles containing Fennel (makeup, skin, hair, bath & body, personal care).

## 4. Shop by concern (10 tiles, 1:1, 500x500)
Pastel field per concern, concern name top-left (Fraunces), product(s) floating over a circle. Product tiles use only products that fit: acne (Fennel + GDM anti-acne serums), dark spots (Fennel melasma + spotless brightening), dullness (Fennel lemon vitamin C face wash + brightening serum), dry skin (GDM daily moisturising lotion, Fennel body lotion), sun care (Fennel BB cream SPF 35), hair fall (GDM hair oil serum; its pack text says it addresses hair loss), dandruff (GDM hair cleansing serum; pack text mentions dandruff). Graphic only, no product (nothing suitable in stock): anti-ageing (GDM retinol/vitamin C etc. have no real packshot), oil control, pores. No medical claims in tile copy.

## Imagery
New generated backdrops (no products/text/people): leaves-wide, silk-wide, water-wide (scripts/banners/backdrops). New cut-outs: five GDM boxes (white removed by flood fill), Fennel BB cream, body lotion, hair food, aloe face wash, GDM daily lotion. Kidlon and Mistine packshots exist only on white; they are used as-is with mix-blend multiply on pale panels (`mul()` in designs-extra.mjs). Fennel packshots are small originals (371x500).

## Product allocation by brand
Kodomo: brand-1, offers, mom & baby. Fennel: brand-2/3, makeup, skin, offers, many concerns. GDM: brand-4, skin, hair, bath & body, concerns. Kidlon: brand-5, combos, gift sets, mom & baby, personal care. Mistine: brand-6, personal care.

## Owner to confirm
Offer labels and links (Gift sets, Combos, Offers, New in); that Kidlon/Mistine/GDM brand filter values (`?brand=GDM`, `KIDLON`, `MISTINE`) match the catalogue; Fennel guarantee wording; whether hair-fall/dandruff GDM products may be shown for those concerns; K-Beauty/Fragrance/Tools categories.

## Re-render
`node scripts/banners/render.mjs brand offer cat concern` (add `--nogif` to skip GIFs, `--still` for previews in .preview/).
