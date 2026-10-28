import type { HomeSection, Ratio, SectionSettings, Storefront, Tile } from './types';

// Starter layout shown until an admin saves their own sections. Every tile points at an SVG placeholder
// (public/banners/placeholders) that prints its recommended upload size, so swapping in real art is obvious.

const ph = (name: string) => `/banners/placeholders/${name}.svg`;
const tile = (name: string, link: string, alt: string, extra: Partial<Tile> = {}): Tile => ({ image: ph(name), link, alt, ...extra });

const R = (w: number, h: number): Ratio => ({ w, h });

/** Recommended upload sizes per section role — also shown in the admin builder. */
export const RATIO_PRESETS: { label: string; ratio: Ratio; size: string }[] = [
  { label: 'Hero desktop (16:5)',  ratio: R(16, 5), size: '1920 × 600' },
  { label: 'Hero mobile (1:1)',    ratio: R(1, 1),  size: '1080 × 1080' },
  { label: 'Strip desktop (10:1)', ratio: R(10, 1), size: '1920 × 192' },
  { label: 'Strip mobile (4:1)',   ratio: R(4, 1),  size: '1080 × 270' },
  { label: 'Square (1:1)',         ratio: R(1, 1),  size: '600 × 600' },
  { label: 'Wide (2:1)',           ratio: R(2, 1),  size: '800 × 400' },
  { label: 'Landscape (3:2)',      ratio: R(3, 2),  size: '600 × 400' },
  { label: 'Banner (5:2)',         ratio: R(5, 2),  size: '600 × 240' },
  { label: 'Portrait (4:5)',       ratio: R(4, 5),  size: '480 × 600' },
];

type Seed = Omit<HomeSection, '_id' | 'order'>;
const section = (type: HomeSection['type'], title: string, settings: SectionSettings, tiles: Tile[] = [], subtitle = ''): Seed => ({
  type, title, subtitle, isActive: true, startsAt: null, endsAt: null, tiles, settings,
});

const cat = (slug: string, name: string) => tile(`cat-${slug}`, `/products?category=${encodeURIComponent(name)}`, name);
const concern = (slug: string, label: string, q: string) => tile(`concern-${slug}`, `/products?q=${encodeURIComponent(q)}`, label);

