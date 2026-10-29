#!/usr/bin/env node
/*
 * Renders the homepage banners (designs.mjs) to animated GIF + animated WebP.
 *
 *   node scripts/banners/render.mjs                      render every banner into public/banners/
 *   node scripts/banners/render.mjs hero-1-desktop deal  only names that start with / equal an argument
 *   node scripts/banners/render.mjs --still [names]      write one preview PNG per banner (t = 2.2 s) to .preview/
 *
 * Each design is plain HTML + CSS animations on a single timeline. We pause every animation, set its
 * currentTime for each frame, screenshot, and encode with ffmpeg — so frames are exact and loops are seamless.
 * Needs: @playwright/test (+ chromium), ffmpeg, network access for Google Fonts.
 */

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chromium } from '@playwright/test';
import { BANNERS, build } from './designs.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..');
const OUT = path.join(root, 'public', 'banners');
const GIFS = path.join(OUT, 'gif');   // full-quality GIFs (large; not committed — webp is what the site serves)
const PREVIEW = path.join(here, '.preview');
const FRAMES = path.join(here, '.frames');

const args = process.argv.slice(2);
const still = args.includes('--still');
const filters = args.filter((a) => !a.startsWith('--'));
const names = Object.keys(BANNERS).filter((n) => !filters.length || filters.some((f) => n === f || n.startsWith(f)));

fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync(GIFS, { recursive: true });
if (still) fs.mkdirSync(PREVIEW, { recursive: true });

const browser = await chromium.launch();

for (const name of names) {
  const b = build(name);
  const file = path.join(here, `_${name}.html`);
  fs.writeFileSync(file, b.html);
  const page = await browser.newPage({ viewport: { width: b.W, height: b.H }, deviceScaleFactor: b.scale });
  await page.goto(pathToFileURL(file).href, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  if (b.script) await page.waitForFunction(() => window.__ready === true);

  const seek = async (ms) => {
    await page.evaluate((t) => document.getAnimations().forEach((a) => { a.pause(); a.currentTime = t; }), ms);
    await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
  };

  if (still) {
    await seek(b.loop === 4 ? 2200 : 3000);
    await page.screenshot({ path: path.join(PREVIEW, `${name}.png`) });
    console.log('preview', name);
  } else {
    const dir = path.join(FRAMES, name);
    fs.rmSync(dir, { recursive: true, force: true });
    fs.mkdirSync(dir, { recursive: true });
    const total = Math.round(b.loop * b.fps);
    for (let i = 0; i < total; i++) {
      // Start on the fully revealed composition (so frame 0 — and any static fallback — is never empty),
      // then play exit → entrance and arrive back at it: the loop seam is invisible.
      await seek(((b.startAt ?? 0) * 1000 + (i / b.fps) * 1000) % (b.loop * 1000));
      await page.screenshot({ path: path.join(dir, `${String(i).padStart(3, '0')}.png`) });
    }
    const input = ['-y', '-v', 'error', '-framerate', String(b.fps), '-i', path.join(dir, '%03d.png')];
    // GIF: one adaptive palette, light dithering (flat colours keep the file small).
    execFileSync('ffmpeg', [...input, '-vf', 'split[a][b];[a]palettegen=max_colors=224:stats_mode=full[p];[b][p]paletteuse=dither=sierra2_4a:diff_mode=rectangle', '-loop', '0', path.join(GIFS, `${name}.gif`)]);
    // Animated WebP: far smaller than the GIF at the same quality, supported by every current browser.
    execFileSync('ffmpeg', [...input, '-c:v', 'libwebp_anim', '-lossless', '0', '-quality', String(b.quality ?? 48), '-compression_level', '6', '-loop', '0', path.join(OUT, `${name}.webp`)]);
    const kb = (f) => Math.round(fs.statSync(path.join(f.endsWith('.gif') ? GIFS : OUT, f)).size / 1024);
    console.log(`${name}: ${b.W * b.scale}×${b.H * b.scale}, ${total} frames, gif ${kb(`${name}.gif`)} KB, webp ${kb(`${name}.webp`)} KB`);
    fs.rmSync(dir, { recursive: true, force: true });
  }
  await page.close();
  fs.rmSync(file, { force: true });
}

await browser.close();
if (!still) fs.rmSync(FRAMES, { recursive: true, force: true });
