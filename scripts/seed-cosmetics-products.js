#!/usr/bin/env node
/*
 * Cosmetics catalog seeder.
 *
 *   node scripts/seed-cosmetics-products.js
 *
 * Uploads the photos in /public/products to Cloudinary once, then builds
 * 2-3 dummy products per existing sub-category (read live from the DB —
 * these were created through the admin panel, not the old toy seed.js
 * pipeline). Wipes the old orphaned toy catalog and anything hanging off it
 * (reviews/offers referencing those product ids) before inserting.
 */

const { loadEnv } = require('./_env');
loadEnv();

const path = require('path');
const mongoose = require('mongoose');
const { v2: cloudinary } = require('cloudinary');

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const SOURCE_IMAGES = [
  '1814814_328.jpg', '1814829_343.jpg', '1883.jpg', '4300975_18213.jpg',
  '6831392_27506.jpg', '6831397_27511.jpg', '6831398_27512.jpg', '7612.jpg',
  '7839.jpg', '8773366_340.jpg', '8773368_341.jpg', '9378216_33924.jpg',
];

const randomDigits = (n) => Array.from({ length: n }, () => Math.floor(Math.random() * 10)).join('');
const slugify = (name) => name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
const generateSlug = (name) => `${slugify(name)}-${randomDigits(7)}`;
const generateSku = () => 'DH-' + randomDigits(8);
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const chance = (p) => Math.random() < p;
function pick(arr, n) {
  const copy = [...arr];
  const out = [];
  for (let i = 0; i < n && copy.length; i++) {
    out.push(copy.splice(Math.floor(Math.random() * copy.length), 1)[0]);
  }
  return out;
}

/** 2-3 dummy product names per sub-category, keyed by the sub-category name already in the DB. */
const SUBCATEGORY_PRODUCTS = {
  'Eyes': ['Velvet Matte Eyeshadow Palette', 'Precision Liquid Eyeliner', 'Volumizing Lash Mascara'],
  'Face': ['Silk Finish Foundation', 'Radiant Glow Blush', 'HD Setting Powder'],
  'Nails': ['Gel Shine Nail Polish', 'Nail Strengthening Base Coat', 'Chrome Effect Top Coat'],
  'Lip Care': ['Hydra Glow Lip Balm', 'Velvet Matte Lipstick', 'Tinted Lip Oil'],
  'Makeup Kit': ['Bridal Glam Makeup Kit', 'Everyday Essentials Makeup Kit', 'Travel Size Beauty Kit'],
  'Tools & Brushes': ['Professional Blending Brush Set', 'Silicone Makeup Sponge', 'Retractable Kabuki Brush'],
  'Cleansers & Toners': ['Gentle Foaming Face Cleanser', 'Rose Water Toner', 'Micellar Cleansing Water'],
  'Eye Care': ['Brightening Under-Eye Cream', 'Cooling Eye Gel Patches', 'Anti-Wrinkle Eye Serum'],
  'Kits and Combos': ['Glow Getter Skincare Combo', 'Daily Essentials Skin Kit', 'Hydration Boost Combo Set'],
  'Masks': ['Charcoal Detox Face Mask', 'Hydrating Sheet Mask', 'Clay Purifying Mud Mask'],
  'Moisturizers': ['Deep Hydration Day Cream', 'Nourishing Night Moisturizer', 'Aloe Vera Gel Moisturizer'],
  'Serums & Essence': ['Vitamin C Brightening Serum', 'Hyaluronic Acid Serum', 'Niacinamide Essence'],
  'Tools and Accessories': ['Jade Facial Roller', 'Konjac Cleansing Sponge', 'Gua Sha Massage Stone'],
  'Hair Care': ['Argan Oil Nourishing Shampoo', 'Keratin Repair Conditioner', 'Scalp Detox Hair Tonic'],
  'Hair Styling': ['Heat Protectant Styling Spray', 'Volumizing Hair Mousse', 'Shine Serum Hair Oil'],
  'Bath and Shower': ['Lavender Bubble Bath', 'Moisturizing Shower Gel', 'Exfoliating Body Scrub'],
  'Body Care': ['Cocoa Butter Body Lotion', 'Shea Butter Body Cream', 'Whitening Body Lotion'],
  'Feminine Hygiene': ['Daily Freshness Intimate Wash', 'Soothing Feminine Wipes', 'pH Balance Care Wash'],
  'Shaving and Hair Removal': ['Smooth Glide Shaving Cream', 'Painless Hair Removal Wax Strips', 'Soothing After-Shave Gel'],
  'Sexual Wellness': ['Silky Touch Intimate Oil', 'Water-Based Personal Lubricant', 'Comfort Care Gel'],
  'Oral Care': ['Whitening Toothpaste', 'Herbal Mouthwash', 'Charcoal Teeth Whitening Powder'],
  'Fragrance Women': ['Blooming Rose Eau de Parfum', 'Vanilla Musk Perfume Mist', 'Citrus Bloom Body Spray'],
  'Premium Fragrance': ['Signature Oud Perfume', 'Luxury Amber Eau de Parfum', 'Velvet Rose Attar'],
};

