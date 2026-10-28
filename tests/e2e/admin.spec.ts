import { test, expect, adminLogin, field, unique, phone, upload, reorderUp } from './fixtures';
import { seed, cleanup } from './data';

test('Brands and categories edit, category visibility, subcategory CRUD and keyboard reorder', async ({ page, audit }) => {
  await adminLogin(page); const data = await seed(page);
  try {
    await page.goto('/admin/brands'); let card = page.locator('.admin-item-card').filter({ hasText: data.brand.name });
    await card.getByRole('button', { name: 'Edit', exact: true }).click(); await field(page.getByRole('dialog'), 'Brand Name').fill(`${data.name} Brand Edited`);
    await page.getByRole('button', { name: 'Update', exact: true }).click(); await expect(page.getByText(`${data.name} Brand Edited`, { exact: true })).toBeVisible(); await audit.check();
    await page.goto('/admin/categories'); card = page.locator('.admin-item-card').filter({ hasText: data.category.name });
    await card.getByRole('button', { name: 'Edit category' }).click(); await field(page.getByRole('dialog'), 'Category Name').fill(`${data.name} Category Edited`); await page.getByRole('button', { name: 'Update', exact: true }).click();
    card = page.locator('.admin-item-card').filter({ hasText: `${data.name} Category Edited` });
    await card.getByRole('button', { name: 'Hide from website' }).click(); await expect(card.getByText('Hidden from website')).toBeVisible();
    expect((await (await page.request.get('/api/admin/categories?visible=1')).json()).some((c: { _id: string }) => c._id === data.category._id)).toBe(false);
    await card.getByRole('button', { name: 'Show on website' }).click(); await expect(card.getByText('Hidden from website')).toHaveCount(0); await audit.check();
    await card.getByText(`${data.name} Category Edited`, { exact: true }).click(); await page.getByRole('button', { name: /Add Sub.category/ }).click();
    const subName = `${data.name} Sub Two`; await page.getByPlaceholder('e.g. Lipstick').fill(subName); await page.getByRole('dialog').getByRole('button', { name: /Add Sub.category/ }).click();
    await expect(page.getByRole('row').filter({ hasText: subName })).toBeVisible();
    const handle = page.getByRole('row').filter({ hasText: subName }).getByRole('button', { name: 'Drag to reorder' });
    await reorderUp(page, handle, '/api/admin/subcategories');
    await expect(page.locator('tbody tr').first()).toContainText(subName);
    await page.reload(); await expect(page.locator('tbody tr').first()).toContainText(subName);
    const row = page.getByRole('row').filter({ hasText: subName }); await row.getByRole('button', { name: 'Edit sub-category' }).click();
    await page.getByPlaceholder('e.g. Lipstick').fill(`${subName} Edited`); await page.getByRole('button', { name: 'Update', exact: true }).click(); await expect(row).toContainText('Edited');
    page.once('dialog', d => d.accept()); await row.getByRole('button', { name: 'Delete sub-category' }).click(); await expect(row).toHaveCount(0); await audit.check();
  } finally { await cleanup(page, data); }
});

