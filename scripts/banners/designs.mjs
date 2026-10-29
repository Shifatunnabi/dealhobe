// Pilot banner designs: 4 hero (desktop + mobile), strip (desktop + mobile), 4 deal tiles.
// Photographic studio backdrops (generated, no products/text) + the real product cut-outs, with type and
// motion in HTML so brand names and labels stay exact. Brand focus: Kodomo and Fennel; no prices anywhere —
// Fennel carries "best price in Bangladesh, guaranteed".

import { COLORS as C, arrow, blendLayer, cta, floatProd, layoutRow, lines, page, podium, prod, row } from './lib.mjs';
import { EXTRA_BANNERS } from './designs-extra.mjs';
import { MODEL_BANNERS } from './designs-models.mjs';

const HERO_D = { W: 1600, H: 500, scale: 1.5 };  // 2400×750 (16:5)
const HERO_M = { W: 900, H: 900, scale: 1.2 };   // 1080×1080 (1:1)

// Per-colourway backdrop + palette. `wide` is a 3:2 photo cropped to the banner, `sq` a square photo.
const SETS = {
  sky:   { wide: 'sky-wide.jpg',   sq: 'sky-square.jpg',   offY: 330, ink: C.navy,  sub: '#173F6A', accent: '#C2670A', bg: '#9CC4E4' },
  plum:  { wide: 'plum-wide.jpg',  sq: 'plum-square.jpg',  offY: 285, ink: '#fff', sub: 'rgba(255,255,255,.86)', accent: C.gold, bg: '#3B0D2E' },
  blush: { wide: 'blush-wide.jpg', sq: 'blush-square.jpg', offY: 330, veil: 'rgba(238,203,190,.38)', ink: C.plum, sub: '#5E2F4F', accent: C.red, bg: '#E0B3A8' },
  red:   { wide: 'red-wide.jpg',   sq: 'red-square.jpg',   offY: 335, ink: C.ivory, sub: 'rgba(255,248,241,.88)', accent: C.gold, bg: '#9A0A18' },
  cream: { sq: 'cream-square.jpg', ink: C.plum, sub: '#5E2F4F', accent: C.red, bg: '#EADBC5' },
};

/** Text column: absolutely placed flex column. */
export const column = (m, inner) =>
  m
    ? `<div class="abs" style="left:64px;right:64px;top:40px;display:flex;flex-direction:column;align-items:flex-start">${inner}</div>`
    : `<div class="abs" style="left:96px;top:0;bottom:0;width:640px;display:flex;flex-direction:column;justify-content:center;align-items:flex-start">${inner}</div>`;

// Masthead lockup: DealHobe logo (mark + wordmark on a white pill), hairline divider, brand label — one row
// sharing the text column's left edge, so the logo reads as part of the layout rather than a sticker.
export const eyebrow = (text, color, size, d = 0.05) => {
  const m = size > 20;
  const pill = m ? 84 : 58, mark = m ? 60 : 41, word = m ? 34 : 23;
  return `<div class="in" style="--d:${d}s;--dy:10px;display:flex;align-items:center;gap:${m ? 24 : 16}px">
    <div style="flex:none;height:${pill}px;padding:0 ${m ? 28 : 20}px 0 ${m ? 20 : 14}px;border-radius:999px;background:#fff;display:flex;align-items:center;gap:${m ? 14 : 10}px;box-shadow:0 6px 18px rgba(15,4,12,.22)"><img src="assets/dealhobe-mark.png" style="height:${mark}px;width:auto;display:block"><img src="assets/dealhobe-word.png" style="height:${word}px;width:auto;display:block"></div>
    <div style="flex:none;width:2px;height:${Math.round(pill * 0.5)}px;background:${color};opacity:.55"></div>
    <div class="eyebrow" style="color:${color};font-size:${size}px">${text}</div>
  </div>`;
};

