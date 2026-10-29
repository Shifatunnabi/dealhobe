// Second banner set: top-brand tiles (2:1), limited-time offer tiles (5:2), category tiles (3:2) and concern tiles (1:1).
// See ART-DIRECTION.md for the rationale. Same pipeline as designs.mjs (calm 4 s loops, copy fixed, products float).
// Packshots that only exist on a white background (Kidlon, Mistine) are blended with `multiply` straight onto a pale
// panel (see `mul`) so no fake cut-out is needed and their own contact shadows survive.

import { COLORS as C, arrow, floatProd, layoutRow, lines, prod, row } from './lib.mjs';

const GUARANTEE = 'Best price in Bangladesh, guaranteed.';

const BRAND = { W: 800, H: 400, scale: 1.5 };     // 1200×600 (2:1)
const OFFER = { W: 600, H: 240, scale: 1.5 };     // 900×360  (5:2)
const CAT = { W: 600, H: 400, scale: 1.5 };       // 900×600  (3:2)
const CONCERN = { W: 400, H: 400, scale: 1.25 };  // 500×500  (1:1)
const TILE = { crf: 24, posterQ: 78, startAt: 3.05 };   // start after the button shine so the poster frame is clean            // tiles are small and flat: spend fewer bytes

/* ───────────── helpers ───────────── */
const abs = (css, inner = '', cls = '') => `<div class="abs ${cls}" style="${css}">${inner}</div>`;
const chip = (size, bg, color, right, top, extra = '') =>
  `<div class="abs" style="right:${right}px;top:${top}px;width:${size}px;height:${size}px;border-radius:50%;background:${bg};color:${color};display:flex;align-items:center;justify-content:center;box-shadow:0 6px 14px rgba(20,8,16,.2);z-index:20;${extra}">${arrow(Math.round(size * 0.46))}</div>`;
const pillBtn = (label, bg, color, { h = 44, font = 17, pad = 22 } = {}) =>
  `<div class="cta" style="background:${bg};color:${color};height:${h}px;padding:0 ${pad}px;font-size:${font}px;gap:9px">${label}${arrow(font + 3)}<i class="shine"></i></div>`;
const kicker = (t, color, size = 16) => `<div class="eyebrow" style="color:${color};font-size:${size}px;letter-spacing:.18em">${t}</div>`;
const head = (arr, color, size, mt = 10) => `<h2 class="d" style="font-size:${size}px;line-height:1;color:${color};margin-top:${mt}px">${lines(arr, 0.1, 0.12)}</h2>`;
const sub = (t, color, size = 22, mt = 12, maxW = 340) => `<p style="margin-top:${mt}px;font-size:${size}px;line-height:1.32;font-weight:600;color:${color};max-width:${maxW}px">${t}</p>`;
const col = (css, inner) => `<div class="abs" style="${css};display:flex;flex-direction:column;align-items:flex-start;z-index:15">${inner}</div>`;

/** JPEG size from its SOF marker (assets are square but be safe). */
import fs from 'node:fs';
import path from 'node:path';
import { ASSETS } from './lib.mjs';
const jpgSize = (file) => {
  const b = fs.readFileSync(path.join(ASSETS, file));
  for (let i = 2; i < b.length;) { if (b[i] !== 0xff) { i++; continue; } const m = b[i + 1]; if (m >= 0xc0 && m <= 0xc3) return { w: b.readUInt16BE(i + 7), h: b.readUInt16BE(i + 5) }; i += 2 + b.readUInt16BE(i + 2); }
  return { w: 900, h: 900 };
};

/**
 * White-background packshot blended with `multiply` (white disappears into the panel behind it).
 * `h` is the visible product height; `crop` is the fraction of the photo the product spans vertically (so the
 * caller thinks in product size, not image size). The <img> is a direct child of the stage so nothing isolates the blend.
 */
export const mul = (file, { cx, cy, h, crop = 0.8, rot = 0, z = 5, p = 0, shadow = true }) => {
  const { w: nw, h: nh } = jpgSize(file);
  const ih = h / crop, iw = (nw / nh) * ih;
  const sh = shadow ? abs(`left:${Math.round(cx - iw * 0.25)}px;top:${Math.round(cy + h * 0.47)}px;width:${Math.round(iw * 0.5)}px;height:${Math.max(8, Math.round(h * 0.05))}px;border-radius:50%;background:rgba(40,30,40,.22);filter:blur(7px);z-index:${z - 1}`) : '';
  return `${sh}<img class="abs dr" src="assets/${file}" style="left:${Math.round(cx - iw / 2)}px;top:${Math.round(cy - ih / 2)}px;width:${Math.round(iw)}px;height:${Math.round(ih)}px;mix-blend-mode:multiply;z-index:${z};--p:${p}s;rotate:${rot}deg">`;
};