test('Products create variants, edit, placement toggles, storefront and delete', async ({ page, audit }) => {
  await adminLogin(page); const data = await seed(page); const name = `${data.name} UI Product`;
  try {
    await page.goto('/admin/products'); await page.getByRole('button', { name: '+ Add New Product', exact: true }).click();
    const dialog = page.getByRole('dialog');
    await dialog.getByPlaceholder('e.g. Matte Lipstick').fill(name); await field(dialog, 'Price (').fill('400'); await field(dialog, 'Category').selectOption(data.category._id); await field(dialog, 'Brand (').selectOption(data.brand._id);
    await field(dialog, 'Short Description').fill('QA short description'); await dialog.locator('[contenteditable=true]').fill('QA detailed description'); await upload(dialog);
    await dialog.getByRole('checkbox', { name: /variants/ }).check(); await dialog.getByRole('button', { name: '+ Shade', exact: true }).click();
    await dialog.getByPlaceholder('Add values — comma separated, press Enter').fill('Rose, Nude'); await dialog.getByPlaceholder('Add values — comma separated, press Enter').press('Enter');
    await expect(dialog.locator('.variants-table tbody tr')).toHaveCount(2); await dialog.getByRole('spinbutton', { name: 'Stock for all variants' }).fill('10');
    await dialog.getByRole('button', { name: 'Apply', exact: true }).click(); await audit.check();
    await dialog.getByRole('button', { name: 'Add Product', exact: true }).click(); await expect(dialog).toHaveCount(0);
    await page.getByPlaceholder('Search products by name…').fill(name); let row = page.getByRole('row').filter({ hasText: name }); await expect(row).toBeVisible();
    for (const tag of ['Trending', 'New', 'Featured', 'Top Seller']) { await row.getByRole('button', { name: tag, exact: true }).click(); await expect(row.getByRole('button', { name: tag, exact: true })).toHaveAttribute('aria-pressed', 'true'); }
    await row.getByRole('button', { name: 'Edit product' }).click(); await dialog.getByPlaceholder('e.g. Matte Lipstick').fill(`${name} Edited`); const saved = page.waitForResponse(r => r.url().endsWith('/api/admin/products') && r.request().method() === 'PUT'); await dialog.getByRole('button', { name: 'Update Product', exact: true }).click();
    const saveResponse = await saved; expect(saveResponse.ok(), await saveResponse.text()).toBeTruthy(); const product = await saveResponse.json(); await expect(dialog).toHaveCount(0);
    await page.goto(`/product/${product.slug}`); await expect(page.locator('h1:visible')).toHaveText(`${name} Edited`); await expect(page.getByRole('button', { name: 'Rose', exact: true })).toBeVisible(); await audit.check();
    await page.goto('/admin/products'); await page.getByPlaceholder('Search products by name…').fill(name); row = page.getByRole('row').filter({ hasText: name }); page.once('dialog', d => d.accept()); await page.request.put('/api/admin/products', { data: { id: product._id, imagePublicIds: [] } }); await row.getByRole('button', { name: 'Delete product' }).click(); await expect(row).toHaveCount(0);
  } finally { await cleanup(page, data); }
});

