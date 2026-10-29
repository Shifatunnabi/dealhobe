import { test, expect, adminLogin, field, unique, sampleImage, upload, reorderUp } from './fixtures';

test('Brand and category create with image uploads, reorder and delete', async ({ page, audit }) => {
  await adminLogin(page); const name = unique();
  for (const kind of ['brands', 'categories']) {
    await page.goto(`/admin/${kind}`);
    await page.getByRole('button', { name: kind === 'brands' ? '+ Add Brand' : '+ Add Category', exact: true }).click();
    const dialog = page.getByRole('dialog'); await field(dialog, kind === 'brands' ? 'Brand Name' : 'Category Name').fill(name); await upload(dialog);
    const response = page.waitForResponse(r => r.url().endsWith(`/api/admin/${kind}`) && r.request().method() === 'POST');
    await dialog.getByRole('button', { name: kind === 'brands' ? 'Add Brand' : 'Add Category', exact: true }).click();
    const res = await response; expect(res.ok(), await res.text()).toBeTruthy(); const data = await res.json();
    const card = page.locator('.admin-item-card').filter({ hasText: name }); await expect(card).toBeVisible(); await audit.check();
    const before = await page.locator('.admin-item-card').allTextContents();
    const handle = card.getByRole('button', { name: 'Drag to reorder' }); await reorderUp(page, handle, `/api/admin/${kind}`);
    await expect.poll(() => page.locator('.admin-item-card').allTextContents()).not.toEqual(before);
    const after = await page.locator('.admin-item-card').allTextContents(); await page.reload(); await expect.poll(() => page.locator('.admin-item-card').allTextContents()).toEqual(after);
    // The fake asset has no real Cloudinary object to destroy.
    await page.request.put(`/api/admin/${kind}`, { data: { id: data._id, logoPublicId: '', imagePublicId: '' } });
    page.once('dialog', d => d.accept()); await card.getByRole('button', { name: kind === 'brands' ? 'Delete' : 'Delete category', exact: true }).click(); await expect(card).toHaveCount(0); await audit.check();
  }
});

test('Homepage starter, section layout, schedule, tiles, reorder, visibility and deletion', async ({ page, audit }) => {
  await adminLogin(page); await page.goto('/admin/homepage');
  await expect(page.getByRole('heading', { name: 'Homepage Builder' })).toBeVisible();
  await expect(page.locator('.hb-toolbar, .hb-starter')).toBeVisible();
  if (await page.getByRole('button', { name: 'Start customising', exact: true }).isVisible()) {
    await page.getByRole('button', { name: 'Start customising', exact: true }).click();
  }
  await expect(page.locator('.hb-section').first()).toBeVisible();
  const name = unique();
  await page.getByRole('combobox', { name: 'Section type' }).selectOption('image-grid'); await page.getByRole('button', { name: 'Add section', exact: true }).click();
  const dialog = page.getByRole('dialog'); await field(dialog, 'Heading').fill(name);
  await field(dialog, 'Tile shape').selectOption('custom'); await dialog.getByRole('spinbutton', { name: 'Ratio width' }).fill('4'); await dialog.getByRole('spinbutton', { name: 'Ratio height' }).fill('3');
  await field(dialog, 'Columns on mobile').fill('1'); await field(dialog, 'Columns on desktop').fill('3');
  await field(dialog, 'Show from').fill('2020-01-01T00:00'); await field(dialog, 'Hide after').fill('2099-01-01T00:00');
  await dialog.locator('.hb-add-tile input[type=file]').setInputFiles(sampleImage); await expect(dialog.locator('.hb-tile')).toHaveCount(1);
  await field(dialog, 'Alt text').fill(`${name} banner`); await field(dialog, 'Link').fill('/products?q=lip');
  await dialog.getByRole('button', { name: 'Save section', exact: true }).click(); await expect(dialog).toHaveCount(0);
  const row = page.locator('.hb-section').filter({ hasText: name }); await expect(row).toContainText('4:3'); await expect(row).toContainText('1/3/3 cols'); await audit.check();
  const handle = row.getByRole('button', { name: 'Drag to reorder' }); await reorderUp(page, handle, '/api/admin/homepage/sections');
  await page.reload(); await expect(page.locator('.hb-section').nth((await page.locator('.hb-section').count()) - 2)).toContainText(name);
  await page.goto('/'); await expect(page.getByRole('heading', { name, exact: true })).toBeVisible(); await page.getByRole('link', { name: `${name} banner`, exact: true }).click(); await expect(page).toHaveURL(/\/products\?q=lip/); await audit.check();
  await page.goto('/admin/homepage'); await row.getByRole('button', { name: 'Edit section', exact: true }).click();
  await field(dialog, 'Show from').fill('2090-01-01T00:00'); await dialog.getByRole('button', { name: 'Save section', exact: true }).click(); await expect(dialog).toHaveCount(0);
  await page.goto('/'); await expect(page.getByRole('heading', { name, exact: true })).toHaveCount(0);
  await page.goto('/admin/homepage'); await row.getByRole('button', { name: 'Hide section', exact: true }).click(); await expect(row.getByRole('button', { name: 'Show section' })).toBeVisible();
  // Keep this hidden fake upload locally; deleting it would invoke the real server-side Cloudinary destroy API.
  await page.getByRole('combobox', { name: 'Section type' }).selectOption('product-rail'); await page.getByRole('button', { name: 'Add section', exact: true }).click();
  await field(dialog, 'Heading').fill(`${name} delete`); await dialog.getByRole('button', { name: 'Save section', exact: true }).click(); await expect(dialog).toHaveCount(0);
  const empty = page.locator('.hb-section').filter({ hasText: `${name} delete` }); page.once('dialog', d => d.accept()); await empty.getByRole('button', { name: 'Delete section' }).click(); await expect(empty).toHaveCount(0); await audit.check();
});

