#!/usr/bin/env node
/*
 * DealHobe database seeder.
 *
 *   node scripts/seed.js            upsert seed data (safe to re-run)
 *   node scripts/seed.js --reset    delete seeded docs first, then re-insert
 *
 * Idempotent: every collection is upserted on a natural key (name / slug /
 * label / title / email / orderNumber), so re-running updates in place rather
 * than duplicating. Only documents this script owns are touched; --reset also
 * only removes documents matching the seed natural keys.
 *
 * Images point at files already in /public, so the storefront renders without
 * Cloudinary. imagePublicId carries a `seed/...` sentinel: Cloudinary's
 * destroy() on an unknown id is a no-op, so admin deletes still work.
 */

const { loadEnv } = require('./_env');
loadEnv();

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const { CATEGORIES, SUBCATEGORIES, BRANDS, HERO_SLIDES, TOP_BAR_TEXTS } = require('./seed-content');
const { PRODUCTS, toHtml } = require('./seed-products');
const { BLOGS, OFFERS, CUSTOMERS, REVIEWS, ORDERS, blogHtml } = require('./seed-commerce');

const RESET = process.argv.includes('--reset');

const DELIVERY_CHARGE = { inside_dhaka: 95, outside_dhaka: 120 };
const FREE_DELIVERY_THRESHOLD = 2000;

const now = new Date();
const daysAgo = (n) => new Date(now.getTime() - n * 24 * 60 * 60 * 1000);
const daysAhead = (n) => new Date(now.getTime() + n * 24 * 60 * 60 * 1000);

let db;
const col = (name) => db.collection(name);

/** Upsert one document on `key`, preserving createdAt on updates. */
async function upsert(name, key, doc, createdAt = now) {
  const res = await col(name).findOneAndUpdate(
    key,
    { $set: { ...doc, updatedAt: now }, $setOnInsert: { createdAt } },
    { upsert: true, returnDocument: 'after' },
  );
  // Driver v5 returns the doc directly; v4 wraps it in { value }.
  return res && res.value ? res.value : res;
}

async function seedTaxonomy() {
  const categories = new Map();
  for (const c of CATEGORIES) {
    const doc = await upsert('categories', { name: c.name }, {
      name: c.name,
      imageUrl: c.imageUrl,
      imagePublicId: `seed/category/${c.name.toLowerCase().replace(/\s+/g, '-')}`,
      order: c.order,
    });
    categories.set(c.name, doc._id);
  }

  const subCategories = new Map();
  for (const sc of SUBCATEGORIES) {
    const categoryId = categories.get(sc.category);
    if (!categoryId) throw new Error(`Sub-category "${sc.name}" references unknown category "${sc.category}"`);
    const doc = await upsert('subcategories', { name: sc.name, category: String(categoryId) }, {
      name: sc.name,
      category: String(categoryId),
      order: sc.order,
    });
    subCategories.set(sc.name, doc._id);
  }

  const brands = new Map();
  for (const b of BRANDS) {
    const doc = await upsert('brands', { name: b.name }, {
      name: b.name,
      logoUrl: b.logoUrl,
      logoPublicId: `seed/brand/${b.name.toLowerCase().replace(/\s+/g, '-')}`,
      order: b.order,
    });
    brands.set(b.name, doc._id);
  }

  console.log(`  categories ${categories.size} | sub-categories ${subCategories.size} | brands ${brands.size}`);
  return { categories, subCategories, brands };
}

async function seedSiteContent() {
  for (const [i, s] of HERO_SLIDES.entries()) {
    // $unset clears title/subtitle left behind by earlier seeds — the hero now
    // renders only the photo and its button.
    await col('heroslides').updateOne(
      { imageUrl: s.imageUrl },
      {
        $set: {
          imageUrl: s.imageUrl,
          imagePublicId: `seed/hero/slide-${i + 1}`,
          ctaText: s.ctaText,
          ctaLink: s.ctaLink,
          ctaColor: s.ctaColor,
          ctaTextColor: s.ctaTextColor,
          order: s.order,
          isActive: true,
          updatedAt: now,
        },
        $unset: { title: '', subtitle: '' },
        $setOnInsert: { createdAt: now },
      },
      { upsert: true },
    );
  }

  for (const t of TOP_BAR_TEXTS) {
    await upsert('topbartexts', { text: t.text }, { text: t.text, order: t.order, isActive: true });
  }

  for (const [i, b] of BLOGS.entries()) {
    const published = daysAgo(b.daysAgo);
    await upsert('blogs', { title: b.title }, {
      title: b.title,
      category: b.category,
      content: blogHtml(b),
      imageUrl: b.imageUrl,
      imagePublicId: `seed/blog/${i + 1}`,
      isFeatured: b.isFeatured,
      publishedAt: published,
    }, published);
  }

  await upsert('settings', { key: 'global' }, {
    key: 'global',
    freeDeliveryThreshold: FREE_DELIVERY_THRESHOLD,
    logoUrl: '/logo/main-logo.png',
    logoPublicId: 'seed/logo/main',
  });

  console.log(`  hero slides ${HERO_SLIDES.length} | top bar ${TOP_BAR_TEXTS.length} | blogs ${BLOGS.length} | settings 1`);
}

