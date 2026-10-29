import { test, expect, visit, adminLogin } from './fixtures';
const publicPages = ['/', '/products', '/offers', '/blogs', '/about-us', '/terms-and-conditions', '/shipping-delivery', '/refund-return-policy', '/cart', '/auth/login', '/auth/register'];
for (const path of publicPages) test(`Public page ${path}`, async ({ page, audit }) => {
  const res = await page.goto(path); expect(res?.status()).toBe(200);
  if (path !== '/') await expect(page.locator('h1:visible').first()).toBeVisible();
  else await expect(page.getByRole('navigation').first()).toBeVisible();
  await audit.check();
});
test('Missing page shows a useful 404', async ({ page }) => {
  const res = await page.goto('/qa-missing-page'); expect(res?.status()).toBe(404);
  await expect(page.getByText(/page not found/i).first()).toBeVisible();
  await expect(page.getByRole('link', { name: /home|shop/i }).first()).toBeVisible();
});
test('Admin login, dashboard and all management pages', async ({ page, audit }) => {
  await adminLogin(page); await expect(page.locator('h1:visible')).toContainText(/Dashboard/);
  const stats = await (await page.request.get('/api/admin/stats')).json();
  for (const [label, value] of [['Brands', stats.totalBrands], ['Categories', stats.totalCategories], ['Blog Posts', stats.totalBlogs], ['Total Reviews', stats.totalReviews]]) { await expect(page.locator('.stat-card').filter({ hasText: String(label) }).locator('.stat-value')).toHaveText(String(value)); }
  await audit.check();
  for (const path of ['brands', 'categories', 'products', 'offers', 'cancelled-orders', 'sales-report', 'homepage', 'hero', 'blogs', 'reviews', 'user-directory', 'settings', 'chat', 'orders']) {
    const balance = path === 'orders' ? page.waitForResponse(r => r.url().endsWith('/api/admin/steadfast/balance')) : null;
    await visit(page, `/admin/${path}`); if (balance) await balance; await page.waitForTimeout(300); await audit.check();
  }
});