test('Storefront nav pills, animated suggestions, trust badges and contact update live', async ({ page, audit, isMobile }) => {
  await adminLogin(page); const original = await (await page.request.get('/api/admin/homepage/storefront')).json(); const name = unique();
  try {
    await page.goto('/admin/homepage'); await page.getByRole('tab', { name: 'Storefront', exact: true }).click();
    await page.getByRole('button', { name: 'Add pill', exact: true }).click(); await page.getByRole('textbox', { name: 'Pill label', exact: true }).last().fill(name); await page.getByRole('textbox', { name: 'Pill link', exact: true }).last().fill('/products?q=lip');
    await page.getByRole('textbox', { name: 'Search suggestion 1', exact: true }).fill('QA lipstick');
    await page.getByRole('textbox', { name: 'Badge title', exact: true }).first().fill(`${name} trust`); await field(page, 'Address').fill(`${name} address`);
    await page.getByRole('button', { name: 'Save storefront', exact: true }).click(); await expect(page.getByText('Storefront saved', { exact: true })).toBeVisible(); await audit.check();
    await page.goto('/'); await expect(page.locator('footer')).toContainText(`${name} address`); await expect(page.getByText(`${name} trust`, { exact: true })).toBeVisible();
    if (!isMobile) {
      const button = page.getByRole('button', { name: 'Search products', exact: true }); await expect(button).toContainText('QA lipstick');
    }
    const pill = page.getByRole('link', { name, exact: true }); await pill.scrollIntoViewIfNeeded(); await pill.click(); await expect(page).toHaveURL(/\/products\?q=lip/); await audit.check();
  } finally { expect((await page.request.put('/api/admin/homepage/storefront', { data: original })).ok()).toBeTruthy(); }
});

