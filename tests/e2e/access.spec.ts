import { test, expect, unique } from './fixtures';

test('Anonymous clients cannot create pre-approved featured admin reviews', async ({ page }) => {
  const response = await page.request.post('/api/admin/reviews', { data: {
    customerName: 'QA anonymous', customerId: unique(), customerEmail: 'e2e@example.test',
    rating: 5, review: 'QA access-control regression', isApproved: true, isFeatured: true,
  } });
  expect(response.status()).toBe(401);
});
