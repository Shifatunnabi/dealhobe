#!/usr/bin/env node
/*
 * Seeds one active offer and a batch of customer reviews against the live
 * cosmetics catalog (products inserted by seed-cosmetics-products.js) and
 * the existing seeded users.
 *
 *   node scripts/seed-offer-reviews.js
 */

const { loadEnv } = require('./_env');
loadEnv();

const mongoose = require('mongoose');

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
function pick(arr, n) {
  const copy = [...arr];
  const out = [];
  for (let i = 0; i < n && copy.length; i++) {
    out.push(copy.splice(Math.floor(Math.random() * copy.length), 1)[0]);
  }
  return out;
}

const REVIEW_TEXTS = [
  "The foundation shade match is perfect. Quality is truly premium and delivery was super quick.",
  "Finally found imported cosmetics that feel authentic and gentle on skin. Packaging was beautiful too.",
  "The skincare set is exactly as shown. DealHobe customer support was very responsive.",
  "Great quality and no irritation at all. I'm obsessed with the new serum.",
  "Reliable page. I have ordered three times and every product was authentic.",
  "Loved the finish and the packaging. My skin feels amazing and so do I.",
  "Worth every taka. Lightweight formulas that suit my skin type perfectly.",
  "Easy checkout and trusted quality. Will definitely order again.",
  "The lipstick shade is even prettier in person. Long-lasting and doesn't dry my lips out.",
  "My go-to store for skincare now. Fast delivery and everything arrives well packed.",
];

(async () => {
  await mongoose.connect(process.env.MONGODB_URI, { family: 4, serverSelectionTimeoutMS: 15000 });
  const db = mongoose.connection.db;
  console.log(`Connected to "${mongoose.connection.name}"`);

  const products = await db.collection('products').find({}).toArray();
  const users = await db.collection('users').find({}).toArray();
  if (!products.length) throw new Error('No products found — run seed-cosmetics-products.js first.');
  if (!users.length) throw new Error('No users found to author reviews.');

  // ── One active offer, referencing 5 real products ──────────────────
  const offerProducts = pick(products, 5);
  const thumbnail = offerProducts[0].images[0];
  const thumbnailPublicId = offerProducts[0].imagePublicIds[0];

  await db.collection('offers').deleteMany({ slug: 'weekend-beauty-sale' });
  const offerDoc = {
    title: 'Weekend Beauty Sale',
    slug: 'weekend-beauty-sale',
    discountType: 'percentage',
    discountAmount: 20,
    details: 'Get 20% off on selected cosmetics this weekend only. Limited stock, while supplies last.',
    thumbnailUrl: thumbnail,
    thumbnailPublicId,
    productSelection: 'selected',
    selectedProducts: offerProducts.map((p) => String(p._id)),
    isActive: true,
    endingDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  const offerRes = await db.collection('offers').insertOne(offerDoc);
  console.log(`\nOffer created: "${offerDoc.title}" (${offerProducts.length} products) -> ${offerRes.insertedId}`);

  // ── Ten reviews, spread across random products and users ───────────
  await db.collection('reviews').deleteMany({});
  const reviewDocs = REVIEW_TEXTS.map((text, i) => {
    const user = users[i % users.length];
    const product = products[rand(0, products.length - 1)];
    return {
      customerName: user.fullName,
      customerId: String(user._id),
      customerEmail: user.email,
      rating: rand(4, 5),
      review: text,
      productId: String(product._id),
      isApproved: true,
      isFeatured: i < 6,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  });
  const reviewRes = await db.collection('reviews').insertMany(reviewDocs);
  console.log(`Reviews created: ${reviewRes.insertedCount} (${reviewDocs.filter((r) => r.isFeatured).length} featured on homepage)`);

  await mongoose.disconnect();
  console.log('\nDone.');
})().catch(async (err) => {
  console.error('\nFailed:', err);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