async function seedProducts({ categories, subCategories, brands }) {
  const bySlug = new Map();
  for (const p of PRODUCTS) {
    const categoryId = categories.get(p.cat);
    const brandId = brands.get(p.brand);
    if (!categoryId || !brandId) {
      throw new Error(`Unresolved taxonomy for ${p.slug}: cat=${p.cat} brand=${p.brand}`);
    }
    const subCategoryId = p.sub ? subCategories.get(p.sub) : null;
    if (p.sub && !subCategoryId) {
      throw new Error(`Unresolved sub-category for ${p.slug}: sub=${p.sub}`);
    }

    const doc = await upsert('products', { slug: p.slug }, {
      sku: p.sku,
      name: p.name,
      slug: p.slug,
      price: p.price,
      ...(p.salePrice ? { salePrice: p.salePrice } : {}),
      quantity: p.qty,
      shortDescription: p.short,
      brand: String(brandId),
      category: String(categoryId),
      ...(subCategoryId ? { subCategory: String(subCategoryId) } : {}),
      whyLoveIt: p.why,
      description: toHtml(p),
      images: [p.image],
      imagePublicIds: [`seed/product/${p.slug}`],
      isFeatured: p.featured,
      isTrending: p.trending,
      isNewArrival: p.newArrival,
      isTopSeller: p.topSeller,
    });
    bySlug.set(p.slug, { id: doc._id, name: p.name, image: p.image, unitPrice: p.salePrice || p.price });
  }
  console.log(
    `  products ${bySlug.size} ` +
    `(featured ${PRODUCTS.filter((p) => p.featured).length}, ` +
    `trending ${PRODUCTS.filter((p) => p.trending).length}, ` +
    `new ${PRODUCTS.filter((p) => p.newArrival).length}, ` +
    `top seller ${PRODUCTS.filter((p) => p.topSeller).length})`
  );
  return bySlug;
}

async function seedOffers(productsBySlug) {
  for (const [i, o] of OFFERS.entries()) {
    const selected = o.products.map((slug) => {
      const p = productsBySlug.get(slug);
      if (!p) throw new Error(`Offer "${o.slug}" references unknown product "${slug}"`);
      return String(p.id);
    });

    await upsert('offers', { slug: o.slug }, {
      title: o.title,
      slug: o.slug,
      discountType: o.discountType,
      discountAmount: o.discountAmount,
      details: o.details,
      thumbnailUrl: o.thumbnailUrl,
      thumbnailPublicId: `seed/offer/${i + 1}`,
      productSelection: o.productSelection,
      selectedProducts: selected,
      isActive: o.isActive,
      endingDate: o.endsInDays === null ? null : daysAhead(o.endsInDays),
    });
  }
  console.log(`  offers ${OFFERS.length} (${OFFERS.filter((o) => o.isActive).length} active)`);
}

async function seedCustomers() {
  // One shared hash for every seeded account - all use the password below.
  const passwordHash = await bcrypt.hash('Password123!', 10);
  const byEmail = new Map();

  for (const c of CUSTOMERS) {
    const doc = await upsert('users', { email: c.email }, {
      fullName: c.fullName,
      phone: c.phone,
      email: c.email,
      passwordHash,
      area: c.area,
      address: c.address,
      addresses: [{ label: 'home', fullAddress: c.address, address: c.address, area: c.area, isDefault: true }],
      isBanned: false,
    });
    byEmail.set(c.email, { id: doc._id, ...c });
  }
  console.log(`  customers ${byEmail.size} (password for all: Password123!)`);
  return byEmail;
}

