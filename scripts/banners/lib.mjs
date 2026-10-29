// Shared building blocks for the homepage banner designs (see designs.mjs, render.mjs).
// Every animation is a CSS animation on one timeline of LOOP seconds, so the renderer can set
// `currentTime` per frame and the result is deterministic and loops cleanly.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
export const ASSETS = path.join(here, 'assets');
export const BACKDROPS = path.join(here, 'backdrops');

export const COLORS = {
  plum: '#3B0D2E', plumLift: '#531445', red: '#A41B15', redDeep: '#8A130E', gold: '#E9C98C', goldDeep: '#D8B26E',
  ivory: '#FFF8F1', blush: '#F7D6DF', blushDeep: '#F0BFCD', ink: '#24121F',
  sky: '#D7EEFA', skyDeep: '#BCE2F6', skyGround: '#A6D6F0', navy: '#0B3A66', navyText: '#2A5883', sun: '#D9770A',
};

export const FONT_LINK = `<link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,600;0,9..144,700;1,9..144,600;1,9..144,700&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap" rel="stylesheet">`;

/** Natural size of a PNG asset (header read), so layouts can place products by their real width. */
export function assetSize(file) {
  const buf = fs.readFileSync(path.join(ASSETS, file));
  return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
}

export const css = (W, H) => `
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:${W}px;height:${H}px;overflow:hidden;background:#fff}
body{font-family:'Plus Jakarta Sans',system-ui,sans-serif;-webkit-font-smoothing:antialiased}
.stage{position:relative;width:${W}px;height:${H}px;overflow:hidden}
.abs{position:absolute}
.disc{position:absolute;border-radius:50%}
.band{position:absolute;left:0;right:0;bottom:0}
@keyframes kb{0%,100%{transform:scale(1)}50%{transform:scale(1.035)}}
.kb{animation:kb 4s ease-in-out infinite;transform-origin:62% 70%}
.d{font-family:Fraunces,Georgia,serif;font-weight:700;letter-spacing:-.02em}
.d em{font-style:italic;font-weight:700}

/* Everything content-like enters, holds, then fades out near the end of the loop. */
@keyframes in{from{opacity:0;transform:translate(var(--dx,0px),var(--dy,26px))}to{opacity:1;transform:none}}
@keyframes pop{0%{opacity:0;transform:scale(.6)}60%{opacity:1;transform:scale(1.06)}100%{opacity:1;transform:scale(1)}}
@keyframes up{from{transform:translateY(108%)}to{transform:none}}
@keyframes out{to{opacity:0}}
@keyframes fl{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}
@keyframes sh{0%{transform:translateX(-140%) skewX(-18deg)}100%{transform:translateX(260%) skewX(-18deg)}}
@keyframes grow{from{transform:scaleX(0)}to{transform:scaleX(1)}}

.in{animation:in .8s cubic-bezier(.2,.8,.2,1) var(--d,0s) both,out .4s ease-in 3.55s forwards}
.pop{animation:pop .7s cubic-bezier(.2,.9,.3,1) var(--d,0s) both,out .4s ease-in 3.55s forwards}
.ln{display:block;overflow:hidden;padding:.06em 0 .14em;margin:-.06em 0 -.14em}
.ln>span{display:block;animation:up .75s cubic-bezier(.2,.8,.2,1) var(--d,0s) both,out .4s ease-in 3.55s forwards}
.fl{animation:fl 4s ease-in-out infinite;animation-delay:calc(var(--p,0s) * -1)}
.pw{position:absolute;transform:translateX(-50%)}
.pw img{display:block;filter:drop-shadow(0 5px 7px rgba(15,4,12,.16))}
.gs1,.gs2{position:absolute;left:50%;transform:translateX(-50%);border-radius:50%}
.gs1{bottom:-3px;height:7px;background:rgba(18,6,14,.6);filter:blur(2.4px)}
.gs2{bottom:-9px;height:20px;background:rgba(18,6,14,.3);filter:blur(9px)}

.eyebrow{display:flex;align-items:center;gap:14px;font-weight:800;letter-spacing:.2em;text-transform:uppercase}
.eyebrow i{display:none}
.cta{position:relative;display:inline-flex;align-items:center;gap:12px;border-radius:999px;font-weight:800;overflow:hidden;white-space:nowrap}
.cta .shine{position:absolute;top:0;bottom:0;width:38%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.55),transparent);animation:sh .9s ease-in-out 1.6s both}
.pill{display:inline-flex;align-items:center;gap:10px;border-radius:999px;font-weight:700;white-space:nowrap}
`;

/** Slide-up text lines (each masked), staggered. */
export const lines = (arr, d0 = 0.1, step = 0.13) =>
  arr.map((t, i) => `<span class="ln"><span style="--d:${(d0 + i * step).toFixed(2)}s">${t}</span></span>`).join('');

export const arrow = (size = 22) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>`;

export const check = (size = 22) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12.5l5 5L20 6.5"/></svg>`;

export const cta = (label, { bg, color, size = 56, font = 18, pad = 30, d = 0.9 }) =>
  `<div class="in" style="--d:${d}s;display:inline-block"><div class="cta" style="background:${bg};color:${color};height:${size}px;padding:0 ${pad}px;font-size:${font}px">${label}${arrow(font + 4)}<i class="shine"></i></div></div>`;

