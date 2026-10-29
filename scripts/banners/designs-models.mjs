// Model-led Fennel makeup banners. Bangladeshi models (generated portraits, see assets/model-*.jpg) in arch / circle frames
// next to the REAL Fennel packshots. The photos are clean studio shots on a cream-peach seamless, so a frame gives a crisp edge;
// the backdrops are light/rose so dark packshots (lipsticks, mascara, compacts) always stand out, and dark products also get
// a thin white rim light (see `rim` in lib.mjs). Copy stays fixed, only photos/products drift gently (CALM).
// Overrides: hero-2, hero-6, deal-1, brand-2, cat-makeup. New: fav-mascara / fav-powder / fav-lipstick / fav-bbcream.

import { COLORS as C, arrow, cta, floatProd, lines, modelFrame, prod, row } from './lib.mjs';
import { column, eyebrow, text } from './designs.mjs';

const GUARANTEE = 'Best price in Bangladesh, guaranteed.';
const abs = (css, inner = '', cls = '') => `<div class="abs ${cls}" style="${css}">${inner}</div>`;
const HERO_D = { W: 1600, H: 500, scale: 1.5 }, HERO_M = { W: 900, H: 900, scale: 1.2 };
const TILE = { crf: 24, posterQ: 80, startAt: 3.05 };
const PLUM = '#4A1030';

/** Soft white glow behind a group, plus a lighter floor pool, for tonal separation. */
const glow = (cx, cy, r, o = 0.55) => abs(`left:${cx - r}px;top:${cy - r}px;width:${r * 2}px;height:${r * 2}px;border-radius:50%;background:radial-gradient(closest-side,rgba(255,255,255,${o}),rgba(255,255,255,0))`);