async function seedReviews(productsBySlug, customersByEmail) {
  let n = 0;
  for (const r of REVIEWS) {
    const customer = customersByEmail.get(r.email);
    const product = productsBySlug.get(r.slug);
    if (!customer || !product) throw new Error(`Review references unknown customer/product: ${r.email} / ${r.slug}`);

    await upsert('reviews', { productId: String(product.id), customerId: String(customer.id) }, {
      customerName: customer.fullName,
      customerId: String(customer.id),
      customerEmail: customer.email,
      rating: r.rating,
      review: r.text,
      productId: String(product.id),
      isApproved: r.approved,
      isFeatured: r.featured,
    });
    n++;
  }
  const featured = REVIEWS.filter((r) => r.approved && r.featured).length;
  const pending = REVIEWS.filter((r) => !r.approved).length;
  console.log(`  reviews ${n} (${featured} featured on homepage, ${pending} pending approval)`);
}

async function seedOrders(productsBySlug, customersByEmail) {
  let n = 0;
  for (const [i, o] of ORDERS.entries()) {
    const customer = o.email ? customersByEmail.get(o.email) : null;
    const delivery = customer
      ? { fullName: customer.fullName, phone: customer.phone, email: customer.email, area: customer.area, address: customer.address, paymentMethod: 'cash_on_delivery' }
      : { ...o.guest, paymentMethod: 'cash_on_delivery' };

    const items = o.items.map(([slug, qty]) => {
      const p = productsBySlug.get(slug);
      if (!p) throw new Error(`Order references unknown product "${slug}"`);
      return { productId: String(p.id), name: p.name, image: p.image, unitPrice: p.unitPrice, qty, lineTotal: p.unitPrice * qty };
    });

    const subtotal = items.reduce((sum, it) => sum + it.lineTotal, 0);
    const deliveryCharge = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_CHARGE[delivery.area];
    const placedAt = daysAgo(o.daysAgo);

    // Deterministic order number so re-runs update the same order.
    const orderNumber = `DH${String(i + 1).padStart(4, '0')}SEED`;

    await upsert('orders', { orderNumber }, {
      orderNumber,
      ...(customer ? { userId: String(customer.id) } : {}),
      checkoutMethod: customer ? 'account' : 'guest',
      status: o.status,
      items,
      delivery,
      subtotal,
      deliveryCharge,
      total: subtotal + deliveryCharge,
      ...(o.status === 'Delivered' ? { receiptEmailSentAt: placedAt } : {}),
    }, placedAt);
    n++;
  }

  const byStatus = ORDERS.reduce((acc, o) => ({ ...acc, [o.status]: (acc[o.status] || 0) + 1 }), {});
  console.log(`  orders ${n} (${Object.entries(byStatus).map(([s, c]) => `${s}: ${c}`).join(', ')})`);
}

async function reset() {
  const spec = [
    ['categories', { name: { $in: CATEGORIES.map((c) => c.name) } }],
    ['subcategories', { name: { $in: SUBCATEGORIES.map((s) => s.name) } }],
    ['brands', { name: { $in: BRANDS.map((b) => b.name) } }],
    ['heroslides', { imageUrl: { $in: HERO_SLIDES.map((s) => s.imageUrl) } }],
    ['topbartexts', { text: { $in: TOP_BAR_TEXTS.map((t) => t.text) } }],
    ['blogs', { title: { $in: BLOGS.map((b) => b.title) } }],
    ['products', { slug: { $in: PRODUCTS.map((p) => p.slug) } }],
    ['offers', { slug: { $in: OFFERS.map((o) => o.slug) } }],
    ['users', { email: { $in: CUSTOMERS.map((c) => c.email) } }],
    ['orders', { orderNumber: /SEED$/ }],
    ['reviews', { customerEmail: { $in: CUSTOMERS.map((c) => c.email) } }],
    ['settings', { key: 'global' }],
  ];
  let total = 0;
  for (const [name, filter] of spec) {
    const { deletedCount } = await col(name).deleteMany(filter);
    total += deletedCount;
  }
  console.log(`  removed ${total} previously seeded documents`);
}

(async () => {
  await mongoose.connect(process.env.MONGODB_URI, { family: 4, serverSelectionTimeoutMS: 15000 });
  db = mongoose.connection.db;
  console.log(`Connected to "${mongoose.connection.name}"\n`);

  if (RESET) {
    console.log('Resetting seeded data:');
    await reset();
    console.log('');
  }

  console.log('Seeding:');
  const taxonomy = await seedTaxonomy();
  await seedSiteContent();
  const productsBySlug = await seedProducts(taxonomy);
  await seedOffers(productsBySlug);
  const customersByEmail = await seedCustomers();
  await seedReviews(productsBySlug, customersByEmail);
  await seedOrders(productsBySlug, customersByEmail);

  console.log('\nDone. Restart `npm run dev` (or wait for ISR) to see the new content.');
  await mongoose.disconnect();
})().catch(async (err) => {
  console.error('\nSeed failed:', err.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
