import { test as base, expect, type Page, type Locator } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

export const sampleImage = { name: 'qa.png', mimeType: 'image/png', buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aRZkAAAAASUVORK5CYII=', 'base64') };
export const unique = () => `QA ${Date.now()} ${Math.floor(Math.random() * 10000)}`;
export const phone = () => `017${String(Date.now()).slice(-8)}`;
export const test = base.extend<{ audit: { check: () => Promise<void>; errors: string[] } }>({
  audit: [async ({ context, page }, use, testInfo) => {
    const errors: string[] = [], blocked: string[] = [];
    let uploads = 0;
    await context.route('**/*', async route => {
      const req = route.request(), url = new URL(req.url());
      if (url.hostname === 'api.cloudinary.com' && req.method() === 'POST' && url.pathname.endsWith('/upload')) {
        await route.fulfill({ json: { secure_url: 'https://res.cloudinary.com/demo/image/upload/sample.jpg', public_id: `e2e/fake-${++uploads}`, width: 800, height: 800 } }); return;
      }
      if (['localhost', '127.0.0.1'].includes(url.hostname) && url.port === '3100') return route.continue();
      if (req.method() === 'GET' && ['fonts.googleapis.com', 'fonts.gstatic.com', 'res.cloudinary.com'].includes(url.hostname)) return route.continue();
      blocked.push(`${req.method()} ${url.origin}${url.pathname}`);
      await route.abort('blockedbyclient');
    });
    context.on('page', monitor); monitor(page);
    function monitor(p: Page) {
      p.on('pageerror', err => errors.push(`JS ${p.url()}: ${err.message}`));
      p.on('console', msg => { if (msg.type() === 'error' && !(p.url().includes('/qa-missing-page') && msg.text().includes('status of 404'))) errors.push(`Console ${p.url()}: ${msg.text()}`); });
      p.on('requestfailed', req => {
        // Navigation cancellation is normal when Next prefetches or a user changes filters quickly.
        if (req.failure()?.errorText === 'net::ERR_ABORTED') return;
        errors.push(`Request ${req.url()}: ${req.failure()?.errorText}`);
      });
      p.on('response', res => { if (res.status() >= 400 && !res.url().includes('/qa-missing-page')) errors.push(`HTTP ${res.status()} ${res.url()}`); });
    }
    const check = async () => {
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth), { message: `Horizontal overflow at ${page.url()}` }).toBeLessThanOrEqual(1);
      expect(errors, `Browser errors at ${page.url()}`).toEqual([]);
    };
    await use({ check, errors });
    await testInfo.attach('browser-audit', { body: JSON.stringify({ errors, blocked, uploads }, null, 2), contentType: 'application/json' });
    // Enforce browser health even when a test forgets a checkpoint.
    if (testInfo.status === testInfo.expectedStatus) await check();
  }, { auto: true }],
});
export { expect };
export async function visit(page: Page, path: string) { await page.goto(path); await expect(page.locator('h1').first()).toBeVisible(); }
export async function adminLogin(page: Page) {
  const env = readFileSync(resolve('.env.local'), 'utf8');
  const value = (key: string) => { const line = env.split('\n').find(l => l.startsWith(`${key}=`)); if (!line) throw new Error(`${key} missing`); return line.slice(key.length + 1).trim().replace(/^(['"])(.*)\1$/, '$2'); };
  await page.goto('/admin/login');
  await page.locator('#admin-email').fill(value('ADMIN_EMAIL'));
  await page.locator('#admin-password').fill(value('ADMIN_PASSWORD'));
  await page.getByRole('button', { name: 'Sign In', exact: true }).click();
  await expect(page).toHaveURL(/\/admin$/);
}
export function field(scope: Page | Locator, label: string) {
  return scope.locator('label').filter({ hasText: label }).first().locator('..').locator('input:not([type=file]), textarea, select').first();
}
export async function upload(scope: Page | Locator, index = 0) { await scope.locator('input[type=file]').nth(index).setInputFiles(sampleImage); await expect(scope.getByAltText(/Preview|Image 1/).first()).toBeVisible(); }
export async function reorderUp(page: Page, handle: Locator, endpoint: string) {
  await handle.scrollIntoViewIfNeeded(); await handle.focus(); await page.keyboard.press('Space', { delay: 100 }); await expect(handle).toHaveAttribute('aria-pressed', 'true'); await page.keyboard.press('ArrowUp', { delay: 100 });
  // Let scroll and the sortable layout settle before dropping.
  await page.waitForTimeout(400);
  const saved = page.waitForResponse(r => r.url().endsWith(endpoint) && r.request().method() === 'PATCH');
  await page.keyboard.press('Space', { delay: 100 }); const response = await saved; expect(response.ok(), await response.text()).toBeTruthy();
}