const dots = (n, seed, { x0, x1, y0, y1, r0, r1, color, opacity = 1, z = 0 }) => {
  let s = seed; const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  return Array.from({ length: n }, () => { const r = r0 + rnd() * (r1 - r0); return abs(`left:${Math.round(x0 + rnd() * (x1 - x0) - r)}px;top:${Math.round(y0 + rnd() * (y1 - y0) - r)}px;width:${Math.round(r * 2)}px;height:${Math.round(r * 2)}px;border-radius:50%;background:${color};opacity:${opacity};z-index:${z}`); }).join('');
};
const cloud = (x, y, s, color = '#fff', p = 0, cls = 'drx') => abs(`left:${x}px;top:${y}px;width:${160 * s}px;height:${70 * s}px;z-index:1;--p:${p}s`,
  `<div style="position:absolute;left:0;bottom:0;width:100%;height:${42 * s}px;border-radius:${42 * s}px;background:${color}"></div><div style="position:absolute;left:${26 * s}px;bottom:${16 * s}px;width:${54 * s}px;height:${54 * s}px;border-radius:50%;background:${color}"></div><div style="position:absolute;left:${70 * s}px;bottom:${16 * s}px;width:${70 * s}px;height:${70 * s}px;border-radius:50%;background:${color}"></div>`, cls);
const ground = (h, color, extra = '') => abs(`left:-60px;right:-60px;bottom:${-h * 0.55}px;height:${h}px;border-radius:50%;background:${color};z-index:2;${extra}`);