function hero(n, m) {
  const S = m ? HERO_M : HERO_D;
  const set = SETS[['sky', 'plum', 'blush', 'red'][n - 1]];
  const headSize = m ? 80 : 70;
  const subSize = m ? 32 : 22;
  const head = (arr, color, size = headSize) => `<h2 class="d" style="font-size:${size}px;line-height:1;color:${color};margin-top:${m ? 22 : 20}px;text-shadow:0 1px 0 rgba(255,255,255,0)">${lines(arr)}</h2>`;
  const sub = (txt) => `<p class="in" style="--d:.55s;--dy:14px;margin-top:${m ? 22 : 20}px;font-size:${subSize}px;line-height:1.4;font-weight:600;color:${set.sub};max-width:${m ? 700 : 500}px">${txt}</p>`;
  const ctaWrap = (html) => `<div style="margin-top:${m ? 30 : 30}px">${html}</div>`;
  const ctaOpts = (bg, color) => ({ bg, color, size: m ? 78 : 56, font: m ? 30 : 18, pad: m ? 44 : 30, d: 1.05 });
  const photo = m ? { photo: set.sq, photoSize: 'cover', photoPos: 'center' } : { photo: set.wide, photoSize: `${S.W}px auto`, photoPos: `0 -${set.offY}px` };
  const shelf = m ? { x0: 40, x1: 860, gy: 78 } : { x0: 770, x1: 1490, gy: 62 };
  const H = (d, mm) => (m ? Math.round(mm * 0.78) : Math.round(d * 1.12));   // pick desktop (a touch larger) / mobile heights

  let products, text, extra = '';
  if (n === 1) {
    products = [
      { file: 'kodomo-shampoo.png', h: H(330, 300) }, { file: 'kodomo-baby-powder.png', h: H(392, 350), z: 2 },
      { file: 'kodomo-lotion-180-ml.png', h: H(350, 310) }, { file: 'kodomo-hair-body-wash.png', h: H(326, 295) },
    ];
    text = eyebrow('Kodomo baby care', set.accent, m ? 26 : 15) + head(['Gentle care for', 'little ones'], set.ink) + sub('Authentic baby essentials, delivered across Bangladesh.') + ctaWrap(cta('Shop Kodomo', ctaOpts(C.navy, '#fff')));
  } else if (n === 2) {
    products = [
      { file: 'fennel-aqua-lip-tint.png', h: H(335, 300) }, { file: 'fennel-matte-lipstick.png', h: H(250, 225) },
      { file: 'fennel-blush-on.png', h: H(215, 195), z: 2 }, { file: 'fennel-volume-express-mascara.png', h: H(345, 310) },
      { file: 'fennel-loose-rice-powder.png', h: H(150, 135) },
    ];
    text = eyebrow('Fennel makeup', set.accent, m ? 26 : 15) + head(['Find your', `<em style="color:${C.gold}">colour.</em>`], set.ink) + sub('Best price in Bangladesh, guaranteed.') + ctaWrap(cta('Shop Fennel makeup', ctaOpts(C.red, '#fff')));
  } else if (n === 3) {
    products = [
      { file: 'fennel-melasma-booster-serum.png', h: H(320, 285), gapAfter: 4 }, { file: 'fennel-spotless-brightening-booster-serum.png', h: H(350, 312), z: 2, gapAfter: 4 },
      { file: 'fennel-anti-acne-booster-serum.png', h: H(320, 285), gapAfter: 30 }, { file: 'fennel-lightening-face-wash-neem.png', h: H(335, 300), z: 2, gapAfter: 8 },
      { file: 'fennel-lightening-face-wash-lemon-vitamin-c.png', h: H(315, 282) },
    ];
    text = eyebrow('Fennel skincare', set.accent, m ? 26 : 15) + head(['Glow,', 'made simple.'], set.ink) + sub('Serums &amp; face washes. Best price in Bangladesh, guaranteed.') + ctaWrap(cta('Shop Fennel skincare', ctaOpts(C.plum, '#fff')));
  } else {
    const service = `<p class="in" style="--d:.8s;--dy:12px;margin-top:${m ? 18 : 12}px;font-size:${m ? 26 : 16}px;font-weight:700;letter-spacing:.06em;color:${C.gold}">Cash on delivery &nbsp;·&nbsp; Nationwide delivery</p>`;
    products = [
      { file: 'kodomo-shampoo.png', h: H(325, 290) }, { file: 'fennel-melasma-booster-serum.png', h: H(310, 275) },
      { file: 'kodomo-baby-powder.png', h: H(385, 340), z: 2 }, { file: 'fennel-matte-lipstick.png', h: H(240, 215) },
      { file: 'kodomo-lotion-180-ml.png', h: H(335, 300) },
    ];
    text = eyebrow('Fennel · Kodomo', set.accent, m ? 26 : 15) + head(['Authentic beauty,', `<span style="color:${C.gold}">delivered.</span>`], set.ink, m ? 80 : 66) + sub('Best price in Bangladesh, guaranteed.') + service + ctaWrap(cta('Start shopping', { bg: C.ivory, color: C.red, size: m ? 78 : 56, font: m ? 30 : 18, pad: m ? 44 : 30, d: 1.05 }));
  }

  const body = `${column(m, text)}${extra}${row(products, { ...shelf, gap: m ? 10 : 14 })}`;
  return { ...S, bg: set.bg, body, ...photo, veil: set.veil, veilDir: m ? '180deg' : '90deg' };
}