test('Offers percentage and flat edits, selected products, expiry, sort and storefront prices', async ({ page, audit }) => {
  await adminLogin(page); const data = await seed(page); let offerId = '';
  const price = page.locator('h1:visible').locator('..').locator('span.font-extrabold.text-primary-pink').first();
  try {
    await page.goto('/admin/offers'); await page.getByRole('button', { name: '+ Create New Offer', exact: true }).click();
    const creation = page.getByRole('dialog');
    await field(creation, 'Offer Title').fill(`${data.name} Offer`);
    await field(creation, 'Discount Amount').fill('20'); await field(creation, 'Offer Details').fill('QA offer details');
    await creation.locator('input[type=date]').fill('2099-12-31'); await upload(creation);
    await creation.getByRole('radio', { name: 'Selected Products Only', exact: true }).check();
    await creation.getByPlaceholder('Search products...').fill(data.name); await creation.getByRole('checkbox', { name: new RegExp(data.name) }).check();
    const created = page.waitForResponse(r => r.url().endsWith('/api/admin/offers') && r.request().method() === 'POST');
    await creation.getByRole('button', { name: 'Create Offer', exact: true }).click(); const res = await created; expect(res.ok(), await res.text()).toBeTruthy();
    const offer = await res.json(); offerId = offer._id; await expect(creation).toHaveCount(0); await audit.check();
    await page.goto(`/product/${data.product.slug}`); await expect(price).toHaveText('৳160'); await audit.check();
    await page.goto('/offers'); await expect(page.getByRole('link', { name: new RegExp(data.name) }).first()).toBeVisible();
    for (const opt of await page.locator('select').first().locator('option').evaluateAll(els => els.map(e => (e as HTMLOptionElement).value))) {
      await page.locator('select').first().selectOption(opt);
      if (opt.startsWith('price-')) {
        await expect.poll(async () => {
          const prices = (await page.locator('#on-sale:visible article .text-primary-pink.font-extrabold').allTextContents()).map(s => Number(s.replace(/[^\d]/g, '')));
          return prices.length > 0 && JSON.stringify(prices) === JSON.stringify([...prices].sort((a, b) => opt === 'price-asc' ? a - b : b - a));
        }).toBe(true);
      }
    }
    const deals = page.locator('#on-sale article'); const before = await deals.count();
    await page.getByRole('button', { name: 'Show more deals', exact: true }).click(); await expect.poll(() => deals.count()).toBeGreaterThan(before); await audit.check();
    await page.goto(`/products/${offer.slug}`); await expect(page.getByRole('heading', { name: offer.title, exact: true })).toBeVisible(); await expect(page.locator('main article')).toHaveCount(1); await audit.check();
    await page.goto('/admin/offers'); let card = page.locator('.admin-item-card').filter({ hasText: offer.title }); await card.getByRole('button', { name: 'Edit', exact: true }).click();
    const dialog = page.getByRole('dialog'); await dialog.getByRole('radio', { name: 'Flat Amount', exact: true }).check(); await field(dialog, 'Discount Amount').fill('50'); await dialog.locator('input[type=date]').fill('2099-11-30'); await dialog.getByRole('button', { name: 'Update Offer', exact: true }).click(); await expect(dialog).toHaveCount(0);
    await page.goto(`/product/${data.product.slug}`); await expect(price).toHaveText('৳150'); await audit.check();
    await page.goto('/admin/offers'); card = page.locator('.admin-item-card').filter({ hasText: offer.title }); await card.getByRole('button', { name: 'Edit', exact: true }).click(); await dialog.locator('input[type=date]').fill('2020-01-01'); await dialog.getByRole('button', { name: 'Update Offer', exact: true }).click();
    await page.goto(`/product/${data.product.slug}`); await expect(price).toHaveText('৳200');
    await page.goto('/admin/offers'); await page.request.put('/api/admin/offers', { data: { id: offerId, thumbnailPublicId: '' } }); page.once('dialog', d => d.accept()); await card.getByRole('button', { name: 'Delete', exact: true }).click(); await expect(card).toHaveCount(0); offerId = '';
  } finally { if (offerId) { await page.request.put('/api/admin/offers', { data: { id: offerId, thumbnailPublicId: '' } }); await page.request.delete('/api/admin/offers', { data: { id: offerId } }); } await cleanup(page, data); }
});

test('Blogs edit, feature, storefront post and delete', async ({ page, audit }) => {
  await adminLogin(page); const name = unique();
  await page.goto('/admin/blogs'); await page.getByRole('button', { name: '+ Add New Blog', exact: true }).click();
  const dialog = page.getByRole('dialog'); await dialog.getByPlaceholder('Enter blog title…').fill(name);
  await dialog.locator('[contenteditable=true]').fill('QA blog content'); await upload(dialog);
  const created = page.waitForResponse(r => r.url().endsWith('/api/admin/blogs') && r.request().method() === 'POST');
  await dialog.getByRole('button', { name: 'Publish Blog', exact: true }).click(); const res = await created; expect(res.ok(), await res.text()).toBeTruthy(); const blog = await res.json(); await expect(dialog).toHaveCount(0);
  try {
    await page.goto('/admin/blogs'); const card = page.locator('.blog-card').filter({ hasText: name }); await card.getByRole('button', { name: 'Edit', exact: true }).click();
    await page.getByPlaceholder('Enter blog title…').fill(`${name} Edited`); await page.getByRole('dialog').locator('[contenteditable=true]').fill('QA updated blog content'); await page.getByRole('button', { name: 'Update Post', exact: true }).click(); await expect(card).toContainText('Edited'); await card.getByRole('button', { name: 'Feature', exact: true }).click(); await expect(card.getByRole('button', { name: 'Featured', exact: true })).toHaveAttribute('aria-pressed', 'true'); await audit.check();
    await page.goto('/blogs'); await page.getByRole('link', { name: new RegExp(name) }).first().click(); await expect(page.locator('h1:visible')).toContainText(`${name} Edited`); await expect(page.getByText('QA updated blog content')).toBeVisible(); await audit.check();
    await page.request.put('/api/admin/blogs', { data: { id: blog._id, imagePublicId: '' } }); await page.goto('/admin/blogs'); page.once('dialog', d => d.accept()); await card.getByRole('button', { name: 'Delete', exact: true }).click(); await expect(card).toHaveCount(0);
  } finally { await page.request.put('/api/admin/blogs', { data: { id: blog._id, imagePublicId: '' } }); await page.request.delete('/api/admin/blogs', { data: { id: blog._id } }); }
});

