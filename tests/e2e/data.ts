import { expect, type Page } from '@playwright/test';
import { unique } from './fixtures';
export const image = '/banners/placeholders/cat-makeup.svg';
export async function seed(page: Page, variants = false) {
  const name = unique();
  const create = async (kind: string, data: object) => { const res = await page.request.post(`/api/admin/${kind}`, { data }); expect(res.ok(), await res.text()).toBeTruthy(); return res.json(); };
  const brand = await create('brands', { name: `${name} Brand`, logoUrl: image, logoPublicId: 'e2e/local', order: 999 });
  const category = await create('categories', { name: `${name} Category`, imageUrl: image, imagePublicId: 'e2e/local', order: 999 });
  const sub = await create('subcategories', { name: `${name} Sub`, category: category._id, order: 0 });
  const product = await create('products', { name, slug: name.toLowerCase().replaceAll(' ', '-'), sku: name.replaceAll(' ', '-'), category: category._id, subCategory: sub._id, brand: brand._id, price: 200, quantity: 100, images: [image, '/banners/placeholders/cat-skin.svg'], shortDescription: 'QA beauty product', description: '<p>QA beauty description</p>', isFeatured: true, ...(variants ? { hasVariants: true, quantity: 200, variantOptions: [{ name: 'Shade', values: ['Rose', 'Nude'] }], variants: [{ key: 'Rose', options: [{ name: 'Shade', value: 'Rose' }], price: 200, quantity: 100, sku: `${name}-R`, useMainImage: true }, { key: 'Nude', options: [{ name: 'Shade', value: 'Nude' }], price: 350, quantity: 100, sku: `${name}-N`, useMainImage: false, image: '/banners/placeholders/cat-skin.svg' }] } : {}) });
  return { name, brand, category, sub, product };
}
export async function cleanup(page: Page, data: Awaited<ReturnType<typeof seed>>) {
  for (const [kind, id] of [['products', data.product._id], ['categories', data.category._id], ['brands', data.brand._id]]) { if (kind !== 'products') await page.request.put(`/api/admin/${kind}`, { data: { id, logoPublicId: '', imagePublicId: '' } }); expect((await page.request.delete(`/api/admin/${kind}`, { data: { id } })).ok()).toBeTruthy(); }
}