test('Top Bar and Hero create, edit and delete', async ({ page, audit }) => {
  await adminLogin(page); const name = unique();
  await page.goto('/admin/hero'); await page.getByRole('button', { name: 'Top Bar Texts', exact: true }).click(); await page.getByRole('button', { name: '+ Add Text', exact: true }).click();
  let dialog = page.getByRole('dialog'); await field(dialog, 'Announcement Text').fill(name); await field(dialog, 'Order').fill('0'); await page.getByRole('button', { name: 'Add Text', exact: true }).click(); await expect(dialog).toHaveCount(0);
  let card = page.locator('.admin-card').filter({ hasText: name }); await expect(card).toBeVisible(); await card.getByRole('button', { name: 'Edit', exact: true }).click(); await field(dialog, 'Announcement Text').fill(`${name} edited`); await dialog.getByRole('button', { name: 'Update', exact: true }).click(); await expect(dialog).toHaveCount(0); await expect(card).toContainText('edited'); await audit.check();
  await page.goto('/'); await expect(page.getByText(`${name} edited`, { exact: true })).toBeVisible();
  await page.goto('/admin/hero'); await page.getByRole('button', { name: 'Top Bar Texts', exact: true }).click(); page.once('dialog', d => d.accept()); await card.getByRole('button', { name: 'Delete', exact: true }).click(); await expect(card).toHaveCount(0);
  await page.getByRole('button', { name: 'Hero Slides', exact: true }).click(); await page.getByRole('button', { name: '+ Add Slide', exact: true }).click(); dialog = page.getByRole('dialog'); await field(dialog, 'Button Text').fill(name); await upload(dialog);
  const response = page.waitForResponse(r => r.url().endsWith('/api/admin/hero/slides') && r.request().method() === 'POST'); await dialog.getByRole('button', { name: 'Add Slide', exact: true }).click(); const res = await response; expect(res.ok(), await res.text()).toBeTruthy(); const slide = await res.json(); await expect(dialog).toHaveCount(0);
  card = page.locator('.admin-item-card').filter({ hasText: name }); await card.getByRole('button', { name: 'Edit', exact: true }).click(); await field(dialog, 'Button Text').fill(`${name} edited`); await dialog.getByRole('button', { name: 'Update', exact: true }).click(); await expect(dialog).toHaveCount(0); await expect(card).toContainText('edited'); await audit.check();
  await page.request.put('/api/admin/hero/slides', { data: { id: slide._id, imagePublicId: '', mobileImagePublicId: '' } }); page.once('dialog', d => d.accept()); await card.getByRole('button', { name: 'Delete', exact: true }).click(); await expect(card).toHaveCount(0);
});

test('Settings delivery threshold and logo save and update storefront and checkout', async ({ page, audit, isMobile }) => {
  await adminLogin(page); const original = await (await page.request.get('/api/admin/settings')).json();
  try {
    // The copied logo has a real asset id; the fake upload owns no real asset.
    expect((await page.request.put('/api/admin/settings', { data: { ...original, logoPublicId: '' } })).ok()).toBeTruthy();
    await page.goto('/admin/settings'); await field(page, 'Free Delivery Threshold').fill('100'); await upload(page);
    await page.getByRole('button', { name: 'Save Settings', exact: true }).click(); await expect(page.getByText('Settings updated.', { exact: true })).toBeVisible(); await page.reload(); await expect(field(page, 'Free Delivery Threshold')).toHaveValue('100'); await expect(page.getByAltText('Preview')).toHaveAttribute('src', /res.cloudinary.com/); await audit.check();
    const settings = await (await page.request.get('/api/settings')).json(); expect(settings.freeDeliveryThreshold).toBe(100); expect(settings.logoUrl).toContain('res.cloudinary.com');
    await page.goto('/products'); await expect(page.getByRole('link', { name: 'DealHobe home', exact: true }).getByRole('img')).toHaveAttribute('src', /res.cloudinary.com/); await page.locator('main article').first().getByRole('link').first().click(); await page.getByRole('button', { name: /^Buy now/ }).click(); await expect(page).toHaveURL(/\/checkout/); if (isMobile) await page.getByRole('button', { name: /^Show order summary/ }).click(); await expect(page.getByText(/unlocked.*free delivery/i).filter({ visible: true }).first()).toBeVisible(); await audit.check();
  } finally {
    await page.request.put('/api/admin/settings', { data: { ...original, logoPublicId: '' } });
    expect((await page.request.put('/api/admin/settings', { data: original })).ok()).toBeTruthy();
  }
});
