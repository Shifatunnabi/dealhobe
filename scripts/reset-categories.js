#!/usr/bin/env node
/*
 * Replace the whole category tree with the agreed one, and re-point existing products at it.
 *
 *   node scripts/reset-categories.js --dry     print the mapping, change nothing
 *   node scripts/reset-categories.js --apply   backup -> delete old categories & sub-categories -> insert new -> remap products
 *
 * Old categories' images are reused as placeholders. A JSON backup of the old tree and each
 * product's old category/subCategory is written to scripts/_category-backup.json first.
 */
const { loadEnv } = require('./_env');
loadEnv();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const APPLY = process.argv.includes('--apply');

const TREE = [
  { name: 'Skin Care', img: 'Skin Care', subs: ['Cleansers & Face Wash', 'Toners & Mists', 'Serums & Treatments', 'Moisturizers', 'Sunscreen', 'Face Masks', 'Eye Care', 'Lip Care'] },
  { name: 'Hair Care', img: 'Hair Care', subs: ['Shampoo', 'Conditioner', 'Hair Oil & Serum', 'Hair Masks', 'Styling'] },
  { name: 'Makeup', img: 'Makeup', subs: ['Face', 'Eyes', 'Lips', 'Nails', 'Tools & Brushes'] },
  { name: 'Bath & Body', img: 'Essentials', subs: ['Body Wash & Soap', 'Body Lotion & Cream', 'Scrubs & Exfoliators', 'Hand & Foot Care', 'Deodorants'] },
  { name: 'Fragrance', img: 'Fragrance', subs: ['Perfume', 'Body Mist', 'Attar & Oils'] },
  { name: 'Grooming', img: 'Essentials', subs: ['Shaving', 'Beard Care', 'After-Shave', 'Hair Removal'] },
  { name: 'Baby & Kids Care', img: 'Skin Care', subs: ['Baby Skin Care', 'Baby Hair & Bath', 'Diaper Care', 'Kids Essentials'] },
  { name: 'Personal Care', img: 'Essentials', subs: ['Intimate Care', 'Oral Care', 'Wipes & Tissues'] },
];

// [old category, old sub-category (null = any), optional product-name regex, [new category, new sub-category | null]]; first match wins
const RULES = [
  ['Makeup', 'Eyes', null, ['Makeup', 'Eyes']],
  ['Makeup', 'Face', null, ['Makeup', 'Face']],
  ['Makeup', 'Nails', null, ['Makeup', 'Nails']],
  ['Makeup', 'Lip Care', null, ['Makeup', 'Lips']],
  ['Makeup', 'Makeup Kit', null, ['Makeup', 'Face']],
  ['Makeup', 'Tools & Brushes', null, ['Makeup', 'Tools & Brushes']],
  ['Skin Care', 'Cleansers & Toners', /toner/i, ['Skin Care', 'Toners & Mists']],
  ['Skin Care', 'Cleansers & Toners', null, ['Skin Care', 'Cleansers & Face Wash']],
  ['Skin Care', 'Eye Care', null, ['Skin Care', 'Eye Care']],
  ['Skin Care', 'Kits and Combos', null, ['Skin Care', null]],
  ['Skin Care', 'Masks', null, ['Skin Care', 'Face Masks']],
  ['Skin Care', 'Moisturizers', null, ['Skin Care', 'Moisturizers']],
  ['Skin Care', 'Serums & Essence', null, ['Skin Care', 'Serums & Treatments']],
  ['Skin Care', 'Tools and Accessories', null, ['Skin Care', null]],
  ['Hair Care', null, /shampoo/i, ['Hair Care', 'Shampoo']],
  ['Hair Care', null, /conditioner/i, ['Hair Care', 'Conditioner']],
  ['Hair Care', null, /oil|serum/i, ['Hair Care', 'Hair Oil & Serum']],
  ['Hair Care', 'Hair Styling', null, ['Hair Care', 'Styling']],
  ['Hair Care', null, /styling|mousse|gel|spray/i, ['Hair Care', 'Styling']],
  ['Hair Care', null, /shampoo/i, ['Hair Care', 'Shampoo']],
  ['Hair Care', null, /conditioner/i, ['Hair Care', 'Conditioner']],
  ['Hair Care', null, /oil|serum/i, ['Hair Care', 'Hair Oil & Serum']],
  ['Hair Care', null, /mask/i, ['Hair Care', 'Hair Masks']],
  ['Hair Care', null, null, ['Hair Care', null]],
  ['Essentials', 'Bath and Shower', null, ['Bath & Body', 'Body Wash & Soap']],
  ['Essentials', 'Body Care', /scrub|exfoli/i, ['Bath & Body', 'Scrubs & Exfoliators']],
  ['Essentials', 'Body Care', null, ['Bath & Body', 'Body Lotion & Cream']],
  ['Essentials', 'Feminine Hygiene', /wipe/i, ['Personal Care', 'Wipes & Tissues']],
  ['Essentials', 'Feminine Hygiene', null, ['Personal Care', 'Intimate Care']],
  ['Essentials', 'Sexual Wellness', null, ['Personal Care', 'Intimate Care']],
  ['Essentials', 'Oral Care', null, ['Personal Care', 'Oral Care']],
  ['Essentials', 'Shaving and Hair Removal', /after-?shave/i, ['Grooming', 'After-Shave']],
  ['Essentials', 'Shaving and Hair Removal', /wax|removal/i, ['Grooming', 'Hair Removal']],
  ['Essentials', 'Shaving and Hair Removal', null, ['Grooming', 'Shaving']],
  ['Fragrance', null, /attar|oil/i, ['Fragrance', 'Attar & Oils']],
  ['Fragrance', null, /mist|spray/i, ['Fragrance', 'Body Mist']],
  ['Fragrance', null, null, ['Fragrance', 'Perfume']],
];

