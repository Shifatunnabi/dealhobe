#!/usr/bin/env node
/*
 * Backfill costPrice on products (admin-only field used for profit reports).
 *
 *   node scripts/seed-cost-prices.js           set costPrice where it is missing
 *   node scripts/seed-cost-prices.js --force   overwrite every product's costPrice
 *
 * Dummy cost = 55-75% of the effective selling price (salePrice if set, else
 * price), deterministic per product so re-runs give the same numbers.
 */

const { loadEnv } = require('./_env');
loadEnv();

const mongoose = require('mongoose');

const FORCE = process.argv.includes('--force');

// Stable 0..1 value derived from the product id (no Math.random).
function unit(id) {
  let h = 2166136261;
  for (const ch of String(id)) h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0;
  return h / 4294967296;
}

(async () => {
  await mongoose.connect(process.env.MONGODB_URI, { family: 4, serverSelectionTimeoutMS: 15000 });
  const products = mongoose.connection.db.collection('products');
  console.log(`Connected to "${mongoose.connection.name}"`);

  const docs = await products.find({}, { projection: { price: 1, salePrice: 1, costPrice: 1 } }).toArray();
  const ops = [];
  for (const p of docs) {
    if (!FORCE && typeof p.costPrice === 'number') continue;
    const selling = p.salePrice || p.price;
    const costPrice = Math.round(selling * (0.55 + unit(p._id) * 0.2));
    ops.push({ updateOne: { filter: { _id: p._id }, update: { $set: { costPrice } } } });
  }

  if (ops.length) await products.bulkWrite(ops);
  console.log(`Set costPrice on ${ops.length} of ${docs.length} products.`);
  await mongoose.disconnect();
})().catch(async (err) => {
  console.error('Failed:', err.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