/**
 * A product standing on the ground line. cx = horizontal centre, gy = distance of its base from the
 * bottom edge, h = rendered height. Entrance (rise) and idle float are on separate wrappers.
 */
export function prod(file, { cx, gy, h, z = 1, d = 0, p = 0, rot = 0, dy = 60 }) {
  const { w: nw, h: nh } = assetSize(file);
  const w = Math.round((nw / nh) * h);
  return `<div class="pw" style="left:${cx}px;bottom:${gy}px;z-index:${z}">
    <div class="in" style="--d:${d}s;--dy:${dy}px;--dx:0px">
      <div class="gs2" style="width:${Math.round(w * 0.98)}px"></div><div class="gs1" style="width:${Math.round(w * 0.66)}px"></div>
      <div class="fl" style="--p:${p}s"><img src="assets/${file}" style="height:${h}px;width:${w}px;transform:rotate(${rot}deg);transform-origin:50% 100%"></div>
    </div></div>`;
}

/** Circular "best price" seal: upright text on the top arc, "GUARANTEED" upright on the bottom arc. */
export function seal({ size, ring, fill, ink, d = 1.1 }) {
  return `<div class="pop" style="--d:${d}s;width:${size}px;height:${size}px;display:inline-block;filter:drop-shadow(0 8px 14px rgba(20,5,15,.3))">
  <svg width="${size}" height="${size}" viewBox="0 0 200 200">
    <defs>
      <path id="sealTop" d="M 22,100 A 78,78 0 0 1 178,100"/>
      <path id="sealBot" d="M 14,100 A 86,86 0 0 0 186,100"/>
    </defs>
    <circle cx="100" cy="100" r="97" fill="${fill}"/>
    <circle cx="100" cy="100" r="92" fill="none" stroke="${ring}" stroke-width="1.5"/>
    <circle cx="100" cy="100" r="54" fill="none" stroke="${ring}" stroke-width="1.5"/>
    <text font-family="Plus Jakarta Sans" font-weight="800" font-size="11.2" fill="${ink}" text-anchor="middle"><textPath href="#sealTop" startOffset="50%" textLength="206" lengthAdjust="spacing">BEST PRICE IN BANGLADESH</textPath></text>
    <text font-family="Plus Jakarta Sans" font-weight="800" font-size="14" fill="${ink}" text-anchor="middle"><textPath href="#sealBot" startOffset="50%" textLength="140" lengthAdjust="spacing">GUARANTEED</textPath></text>
    <g transform="translate(100 100)" fill="none" stroke="${ink}" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"><path d="M-24 2l16 16L25 -17"/></g>
  </svg></div>`;
}

/**
 * Auto-layout a row of products inside [x0, x1]: items are placed left to right with `gap` between their
 * widths (negative = deliberate overlap), centred in the region, and shrunk uniformly if they don't fit.
 * items: [{ file, h, z?, lift? }]. Returns prod() HTML with staggered entrance + float phases.
 */
export function row(items, { x0, x1, gy, gap = 18, d0 = 0.5, step = 0.12, dy = 60 }) {
  const dims = items.map((it) => { const { w, h } = assetSize(it.file); return { ...it, ar: w / h }; });
  const gapAt = (i) => (dims[i].gapAfter ?? gap);
  const gaps = dims.slice(0, -1).reduce((s, _, i) => s + gapAt(i), 0);
  const total = (k) => dims.reduce((s, it) => s + it.ar * it.h * k, 0) + gaps;
  const k = Math.min(1, (x1 - x0) / total(1));
  let x = x0 + ((x1 - x0) - total(k)) / 2;
  return dims.map((it, i) => {
    const h = it.h * k, w = it.ar * h;
    const cx = x + w / 2; x += w + gapAt(i);
    return prod(it.file, { cx: Math.round(cx), gy: gy + (it.lift || 0), h: Math.round(h), z: it.z ?? 1, d: +(d0 + i * step).toFixed(2), p: +(i * 0.7).toFixed(2), dy, rot: it.rot || 0 });
  }).join('');
}

/** DealHobe logo on a white rounded chip (reads on every backdrop). */
export const logoChip = ({ m, d = 0.15 }) =>
  `<div class="abs in" style="--d:${d}s;--dy:-12px;${m ? 'right:48px;top:40px' : 'left:96px;top:24px'};background:#fff;border-radius:${m ? 20 : 16}px;padding:${m ? 9 : 6}px;box-shadow:0 8px 22px rgba(15,4,12,.24);line-height:0"><img src="assets/dealhobe-logo.png" style="height:${m ? 66 : 50}px;width:auto;display:block"></div>`;

export function page({ W, H, bg, body, script = '', photo = '', photoPos = 'center', photoSize = 'cover', veil = '', veilDir = '90deg' }) {
  const layer = photo ? `<div class="abs kb" style="inset:0;background:url('backdrops/${photo}') ${photoPos}/${photoSize} no-repeat"></div>` : '';
  const veilLayer = veil ? `<div class="abs" style="inset:0;background:linear-gradient(${veilDir},${veil},rgba(255,255,255,0) 62%)"></div>` : '';
  return `<!doctype html><html><head><meta charset="utf-8">${FONT_LINK}<style>${css(W, H)}</style></head>
<body><div class="stage" style="background:${bg}">${layer}${veilLayer}${body}</div>${script ? `<script>${script}</script>` : ''}</body></html>`;
}
