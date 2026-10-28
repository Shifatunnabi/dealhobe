#!/usr/bin/env node
/*
 * Move a product to the right brand, creating the brand (with its logo) if it doesn't exist yet.
 *
 *   node scripts/reassign-brand.js <product-slug> "<BRAND NAME>" <logo file>            dry run
 *   node scripts/reassign-brand.js <product-slug> "<BRAND NAME>" <logo file> --commit   apply
 *
 * The previous brand id is written to scripts/data/brand-backup-<timestamp>.json so it can be undone.
 * Pair with scripts/update-product-photos.js to replace a placeholder photo.
 */

const { loadEnv } = require('./_env');
loadEnv();

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const { v2: cloudinary } = require('cloudinary');

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const [slug, brandName, logoFile, flag] = process.argv.slice(2);
const commit = flag === '--commit';
if (!slug || !brandName || !logoFile) {
  console.error('Usage: node scripts/reassign-brand.js <product-slug> "<BRAND NAME>" <logo file> [--commit]');
  process.exit(1);
}

(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection;
  const products = db.collection('products');
  const brands = db.collection('brands');

  const product = await products.findOne({ slug }, { projection: { name: 1, brand: 1 } });
  if (!product) throw new Error(`No product with slug ${slug}`);
  const current = product.brand ? await brands.findOne({ _id: new mongoose.Types.ObjectId(String(product.brand)) }).catch(() => null) : null;
  let target = await brands.findOne({ name: { $regex: `^${brandName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' } });

  console.log(`${product.name}: ${current?.name ?? product.brand ?? 'no brand'} → ${target?.name ?? `${brandName} (new brand)`}`);
  if (!commit) return mongoose.disconnect();

  if (!target) {
    if (!fs.existsSync(logoFile)) throw new Error(`Missing logo ${logoFile}`);
    const up = await cloudinary.uploader.upload(path.resolve(logoFile), { folder: 'dealhobe/brands', resource_type: 'image' });
    const last = await brands.find().sort({ order: -1 }).limit(1).next();
    const now = new Date();
    const { insertedId } = await brands.insertOne({ name: brandName, logoUrl: up.secure_url, logoPublicId: up.public_id, order: (last?.order ?? 0) + 1, createdAt: now, updatedAt: now, __v: 0 });
    target = { _id: insertedId, name: brandName };
    console.log(`  ✓ created brand ${brandName} (${up.secure_url})`);
  }
  await products.updateOne({ _id: product._id }, { $set: { brand: String(target._id), updatedAt: new Date() } });
  const out = path.join(__dirname, 'data', `brand-backup-${Date.now()}.json`);
  fs.writeFileSync(out, JSON.stringify({ _id: String(product._id), slug, previousBrand: product.brand ?? null }, null, 2));
  console.log(`  ✓ product moved to ${target.name}. Backup: ${out}`);
  await mongoose.disconnect();
})().catch((err) => { console.error(err); process.exit(1); });