/* ───────────────────────── Additional hero styles (kept alongside hero-1…4) ─────────────────────────
 * 5  Fennel skincare — iridescent liquid-splash style (pastel gradient, water, bubbles, tilted floating serums)
 * 6  Fennel makeup   — dark editorial: lipstick/cream smear texture, products fanned and tilted, text on the right
 * 7  Trust banner    — flat graphic: brand-red arches, gold sun, podiums (no photography)
 */
export const text = (m) => {
  const headSize = m ? 80 : 68, subSize = m ? 32 : 22;
  return {
    head: (arr, color, size = headSize) => `<h2 class="d" style="font-size:${size}px;line-height:1;color:${color};margin-top:${m ? 22 : 20}px">${lines(arr)}</h2>`,
    sub: (txt, color) => `<p class="in" style="--d:.55s;--dy:14px;margin-top:${m ? 22 : 20}px;font-size:${subSize}px;line-height:1.4;font-weight:600;color:${color};max-width:${m ? 700 : 500}px">${txt}</p>`,
    ctaWrap: (html) => `<div style="margin-top:30px">${html}</div>`,
    ctaOpts: (bg, color) => ({ bg, color, size: m ? 78 : 56, font: m ? 30 : 18, pad: m ? 44 : 30, d: 1.05 }),
    eb: (t, color) => eyebrow(t, color, m ? 26 : 15),
  };
};
const colRight = (inner) => `<div class="abs" style="left:880px;right:96px;top:0;bottom:0;display:flex;flex-direction:column;justify-content:center;align-items:flex-start">${inner}</div>`;

