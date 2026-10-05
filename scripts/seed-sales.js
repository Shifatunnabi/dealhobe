#!/usr/bin/env node
/*
 * Dummy sales data for the admin Sales Report.
 *
 *   node scripts/seed-sales.js           upsert ~60 orders (orderNumber DH####SALES)
 *   node scripts/seed-sales.js --remove  delete only those orders
 *
 * Touches nothing but the `orders` collection. Orders are built from products
 * that already exist in the database, so the report shows real product names.
 * Deterministic (fixed PRNG seed) and idempotent: re-running updates in place.
 */

const { loadEnv } = require('./_env');
loadEnv();

const mongoose = require('mongoose');

const COUNT = 60;
const REMOVE = process.argv.includes('--remove');
const DELIVERY_CHARGE = { inside_dhaka: 95, outside_dhaka: 120 };
const FREE_DELIVERY_THRESHOLD = 2000;
const DAY = 24 * 60 * 60 * 1000;

// Small deterministic PRNG so re-runs produce the same orders.
let state = 20260401;
const rand = () => {
  state = (state * 1664525 + 1013904223) % 4294967296;
  return state / 4294967296;
};
const randInt = (min, max) => min + Math.floor(rand() * (max - min + 1));

const CUSTOMERS = [
  { fullName: 'Imran Sheikh', phone: '01811000201', area: 'inside_dhaka', address: 'House 12, Road 3, Mohammadpur, Dhaka 1207' },
  { fullName: 'Shamima Akter', phone: '01811000202', area: 'outside_dhaka', address: '55 Station Road, Rajshahi 6100' },
  { fullName: 'Kamrul Hasan', phone: '01811000203', area: 'inside_dhaka', address: 'Flat 3A, 9 Gulshan Avenue, Dhaka 1212' },
  { fullName: 'Nadia Rahman', phone: '01811000204', area: 'inside_dhaka', address: 'House 5, Road 14, Dhanmondi, Dhaka 1209' },
  { fullName: 'Arif Hossain', phone: '01811000205', area: 'outside_dhaka', address: '21 Agrabad C/A, Chattogram 4100' },
  { fullName: 'Sumaiya Islam', phone: '01811000206', area: 'inside_dhaka', address: 'Flat 6C, 40 Mirpur Road, Dhaka 1216' },
  { fullName: 'Rafiq Uddin', phone: '01811000207', area: 'outside_dhaka', address: '8 Zindabazar, Sylhet 3100' },
  { fullName: 'Tasnim Ferdous', phone: '01811000208', area: 'inside_dhaka', address: 'House 77, Sector 11, Uttara, Dhaka 1230' },
];

// Mostly delivered, a few cancelled (cancelled orders are excluded from the report).
const STATUS_POOL = [
  ...Array(7).fill('Delivered'),
  ...Array(2).fill('Shipped'),
  'Processing',
  'Pending',
  'Cancelled',
];

(async () => {
  await mongoose.connect(process.env.MONGODB_URI, { family: 4, serverSelectionTimeoutMS: 15000 });
  const orders = mongoose.connection.db.collection('orders');
  console.log(`Connected to "${mongoose.connection.name}"`);

  if (REMOVE) {
    const { deletedCount } = await orders.deleteMany({ orderNumber: /SALES$/ });
    console.log(`Removed ${deletedCount} dummy sales orders.`);
    await mongoose.disconnect();
    return;
  }

  const products = await mongoose.connection.db
    .collection('products')
    .find({}, { projection: { name: 1, price: 1, salePrice: 1, costPrice: 1, images: 1 } })
    .sort({ _id: 1 })
    .toArray();
  if (products.length === 0) throw new Error('No products in the database — run `npm run seed` first.');

  // Zipf-ish popularity: product i is picked with weight 1/(i+1).
  const weights = products.map((_, i) => 1 / (i + 1));
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  const pickProduct = () => {
    let r = rand() * totalWeight;
    for (let i = 0; i < products.length; i++) {
      r -= weights[i];
      if (r <= 0) return products[i];
    }
    return products[0];
  };

  const now = Date.now();
  let n = 0;
  let cancelled = 0;

  for (let i = 0; i < COUNT; i++) {
    // First 14 orders land in the last 5 days so the report's default
    // "this month" range is never empty; the rest spread over ~60 days.
    const daysAgo = i < 14 ? randInt(0, 4) : randInt(5, 60);
    const placedAt = new Date(now - daysAgo * DAY - randInt(0, 20) * 60 * 60 * 1000);

    const lineCount = randInt(1, 3);
    const chosen = new Map();
    for (let k = 0; k < lineCount; k++) {
      const p = pickProduct();
      chosen.set(String(p._id), p);
    }
    const items = [...chosen.values()].map((p) => {
      const unitPrice = p.salePrice ?? p.price;
      const qty = randInt(1, 3);
      return {
        productId: String(p._id),
        name: p.name,
        image: p.images?.[0] || '/placeholder.png',
        unitPrice,
        ...(typeof p.costPrice === 'number' ? { costPrice: p.costPrice } : {}),
        qty,
        lineTotal: unitPrice * qty,
      };
    });

    const customer = CUSTOMERS[randInt(0, CUSTOMERS.length - 1)];
    const subtotal = items.reduce((s, it) => s + it.lineTotal, 0);
    const deliveryCharge = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_CHARGE[customer.area];

    // Recent orders haven't shipped yet; older ones are mostly delivered.
    const status = daysAgo <= 1 ? (rand() < 0.5 ? 'Pending' : 'Processing') : STATUS_POOL[randInt(0, STATUS_POOL.length - 1)];
    if (status === 'Cancelled') cancelled++;

    const orderNumber = `DH${String(i + 1).padStart(4, '0')}SALES`;
    await orders.findOneAndUpdate(
      { orderNumber },
      {
        $set: {
          orderNumber,
          checkoutMethod: 'guest',
          status,
          items,
          delivery: { ...customer, paymentMethod: 'cash_on_delivery' },
          subtotal,
          deliveryCharge,
          total: subtotal + deliveryCharge,
          receiptEmailSending: false,
          updatedAt: placedAt,
        },
        $setOnInsert: { createdAt: placedAt },
      },
      { upsert: true },
    );
    n++;
  }

  console.log(`Upserted ${n} orders across ${products.length} products (${cancelled} cancelled — excluded from the report).`);
  await mongoose.disconnect();
})().catch(async (err) => {
  console.error('Failed:', err.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
