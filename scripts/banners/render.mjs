#!/usr/bin/env node
/*
 * Renders the homepage banners (designs.mjs) to smooth 24 fps MP4 video, a sharp still "poster" frame
 * and a lighter GIF.
 *
 *   node scripts/banners/render.mjs                      render every banner
 *   node scripts/banners/render.mjs hero-1-desktop deal  only names that equal / start with an argument
 *   node scripts/banners/render.mjs --still [names]      write one preview PNG per banner (t = 2.2 s) to .preview/
 *
 * Outputs (public/banners/): <name>.mp4 (what the site plays), <name>.poster.webp (what the site shows first and
 * the LCP image), gif/<name>.gif (deliverable for uploading via admin; git-ignored).
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
const GIFS = path.join(OUT, 'gif');
const PREVIEW = path.join(here, '.preview');
const FRAMES = path.join(here, '.frames');
const CONCURRENCY = 3;

const args = process.argv.slice(2);
const still = args.includes('--still');
const noGif = args.includes('--nogif');   // skip the (slow, git-ignored) GIF deliverable while iterating
const filters = args.filter((a) => !a.startsWith('--'));
const names = Object.keys(BANNERS).filter((n) => !filters.length || filters.some((f) => n === f || n.startsWith(f)));

fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync(GIFS, { recursive: true });
if (still) fs.mkdirSync(PREVIEW, { recursive: true });

const ff = (...a) => execFileSync('ffmpeg', ['-y', '-v', 'error', ...a]);
const kb = (f) => Math.round(fs.statSync(f).size / 1024);

async function renderOne(browser, name) {
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
      // Start on the fully revealed composition (so frame 0 — the poster — is never empty), then play exit →
      // entrance and arrive back at it: the loop seam is invisible.
      await seek(((b.startAt ?? 0) * 1000 + (i / b.fps) * 1000) % (b.loop * 1000));
      await page.screenshot({ path: path.join(dir, `${String(i).padStart(4, '0')}.jpg`), type: 'jpeg', quality: 97 });
    }
    const input = ['-framerate', String(b.fps), '-i', path.join(dir, '%04d.jpg')];
    const width = b.W * b.scale;
    // MP4 (H.264): smooth and tiny compared with GIF/WebP; plays inline, muted, looping.
    ff(...input, '-c:v', 'libx264', '-preset', 'slow', '-crf', String(b.crf ?? 21), '-pix_fmt', 'yuv420p',
      '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2', '-movflags', '+faststart', '-an', path.join(OUT, `${name}.mp4`));
    // Poster: frame 0 at full resolution, high quality — what the page shows (and measures as LCP) before the video starts.
    ff('-i', path.join(dir, '0000.jpg'), '-frames:v', '1', '-c:v', 'libwebp', '-quality', String(b.posterQ ?? 84), path.join(OUT, `${name}.poster.webp`));
    // GIF deliverable: GIF can't take smooth full-frame motion (every pixel changing balloons the file), so it is
    // captured separately at 12 fps with the slow background drift frozen, at a capped width.
    if (!noGif) {
    await page.addStyleTag({ content: '.kb{animation:none!important}' });
    const gdir = path.join(dir, 'gif');
    fs.mkdirSync(gdir, { recursive: true });
    const gfps = 12;
    for (let i = 0; i < Math.round(b.loop * gfps); i++) {
      await seek(((b.startAt ?? 0) * 1000 + (i / gfps) * 1000) % (b.loop * 1000));
      await page.screenshot({ path: path.join(gdir, `${String(i).padStart(4, '0')}.jpg`), type: 'jpeg', quality: 95 });
    }
    const gifW = Math.min(width, width >= 2000 ? 1200 : width >= 1000 ? 720 : width);
    ff('-framerate', String(gfps), '-i', path.join(gdir, '%04d.jpg'), '-vf', `scale=${gifW}:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=192:stats_mode=diff[p];[b][p]paletteuse=dither=bayer:bayer_scale=4:diff_mode=rectangle`, '-loop', '0', path.join(GIFS, `${name}.gif`));
    }
    console.log(`${name}: ${width}×${Math.round(b.H * b.scale)}, ${total} frames @ ${b.fps} fps — mp4 ${kb(path.join(OUT, `${name}.mp4`))} KB, poster ${kb(path.join(OUT, `${name}.poster.webp`))} KB, gif ${noGif ? '-' : kb(path.join(GIFS, `${name}.gif`)) + ' KB'}`);
    fs.rmSync(dir, { recursive: true, force: true });
  }
  await page.close();
  fs.rmSync(file, { force: true });
}

const browser = await chromium.launch();
const queue = [...names];
await Promise.all(Array.from({ length: Math.min(CONCURRENCY, queue.length) }, async () => {
  for (let n = queue.shift(); n; n = queue.shift()) await renderOne(browser, n);
}));
await browser.close();
if (!still) fs.rmSync(FRAMES, { recursive: true, force: true });