function heroSplash(m) {
  const S = m ? HERO_M : HERO_D, k = text(m);
  const ink = '#3A2468', subc = '#5C4690', accent = '#B8337E';
  const photo = m ? { photo: 'splash-square.jpg', photoSize: 'cover', photoPos: 'center' } : { photo: 'splash-wide.jpg', photoSize: `${S.W}px auto`, photoPos: '0 -250px' };
  const glow = m ? `<div class="abs" style="left:150px;top:380px;width:600px;height:600px;border-radius:50%;background:radial-gradient(closest-side,rgba(255,255,255,.55),rgba(255,255,255,0));"></div>`
                 : `<div class="abs" style="left:880px;top:30px;width:560px;height:520px;border-radius:50%;background:radial-gradient(closest-side,rgba(255,255,255,.55),rgba(255,255,255,0));"></div>`;
  const prods = m
    ? [['fennel-melasma-booster-serum.png', 215, 735, 270, -12, 2, .55, 0.0], ['fennel-anti-acne-booster-serum.png', 705, 745, 260, 9, 2, .67, .8], ['fennel-spotless-brightening-booster-serum.png', 460, 690, 380, 16, 4, .45, .4]]
    : [['fennel-melasma-booster-serum.png', 985, 318, 300, -12, 2, .55, 0.0], ['fennel-anti-acne-booster-serum.png', 1385, 318, 290, 9, 2, .67, .8], ['fennel-spotless-brightening-booster-serum.png', 1175, 262, 410, 16, 4, .45, .4]];
  const items = prods.map(([f, cx, cy, h, rot, z, d, p]) => floatProd(f, { cx, cy, h, rot, z, d, p, shadow: 'rgba(110,60,150,.34)' })).join('');
  const fg = m ? blendLayer('backdrops/splash-fg.jpg', { left: -120, top: 640, width: 1140, opacity: .8, z: 6, cls: 'in', d: .5 })
               : blendLayer('backdrops/splash-fg.jpg', { left: 760, top: 250, width: 800, opacity: .8, z: 6, cls: 'in', d: .5 });
  // Bubbles sit BEHIND the products (z 1). A fading mask keeps them off the text column; blend mode stays on the
  // image itself (a clipping wrapper would isolate it and `screen` would show the black).
  const bubbleMask = m ? 'linear-gradient(to bottom,transparent 38%,#000 58%)' : 'linear-gradient(to right,transparent 52%,#000 62%)';
  const bubbles = m ? blendLayer('backdrops/bubbles.jpg', { left: 230, top: 330, width: 620, opacity: .8, z: 1, cls: 'drx' })
                    : blendLayer('backdrops/bubbles.jpg', { left: 770, top: -80, width: 760, opacity: .8, z: 1, cls: 'drx' });
  const bubblesMasked = bubbles.replace('pointer-events:none"', `pointer-events:none;-webkit-mask-image:${bubbleMask};mask-image:${bubbleMask}"`);
  const col = (inner) => (m ? `<div class="abs" style="left:64px;right:64px;top:40px;display:flex;flex-direction:column;align-items:flex-start">${inner}</div>` : `<div class="abs" style="left:96px;top:0;bottom:0;width:640px;display:flex;flex-direction:column;justify-content:center;align-items:flex-start">${inner}</div>`);
  const t = k.eb('Fennel skincare', accent) + k.head(['Glow, made', 'simple.'], ink) + k.sub('Serums &amp; face washes. Best price in Bangladesh, guaranteed.', subc)
    + k.ctaWrap(cta('Shop Fennel skincare', k.ctaOpts('linear-gradient(90deg,#CF4C96,#7A5BD2)', '#fff')));
  return { ...S, bg: '#E7C9E6', body: `${glow}${col(t)}${items}${fg}${bubblesMasked}`, ...photo };
}

function heroEditorial(m) {
  const S = m ? HERO_M : HERO_D, k = text(m);
  const photo = m ? { photo: 'smear-square.jpg', photoSize: 'cover', photoPos: 'center' } : { photo: 'smear-wide.jpg', photoSize: `${S.W}px auto`, photoPos: '0 -250px' };
  const spot = m ? `<div class="abs" style="inset:0;background:radial-gradient(ellipse at 50% 72%,rgba(255,214,225,.22),rgba(0,0,0,0) 60%)"></div>`
                 : `<div class="abs" style="inset:0;background:radial-gradient(ellipse at 30% 55%,rgba(255,214,225,.24),rgba(0,0,0,0) 55%)"></div>`;
  // Fanned, tilted products: auto-spaced across the stage; `bot` = y of each product's bottom edge (they float at different heights).
  const spec = m
    ? [{ file: 'fennel-aqua-lip-tint.png', h: 340, rot: -14, bot: 840 }, { file: 'fennel-matte-lipstick.png', h: 225, rot: 9, bot: 860 }, { file: 'fennel-blush-on.png', h: 215, rot: -7, bot: 865 }, { file: 'fennel-volume-express-mascara.png', h: 350, rot: 13, bot: 835 }, { file: 'fennel-loose-rice-powder.png', h: 120, rot: -4, bot: 875 }]
    : [{ file: 'fennel-aqua-lip-tint.png', h: 335, rot: -13, bot: 420 }, { file: 'fennel-matte-lipstick.png', h: 232, rot: 9, bot: 445 }, { file: 'fennel-blush-on.png', h: 215, rot: -7, bot: 452 }, { file: 'fennel-volume-express-mascara.png', h: 345, rot: 13, bot: 415 }, { file: 'fennel-loose-rice-powder.png', h: 125, rot: -4, bot: 462 }];
  const lay = layoutRow(spec, m ? { x0: 40, x1: 860, gap: 4 } : { x0: 56, x1: 790, gap: 4 });
  const items = lay.map((it, i) => floatProd(it.file, { cx: Math.round(it.cx), cy: Math.round(it.bot - it.h / 2), h: Math.round(it.h), rot: it.rot, z: i % 2 ? 3 : 2, d: +(0.5 + i * 0.12).toFixed(2), p: +(i * 0.7).toFixed(2), shadow: 'rgba(0,0,0,.55)', blur: 28 })).join('');
  const col = (inner) => (m ? `<div class="abs" style="left:64px;right:64px;top:40px;display:flex;flex-direction:column;align-items:flex-start">${inner}</div>` : colRight(inner));
  const t = k.eb('Fennel makeup', C.gold) + k.head(['Colour', `<em style="color:${C.gold}">with attitude.</em>`], '#fff', m ? 80 : 64) + k.sub('Best price in Bangladesh, guaranteed.', 'rgba(255,255,255,.88)')
    + k.ctaWrap(cta('Shop Fennel makeup', k.ctaOpts(C.red, '#fff')));
  return { ...S, bg: '#2A0A24', body: `${spot}${col(t)}${items}`, ...photo };
}