/* ───────────── hero-6: "Colour with attitude." — rose studio, two arches (hijab model, mascara model) ───────────── */
function hero6(m) {
  const S = m ? HERO_M : HERO_D, k = text(m);
  const bg = 'linear-gradient(115deg,#F7D3CB,#EDA9A6 55%,#DF8C92)';
  const t = k.eb('Fennel makeup', '#8A130E') + k.head(['Colour', '<em style="color:#8A130E">with attitude.</em>'], PLUM, m ? 80 : 68)
    + k.sub('Best price in Bangladesh, guaranteed.', '#5E2038') + k.ctaWrap(cta('Shop Fennel makeup', k.ctaOpts(PLUM, '#fff')));
  let body;
  if (m) {
    body = glow(450, 700, 520) + column(true, t)
      + modelFrame('model-hijab.jpg', { left: 50, top: 520, w: 360, h: 380, iw: 400, ix: -20, iy: -62, p: 0 })
      + modelFrame('model-mascara.jpg', { left: 490, top: 520, w: 360, h: 380, iw: 400, ix: -20, iy: -62, p: 1.4 })
      + row([{ file: 'fennel-aqua-lip-tint.png', h: 175 }, { file: 'fennel-matte-lipstick.png', h: 140, z: 7 }, { file: 'fennel-blush-on.png', h: 125, z: 8 }, { file: 'fennel-volume-express-mascara.png', h: 182 }, { file: 'fennel-loose-rice-powder.png', h: 76, z: 8 }], { x0: 40, x1: 860, gy: 20, gap: 6 }).replace(/z-index:[12]"/g, 'z-index:6"');
  } else {
    body = glow(1100, 270, 430) + column(false, t)
      + modelFrame('model-hijab.jpg', { left: 770, top: 40, w: 290, h: 460, iw: 330, ix: -20, iy: -22, p: 0 })
      + modelFrame('model-mascara.jpg', { left: 1150, top: 70, w: 290, h: 430, iw: 330, ix: -20, iy: -26, p: 1.4 })
      + row([{ file: 'fennel-aqua-lip-tint.png', h: 218 }, { file: 'fennel-matte-lipstick.png', h: 172 }, { file: 'fennel-blush-on.png', h: 154 }, { file: 'fennel-volume-express-mascara.png', h: 228 }, { file: 'fennel-loose-rice-powder.png', h: 96 }], { x0: 735, x1: 1500, gy: 22, gap: 6 }).replace(/z-index:[12]"/g, 'z-index:6"');
  }
  return { ...S, bg, body };
}

/* ───────────── hero-2: "Find your colour." — warm apricot studio, two circle portraits ───────────── */
function hero2(m) {
  const S = m ? HERO_M : HERO_D, k = text(m);
  const bg = 'linear-gradient(115deg,#FBE1CC,#F4BE9C 60%,#EBA283)';
  const t = k.eb('Fennel makeup', '#8A130E') + k.head(['Find your', '<em style="color:#8A130E">colour.</em>'], PLUM, m ? 80 : 70) + k.sub('Best price in Bangladesh, guaranteed.', '#5E2038')
    + k.ctaWrap(cta('Shop Fennel makeup', k.ctaOpts(C.red, '#fff')));
  let body;
  if (m) {
    body = glow(450, 700, 520, 0.5) + column(true, t)
      + modelFrame('model-mature.jpg', { left: 70, top: 505, w: 300, h: 300, shape: 'circle', iw: 380, ix: -40, iy: -40, p: 0 })
      + modelFrame('model-powder.jpg', { left: 520, top: 505, w: 300, h: 300, shape: 'circle', iw: 380, ix: -45, iy: -35, p: 1.4 })
      + row([{ file: 'fennel-aqua-lip-tint.png', h: 200 }, { file: 'fennel-matte-lipstick.png', h: 170 }, { file: 'fennel-blush-on.png', h: 160, z: 8 }, { file: 'fennel-volume-express-mascara.png', h: 215 }, { file: 'fennel-loose-rice-powder.png', h: 90, z: 8 }], { x0: 40, x1: 860, gy: 22, gap: 8 }).replace(/z-index:[12]"/g, 'z-index:6"');
  } else {
    body = glow(1120, 260, 420, 0.5) + column(false, t)
      + modelFrame('model-mature.jpg', { left: 800, top: 40, w: 300, h: 300, shape: 'circle', iw: 380, ix: -45, iy: -40, p: 0 })
      + modelFrame('model-powder.jpg', { left: 1190, top: 70, w: 270, h: 270, shape: 'circle', iw: 345, ix: -40, iy: -32, p: 1.4 })
      + row([{ file: 'fennel-aqua-lip-tint.png', h: 285 }, { file: 'fennel-matte-lipstick.png', h: 225 }, { file: 'fennel-blush-on.png', h: 200 }, { file: 'fennel-volume-express-mascara.png', h: 300 }, { file: 'fennel-loose-rice-powder.png', h: 120 }], { x0: 735, x1: 1500, gy: 26, gap: 8 }).replace(/z-index:[12]"/g, 'z-index:6"');
  }
  return { ...S, bg, body };
}

/* ───────────── tile helpers (all small tiles) ───────────── */
const kicker = (t, color, size = 14) => `<div class="eyebrow" style="color:${color};font-size:${size}px;letter-spacing:.18em">${t}</div>`;
const title = (arr, color, size) => `<h2 class="d" style="font-size:${size}px;line-height:1;color:${color};margin-top:8px">${lines(arr, 0.1, 0.12)}</h2>`;
const guar = (color, size = 14.5, max = 190, mt = 10) => `<p style="margin-top:${mt}px;font-size:${size}px;line-height:1.3;font-weight:700;color:${color};max-width:${max}px">Best price in Bangladesh, guaranteed.</p>`;
const col = (css, inner) => `<div class="abs" style="${css};display:flex;flex-direction:column;align-items:flex-start;z-index:20">${inner}</div>`;
const chip = (bg, color, right = 22, top = 22, size = 44) => `<div class="abs" style="right:${right}px;top:${top}px;width:${size}px;height:${size}px;border-radius:50%;background:${bg};color:${color};display:flex;align-items:center;justify-content:center;box-shadow:0 6px 14px rgba(20,8,16,.22);z-index:30">${arrow(Math.round(size * 0.46))}</div>`;
const pillBtn = (label, bg, color, h = 40, font = 15) => `<div class="cta" style="background:${bg};color:${color};height:${h}px;padding:0 20px;font-size:${font}px;gap:8px">${label}${arrow(font + 3)}<i class="shine"></i></div>`;

/* ───────────── deal-1: Fennel Makeup (1:1) — peach, model b + four products ───────────── */
function deal1() {
  const body = abs('inset:0;background:linear-gradient(160deg,#FCE3D5,#F5BFA9)') + glow(360, 300, 280, 0.5)
    + modelFrame('model-glow.jpg', { left: 292, top: 112, w: 186, h: 388, iw: 250, ix: -30, iy: -10, p: 0, shadow: 'rgba(90,30,20,.3)' })
    + col('left:32px;top:32px;right:92px', kicker('Fennel', '#8A130E', 13) + title(['Makeup'], PLUM, 56) + guar('#5E2038', 14.5, 200, 10))
    + chip(PLUM, '#fff', 28, 30, 50)
    + row([{ file: 'fennel-matte-lipstick.png', h: 165 }, { file: 'fennel-blush-on.png', h: 140, z: 2 }, { file: 'fennel-aqua-lip-tint.png', h: 200 }, { file: 'fennel-volume-express-mascara.png', h: 190 }], { x0: 18, x1: 405, gy: 26, gap: 2, d0: 0.45, step: 0.1, dy: 40 }).replace(/z-index:[12]"/g, 'z-index:6"');
  return { W: 500, H: 500, scale: 1.2, ...TILE, bg: '#F8D3C0', body };
}

/* ───────────── brand-2 (2:1): "Fennel colour." ───────────── */
function brand2() {
  const body = abs('inset:0;background:linear-gradient(120deg,#FCE5D8,#F3BBA8)') + glow(600, 200, 330, 0.55)
    + abs('left:0;right:0;bottom:0;height:46px;background:rgba(255,255,255,.35);z-index:1')
    + modelFrame('model-lipstick.jpg', { left: 520, top: 30, w: 200, h: 370, iw: 255, ix: -28, iy: -8, p: 0, shadow: 'rgba(90,30,20,.3)' })
    + col('left:52px;top:0;bottom:0;width:340px;justify-content:center', kicker('Makeup', C.red, 17)
      + `<h2 class="d" style="font-size:80px;line-height:1;color:${PLUM};margin-top:8px">${lines(['Fennel', `<em style="color:#8A130E">colour.</em>`], 0.1, 0.12)}</h2>`
      + `<p style="margin-top:14px;font-size:22px;line-height:1.32;font-weight:600;color:#5E2038;max-width:300px">${GUARANTEE}</p><div style="margin-top:20px">${pillBtn('Shop Fennel makeup', PLUM, '#fff', 44, 17)}</div>`)
    + row([{ file: 'fennel-aqua-lip-tint.png', h: 215 }, { file: 'fennel-matte-lipstick.png', h: 165 }, { file: 'fennel-blush-on.png', h: 130, z: 2 }, { file: 'fennel-volume-express-mascara.png', h: 225 }], { x0: 440, x1: 775, gy: 28, gap: 4, d0: 0.4 }).replace(/z-index:[12]"/g, 'z-index:6"');
  return { W: 800, H: 400, scale: 1.5, ...TILE, bg: '#F6CDBE', body };
}

/* ───────────── cat-makeup (3:2) ───────────── */
function catMakeup() {
  const body = abs('inset:0;background:linear-gradient(150deg,#FBE1D2,#F1B7A6)') + glow(430, 220, 260, 0.5)
    + modelFrame('model-powder.jpg', { left: 405, top: 40, w: 175, h: 360, iw: 235, ix: -28, iy: -10, p: 0, shadow: 'rgba(90,30,20,.28)' })
    + col('left:30px;top:28px', `<h2 class="d" style="font-size:54px;line-height:1;color:${PLUM}">Makeup</h2><div style="margin-top:8px;font-size:15px;font-weight:700;color:#5E2038;max-width:230px;line-height:1.3">Best price in Bangladesh, guaranteed.</div>`)
    + row([{ file: 'fennel-aqua-lip-tint.png', h: 215 }, { file: 'fennel-matte-lipstick.png', h: 160 }, { file: 'fennel-blush-on.png', h: 130, z: 2 }, { file: 'fennel-volume-express-mascara.png', h: 220 }], { x0: 24, x1: 420, gy: 26, gap: 4, d0: 0.4 }).replace(/z-index:[12]"/g, 'z-index:6"');
  return { W: 600, H: 400, scale: 1.5, ...TILE, bg: '#F4C6B5', body };
}

/* ───────────── fav-* : one Fennel product per tile (1:1, 500x500 → 600) ───────────── */
function fav(kind) {
  const S = { W: 500, H: 500, scale: 1.2, ...TILE };
  const top = (k, kc, t, tc, size) => col('left:32px;top:30px;right:96px', kicker(k, kc, 13) + title(t, tc, size) + guar(tc === PLUM ? '#5E2038' : tc, 14.5, 190, 10));
  if (kind === 'lipstick') {   // model-led: hijab model, red lip; rose field
    const body = abs('inset:0;background:linear-gradient(160deg,#F9D5CF,#EDA3A1)') + glow(330, 300, 260, 0.5)
      + modelFrame('model-hijab.jpg', { left: 215, top: 120, w: 255, h: 380, iw: 300, ix: -22, iy: -14, p: 0, shadow: 'rgba(100,20,40,.3)' })
      + top('Fennel', '#8A130E', ['Matte', 'lipstick'], PLUM, 50) + chip(PLUM, '#fff', 28, 30, 50)
      + prod('fennel-matte-lipstick.png', { cx: 130, gy: 30, h: 225, z: 8, d: 0.3, p: 0.4, dy: 30 });
    return { ...S, bg: '#F2B5B0', body };
  }
  if (kind === 'bbcream') {    // model-led: teal field complements the tan bottle
    const body = abs('inset:0;background:linear-gradient(160deg,#CFE8E2,#9FCFC6)') + glow(330, 300, 260, 0.5)
      + modelFrame('model-bbcream.jpg', { left: 215, top: 120, w: 255, h: 380, iw: 330, ix: -36, iy: -40, p: 0, shadow: 'rgba(10,60,60,.3)' })
      + top('Fennel', '#0F5A55', ['BB cream', '<em style="color:#0F5A55">SPF 35</em>'], '#0E3F3C', 48) + chip('#0E3F3C', '#fff', 28, 30, 50)
      + prod('fennel-bb-cream.png', { cx: 125, gy: 30, h: 250, z: 8, d: 0.3, p: 0.4, dy: 30 });
    return { ...S, bg: '#B5DBD3', body };
  }
  if (kind === 'mascara') {    // product-led: butter yellow + big white disc so the black tube pops
    const body = abs('inset:0;background:linear-gradient(160deg,#FFF0B8,#FFD76A)') + abs('left:130px;top:105px;width:360px;height:360px;border-radius:50%;background:radial-gradient(circle at 40% 35%,#FFFFFF,#FFF6D6 70%);box-shadow:0 0 0 3px rgba(255,255,255,.7)')
      + abs('left:0;right:0;bottom:0;height:40px;background:#F3C04A;z-index:2')
      + top('Fennel', '#8A4A00', ['Volume', 'Express', 'mascara'], '#3A2300', 40) .replace('max-width:190px', 'max-width:200px') + chip('#3A2300', '#fff', 28, 30, 50)
      + prod('fennel-volume-express-mascara.png', { cx: 330, gy: 36, h: 390, z: 8, d: 0.3, p: 0.4, dy: 30 });
    return { ...S, bg: '#FFE08A', body };
  }
  // powder: product-led, lilac field + pale disc
  const body = abs('inset:0;background:linear-gradient(160deg,#EADFF7,#CDB8EC)') + abs('left:85px;top:185px;width:350px;height:350px;border-radius:50%;background:radial-gradient(circle at 40% 35%,#FFFFFF,#F3EBFC 70%);box-shadow:0 0 0 3px rgba(255,255,255,.7)')
    + abs('left:0;right:0;bottom:0;height:40px;background:#BBA3E0;z-index:2')
    + top('Fennel', '#6A3FA3', ['Loose rice', 'powder'], '#2E1A4A', 46) + chip('#2E1A4A', '#fff', 28, 30, 50)
    + prod('fennel-loose-rice-powder.png', { cx: 260, gy: 70, h: 195, z: 8, d: 0.3, p: 0.4, dy: 30 });
  return { ...S, bg: '#D9C8F0', body };
}

export const MODEL_BANNERS = {
  'hero-2-desktop': () => hero2(false), 'hero-2-mobile': () => hero2(true),
  'hero-6-desktop': () => hero6(false), 'hero-6-mobile': () => hero6(true),
  'deal-1': deal1, 'brand-2': brand2, 'cat-makeup': catMakeup,
  'fav-mascara': () => fav('mascara'), 'fav-powder': () => fav('powder'), 'fav-lipstick': () => fav('lipstick'), 'fav-bbcream': () => fav('bbcream'),
};
