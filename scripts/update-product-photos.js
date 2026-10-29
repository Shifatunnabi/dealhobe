#!/usr/bin/env node
/*
 * Replace products' main photo (e.g. a brand logo used as a placeholder) with real packshots.
 *
 *   node scripts/update-product-photos.js <mapping.json>            dry run (no writes)
 *   node scripts/update-product-photos.js <mapping.json> --commit   upload + update
 *
 * <mapping.json>: { "<product-slug>": "<local image path>", ... }
 *
 * Each image is uploaded to Cloudinary (dealhobe/products) and replaces the product's FIRST photo
 * (the placeholder — check it visually before running); any further photos are kept. Old image
 * arrays are written to scripts/data/photo-backup-<timestamp>.json so a run can be undone.
 * Old Cloudinary files are NOT deleted (some placeholders are shared with the brand record).
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

const [mappingFile, flag] = process.argv.slice(2);
const commit = flag === '--commit';
if (!mappingFile) { console.error('Usage: node scripts/update-product-photos.js <mapping.json> [--commit]'); process.exit(1); }

const mapping = JSON.parse(fs.readFileSync(mappingFile, 'utf8'));

(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const Product = mongoose.connection.collection('products');
  const backup = [];

  for (const [slug, file] of Object.entries(mapping)) {
    const p = await Product.findOne({ slug }, { projection: { name: 1, images: 1, imagePublicIds: 1 } });
    if (!p) { console.log(`✗ ${slug}: product not found`); continue; }
    if (!fs.existsSync(file)) { console.log(`✗ ${slug}: missing file ${file}`); continue; }
    const keep = (p.images || []).slice(1).map((url, i) => ({ url, id: (p.imagePublicIds || [])[i + 1] || '' }));
    console.log(`${commit ? '→' : '·'} ${p.name}: replacing photo 1 of ${p.images?.length || 0} (${(p.images || [])[0] || 'none'})`);
    if (!commit) continue;

    const up = await cloudinary.uploader.upload(path.resolve(file), { folder: 'dealhobe/products', resource_type: 'image' });
    backup.push({ _id: String(p._id), slug, images: p.images, imagePublicIds: p.imagePublicIds });
    await Product.updateOne({ _id: p._id }, {
      $set: { images: [up.secure_url, ...keep.map((x) => x.url)], imagePublicIds: [up.public_id, ...keep.map((x) => x.id)], updatedAt: new Date() },
    });
    console.log(`  ✓ ${up.secure_url}`);
  }

  if (commit && backup.length) {
    const out = path.join(__dirname, 'data', `photo-backup-${Date.now()}.json`);
    fs.writeFileSync(out, JSON.stringify(backup, null, 2));
    console.log(`Backup of previous photos: ${out}`);
  }
  await mongoose.disconnect();
})().catch((err) => { console.error(err); process.exit(1); });