function heroGraphic(m) {
  const S = m ? HERO_M : HERO_D, k = text(m);
  const grain = `<svg class="abs" style="inset:0;width:100%;height:100%;opacity:.16;mix-blend-mode:multiply;pointer-events:none" xmlns="http://www.w3.org/2000/svg"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .9 0"/></filter><rect width="100%" height="100%" filter="url(#n)"/></svg>`;
  const items = m
    ? [{ file: 'kodomo-shampoo.png', h: 215, pod: 60 }, { file: 'fennel-melasma-booster-serum.png', h: 205, pod: 120 }, { file: 'kodomo-baby-powder.png', h: 275, pod: 40, z: 2 }, { file: 'fennel-matte-lipstick.png', h: 155, pod: 100 }, { file: 'kodomo-lotion-180-ml.png', h: 230, pod: 70 }]
    : [{ file: 'kodomo-shampoo.png', h: 300, pod: 70 }, { file: 'fennel-melasma-booster-serum.png', h: 285, pod: 135 }, { file: 'kodomo-baby-powder.png', h: 350, pod: 50, z: 2 }, { file: 'fennel-matte-lipstick.png', h: 215, pod: 110 }, { file: 'kodomo-lotion-180-ml.png', h: 310, pod: 80 }];
  const area = m ? { x0: 60, x1: 840 } : { x0: 800, x1: 1500 };
  const lay = layoutRow(items.map((it) => ({ ...it })), { ...area, gap: m ? 26 : 24 });
  const base = m ? 34 : 0;       // podium base sits this far above the bottom edge
  const pods = lay.map((it, i) => podium({ cx: it.cx, w: Math.max(it.w * 1.18, m ? 190 : 150), h: it.pod + base, top: i % 2 ? '#F3C9A8' : '#FFE9D6', body: i % 2 ? '#C93A2B' : '#B2241A', shade: i % 2 ? '#A52A1E' : '#8E1B12' })).join('');
  const prodsHtml = lay.map((it, i) => prod(it.file, { cx: Math.round(it.cx), gy: it.pod + base, h: Math.round(it.h), z: it.z ?? 3, d: +(0.5 + i * 0.12).toFixed(2), p: +(i * 0.7).toFixed(2), dy: 60 })).join('');
  const arch = m
    ? `<div class="abs" style="right:84px;top:392px;width:140px;height:140px;border-radius:50%;background:${C.gold}"></div><div class="abs" style="left:100px;bottom:0;width:700px;height:420px;border-radius:350px 350px 0 0;background:#FFF1E3"></div><div class="abs" style="left:136px;bottom:0;width:628px;height:384px;border-radius:314px 314px 0 0;border:3px solid ${C.goldDeep};border-bottom:0"></div>`
    : `<div class="abs" style="left:820px;bottom:0;width:640px;height:470px;border-radius:320px 320px 0 0;background:#FFF1E3"></div><div class="abs" style="left:858px;bottom:0;width:564px;height:432px;border-radius:282px 282px 0 0;border:3px solid ${C.goldDeep};border-bottom:0"></div><div class="abs" style="left:1330px;top:36px;width:150px;height:150px;border-radius:50%;background:${C.gold}"></div>`;
  const col = (inner) => (m ? `<div class="abs" style="left:64px;right:64px;top:40px;display:flex;flex-direction:column;align-items:flex-start">${inner}</div>` : `<div class="abs" style="left:96px;top:0;bottom:0;width:640px;display:flex;flex-direction:column;justify-content:center;align-items:flex-start">${inner}</div>`);
  const service = `<p class="in" style="--d:.8s;--dy:12px;margin-top:${m ? 18 : 12}px;font-size:${m ? 26 : 16}px;font-weight:700;letter-spacing:.06em;color:${C.gold}">Cash on delivery &nbsp;·&nbsp; Nationwide delivery</p>`;
  const t = k.eb('Fennel · Kodomo', C.gold) + k.head(['Authentic beauty,', `<span style="color:${C.gold}">delivered.</span>`], C.ivory, m ? 80 : 66) + k.sub('Best price in Bangladesh, guaranteed.', C.ivory) + service
    + k.ctaWrap(cta('Start shopping', k.ctaOpts(C.ivory, C.red)));
  return { ...S, bg: '#A41B15', body: `${arch}${pods}${col(t)}${prodsHtml}${grain}` };
}

