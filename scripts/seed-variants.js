#!/usr/bin/env node
/*
 * Demo variants on a handful of existing products.
 *
 *   node scripts/seed-variants.js           add variants (idempotent)
 *   node scripts/seed-variants.js --remove  strip variants again (restores single-product mode)
 *
 * Mirrors what the admin form saves: product.price = lowest variant price,
 * product.quantity = sum of variant stock, product.salePrice cleared.
 * Original price/salePrice/quantity are kept in `_variantSeedBackup` so --remove restores them.
 */
const { loadEnv } = require('./_env');
loadEnv();
const mongoose = require('mongoose');

const REMOVE = process.argv.includes('--remove');

// name → options (name + values with price multiplier), cartesian product is generated below
const PLAN = {
  'Velvet Matte Lipstick': [{ name: 'Shade', values: ['Ruby Red', 'Nude Beige', 'Berry Wine', 'Coral Pop'] }],
  'Silk Finish Foundation': [{ name: 'Shade', values: ['Ivory', 'Beige', 'Sand', 'Caramel'] }],
  'Gel Shine Nail Polish': [{ name: 'Color', values: ['Cherry', 'Lilac', 'Mint', 'Sky Blue', 'Black'] }],
  'Gentle Foaming Face Cleanser': [{ name: 'Volume', values: ['100ml', '200ml'], mult: [1, 1.7] }],
  'Argan Oil Nourishing Shampoo': [{ name: 'Size', values: ['250ml', '500ml', '1L'], mult: [1, 1.8, 3.2] }],
  'Blooming Rose Eau de Parfum': [{ name: 'Volume', values: ['30ml', '50ml', '100ml'], mult: [0.6, 1, 1.8] }],
  'Cocoa Butter Body Lotion': [
    { name: 'Size', values: ['200ml', '400ml'], mult: [1, 1.7] },
    { name: 'Fragrance', values: ['Original', 'Vanilla'] },
  ],
  'Hydration Boost Combo Set': [{ name: 'Pack Size', values: ['Pack of 1', 'Pack of 2', 'Pack of 3'], mult: [1, 1.9, 2.7] }],
};

const combos = (opts) =>
  opts.reduce((acc, o) => acc.flatMap((c) => o.values.map((v, i) => [...c, { name: o.name, value: v, mult: o.mult ? o.mult[i] : 1 }])), [[]]);

(async () => {
  await mongoose.connect(process.env.MONGODB_URI, { family: 4, serverSelectionTimeoutMS: 10000 });
  const col = mongoose.connection.db.collection('products');
  let n = 0;
  for (const [name, opts] of Object.entries(PLAN)) {
    const p = await col.findOne({ name });
    if (!p) { console.log('skip (not found):', name); continue; }

    if (REMOVE) {
      const b = p._variantSeedBackup;
      if (!b) continue;
      await col.updateOne({ _id: p._id }, {
        $set: { hasVariants: false, variantOptions: [], variants: [], price: b.price, quantity: b.quantity, ...(b.salePrice ? { salePrice: b.salePrice } : {}) },
        $unset: { _variantSeedBackup: '' },
      });
      console.log('removed variants:', name); n++;
      continue;
    }

    const backup = p._variantSeedBackup || { price: p.price, salePrice: p.salePrice || 0, quantity: p.quantity };
    const imgs = p.images || [];
    const variants = combos(opts).map((c, idx) => {
      const mult = c.reduce((m, o) => m * o.mult, 1);
      const price = Math.round(backup.price * mult);
      const salePrice = backup.salePrice ? Math.round(backup.salePrice * mult) : 0;
      const own = imgs.length > 1 && idx % 2 === 1 ? imgs[1] : null; // every other variant gets its own photo when one exists
      return {
        key: c.map((o) => o.value).join('|'),
        options: c.map((o) => ({ name: o.name, value: o.value })),
        price, salePrice,
        ...(typeof p.costPrice === 'number' ? { costPrice: Math.round(p.costPrice * mult) } : {}),
        sku: 'DHV-' + String(p._id).slice(-5).toUpperCase() + '-' + (idx + 1),
        quantity: idx === 0 ? 12 : idx === 2 ? 0 : 8 + idx * 3, // include one out-of-stock variant
        useMainImage: !own,
        ...(own ? { image: own } : {}),
      };
    });
    await col.updateOne({ _id: p._id }, {
      $set: {
        hasVariants: true,
        variantOptions: opts.map((o) => ({ name: o.name, values: o.values })),
        variants,
        price: Math.min(...variants.map((v) => v.price)),
        salePrice: 0,
        quantity: variants.reduce((s, v) => s + v.quantity, 0),
        _variantSeedBackup: backup,
      },
    });
    console.log(`variants added: ${name} (${variants.length} variants, ${variants.filter((v) => !v.useMainImage).length} with own image)`); n++;
  }
  console.log('done,', n, 'products');
  await mongoose.disconnect();
})().catch((e) => { console.error('ERROR:', e.message); process.exit(1); });
