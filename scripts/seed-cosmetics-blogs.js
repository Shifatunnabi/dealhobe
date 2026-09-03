#!/usr/bin/env node
/*
 * Replaces the old toy-store blog posts with cosmetics/skincare content.
 * Reuses the product photos already uploaded to Cloudinary (see
 * seed-cosmetics-products.js) as blog thumbnails — no new uploads needed.
 *
 *   node scripts/seed-cosmetics-blogs.js
 */

const { loadEnv } = require('./_env');
loadEnv();

const mongoose = require('mongoose');

const now = new Date();
const daysAgo = (n) => new Date(now.getTime() - n * 24 * 60 * 60 * 1000);

const blogHtml = (paragraphs) => paragraphs.map((p) => `<p>${p}</p>`).join('');

const BLOGS = [
  {
    title: 'Building a Skincare Routine That Actually Works',
    category: 'Skincare Tips',
    isFeatured: true,
    daysAgo: 2,
    body: [
      'Most skincare routines fail for the same reason: too many products, applied in the wrong order, changed too often to see what is actually working. A routine only needs three steps to be effective — cleanse, treat, moisturize — and a fourth, sunscreen, every single morning without exception.',
      'Introduce one new product at a time and give it two to three weeks before judging it. Skin turnover takes about 28 days, so a serum that looks like it is "doing nothing" in week one may just need more time, while a product that causes irritation will usually show it within days.',
      'Consistency beats complexity. A five-step routine followed every day will outperform a twelve-step routine followed twice a week.',
    ],
  },
  {
    title: 'Five Ingredients Worth Reading the Label For',
    category: 'Ingredients',
    isFeatured: true,
    daysAgo: 6,
    body: [
      'Niacinamide shows up in almost everything now, and for good reason — it calms redness, refines the look of pores, and plays well with nearly every other active, which makes it a safe first step into "actives" for beginners.',
      'Hyaluronic acid is a humectant, not a moisturizer on its own — it pulls water into the skin, so it works best applied to damp skin and sealed in with a cream, not applied to bone-dry skin where it can pull moisture out instead.',
      'Vitamin C, retinoids and SPF round out the list. Vitamin C brightens and protects against environmental damage during the day; retinoids do the heavy lifting overnight; and SPF is what actually protects the investment you have made in the other four.',
    ],
  },
  {
    title: 'Foundation Matching: Getting the Undertone Right',
    category: 'Makeup Guides',
    isFeatured: false,
    daysAgo: 10,
    body: [
      'Shade matching goes wrong most often because of undertone, not depth. A foundation can be the right lightness and still look wrong if it leans too pink, yellow, or neutral against your skin.',
      'The simplest test does not involve your wrist — wrists are often a different tone than your face. Swatch two or three close shades along your jawline in daylight and pick the one that seems to disappear, rather than the one that looks best on the back of your hand.',
      'When in doubt between two shades, size down rather than up. A foundation that oxidizes slightly darker over the day is far less noticeable than one that stays visibly lighter than your neck.',
    ],
  },
  {
    title: 'The Truth About "Natural" and "Clean" Beauty Labels',
    category: 'Ingredients',
    isFeatured: false,
    daysAgo: 15,
    body: [
      '"Natural" and "clean" are marketing terms, not regulated claims — there is no legal standard that defines what qualifies, which is why two products can both wear the label and have almost nothing in common on the ingredient list.',
      'Naturally derived does not automatically mean gentler, either. Several plant extracts and essential oils are more likely to cause irritation or sensitization than their lab-formulated counterparts, which are often designed specifically to be stable and low-irritant.',
      'The label worth trusting is the ingredient list itself, read in order of concentration, not the word printed across the front of the bottle.',
    ],
  },
  {
    title: "A Reviewer's Month With Vitamin C Serum",
    category: 'Product Reviews',
    isFeatured: false,
    daysAgo: 20,
    body: [
      'We used a vitamin C serum every morning for four weeks under sunscreen, on skin that runs slightly dry and reactive in the colder months, to see whether the brightening claims held up outside a lab.',
      'Week one brought mild tingling on application and nothing visible. By week two the tingling had stopped and morning skin looked noticeably less dull. By week four, a handful of post-blemish marks had faded faster than they usually do unassisted.',
      'It did not work miracles, and it will not replace sunscreen or a good moisturizer — but as a five-minute addition to an existing routine, the brightening effect was real enough to keep it in daily rotation.',
    ],
  },
  {
    title: 'Makeup Storage That Actually Protects Your Products',
    category: 'Tips & Tricks',
    isFeatured: false,
    daysAgo: 26,
    body: [
      'Heat, light and humidity are the three things that shorten a product\'s shelf life fastest, and a bathroom windowsill has all three. Store actives like vitamin C and retinoids in a cool, dark drawer rather than anywhere near direct sun or a hot shower.',
      'Keep brushes and sponges upright and separated so bristles keep their shape and nothing stays damp against another surface — damp, enclosed storage is exactly the environment bacteria need.',
      'Write the opening date on anything without a clear expiry, especially mascara and liquid liner. Most should be replaced every three to six months regardless of how much product is left in the tube.',
    ],
  },
  {
    title: "Sunscreen Myths That Won't Go Away",
    category: 'Skincare Tips',
    isFeatured: false,
    daysAgo: 32,
    body: [
      'Cloudy days and indoor time are not exemptions — UVA rays pass through cloud cover and window glass, which is why sunscreen belongs in the routine every single day, not just at the beach.',
      'A higher SPF number is not a reason to apply less. Most people apply roughly half the amount used in official SPF testing, which quietly cuts the real-world protection of a "50" down closer to a "25".',
      'Darker skin tones still need sunscreen. Melanin offers some natural protection against sunburn, but it does not prevent UV-driven premature aging or block the skin cancer risk that comes with daily unprotected exposure.',
    ],
  },
  {
    title: 'Building a Five-Minute Everyday Makeup Look',
    category: 'Makeup Guides',
    isFeatured: false,
    daysAgo: 38,
    body: [
      'A fast everyday look needs exactly four products: a tinted moisturizer or light foundation, cream blush, a neutral eyeshadow swept across the lid, and a tinted lip balm — anything more starts eating into the five minutes.',
      'Cream products are what make the timeline possible. They blend with fingertips in seconds, so there is no brush-cleaning delay and no harsh lines to soften.',
      'Do eyes before base. A little fallout under the eye is invisible on bare skin and easy to wipe away, but it is a genuine setback once foundation and concealer are already in place.',
    ],
  },
];