function strip(m) {
  const S = m ? { W: 900, H: 90, scale: 1.2 } : { W: 1600, H: 64, scale: 1.25 };   // 2000×80 (25:1)
  const size = m ? 30 : 19;
  const items = ['Best price in Bangladesh, guaranteed', '100% authentic', 'Cash on delivery', 'Nationwide delivery'];
  const block = `<div class="blk" style="display:flex;align-items:center;flex:none">${items.map((t) => `<span style="padding:0 ${m ? 26 : 30}px;display:inline-flex;align-items:center;gap:${m ? 26 : 30}px"><span>${t}</span><span style="color:${C.gold};font-size:${size * 0.42}px">◆</span></span>`).join('')}</div>`;
  const body = `
    <div class="abs" style="left:0;right:0;top:0;height:1px;background:${C.gold};opacity:.5"></div>
    <div class="abs" style="left:0;right:0;bottom:0;height:1px;background:${C.gold};opacity:.5"></div>
    <div id="track" style="position:absolute;left:0;top:0;bottom:0;display:flex;align-items:center;white-space:nowrap;text-transform:uppercase;font-weight:800;letter-spacing:.12em;font-size:${size}px;color:${C.ivory}">${block}${block}${block}</div>`;
  const loop = 8;
  const script = `document.fonts.ready.then(()=>{const t=document.getElementById('track');const w=t.querySelector('.blk').getBoundingClientRect().width;t.animate([{transform:'translateX(0)'},{transform:'translateX(-'+w+'px)'}],{duration:${loop * 1000},easing:'linear',fill:'both'});window.__ready=true;});`;
  return { ...S, bg: C.plum, body, loop, fps: 24, script, startAt: 0 };  // flat colour + text: low quality is plenty
}