/** One shared "why you'll love it" list and description template — every product only swaps its name in. */
const WHY_LOVE_IT = [
  'Made with skin-friendly, dermatologically tested ingredients',
  'Lightweight formula that blends and absorbs easily',
  'Free from harsh parabens and sulphates',
  'Suitable for daily use on all skin types',
  'Cruelty-free and never tested on animals',
];

function shortDescription(name) {
  return `${name} is a premium cosmetic essential crafted for everyday beauty routines, offering gentle care, a delightful finish, and long-lasting comfort.`;
}

function descriptionHtml(name) {
  const paras = [
    `${name} is thoughtfully formulated to fit seamlessly into your daily beauty routine, combining nourishing ingredients with a lightweight, comfortable feel.`,
    `Designed for everyday confidence, it delivers consistent results use after use, without compromising on quality or care.`,
  ];
  const items = WHY_LOVE_IT.map((w) => `<li>${w}</li>`).join('');
  return paras.map((p) => `<p>${p}</p>`).join('') + `<h3>Why you'll love it</h3><ul>${items}</ul>`;
}

(async () => {
  await mongoose.connect(process.env.MONGODB_URI, { family: 4, serverSelectionTimeoutMS: 15000 });
  const db = mongoose.connection.db;
  console.log(`Connected to "${mongoose.connection.name}"`);

  console.log('\nUploading source images to Cloudinary...');
  const uploaded = [];
  for (const file of SOURCE_IMAGES) {
    const filePath = path.join(__dirname, '..', 'public', 'products', file);
    const result = await cloudinary.uploader.upload(filePath, { folder: 'dealhobe/products' });
    uploaded.push({ url: result.secure_url, publicId: result.public_id });
    console.log(`  uploaded ${file} -> ${result.public_id}`);
  }

  const oldProductIds = (await db.collection('products').find({}, { projection: { _id: 1 } }).toArray()).map((p) => String(p._id));
  const delProducts = await db.collection('products').deleteMany({});
  const delReviews = await db.collection('reviews').deleteMany({ productId: { $in: oldProductIds } });
  const delOffers = await db.collection('offers').deleteMany({});
  console.log(`\nRemoved ${delProducts.deletedCount} old (orphaned toy) products, ${delReviews.deletedCount} stale reviews, ${delOffers.deletedCount} stale offers`);

  const subCategories = await db.collection('subcategories').find({}).toArray();

  const now = new Date();
  const docs = [];
  for (const sub of subCategories) {
    const names = SUBCATEGORY_PRODUCTS[sub.name];
    if (!names) {
      console.warn(`  ! no product names mapped for sub-category "${sub.name}", skipping`);
      continue;
    }
    const count = chance(0.5) ? 3 : 2;
    for (const name of names.slice(0, count)) {
      const price = rand(250, 3200);
      const onSale = chance(0.35);
      const images = pick(uploaded, rand(3, 4));
      docs.push({
        sku: generateSku(),
        name,
        slug: generateSlug(name),
        price,
        ...(onSale ? { salePrice: Math.round(price * 0.8) } : {}),
        quantity: rand(15, 90),
        shortDescription: shortDescription(name),
        category: String(sub.category),
        subCategory: String(sub._id),
        whyLoveIt: WHY_LOVE_IT,
        description: descriptionHtml(name),
        images: images.map((i) => i.url),
        imagePublicIds: images.map((i) => i.publicId),
        isFeatured: chance(0.25),
        isTrending: chance(0.25),
        isNewArrival: chance(0.25),
        isTopSeller: chance(0.2),
        createdAt: now,
        updatedAt: now,
      });
    }
  }

  const res = await db.collection('products').insertMany(docs);
  console.log(`\nInserted ${res.insertedCount} products across ${subCategories.length} sub-categories`);
  console.log(
    `  featured ${docs.filter((d) => d.isFeatured).length}, ` +
    `trending ${docs.filter((d) => d.isTrending).length}, ` +
    `new ${docs.filter((d) => d.isNewArrival).length}, ` +
    `top seller ${docs.filter((d) => d.isTopSeller).length}`
  );

  await mongoose.disconnect();
  console.log('\nDone.');
})().catch(async (err) => {
  console.error('\nSeed failed:', err);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
