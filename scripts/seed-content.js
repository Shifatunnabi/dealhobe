/* Static seed content for DealHobe.
   Images point at files that already exist in /public, so the seeded site
   renders without depending on Cloudinary. imagePublicId uses a `seed/` prefix
   sentinel — Cloudinary destroy() on a missing id is a no-op, so admin deletes
   still work. */

const CATEGORIES = [
  { name: 'Educational', imageUrl: '/category/1.png', order: 1 },
  { name: 'Fun',         imageUrl: '/category/2.png', order: 2 },
  { name: 'DIY',         imageUrl: '/category/3.png', order: 3 },
  { name: 'Soft Toys',   imageUrl: '/category/4.png', order: 4 },
  { name: 'Outdoor',     imageUrl: '/category/5.png', order: 5 },
  { name: 'Puzzles',     imageUrl: '/category/6.png', order: 6 },
];

/* `category` is the parent Category's natural-key name — the seeder resolves
   it to a real ObjectId, same pattern as products' `cat`/`brand` keys. */
const SUBCATEGORIES = [
  { name: 'Building Sets',    category: 'Educational', order: 1 },
  { name: 'STEM Kits',        category: 'Educational', order: 2 },
  { name: 'Action Figures',   category: 'Fun',          order: 1 },
  { name: 'Remote Control',   category: 'Fun',          order: 2 },
  { name: 'Craft Kits',       category: 'DIY',          order: 1 },
  { name: 'Drawing & Art',    category: 'DIY',          order: 2 },
  { name: 'Plush Dolls',      category: 'Soft Toys',    order: 1 },
  { name: 'Explorer Gear',    category: 'Outdoor',      order: 1 },
  { name: 'Jigsaw Puzzles',   category: 'Puzzles',      order: 1 },
];

const BRANDS = [
  { name: 'Lego',       logoUrl: '/brands/1.png', order: 1 },
  { name: 'Disney',     logoUrl: '/brands/2.png', order: 2 },
  { name: 'Hot Wheels', logoUrl: '/brands/3.png', order: 3 },
  { name: 'Barbie',     logoUrl: '/brands/4.png', order: 4 },
  { name: 'Funko',      logoUrl: '/brands/5.png', order: 5 },
];

const HERO_SLIDES = [
  { imageUrl: '/hero/slide1.png', ctaText: 'Shop All Toys',      ctaLink: '/products', ctaColor: '#A41B15', ctaTextColor: '#FFFFFF', order: 1 },
  { imageUrl: '/hero/slide2.png', ctaText: 'Grab the Deal',      ctaLink: '/offers',   ctaColor: '#C4622D', ctaTextColor: '#FFFFFF', order: 2 },
  { imageUrl: '/hero/slide3.png', ctaText: 'Explore Educational', ctaLink: '/products', ctaColor: '#3DA7E4', ctaTextColor: '#0F172A', order: 3 },
  { imageUrl: '/hero/slide4.png', ctaText: 'Shop Soft Toys',     ctaLink: '/products', ctaColor: '#A41B15', ctaTextColor: '#FFD93D', order: 4 },
];

const TOP_BAR_TEXTS = [
  { text: 'Free delivery on orders over ৳2000', order: 1 },
  { text: 'Cash on delivery available nationwide', order: 2 },
  { text: '7-day easy return on all toys', order: 3 },
];

module.exports = { CATEGORIES, SUBCATEGORIES, BRANDS, HERO_SLIDES, TOP_BAR_TEXTS };