(async () => {
  await mongoose.connect(process.env.MONGODB_URI, { family: 4, serverSelectionTimeoutMS: 15000 });
  const db = mongoose.connection.db;
  console.log(`Connected to "${mongoose.connection.name}"`);

  const products = await db.collection('products').find({}, { projection: { images: 1, imagePublicIds: 1 } }).toArray();
  const photos = [];
  const seen = new Set();
  for (const p of products) {
    (p.images || []).forEach((url, i) => {
      const publicId = p.imagePublicIds?.[i];
      if (url && publicId && !seen.has(url)) {
        seen.add(url);
        photos.push({ url, publicId });
      }
    });
  }
  if (!photos.length) throw new Error('No product photos found — run seed-cosmetics-products.js first.');

  const delRes = await db.collection('blogs').deleteMany({});
  console.log(`Removed ${delRes.deletedCount} old (toy) blog posts`);

  const docs = BLOGS.map((b, i) => {
    const photo = photos[i % photos.length];
    return {
      title: b.title,
      category: b.category,
      content: blogHtml(b.body),
      imageUrl: photo.url,
      imagePublicId: photo.publicId,
      isFeatured: b.isFeatured,
      publishedAt: daysAgo(b.daysAgo),
      createdAt: daysAgo(b.daysAgo),
      updatedAt: now,
    };
  });

  const res = await db.collection('blogs').insertMany(docs);
  console.log(`Inserted ${res.insertedCount} cosmetics/skincare blog posts (${docs.filter((d) => d.isFeatured).length} featured)`);

  await mongoose.disconnect();
  console.log('\nDone.');
})().catch(async (err) => {
  console.error('\nFailed:', err);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