function deal(n) {
  const S = { W: 500, H: 500, scale: 1.2 }; // 600×600
  const set = SETS[['plum', 'sky', 'blush', 'cream'][n - 1]];
  const gy = 34;
  const head = (eb, title, sub, accent = set.accent) => `
    <div class="abs" style="left:34px;top:34px;right:92px">
      <div class="eyebrow" style="color:${accent};font-size:12.5px"><i style="width:28px"></i><span class="in" style="--d:.05s;--dy:8px">${eb}</span></div>
      <h2 class="d" style="font-size:58px;line-height:1;color:${set.ink};margin-top:13px">${lines(title, 0.1, 0.12)}</h2>
      <p class="in" style="--d:.5s;--dy:10px;margin-top:11px;font-size:16.5px;line-height:1.4;font-weight:600;color:${set.sub}">${sub}</p>
    </div>
    <div class="abs pop" style="--d:.9s;right:30px;top:32px;width:50px;height:50px;border-radius:50%;background:${n === 1 ? C.gold : set.ink};display:flex;align-items:center;justify-content:center;filter:drop-shadow(0 6px 10px rgba(15,4,12,.25))"><span style="color:${n === 1 ? C.plum : (n === 2 ? '#fff' : '#fff')}">${arrow(24)}</span></div>`;
  const shelf = (items, x0 = 30, x1 = 470) => row(items, { x0, x1, gy, gap: 6, d0: 0.45, step: 0.1, dy: 40 });

  const common = { ...S, bg: set.bg, photo: set.sq, photoSize: 'cover', photoPos: 'center' };
  if (n === 1) {
    return { ...common, body: head('Fennel', ['Makeup'], 'Best price in Bangladesh,<br>guaranteed.', C.gold) + shelf([
      { file: 'fennel-matte-lipstick.png', h: 185 }, { file: 'fennel-blush-on.png', h: 150, z: 2 }, { file: 'fennel-aqua-lip-tint.png', h: 235 }, { file: 'fennel-volume-express-mascara.png', h: 215 }]) };
  }
  if (n === 2) {
    return { ...common, body: head('Kodomo', ['Baby care'], 'Gentle on little skin.') + shelf([
      { file: 'kodomo-baby-powder.png', h: 270 }, { file: 'kodomo-shampoo.png', h: 245 }, { file: 'kodomo-lotion-180-ml.png', h: 255 }, { file: 'kodomo-pink-hanabaki-cream.png', h: 85 }]) };
  }
  if (n === 3) {
    return { ...common, body: head('Customer favourites', ['Bestsellers'], 'Most-loved picks. Best price<br>in Bangladesh, guaranteed.') + shelf([
      { file: 'fennel-matte-lipstick.png', h: 175 }, { file: 'fennel-melasma-booster-serum.png', h: 255 }, { file: 'kodomo-baby-powder.png', h: 265 }, { file: 'kodomo-shampoo.png', h: 235 }]) };
  }
  return { ...common, body: head('Thoughtful picks', ['Gift sets'], 'For little ones and<br>beauty lovers.') + shelf([
    { file: 'kodomo-baby-soap-75-gm.png', h: 122 }, { file: 'kodomo-gift-set.png', h: 315, z: 2 }, { file: 'kodomo-pink-hanabaki-cream.png', h: 114 }]) };
}

export const BANNERS = {
  'hero-1-desktop': () => hero(1, false), 'hero-1-mobile': () => hero(1, true),
  'hero-2-desktop': () => hero(2, false), 'hero-2-mobile': () => hero(2, true),
  'hero-3-desktop': () => hero(3, false), 'hero-3-mobile': () => hero(3, true),
  'hero-4-desktop': () => hero(4, false), 'hero-4-mobile': () => hero(4, true),
  'hero-5-desktop': () => heroSplash(false), 'hero-5-mobile': () => heroSplash(true),
  'hero-6-desktop': () => heroEditorial(false), 'hero-6-mobile': () => heroEditorial(true),
  'hero-7-desktop': () => heroGraphic(false), 'hero-7-mobile': () => heroGraphic(true),
  'strip-desktop': () => strip(false), 'strip-mobile': () => strip(true),
  'deal-1': () => deal(1), 'deal-2': () => deal(2), 'deal-3': () => deal(3), 'deal-4': () => deal(4),
  ...EXTRA_BANNERS,   // brand / offer / category / concern tiles (designs-extra.mjs)
  ...MODEL_BANNERS,   // model-led Fennel makeup banners + fav-* product tiles; these override hero-2/6, deal-1, brand-2, cat-makeup (designs-models.mjs)
};

export const build = (name) => {
  const b = BANNERS[name]();
  return { name, loop: 4, fps: 24, startAt: 1.95, ...b, html: page({ W: b.W, H: b.H, bg: b.bg, body: b.body, script: b.script, photo: b.photo, photoPos: b.photoPos, photoSize: b.photoSize, veil: b.veil, veilDir: b.veilDir, calm: b.calm }) };
};
