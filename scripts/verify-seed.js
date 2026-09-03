#!/usr/bin/env node
/* Re-runs the same queries the storefront uses (lib/data.ts) and checks that
   product taxonomy references actually resolve to real docs. */

const { loadEnv } = require('./_env');
loadEnv();
const mongoose = require('mongoose');

(async () => {
  await mongoose.connect(process.env.MONGODB_URI, { family: 4, serverSelectionTimeoutMS: 15000 });
  const db = mongoose.connection.db;
  const c = (n) => db.collection(n);

  console.log('Homepage queries (lib/data.ts):');
  console.log('  getActiveHeroSlides ', await c('heroslides').countDocuments({ isActive: true }));
  console.log('  getCategories       ', await c('categories').countDocuments());
  console.log('  getSubCategories    ', await c('subcategories').countDocuments());
  console.log('  getBrands           ', await c('brands').countDocuments());
  console.log('  getTrendingProducts ', await c('products').countDocuments({ isTrending: true }));
  console.log('  getNewProducts      ', await c('products').countDocuments({ isNewArrival: true }));
  console.log('  getFeaturedProducts ', await c('products').countDocuments({ isFeatured: true }));
  console.log('  getTopSellerProducts', await c('products').countDocuments({ isTopSeller: true }));
  console.log('  getFeaturedReviews  ', await c('reviews').countDocuments({ isApproved: true, isFeatured: true }));
  console.log('  getOffers           ', await c('offers').countDocuments());
  console.log('  getBlogs            ', await c('blogs').countDocuments());
  console.log('  getProducts         ', await c('products').countDocuments());

  // Referential integrity: product.category/.brand/.subCategory hold ObjectId strings.
  // brand and subCategory are optional, so a missing value is not a broken reference.
  const catIds = new Set((await c('categories').find({}, { projection: { _id: 1 } }).toArray()).map((d) => String(d._id)));
  const brandIds = new Set((await c('brands').find({}, { projection: { _id: 1 } }).toArray()).map((d) => String(d._id)));
  const subCats = await c('subcategories').find().toArray();
  const subCatIds = new Set(subCats.map((d) => String(d._id)));

  // Every sub-category must point at a real category.
  const orphanSubCats = subCats.filter((sc) => !catIds.has(sc.category));
  console.log(`\nSub-category -> category references: ${subCats.length - orphanSubCats.length}/${subCats.length} resolve`);
  orphanSubCats.forEach((sc) => console.log('  BROKEN:', sc.name));

  const products = await c('products').find().toArray();
  const broken = products.filter(
    (p) => !catIds.has(p.category)
      || (p.brand && !brandIds.has(p.brand))
      || (p.subCategory && !subCatIds.has(p.subCategory)),
  );
  console.log(`Product taxonomy references: ${products.length - broken.length}/${products.length} resolve`);
  broken.forEach((p) => console.log('  BROKEN:', p.slug));

  // A product's sub-category, when set, should belong to that product's own category.
  const subCatById = new Map(subCats.map((sc) => [String(sc._id), sc]));
  const mismatched = products.filter((p) => {
    if (!p.subCategory) return false;
    const sc = subCatById.get(p.subCategory);
    return sc && sc.category !== p.category;
  });
  console.log(`Product sub-category/category mismatches: ${mismatched.length}`);
  mismatched.forEach((p) => console.log('  MISMATCH:', p.slug));

  // Offers must point at real products.
  const productIds = new Set(products.map((p) => String(p._id)));
  const offers = await c('offers').find().toArray();
  let badOfferRefs = 0;
  offers.forEach((o) => (o.selectedProducts || []).forEach((id) => { if (!productIds.has(id)) badOfferRefs++; }));
  console.log(`Offer product references: ${badOfferRefs} broken`);

  // Orders must point at real products too (the sales report groups by them).
  const orders = await c('orders').find().toArray();
  let badOrderRefs = 0;
  orders.forEach((o) => o.items.forEach((it) => { if (!productIds.has(it.productId)) badOrderRefs++; }));
  const revenue = orders.filter((o) => o.status !== 'Cancelled').reduce((s, o) => s + o.total, 0);
  console.log(`Order product references: ${badOrderRefs} broken`);
  console.log(`Non-cancelled order revenue: BDT ${revenue.toLocaleString('en-US')} across ${orders.length} orders`);

  // Sanity: every product should be reachable from at least one category filter.
  const usedCats = new Set(products.map((p) => p.category));
  console.log(`Categories with at least one product: ${usedCats.size}/${catIds.size}`);

  const ok = broken.length === 0 && orphanSubCats.length === 0 && mismatched.length === 0
    && badOfferRefs === 0 && badOrderRefs === 0;
  console.log(`\n${ok ? 'PASS - all references resolve' : 'FAIL - broken references above'}`);
  await mongoose.disconnect();
  if (!ok) process.exit(1);
})().catch(async (e) => {
  console.error('Verify failed:', e.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