/* ───────────── 1. Top brands and offers (2:1) ───────────── */
function brand(n) {
  const S = BRAND;
  if (n === 1) {  // Kodomo — flat paper-cut sky: clouds, sun, butter hill
    const prods = row([{ file: 'kodomo-shampoo.png', h: 240 }, { file: 'kodomo-baby-powder.png', h: 272, z: 2 }, { file: 'kodomo-lotion-180-ml.png', h: 246 }, { file: 'kodomo-hair-body-wash.png', h: 232 }], { x0: 405, x1: 775, gy: 46, gap: 6, d0: 0.4 });
    const body = abs('inset:0;background:radial-gradient(ellipse at 70% 20%,#E9F6FD,#CBE7F6 60%,#BADBF0)')
      + abs('right:64px;top:34px;width:84px;height:84px;border-radius:50%;background:#FFD66B;box-shadow:0 0 0 14px rgba(255,214,107,.28),0 0 0 30px rgba(255,214,107,.14)')
      + cloud(380, 56, 1.0, '#fff', 0) + cloud(560, 118, 0.7, 'rgba(255,255,255,.92)', 1.4)
      + ground(190, '#FFF0C2') + abs('left:-60px;right:-60px;bottom:-112px;height:190px;border-radius:50%;background:#FFE29A;z-index:1;transform:translateY(-10px)')
      + col('left:52px;top:0;bottom:0;width:360px;justify-content:center',
          kicker('Baby care', '#C2670A', 17) + head(['Kodomo'], C.navy, 94, 8) + sub('Gentle care for little ones.', '#173F6A', 25, 8, 330) + `<div style="margin-top:22px">${pillBtn('Shop Kodomo', C.navy, '#fff')}</div>`)
      + prods;
    return { ...S, ...TILE, bg: '#CBE7F6', body };
  }
  if (n === 2) {  // Fennel makeup — flat colour swatches (lip & blush shades)
    const sw = (x, y, d, c, p) => abs(`left:${x}px;top:${y}px;width:${d}px;height:${d}px;border-radius:50%;background:${c};z-index:1;--p:${p}s`, '', 'drx');
    const prods = row([{ file: 'fennel-aqua-lip-tint.png', h: 262 }, { file: 'fennel-matte-lipstick.png', h: 190 }, { file: 'fennel-blush-on.png', h: 160, z: 2 }, { file: 'fennel-volume-express-mascara.png', h: 266 }], { x0: 405, x1: 765, gy: 38, gap: 8, d0: 0.4 });
    const body = abs('inset:0;background:#FFF2EA')
      + sw(520, -70, 330, '#EE8D83', 0) + sw(380, 110, 250, '#D9456A', 1.3) + sw(650, 60, 210, '#8E1B3C', 2.1) + sw(470, 250, 190, '#EFC3B0', .8) + sw(690, 250, 120, '#F4A9B8', 2.8)
      + abs('left:0;right:0;bottom:0;height:62px;background:#F3D9CC;z-index:2') + abs('left:0;right:0;bottom:62px;height:2px;background:rgba(142,27,60,.18);z-index:2')
      + col('left:52px;top:0;bottom:0;width:340px;justify-content:center',
          kicker('Makeup', C.red, 17) + head(['Fennel', `<em style="color:${C.red}">colour.</em>`], C.plum, 80, 8) + sub(GUARANTEE, '#5E2F4F', 22, 14, 300) + `<div style="margin-top:20px">${pillBtn('Shop Fennel makeup', C.red, '#fff')}</div>`)
      + prods;
    return { ...S, ...TILE, bg: '#FFF2EA', body };
  }
  if (n === 3) {  // Fennel skincare — soft lilac arch + stepped stone plinths
    const plinth = (cx, w, h, top, body, shade) => abs(`left:${cx - w / 2}px;bottom:0;width:${w}px;height:${h}px;z-index:2;border-radius:18px 18px 0 0;background:linear-gradient(90deg,${body} 0 70%,${shade} 70% 100%)`)
      + abs(`left:${cx - w / 2}px;bottom:${h - 9}px;width:${w}px;height:20px;border-radius:50%;background:${top};z-index:2`);
    const items = [['fennel-melasma-booster-serum.png', 515, 78, 196], ['fennel-spotless-brightening-booster-serum.png', 625, 108, 220], ['fennel-anti-acne-booster-serum.png', 735, 60, 196]];
    const body = abs('inset:0;background:linear-gradient(135deg,#EFE6F8,#E3D4F2)')
      + abs('left:446px;bottom:0;width:330px;height:380px;border-radius:165px 165px 0 0;background:#F8F3FD;z-index:0;box-shadow:inset 0 0 0 3px #D7C4EC')
      + abs('left:416px;top:44px;width:84px;height:84px;border-radius:50%;background:#F7C8A8;z-index:0;--p:1s', '', 'drx')
      + items.map(([f, cx, ph, h], i) => plinth(cx, 104, ph, '#FFFFFF', ['#E9D8F6', '#F7D7C4', '#E9D8F6'][i], ['#D5BEEA', '#EBBFA6', '#D5BEEA'][i])
        + prod(f, { cx, gy: ph + 6, h, z: 4, d: 0.4 + i * 0.12, p: i * 0.7, dy: 40 })).join('')
      + col('left:52px;top:0;bottom:0;width:380px;justify-content:center',
          kicker('Skincare', '#8A3FB0', 17) + head(['Fennel', '<em style="color:#8A3FB0">skin.</em>'], '#2E1A4A', 72, 8) + sub('Serums &amp; face washes.<br>' + GUARANTEE, '#4C3770', 21, 14, 340) + `<div style="margin-top:20px">${pillBtn('Shop Fennel skincare', '#4A2A78', '#fff')}</div>`);
    return { ...S, ...TILE, bg: '#E8DBF4', body };
  }
  if (n === 4) {  // GDM — leaf-shadow plaster wall, limestone ledge
    const prods = row([{ file: 'gdm-hair-cleansing-serum.png', h: 262 }, { file: 'gdm-hair-oil-serum.png', h: 274, z: 2 }, { file: 'gdm-anti-acne-face-serum.png', h: 246 }, { file: 'gdm-spotless-face-serum.png', h: 240 }], { x0: 410, x1: 780, gy: 78, gap: 14, d0: 0.4 });
    const body = col('left:52px;top:0;bottom:0;width:360px;justify-content:center',
      kicker('Skin &amp; hair care', '#7A3B14', 17) + head(['GDM'], '#12492A', 100, 8) + sub('Everyday skin and hair essentials.', '#1C4A2E', 24, 8, 320) + `<div style="margin-top:22px">${pillBtn('Shop GDM', '#12492A', '#fff')}</div>`) + prods;
    return { ...S, ...TILE, bg: '#B8C49C', photo: 'leaves-wide.jpg', photoSize: '800px auto', photoPos: '0 -30px', body, veil: 'rgba(222,230,200,.78)' };
  }
  if (n === 5) {  // Kidlon — brand-blue block + pale catalogue panel (multiply packshots)
    const body = abs('inset:0;background:#F7F4EE')
      + abs('left:0;top:0;bottom:0;width:380px;background:#1B4FA3;z-index:0')
      + abs('left:300px;top:-60px;width:520px;height:520px;border-radius:50%;background:#EEF3FA;z-index:0')
      + abs('left:292px;top:-68px;width:536px;height:536px;border-radius:50%;border:3px solid #1B4FA3;opacity:.25;z-index:0')
      + col('left:52px;top:0;bottom:0;width:290px;justify-content:center',
          kicker('Baby care', '#FFD66B', 17) + head(['Kidlon'], '#fff', 82, 8) + sub('Baby essentials &amp; gift sets.', 'rgba(255,255,255,.92)', 23, 10, 250) + `<div style="margin-top:22px">${pillBtn('Shop Kidlon', '#FFD66B', '#12356F')}</div>`)
      + mul('kidlon-essential-gift-set.jpg', { cx: 590, cy: 125, h: 150, crop: 0.56, z: 4, p: 0.3 })
      + mul('kidlon-baby-cream.jpg', { cx: 478, cy: 300, h: 160, crop: 0.9, z: 5, p: 0.9 })
      + mul('kidlon-baby-petroleum-jelly-100-ml.jpg', { cx: 592, cy: 330, h: 70, crop: 0.5, z: 6, p: 2.2 })
      + mul('kidlon-baby-lotion-200-ml.jpg', { cx: 702, cy: 296, h: 170, crop: 0.9, z: 5, p: 1.6 });
    return { ...S, ...TILE, bg: '#F7F4EE', body };
  }
  // 6 — Mistine: single hero product, calm teal typographic tile
  const body = abs('inset:0;background:linear-gradient(120deg,#0E6F78,#16939A)')
    + abs('left:420px;top:-40px;width:480px;height:480px;border-radius:50%;background:#E4F4F2;z-index:0')
    + abs('left:380px;top:-80px;width:560px;height:560px;border-radius:50%;border:2px solid rgba(255,255,255,.35);z-index:0')
    + col('left:52px;top:0;bottom:0;width:360px;justify-content:center',
        kicker('Facial care', '#BDEBE6', 17) + head(['Mistine'], '#fff', 88, 8) + sub('Acne Clear facial foam.', 'rgba(255,255,255,.92)', 25, 10, 320) + `<div style="margin-top:22px">${pillBtn('Shop Mistine', '#fff', '#0E6F78')}</div>`)
    + mul('mistine-acne-clear.jpg', { cx: 590, cy: 215, h: 205, crop: 0.52, z: 4, p: 0.4 });
  return { ...S, ...TILE, bg: '#0E6F78', body };
}

