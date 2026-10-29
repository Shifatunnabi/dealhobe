// Pilot banner designs: 4 hero (desktop + mobile), strip (desktop + mobile), 4 deal tiles.
// Photographic studio backdrops (generated, no products/text) + the real product cut-outs, with type and
// motion in HTML so brand names and labels stay exact. Brand focus: Kodomo and Fennel; no prices anywhere —
// Fennel carries "best price in Bangladesh, guaranteed".

import { COLORS as C, arrow, cta, lines, page, row } from './lib.mjs';

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
const column = (m, inner) =>
  m
    ? `<div class="abs" style="left:64px;right:64px;top:40px;display:flex;flex-direction:column;align-items:flex-start">${inner}</div>`
    : `<div class="abs" style="left:96px;top:0;bottom:0;width:640px;display:flex;flex-direction:column;justify-content:center;align-items:flex-start">${inner}</div>`;

// Masthead lockup: DealHobe logo (mark + wordmark on a white pill), hairline divider, brand label — one row
// sharing the text column's left edge, so the logo reads as part of the layout rather than a sticker.
const eyebrow = (text, color, size, d = 0.05) => {
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
  'strip-desktop': () => strip(false), 'strip-mobile': () => strip(true),
  'deal-1': () => deal(1), 'deal-2': () => deal(2), 'deal-3': () => deal(3), 'deal-4': () => deal(4),
};

export const build = (name) => {
  const b = BANNERS[name]();
  return { name, loop: 4, fps: 24, startAt: 1.95, ...b, html: page({ W: b.W, H: b.H, bg: b.bg, body: b.body, script: b.script, photo: b.photo, photoPos: b.photoPos, photoSize: b.photoSize, veil: b.veil, veilDir: b.veilDir }) };
};