test('Guest chat sends and receives an admin reply', async ({ page, audit }) => {
  const name = unique(), message = `${name} customer message`, reply = `${name} admin reply`;
  await page.goto('/'); await page.getByRole('button', { name: 'Chat with DealHobe', exact: true }).click();
  await page.getByPlaceholder('Your name', { exact: true }).fill(name); await page.getByPlaceholder('Your mobile number', { exact: true }).fill(phone()); await page.getByRole('button', { name: 'Start messaging', exact: true }).click();
  await page.getByPlaceholder('Type a message...').fill(message); await page.getByRole('button', { name: 'Send message', exact: true }).click(); await expect(page.locator('p').filter({ hasText: message })).toBeVisible(); await audit.check();
  await page.getByRole('button', { name: 'Close chat', exact: true }).first().click(); await adminLogin(page); await page.goto('/admin/chat');
  await page.getByRole('button', { name: new RegExp(name) }).click(); await expect(page.locator('p').filter({ hasText: message })).toBeVisible(); await page.getByRole('textbox', { name: 'Reply message' }).fill(reply); await page.getByRole('button', { name: 'Send', exact: true }).click(); await expect(page.locator('p').filter({ hasText: reply })).toBeVisible(); await audit.check();
  await page.goto('/'); await page.getByRole('button', { name: 'Chat with DealHobe', exact: true }).click(); await expect(page.locator('p').filter({ hasText: reply })).toBeVisible();
});

test('Sales report date and product filters; admin menu and logout', async ({ page, isMobile, audit }) => {
  await adminLogin(page); await page.goto('/admin/sales-report');
  await page.getByLabel('From', { exact: true }).fill('2026-01-01'); await page.getByLabel('To', { exact: true }).fill('2099-12-31');
  await page.getByRole('button', { name: 'Click to select products…', exact: true }).click(); const dialog = page.getByRole('dialog'); await dialog.getByRole('searchbox', { name: 'Search products' }).fill('lip');
  await dialog.locator('.picker-row').first().click(); await dialog.getByRole('button', { name: /Apply/ }).click();
  const generated = page.waitForResponse(r => r.url().includes('/api/admin/sales-report?'));
  await page.getByRole('button', { name: 'Generate Report', exact: true }).click(); const report = await generated; expect(report.ok(), await report.text()).toBeTruthy();
  const query = new URL(report.url()).searchParams; expect(query.get('from')).toBe('2026-01-01'); expect(query.get('to')).toBe('2099-12-31'); expect(query.get('productIds')).toBeTruthy();
  await expect(page.locator('.admin-card-header').filter({ hasText: 'Results' })).toBeVisible(); await expect(page.getByRole('button', { name: 'Generate Report', exact: true })).toBeEnabled(); await audit.check();
  if (isMobile) await page.getByRole('button', { name: 'Open admin menu', exact: true }).click(); await page.getByRole('button', { name: 'Logout', exact: true }).filter({ visible: true }).click(); await expect(page).toHaveURL(/\/admin\/login/);
});