/* ───────────── 2. Limited-time offers (5:2, light) ───────────── */
function offer(n) {
  const S = OFFER;
  const card = (bg, inner) => abs(`inset:0;background:${bg}`) + inner;
  const word = (t, color, size = 56) => `<h2 class="d" style="font-size:${size}px;line-height:.98;color:${color}">${lines(Array.isArray(t) ? t : [t], 0.05, 0.1)}</h2>`;
  if (n === 1) {  // sets: text left, peach blob, Kodomo gift set + Kidlon set
    const body = card('#FFF6EE',
      abs('left:300px;top:-60px;width:360px;height:360px;border-radius:50%;background:#FADBC6')
      + col('left:36px;top:0;bottom:0;width:260px;justify-content:center', kicker('Thoughtful picks', '#B4531F', 15) + `<div style="height:8px"></div>` + word(['Gift', 'sets'], '#4A1F2E', 62))
      + floatProd('kodomo-gift-set.png', { cx: 450, cy: 140, h: 150, rot: -5, z: 4, p: 0.2, shadow: 'rgba(120,50,20,.3)', blur: 16 })
      + chip(34, '#4A1F2E', '#fff', 16, 14));
    return { ...S, ...TILE, bg: '#FFF6EE', body };
  }
  if (n === 2) {  // combos: art left, text right, mint
    const body = card('#EEF7F2',
      abs('left:-70px;top:-50px;width:340px;height:340px;border-radius:50%;background:#CDE8DB')
      + mul('kidlon-feeding-gift-set-combo.jpg', { cx: 112, cy: 126, h: 172, crop: 0.62, rot: -3, z: 4, p: 0.3, shadow: false })
      + mul('kidlon-baby-care-kit-box.jpg', { cx: 244, cy: 152, h: 128, crop: 0.62, rot: 4, z: 5, p: 1.1, shadow: false })
      + col('left:330px;top:0;bottom:0;width:240px;justify-content:center', kicker('Ready-made', '#1D6B4B', 15) + `<div style="height:8px"></div>` + word(['Combos'], '#12392B', 60))
      + chip(34, '#12392B', '#fff', 16, 14));
    return { ...S, ...TILE, bg: '#EEF7F2', body };
  }
  if (n === 3) {  // offers: red field, gold ring, Fennel + Kodomo, guarantee line
    const body = card('#A41B15',
      abs('left:-40px;top:-60px;width:340px;height:340px;border-radius:50%;background:#B52A22')
      + abs('left:330px;top:-30px;width:300px;height:300px;border-radius:50%;border:3px solid #E9C98C;opacity:.55')
      + col('left:36px;top:0;bottom:0;width:300px;justify-content:center', kicker('Current picks', '#E9C98C', 15) + `<div style="height:8px"></div>` + word('Offers', '#FFF8F1', 70) + `<p style="margin-top:12px;font-size:19px;font-weight:700;line-height:1.25;color:rgba(255,248,241,.92);max-width:250px">${GUARANTEE}</p>`)
      + row([{ file: 'fennel-matte-lipstick.png', h: 110 }, { file: 'fennel-melasma-booster-serum.png', h: 158, z: 2 }, { file: 'kodomo-baby-powder.png', h: 170 }], { x0: 330, x1: 545, gy: 22, gap: 2, d0: 0.3 })
      + chip(34, '#E9C98C', '#5A1010', 16, 14));
    return { ...S, ...TILE, bg: '#A41B15', body };
  }
  // 4 — "New in": pure typography on plum, no products (nothing to fake)
  const star = (x, y, s, p) => abs(`left:${x}px;top:${y}px;width:${s}px;height:${s}px;color:#E9C98C;z-index:2;--p:${p}s`, `<svg viewBox="0 0 24 24" width="100%" height="100%"><path fill="currentColor" d="M12 0c.8 6.4 5.6 11.2 12 12-6.4.8-11.2 5.6-12 12-.8-6.4-5.6-11.2-12-12C6.4 11.2 11.2 6.4 12 0z"/></svg>`, 'fl');
  const body = card('#3B0D2E',
    abs('left:-80px;bottom:-190px;width:420px;height:420px;border-radius:50%;background:#531445')
    + abs('right:-60px;top:-120px;width:340px;height:340px;border-radius:50%;background:#531445')
    + star(392, 40, 22, 0) + star(560, 196, 16, 1.6)
    + floatProd('gdm-hair-oil-serum.png', { cx: 400, cy: 135, h: 150, rot: -8, z: 4, p: 0.2, shadow: 'rgba(0,0,0,.45)', blur: 16 })
    + floatProd('fennel-melasma-booster-serum.png', { cx: 480, cy: 125, h: 150, rot: 4, z: 5, p: 0.9, shadow: 'rgba(0,0,0,.45)', blur: 16 })
    + floatProd('kodomo-lotion-180-ml.png', { cx: 556, cy: 135, h: 140, rot: 9, z: 4, p: 1.6, shadow: 'rgba(0,0,0,.45)', blur: 16 })
    + col('left:36px;top:0;bottom:0;width:300px;justify-content:center', kicker('Just landed', '#E9C98C', 15) + `<div style="height:6px"></div>` + word(['New', '<em style="color:#E9C98C">in</em>'], '#FFF8F1', 74) + `<p style="margin-top:10px;font-size:16px;font-weight:700;color:rgba(255,248,241,.85)">${GUARANTEE}</p>`)
    + chip(34, '#E9C98C', '#3B0D2E', 16, 14));
  return { ...S, ...TILE, bg: '#3B0D2E', body };
}

