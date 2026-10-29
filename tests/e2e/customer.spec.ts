import { test, expect, adminLogin, unique, phone } from './fixtures';
import { seed, cleanup } from './data';

test('Homepage links, animated search overlay and results', async ({ page, audit, isMobile }) => {
  await page.goto('/');
  await expect(page.locator('main').getByRole('link').first()).toBeVisible();
  const links = await page.locator('main a[href]').evaluateAll(els => els.map(el => el.getAttribute('href')).filter(x => x?.startsWith('/')));
  expect(links.length).toBeGreaterThan(10);
  if (!isMobile) {
    const search = page.getByRole('button', { name: 'Search products', exact: true }); const initial = await search.innerText(); await expect.poll(() => search.innerText()).not.toBe(initial);
    const right = page.getByRole('button', { name: 'Scroll category links right', exact: true }); await right.click(); await expect(page.getByRole('button', { name: 'Scroll category links left', exact: true })).toBeVisible(); await page.getByRole('button', { name: 'Scroll category links left', exact: true }).click();
  }
  await (isMobile ? page.getByRole('button', { name: 'Search', exact: true }) : page.locator('header button').filter({ hasText: /Search/ }).first()).click();
  await page.getByRole('textbox', { name: 'Search products', exact: true }).fill('lip');
  await expect(page.locator('header a[href^="/product/"]').first()).toBeVisible();
  await page.getByRole('textbox', { name: 'Search products', exact: true }).press('Enter');
  await expect(page).toHaveURL(/\/products\?q=lip/); await expect(page.locator('h1:visible')).toContainText('lip'); await audit.check();
});

test('Catalog filters, chips, sort, infinite scrolling and reload', async ({ page, isMobile, audit }) => {
  await adminLogin(page); const data = await seed(page);
  try {
    await page.goto('/products');
    const panel = isMobile ? page.getByRole('dialog', { name: 'Filters' }) : page.getByRole('complementary', { name: 'Filters' });
    if (isMobile) await page.getByRole('button', { name: /^Filter(?: \(\d+\))?$/ }).click();
    await panel.getByRole('button', { name: new RegExp(data.category.name) }).click();
    await panel.getByRole('button', { name: new RegExp(data.sub.name) }).click();
    await panel.getByRole('button', { name: new RegExp(data.brand.name) }).click();
    await panel.getByRole('button', { name: 'Under ৳500', exact: true }).click();
    await panel.getByRole('button', { name: 'In stock only', exact: true }).click();
    if (isMobile) await page.getByRole('button', { name: 'Close filters' }).click();
    await expect(page.locator('main article')).toHaveCount(1);
    await expect(page.locator('h1:visible')).toContainText(data.sub.name);
    await expect(page).toHaveTitle(new RegExp(data.sub.name));
    await expect(page).toHaveURL(/subcategory=.*brand=.*max=500.*instock=1/);
    await audit.check();
    await page.getByRole('button', { name: 'Remove filter In stock', exact: true }).click();
    await page.getByRole('button', { name: 'Clear all', exact: true }).click();
    if (isMobile) await page.getByRole('button', { name: /^Filter(?: \(\d+\))?$/ }).click();
    await panel.getByRole('textbox', { name: 'Minimum price' }).fill('100');
    await panel.getByRole('textbox', { name: 'Maximum price' }).fill('300');
    await panel.getByRole('button', { name: 'Go', exact: true }).click();
    await panel.getByRole('button', { name: '★★★★☆ & up', exact: true }).click();
    if (isMobile) await page.getByRole('button', { name: 'Close filters' }).click();
    await expect(page).toHaveURL(/min=100&max=300&rating=4/);
    await page.getByRole('button', { name: 'Clear all', exact: true }).click();
    for (const value of ['price-asc', 'price-desc', 'newest', 'discount', 'best-selling', 'top-rated', 'featured']) {
      await page.locator('select:visible').selectOption(value);
      await expect(page.locator('main article').first()).toBeVisible();
      if (value.startsWith('price-')) {
        const prices = await page.locator('main article .text-primary-pink.font-extrabold').allTextContents();
        const numbers = prices.map(s => Number(s.replace(/[^\d]/g, '')));
        expect(numbers.length).toBeGreaterThan(0);
        expect(numbers).toEqual([...numbers].sort((a,b) => value === 'price-asc' ? a-b : b-a));
      }
    }
    let total = 0;
    for (let i = 0; i < 100; i++) {
      const text = await page.getByText(/Showing \d+ of \d+ products/).innerText();
      const [shown, count] = text.match(/\d+/g)!.map(Number); total = count;
      if (shown === count) break;
      await page.locator('main article').last().scrollIntoViewIfNeeded();
      await page.getByText(/Showing \d+ of \d+ products/).scrollIntoViewIfNeeded();
      await page.waitForTimeout(100);
    }
    await expect(page.locator('main article')).toHaveCount(total);
    expect(total).toBeGreaterThan(24);
    const url = page.url(); expect(url).toContain('page=');
    await page.reload(); await expect(page.locator('main article')).toHaveCount(total); await audit.check();
  } finally { await cleanup(page, data); }
});