(async () => {
  await mongoose.connect(process.env.MONGODB_URI, { family: 4, serverSelectionTimeoutMS: 10000 });
  const db = mongoose.connection.db;
  const cats = await db.collection('categories').find().toArray();
  const subs = await db.collection('subcategories').find().toArray();
  const products = await db.collection('products').find({}, { projection: { name: 1, category: 1, subCategory: 1 } }).toArray();
  const catName = (id) => (cats.find((c) => String(c._id) === String(id)) || {}).name;
  const subName = (id) => (subs.find((s) => String(s._id) === String(id)) || {}).name;

  const plan = products.map((p) => {
    const oc = catName(p.category), os = subName(p.subCategory);
    const rule = RULES.find(([c, s, re]) => c === oc && (s === null || s === os) && (!re || re.test(p.name)));
    return { p, oc, os, target: rule ? rule[3] : null };
  });
  const unmapped = plan.filter((x) => !x.target);
  const byTarget = {};
  for (const x of plan) {
    const k = x.target ? x.target.join(' > ') : 'UNMAPPED';
    (byTarget[k] = byTarget[k] || []).push(x.p.name);
  }
  for (const [k, v] of Object.entries(byTarget).sort()) {
    console.log(k.padEnd(42) + String(v.length).padStart(3) + '  ' + v.slice(0, 3).join(', ') + (v.length > 3 ? ', ...' : ''));
  }
  console.log('\nold: ' + cats.length + ' categories, ' + subs.length + ' sub-categories | new: ' + TREE.length + ' categories, ' +
    TREE.reduce((n, t) => n + t.subs.length, 0) + ' sub-categories | products to remap: ' + plan.length + ', unmapped: ' + unmapped.length);
  if (!APPLY) { console.log('(dry run - nothing changed; pass --apply)'); await mongoose.disconnect(); return; }
  if (unmapped.length) throw new Error('Unmapped products, aborting: ' + unmapped.map((x) => x.p.name).join(', '));

  fs.writeFileSync(path.join(__dirname, '_category-backup.json'), JSON.stringify({ cats, subs, products }, null, 1));
  console.log('backup written: scripts/_category-backup.json');

  const now = new Date();
  await db.collection('categories').deleteMany({});
  await db.collection('subcategories').deleteMany({});
  const idOf = {};
  for (const [i, t] of TREE.entries()) {
    const src = cats.find((c) => c.name === t.img);
    const r = await db.collection('categories').insertOne({ name: t.name, imageUrl: src.imageUrl, imagePublicId: src.imagePublicId, order: i + 1, createdAt: now, updatedAt: now });
    idOf[t.name] = { id: String(r.insertedId), subs: {} };
    for (const [j, s] of t.subs.entries()) {
      const sr = await db.collection('subcategories').insertOne({ name: s, category: String(r.insertedId), order: j + 1, createdAt: now, updatedAt: now });
      idOf[t.name].subs[s] = String(sr.insertedId);
    }
  }
  for (const x of plan) {
    const [c, s] = x.target;
    await db.collection('products').updateOne({ _id: x.p._id }, { $set: { category: idOf[c].id, subCategory: s ? idOf[c].subs[s] : '' } });
  }
  console.log('done: tree replaced, ' + plan.length + ' products remapped');
  await mongoose.disconnect();
})().catch((e) => { console.error('ERROR:', e.message); process.exit(1); });