/* ───────────── 3. Shop by category (3:2) ───────────── */
function category(slug) {
  const S = CAT;
  const title = (t, color, size = 58, extra = '') => abs(`left:30px;bottom:26px;z-index:20;${extra}`, `<h2 class="d" style="font-size:${size}px;line-height:1;color:${color}">${t}</h2>`);
  const tag = (t, color, size = 21) => `<div style="margin-top:8px;font-size:${size}px;font-weight:700;color:${color}">${t}</div>`;
  const label = (t, s, color, tagColor, size = 58) => abs('left:32px;top:28px;z-index:20', `<h2 class="d" style="font-size:${size}px;line-height:1;color:${color}">${t}</h2>${s ? tag(s, tagColor) : ''}`);
  if (slug === 'makeup') {
    const prods = row([{ file: 'fennel-aqua-lip-tint.png', h: 232 }, { file: 'fennel-matte-lipstick.png', h: 168 }, { file: 'fennel-blush-on.png', h: 142, z: 2 }, { file: 'fennel-volume-express-mascara.png', h: 236 }], { x0: 250, x1: 580, gy: 46, gap: 4, d0: 0.4 });
    return { ...S, ...TILE, bg: '#E8B6A6', photo: 'silk-wide.jpg', photoSize: '600px auto', photoPos: '0 -40px', body: label('Makeup', GUARANTEE.replace('guaranteed.', 'guaranteed.'), '#4A1030', '#6E2848', 54).replace('font-size:21px', 'font-size:15px') + prods };
  }
  if (slug === 'skin') {
    const prods = [['gdm-anti-acne-face-serum.png', 330, 62, 205, -6], ['fennel-spotless-brightening-booster-serum.png', 430, 82, 232, 0], ['fennel-melasma-booster-serum.png', 530, 60, 200, 7]]
      .map(([f, cx, gy, h, rot], i) => prod(f, { cx, gy, h, z: 3 + (i === 1), d: 0.4 + i * 0.12, p: i * 0.7, dy: 40, rot })).join('');
    return { ...S, ...TILE, bg: '#BFDDE8', photo: 'water-wide.jpg', photoSize: '1000px auto', photoPos: '-160px -30px', body: label('Skin care', GUARANTEE, '#14325B', '#20507F', 56).replace('font-size:21px', 'font-size:15px') + prods };
  }
  if (slug === 'hair') {
    const body = abs('inset:0;background:#EFC453')
      + abs('left:225px;top:-90px;width:470px;height:470px;border-radius:50%;background:#F6D77D')
      + abs('left:270px;top:-30px;width:350px;height:350px;border-radius:50%;border:3px solid #D69E1E;opacity:.5')
      + abs('left:0;right:0;bottom:0;height:54px;background:#D9A528;z-index:2')
      + row([{ file: 'gdm-hair-cleansing-serum.png', h: 225 }, { file: 'gdm-hair-oil-serum.png', h: 240, z: 2 }, { file: 'fennel-hair-food.png', h: 130 }], { x0: 260, x1: 580, gy: 44, gap: 14, d0: 0.4 })
      + label('Hair care', GUARANTEE, '#3A2606', '#5A3C0A', 56).replace('font-size:21px', 'font-size:15px');
    return { ...S, ...TILE, bg: '#EFC453', body };
  }
  if (slug === 'bath-body') {
    const ring = (r, o) => abs(`left:${430 - r}px;top:${210 - r}px;width:${r * 2}px;height:${r * 2}px;border-radius:50%;border:2px solid rgba(86,70,160,${o})`);
    const body = abs('inset:0;background:radial-gradient(circle at 70% 55%,#F1ECFB,#DCD2F2)')
      + [60, 105, 150, 200, 255].map((r, i) => ring(r, 0.5 - i * 0.08)).join('')
      + abs('left:0;right:0;bottom:0;height:56px;background:linear-gradient(#CFC3EC,#C3B5E6);z-index:2')
      + floatProd('fennel-body-lotion.png', { cx: 405, cy: 285, h: 130, rot: 0, z: 4, p: 0.3, shadow: 'rgba(70,40,140,.3)', blur: 18 })
      + prod('gdm-daily-lotion.png', { cx: 540, gy: 52, h: 215, z: 5, d: 0.5, p: 1.0, dy: 40 })
      + label('Bath &amp; body', GUARANTEE, '#2B1B5C', '#4A3A86', 52).replace('font-size:21px', 'font-size:15px');
    return { ...S, ...TILE, bg: '#DCD2F2', body };
  }
  if (slug === 'mom-baby') {
    const prods = row([{ file: 'kodomo-shampoo.png', h: 210 }, { file: 'kodomo-baby-powder.png', h: 245, z: 2 }, { file: 'kodomo-lotion-180-ml.png', h: 218 }], { x0: 270, x1: 585, gy: 46, gap: 6, d0: 0.4 });
    const body = abs('inset:0;background:#FFE9A8')
      + abs('left:250px;bottom:0;width:340px;height:330px;border-radius:170px 170px 0 0;background:#FFF7D9')
      + abs('left:262px;bottom:0;width:316px;height:318px;border-radius:158px 158px 0 0;border:3px solid #F3C94F;border-bottom:0;opacity:.7')
      + abs('left:0;right:0;bottom:0;height:46px;background:#F6CF55;z-index:2')
      + cloud(470, 22, 0.5, '#fff', 1.6)
      + prods + label('Mom &amp; baby', 'Kodomo &amp; Kidlon essentials', '#12345F', '#2A5883', 52).replace('font-size:21px', 'font-size:17px');
    return { ...S, ...TILE, bg: '#FFE9A8', body };
  }
  // personal care (new): mint field, Kidlon / Mistine packshots (multiply) + Fennel face wash
  const body = abs('inset:0;background:#E6F3EE')
    + abs('left:230px;top:-70px;width:420px;height:420px;border-radius:50%;background:#D2EAE0')
    + abs('left:0;right:0;bottom:0;height:46px;background:#BBDACD;z-index:2')
    + mul('mistine-acne-clear.jpg', { cx: 355, cy: 245, h: 150, crop: 0.52, z: 4, p: 0.2 })
    + mul('kidlon-toothbrush.jpg', { cx: 465, cy: 235, h: 200, crop: 0.9, z: 4, p: 1.0 })
    + prod('fennel-face-wash-aloe.png', { cx: 555, gy: 50, h: 175, z: 5, d: 0.5, p: 1.6, dy: 40 })
    + label('Personal care', GUARANTEE, '#0E4B43', '#1D6B5E', 50).replace('font-size:21px', 'font-size:15px');
  return { ...S, ...TILE, bg: '#E6F3EE', body };
}