test('Variants, gallery, bag quantities, remove and Buy now', async ({ page, audit, isMobile, context }) => {
  await adminLogin(page); const data = await seed(page, true);
  try {
    await page.goto(`/product/${data.product.slug}`);
    await expect(page.getByRole('button', { name: 'Rose', exact: true })).toHaveAttribute('aria-pressed', 'true');
    await page.getByRole('button', { name: 'Nude', exact: true }).click();
    await expect(page).toHaveURL(/variant=Nude/);
    await expect(page.getByRole('button', { name: 'Nude', exact: true })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('main')).toContainText('৳350');
    await expect.poll(() => page.locator('[aria-roledescription=carousel]').evaluate(el => Math.round(el.scrollLeft / el.clientWidth))).toBe(1);
    await page.reload(); await expect(page.getByRole('button', { name: 'Nude', exact: true })).toHaveAttribute('aria-pressed', 'true');
    if (isMobile) {
      await page.getByRole('button', { name: 'Rose', exact: true }).click();
      const gallery = page.locator('[aria-roledescription=carousel]'); await gallery.scrollIntoViewIfNeeded();
      await expect.poll(() => gallery.evaluate(el => Math.round(el.scrollLeft / el.clientWidth))).toBe(0);
      const box = (await gallery.boundingBox())!; const client = await context.newCDPSession(page);
      await client.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: box.x + box.width * .8, y: box.y + box.height / 2 }] });
      for (let i = 0; i < 8; i++) await client.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: box.x + box.width * (.8 - .08 * i), y: box.y + box.height / 2 }] });
      await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      await expect.poll(() => gallery.evaluate(el => Math.round(el.scrollLeft / el.clientWidth))).toBe(1); await client.detach(); await page.getByRole('button', { name: 'Nude', exact: true }).click();
    } else {
      await page.getByRole('button', { name: 'Show photo 2', exact: true }).click();
      await expect(page.getByRole('button', { name: 'Show photo 2', exact: true })).toHaveAttribute('aria-current', 'true');
    }
    await page.getByRole('button', { name: 'Zoom photo', exact: true }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.keyboard.press('ArrowLeft'); await page.keyboard.press('Escape'); await expect(page.getByRole('dialog')).toHaveCount(0);
    await audit.check(); await expect(page.getByRole('region', { name: 'You may also like', exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Increase quantity', exact: true }).click();
    await page.getByRole('button', { name: 'Add to bag', exact: true }).click();
    if (isMobile) await page.getByRole('button', { name: /^Bag/ }).filter({ visible: true }).click();
    const bag = isMobile ? page.locator('main') : page.getByRole('dialog', { name: 'Shopping bag' });
    await expect(bag).toContainText(data.name); await expect(bag).toContainText('৳700'); await expect(bag.getByRole('progressbar', { name: 'Progress to free delivery' })).toBeVisible();
    await bag.getByRole('button', { name: /^Increase quantity of/ }).click(); await expect(bag).toContainText('৳1,050');
    if (!isMobile) await bag.getByRole('button', { name: 'Close bag' }).click();
    await page.goto('/cart'); await expect(page.locator('h1:visible')).toContainText(/bag/i);
    await page.getByRole('button', { name: /^Decrease quantity of/ }).click(); await expect(page.locator('main')).toContainText('৳700');
    await page.getByRole('button', { name: /^Remove .* from bag/ }).click(); await expect(page.getByText('Your bag is empty')).toBeVisible(); await audit.check();
    await page.goto(`/product/${data.product.slug}?variant=Rose`);
    await page.getByRole('button', { name: /^Buy now/ }).click(); await expect(page).toHaveURL(/\/checkout/); await expect(page.locator('main')).toContainText(data.name); await audit.check();
  } finally { await cleanup(page, data); }
});

for (const area of ['inside_dhaka', 'outside_dhaka']) test(`Guest COD checkout ${area}, receipt PDF and order tracking`, async ({ page, audit }) => {
  await adminLogin(page); const data = await seed(page);
  expect((await page.request.put('/api/admin/products', { data: { id: data.product._id, quantity: 1 } })).ok()).toBeTruthy();
  try {
    await page.goto(`/product/${data.product.slug}`); await page.getByRole('button', { name: /^Buy now/ }).click();
    await page.getByLabel('Full name').fill('QA Guest'); await page.getByLabel('Mobile number').fill(phone());
    const areaInput = page.locator(`input[name=area][value=${area}]`);
    await areaInput.locator('..').click(); await expect(areaInput).toBeChecked();
    await page.getByLabel('Full address').fill('QA House 42, Road 5, Test District');
    await expect(page.getByRole('radio', { name: /Cash on delivery/ })).toBeChecked();
    await audit.check();
    const response = page.waitForResponse(r => r.url().endsWith('/api/orders') && r.request().method() === 'POST');
    await page.getByRole('button', { name: /Place order/i }).filter({ visible: true }).click();
    const res = await response; expect(res.ok(), await res.text()).toBeTruthy(); const order = await res.json();
    const receipt = await (await page.request.get(`/api/orders/${order.orderNumber}`)).json();
    expect(receipt.subtotal).toBe(200); expect(receipt.deliveryCharge).toBe(area === 'inside_dhaka' ? 95 : 120); expect(receipt.total).toBe(area === 'inside_dhaka' ? 295 : 320);
    await expect(page).toHaveURL(/\/receipt\//); await expect(page.locator('main')).toContainText(order.orderNumber); await audit.check();
    const download = page.waitForEvent('download'); await page.getByRole('button', { name: 'Download receipt', exact: true }).click();
    const pdf = await download; expect(pdf.suggestedFilename()).toBe(`${order.orderNumber}.pdf`);
    const stream = await pdf.createReadStream(); const chunks = []; for await (const chunk of stream!) chunks.push(chunk); expect(Buffer.concat(chunks).subarray(0,4).toString()).toBe('%PDF');
    await page.goto(`/orders/${order.orderNumber}`); await expect(page.locator('h1:visible').locator('..').getByText('Order placed', { exact: true })).toBeVisible(); await expect(page.locator('main')).toContainText(data.name); await audit.check();
    await page.goto(`/product/${data.product.slug}`); await expect(page.getByRole('button', { name: 'Out of stock', exact: true })).toBeDisabled(); await audit.check();
    await page.goto(`/products?q=${encodeURIComponent(data.name)}&instock=1`); await expect(page.locator('main article')).toHaveCount(0); await audit.check();
    await page.goto('/admin/orders'); await expect(page.getByRole('row').filter({ hasText: order.orderNumber })).toBeVisible(); await audit.check();
    await page.getByRole('row').filter({ hasText: order.orderNumber }).getByRole('link', { name: 'View', exact: true }).click(); await expect(page.locator('h1:visible')).toContainText(order.orderNumber);
    if (area === 'inside_dhaka') { await page.getByRole('button', { name: 'Mark Delivered', exact: true }).click(); await expect(page.getByRole('button', { name: 'Mark Delivered', exact: true })).toHaveCount(0); await page.goto(`/orders/${order.orderNumber}`); await expect(page.locator('h1:visible').locator('..').getByText('Delivered', { exact: true })).toBeVisible(); await page.goto(`/admin/orders/${order.orderNumber}`); }
    await audit.check();
    page.once('dialog', d => d.accept()); await page.getByRole('button', { name: 'Cancel Order', exact: true }).click(); await expect(page.getByText('This order has been cancelled.', { exact: true })).toBeVisible();
    await page.goto('/admin/cancelled-orders'); await expect(page.getByRole('row').filter({ hasText: order.orderNumber })).toBeVisible(); await audit.check();
    await page.goto(`/products?q=${encodeURIComponent(data.name)}&instock=1`); await expect(page.locator('main article')).toHaveCount(1); await audit.check();
  } finally { await cleanup(page, data); }
});

test('Customer register, addresses, password, account order, review moderation and logout', async ({ page, audit, isMobile }) => {
  await adminLogin(page); const data = await seed(page);
  const email = `e2e+${Date.now()}@example.test`, password = 'QaPassword42!';
  try {
    await page.goto('/auth/register');
    await page.getByLabel('Full name', { exact: true }).fill('QA Customer'); await page.getByLabel('Mobile number').fill(phone()); await page.getByLabel(/^Email/).fill(email);
    await page.getByLabel('Full address').fill('QA Home, Dhaka'); await page.getByLabel('Password', { exact: true }).fill(password); await page.getByLabel('Confirm password', { exact: true }).fill(password);
    await page.getByRole('button', { name: 'Create account', exact: true }).click(); await expect(page).toHaveURL(/\/profile/); await audit.check();
    await page.getByRole(isMobile ? 'tab' : 'button', { name: 'Addresses', exact: true }).click(); await page.getByRole('button', { name: /Add address/ }).click();
    await page.getByLabel('Label', { exact: true }).selectOption('office'); await page.getByLabel('Delivery area', { exact: true }).selectOption('outside_dhaka'); await page.getByLabel('Full address').fill('QA Office, Chattogram');
    await page.getByRole('button', { name: 'Save address', exact: true }).click(); await expect(page.getByText('QA Office, Chattogram')).toBeVisible();
    await page.getByRole(isMobile ? 'tab' : 'button', { name: 'Password', exact: true }).click();
    await page.getByLabel('Current password', { exact: true }).fill(password); await page.getByLabel('New password', { exact: true }).fill(`${password}new`); await page.getByLabel('Confirm new password', { exact: true }).fill(`${password}new`);
    await page.getByRole('button', { name: /Update password|Change password/ }).click(); await expect(page.getByText(/Password updated|Password changed/i)).toBeVisible();
    await page.goto(`/product/${data.product.slug}`); await page.getByRole('button', { name: /^Buy now/ }).click();
    const response = page.waitForResponse(r => r.url().endsWith('/api/orders') && r.request().method() === 'POST');
    await page.getByRole('button', { name: /Place order/i }).filter({ visible: true }).click(); const res = await response; expect(res.ok()).toBeTruthy(); const order = await res.json();
    await expect(page).toHaveURL(/\/receipt\//); await page.goto('/profile'); await page.getByRole(isMobile ? 'tab' : 'button', { name: 'Orders', exact: true }).click(); await expect(page.locator('main')).toContainText(order.orderNumber);
    await page.goto(`/product/${data.product.slug}`); await page.getByRole('button', { name: 'Write a review', exact: true }).click(); await page.getByRole('radio', { name: '5 stars', exact: true }).click();
    const review = unique(); await page.getByRole('textbox', { name: 'Your review' }).fill(review); await page.getByRole('button', { name: 'Submit review', exact: true }).click(); await expect(page.getByText('Thanks for your review!')).toBeVisible();
    await page.goto('/admin/reviews'); const card = page.locator('.review-card').filter({ hasText: review }); await card.getByRole('button', { name: 'Hide', exact: true }).click(); await expect(card.getByText('Pending', { exact: true })).toBeVisible(); await card.getByRole('button', { name: '+ Add to Homepage', exact: true }).click(); await expect(card.getByText('Approved', { exact: true })).toBeVisible(); await expect(card.getByText('Featured', { exact: true })).toBeVisible(); await audit.check();
    await page.goto(`/product/${data.product.slug}`); await expect(page.getByText(review, { exact: true }).filter({ visible: true })).toBeVisible();
    await page.goto('/profile'); await page.getByRole('button', { name: 'Sign out', exact: true }).filter({ visible: true }).first().click();
    await page.goto('/auth/login'); await page.getByLabel('Email or mobile number').fill(email); await page.getByLabel('Password', { exact: true }).fill(`${password}new`); await page.getByRole('button', { name: 'Sign in', exact: true }).click(); await expect(page).toHaveURL(/\/profile/); await audit.check();
    await page.goto('/admin/user-directory'); await page.getByPlaceholder(/Search/).fill(email); const user = page.locator('.user-card').filter({ hasText: email }); await user.getByRole('button', { name: 'View Details ▼', exact: true }).click(); await expect(user).toContainText('Total Orders'); await user.getByRole('button', { name: 'Ban', exact: true }).click(); await expect(user.getByText('Banned', { exact: true })).toBeVisible(); await page.reload(); await page.getByPlaceholder(/Search/).fill(email); await expect(user.getByText('Banned', { exact: true })).toBeVisible(); await user.getByRole('button', { name: 'Unban', exact: true }).click(); await expect(user.getByText('Banned', { exact: true })).toHaveCount(0); await audit.check();
    await page.goto('/admin/reviews'); page.once('dialog', d => d.accept()); await card.getByRole('button', { name: /Delete/ }).click(); await expect(card).toHaveCount(0);
  } finally { await cleanup(page, data); }
});

test('Phone-only customer registration supports product reviews', async ({ page, audit }) => {
  await adminLogin(page); const data = await seed(page);
  try {
    await page.goto('/auth/register'); await page.getByLabel('Full name', { exact: true }).fill('QA Phone Customer'); await page.getByLabel('Mobile number').fill(phone());
    await page.getByLabel('Full address').fill('QA Phone Street, Dhaka'); await page.getByLabel('Password', { exact: true }).fill('QaPassword42!'); await page.getByLabel('Confirm password', { exact: true }).fill('QaPassword42!');
    await page.getByRole('button', { name: 'Create account', exact: true }).click(); await expect(page).toHaveURL(/\/profile/); await audit.check();
    await page.goto(`/product/${data.product.slug}`); await page.getByRole('button', { name: 'Write a review', exact: true }).click(); const review = `${data.name} phone review`;
    await page.getByRole('textbox', { name: 'Your review' }).fill(review); const response = page.waitForResponse(r => r.url().endsWith('/api/reviews') && r.request().method() === 'POST'); await page.getByRole('button', { name: 'Submit review', exact: true }).click();
    const res = await response; expect(res.ok(), await res.text()).toBeTruthy(); const created = await res.json(); await expect(page.getByText('Thanks for your review!', { exact: true })).toBeVisible(); await audit.check();
    await page.goto('/admin/reviews'); const card = page.locator('.review-card').filter({ hasText: review }); page.once('dialog', d => d.accept()); await card.getByRole('button', { name: 'Delete review' }).click(); await expect(card).toHaveCount(0); expect((await page.request.get(`/api/reviews?productId=${created.productId}`)).ok()).toBeTruthy();
  } finally { await cleanup(page, data); }
});