export const DEFAULT_SECTIONS: Seed[] = [
  section('hero', 'Hero', { ratio: R(16, 5), mobileRatio: R(1, 1), autoplayMs: 6000 }, [1, 2, 3, 4].map((n) =>
    tile(`hero-${n}-desktop`, '/products', `Featured campaign ${n}`, { mobileImage: ph(`hero-${n}-mobile`) }))),
  section('strip', 'Flash strip', { ratio: R(10, 1), mobileRatio: R(4, 1) }, [
    tile('strip-desktop', '/offers', 'Flash sale', { mobileImage: ph('strip-mobile') }),
  ]),
  section('image-grid', 'Deals you cannot miss', { ratio: R(1, 1), cols: { mobile: 2, tablet: 4, desktop: 4 }, mobileLayout: 'grid', accent: '#A41B15' }, [
    tile('deal-1', '/products', 'Under ৳499'),
    tile('deal-2', '/products', 'Bestsellers'),
    tile('deal-3', '/products', 'New arrivals'),
    tile('deal-4', '/products', 'Gift sets'),
  ]),
  section('image-grid', 'Top brands and offers', { ratio: R(2, 1), cols: { mobile: 1, tablet: 2, desktop: 3 }, mobileLayout: 'scroll', accent: '#3B0D2E' },
    [1, 2, 3, 4, 5, 6].map((n) => tile(`brand-${n}`, '/offers', `Brand offer ${n}`))),
  section('product-rail', 'Flash sale', { source: 'trending', limit: 12, viewAllLink: '/offers', countdownTo: null, accent: '#A41B15' }, [], 'Grab them before the timer runs out'),
  section('image-grid', 'Limited time offers', { ratio: R(5, 2), cols: { mobile: 2, tablet: 4, desktop: 4 }, mobileLayout: 'grid', accent: '#D8B26E' }, [
    tile('offer-bogo', '/offers', 'Buy 1 Get 1'),
    tile('offer-combo', '/offers', 'Combo deals'),
    tile('offer-offers', '/offers', 'All offers'),
    tile('offer-clearance', '/offers', 'Clearance sale'),
  ]),
  section('image-grid', 'Shop by category', { ratio: R(3, 2), cols: { mobile: 2, tablet: 4, desktop: 4 }, mobileLayout: 'grid', accent: '#A41B15' }, [
    cat('makeup', 'Makeup'), cat('skin', 'Skin Care'), cat('hair', 'Hair Care'), cat('k-beauty', 'K-Beauty'),
    cat('fragrance', 'Fragrance'), cat('bath-body', 'Bath & Body'), cat('tools', 'Tools & Accessories'), cat('mom-baby', 'Mom & Baby'),
  ]),
  section('product-rail', 'New arrivals', { source: 'new', limit: 12, viewAllLink: '/products' }),
  section('image-grid', 'Shop by concern', { ratio: R(1, 1), cols: { mobile: 3, tablet: 5, desktop: 5 }, mobileLayout: 'grid', accent: '#3B0D2E' }, [
    concern('acne', 'Acne', 'acne'), concern('anti-aging', 'Anti-ageing', 'anti aging'), concern('dark-spots', 'Dark spots', 'spot'),
    concern('dry-skin', 'Dry skin', 'moistur'), concern('oil-control', 'Oily skin', 'oil control'), concern('pores', 'Pores', 'pore'),
    concern('dullness', 'Dullness', 'brightening'), concern('sun-care', 'Sun care', 'sunscreen'), concern('hair-fall', 'Hair fall', 'hair fall'),
    concern('dandruff', 'Dandruff', 'dandruff'),
  ]),
  section('product-rail', 'Best sellers', { source: 'top', limit: 12, viewAllLink: '/products' }),
  section('brand-marquee', 'Brands we love', {}),
  section('reviews', 'Loved by our customers', {}),
  section('trust-badges', 'Why DealHobe', {}),
];

/** Defaults with stable fake ids, for rendering before anything is saved. */
export const defaultSections = (): HomeSection[] =>
  DEFAULT_SECTIONS.map((s, i) => ({ ...s, _id: `default-${i}`, order: i }));

export const DEFAULT_STOREFRONT: Storefront = {
  navPills: [
    { label: 'Makeup',      link: '/products?category=Makeup',    color: '#A41B15' },
    { label: 'Skin Care',   link: '/products?category=Skin%20Care', color: '#C2185B' },
    { label: 'Hair Care',   link: '/products?category=Hair%20Care', color: '#6A1B9A' },
    { label: 'Offers',      link: '/offers',                      color: '#D8902F' },
    { label: 'New In',      link: '/products',                    color: '#00897B' },
    { label: 'Blogs',       link: '/blogs',                       color: '#3B0D2E' },
  ],
  trustBadges: [
    { icon: 'shield',  title: '100% authentic',     text: 'Sourced from trusted importers' },
    { icon: 'truck',   title: 'Nationwide delivery', text: 'Fast shipping across Bangladesh' },
    { icon: 'cash',    title: 'Cash on delivery',    text: 'Pay when it reaches you' },
    { icon: 'refresh', title: 'Easy returns',        text: 'Hassle-free return policy' },
  ],
  contact: {
    phone: '+8801338886611',
    email: 'dealhobe26@gmail.com',
    address: 'House 1/10, Block #A, Road #5, Lalmatia, Dhaka',
    whatsapp: '8801338886611',
  },
  socials: { facebook: '', instagram: '', youtube: '', tiktok: '' },
  footerAbout: 'Premium imported cosmetics and beauty essentials, delivered across Bangladesh.',
};