/* ───────────── 4. Shop by concern (1:1) ───────────── */
function concern(slug) {
  const S = CONCERN;
  const lab = (t, color, { x = 26, y = 28, size = 46, align = 'left', bottom = false } = {}) =>
    abs(`${align === 'right' ? 'right' : 'left'}:${x}px;${bottom ? 'bottom' : 'top'}:${y}px;z-index:20;text-align:${align}`, `<h2 class="d" style="font-size:${size}px;line-height:1;color:${color}">${t}</h2>`);
  const guar = (color, x = 26, extra = '') => abs(`left:${x}px;bottom:14px;z-index:20;font-size:15px;font-weight:700;color:${color};${extra}`, GUARANTEE);
  const base = (bg, inner, name) => ({ ...S, ...TILE, bg, body: inner });
  const circle = (cx, cy, r, c, extra = '') => abs(`left:${cx - r}px;top:${cy - r}px;width:${r * 2}px;height:${r * 2}px;border-radius:50%;background:${c};${extra}`);
  const ring = (cx, cy, r, c, w = 2, o = 1) => abs(`left:${cx - r}px;top:${cy - r}px;width:${r * 2}px;height:${r * 2}px;border-radius:50%;border:${w}px solid ${c};opacity:${o}`);
  const fp = (file, cx, cy, h, rot, i = 0, shadow = 'rgba(30,20,60,.3)') => floatProd(file, { cx, cy, h, rot, z: 6, p: i * 0.8, shadow, blur: 14 });
  switch (slug) {
    case 'acne': return base('#CFEBF2',
      circle(250, 250, 175, '#E9F7FA') + ring(250, 250, 192, '#6FB7CC', 2, 0.6)
      + fp('fennel-anti-acne-booster-serum.png', 180, 250, 250, -6, 0) + fp('gdm-anti-acne-face-serum.png', 300, 255, 245, 6, 1)
      + lab('Acne', '#0F3D55', { size: 56 }) + guar('#1D5670'));
    case 'anti-aging': return base('#E6DDF4',
      [70, 120, 175, 235, 300].map((r, i) => ring(300, 330, r, '#8E6CC0', 2, 0.55 - i * 0.08)).join('') + circle(300, 330, 36, '#C9B2E8', 'filter:blur(1px)')
      + abs('left:228px;top:262px;width:140px;height:140px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#fff,#D7C4F0 60%,#BEA2E2);z-index:3;--p:0s', '', 'fl')
      + lab('Anti-<br>ageing', '#2E1A5A', { size: 54 }));
    case 'dark-spots': return base('#F9D9C3',
      dots(16, 7, { x0: 20, x1: 380, y0: 120, y1: 380, r0: 5, r1: 22, color: '#EBB596', opacity: 0.55 }) + circle(262, 262, 150, '#FDEBDD')
      + fp('fennel-melasma-booster-serum.png', 190, 258, 232, -7, 0, 'rgba(120,50,20,.3)') + fp('fennel-spotless-brightening-booster-serum.png', 328, 262, 250, 6, 1, 'rgba(120,50,20,.3)')
      + lab('Dark<br>spots', '#5A2410', { size: 52 }) + guar('#7A3A1E'));
    case 'dry-skin': return base('#FBEAB9',
      abs('left:-40px;bottom:-60px;width:480px;height:220px;border-radius:50%;background:#F7D77E;z-index:1') + circle(300, 180, 120, '#FFF4D2')
      + fp('gdm-daily-lotion.png', 270, 240, 270, -4, 0, 'rgba(120,80,10,.3)')
      + floatProd('fennel-body-lotion.png', { cx: 130, cy: 290, h: 118, rot: 10, z: 6, p: 1.2, shadow: 'rgba(120,80,10,.3)', blur: 14 })
      + lab('Dry<br>skin', '#4C3305', { size: 56 }) + guar('#6B4A0C'));
    case 'oil-control': return base('#DCE8D4',
      [[110, 270, 94], [250, 190, 116], [310, 330, 70], [90, 120, 40]].map(([x, y, r], i) => circle(x, y, r, i % 2 ? '#C9DABE' : '#E9F1E3', `box-shadow:inset -${r / 5}px -${r / 5}px ${r / 2}px rgba(60,100,60,.12);z-index:1`)).join('')
      + ring(250, 190, 150, '#8FAF85', 2, 0.5)
      + lab('Oil<br>control', '#1F3D22', { size: 54, y: 28 }));
    case 'pores': {
      let g = ''; for (let r = 0; r < 7; r++) for (let c = 0; c < 8; c++) { const x = 40 + c * 52 + (r % 2) * 26, y = 150 + r * 38; const d = 6 + (((r * 7 + c * 3) % 5) * 2.3); g += circle(x, y, d, '#E3A7B0', 'opacity:.55'); }
      return base('#F6D8DC', g + abs('left:0;right:0;top:0;height:140px;background:linear-gradient(#F6D8DC 55%,rgba(246,216,220,0))') + lab('Pores', '#5A1D2C', { size: 60 }));
    }
    case 'dullness': return base('#FFE9A6',
      abs('left:60px;top:80px;width:360px;height:360px;border-radius:50%;background:radial-gradient(closest-side,#FFFBE3,rgba(255,243,176,0))')
      + fp('fennel-spotless-brightening-booster-serum.png', 270, 232, 250, 6, 0, 'rgba(130,90,0,.3)')
      + fp('fennel-lightening-face-wash-lemon-vitamin-c.png', 165, 258, 225, -8, 1, 'rgba(130,90,0,.3)')
      + lab('Dullness', '#4C3500', { size: 46 }) + guar('#6B4C00'));
    case 'sun-care': return base('#FFD7A1',
      abs('left:150px;top:-130px;width:420px;height:420px;border-radius:50%;background:#FFB94F') + ring(360, 80, 150, '#FFF3D6', 2, 0.8) + ring(360, 80, 190, '#FFF3D6', 2, 0.45)
      + floatProd('fennel-bb-cream.png', { cx: 225, cy: 255, h: 215, rot: -4, z: 6, p: 0.4, shadow: 'rgba(140,70,0,.3)', blur: 14 })
      + lab('Sun<br>care', '#5A2A00', { size: 56 }) + guar('#7A3C00'));
    case 'hair-fall': return base('#D9E5B6',
      circle(250, 255, 168, '#EAF1CF') + ring(250, 255, 186, '#8EA84F', 2, 0.55)
      + fp('gdm-hair-oil-serum.png', 255, 250, 285, -3, 0, 'rgba(50,70,10,.3)')
      + lab('Hair<br>fall', '#263F0E', { size: 56 }));
    case 'dandruff': return base('#CFE4EB',
      circle(255, 255, 168, '#E6F3F7') + ring(255, 255, 186, '#5FA4B8', 2, 0.55)
      + fp('gdm-hair-cleansing-serum.png', 255, 250, 285, 4, 0, 'rgba(10,60,80,.3)')
      + lab('Dandruff', '#0E3A4A', { size: 46 }));
  }
}

export const EXTRA_BANNERS = {
  ...Object.fromEntries([1, 2, 3, 4, 5, 6].map((n) => [`brand-${n}`, () => brand(n)])),
  ...Object.fromEntries([1, 2, 3, 4].map((n) => [['offer-bogo', 'offer-combo', 'offer-offers', 'offer-clearance'][n - 1], () => offer(n)])),
  ...Object.fromEntries(['makeup', 'skin', 'hair', 'bath-body', 'mom-baby', 'personal-care'].map((s) => [`cat-${s}`, () => category(s)])),
  ...Object.fromEntries(['acne', 'anti-aging', 'dark-spots', 'dry-skin', 'oil-control', 'pores', 'dullness', 'sun-care', 'hair-fall', 'dandruff'].map((s) => [`concern-${s}`, () => concern(s)])),
};
