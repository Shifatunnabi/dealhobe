import type { HomeSection, Ratio, SectionSettings, Storefront, Tile } from './types';

// Starter layout shown until an admin saves their own sections. Every tile points at an SVG placeholder
// (public/banners/placeholders) that prints its recommended upload size, so swapping in real art is obvious.

const ph = (name: string) => `/banners/placeholders/${name}.svg`;
/** Real animated banners rendered by scripts/banners: smooth MP4 + a sharp poster still (GIFs are for uploading via admin). */
const real = (name: string) => `/banners/${name}.mp4`;
const poster = (name: string) => `/banners/${name}.poster.webp`;
const tile = (name: string, link: string, alt: string, extra: Partial<Tile> = {}): Tile => ({ image: ph(name), link, alt, ...extra });
/** A tile backed by a rendered banner (scripts/banners): MP4 + poster. */
const art = (name: string, link: string, alt: string): Tile => ({ image: real(name), poster: poster(name), link, alt });

const R = (w: number, h: number): Ratio => ({ w, h });

/** Recommended upload sizes per section role — also shown in the admin builder. */
export const RATIO_PRESETS: { label: string; ratio: Ratio; size: string }[] = [
  { label: 'Hero desktop (16:5)',  ratio: R(16, 5), size: '1920 × 600' },
  { label: 'Hero mobile (1:1)',    ratio: R(1, 1),  size: '1080 × 1080' },
  { label: 'Strip desktop (25:1)', ratio: R(25, 1), size: '2000 × 80' },
  { label: 'Strip mobile (10:1)',  ratio: R(10, 1), size: '1080 × 108' },
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

const catArt = (slug: string, name: string, alt: string) => art(`cat-${slug}`, `/products?category=${encodeURIComponent(name)}`, alt);
const concern = (slug: string, label: string, q: string) => art(`concern-${slug}`, `/products?q=${encodeURIComponent(q)}`, label);

export const DEFAULT_SECTIONS: Seed[] = [
  section('hero', 'Hero', { ratio: R(16, 5), mobileRatio: R(1, 1), autoplayMs: 6000 }, [
    { image: real('hero-1-desktop'), poster: poster('hero-1-desktop'), mobileImage: real('hero-1-mobile'), mobilePoster: poster('hero-1-mobile'), link: '/products?brand=KODOMO', alt: 'Kodomo baby care: gentle care for little ones' },
    { image: real('hero-5-desktop'), poster: poster('hero-5-desktop'), mobileImage: real('hero-5-mobile'), mobilePoster: poster('hero-5-mobile'), link: '/products?brand=FENNEL&category=Skin%20Care', alt: 'Fennel skincare: glow made simple, best price in Bangladesh guaranteed' },
    { image: real('hero-2-desktop'), poster: poster('hero-2-desktop'), mobileImage: real('hero-2-mobile'), mobilePoster: poster('hero-2-mobile'), link: '/products?brand=FENNEL&category=Makeup', alt: 'Fennel makeup: find your colour, best price in Bangladesh guaranteed' },
    { image: real('hero-6-desktop'), poster: poster('hero-6-desktop'), mobileImage: real('hero-6-mobile'), mobilePoster: poster('hero-6-mobile'), link: '/products?brand=FENNEL&category=Makeup', alt: 'Fennel makeup: colour with attitude, best price in Bangladesh guaranteed' },
    { image: real('hero-3-desktop'), poster: poster('hero-3-desktop'), mobileImage: real('hero-3-mobile'), mobilePoster: poster('hero-3-mobile'), link: '/products?brand=FENNEL&category=Skin%20Care', alt: 'Fennel skincare: serums and face washes, best price in Bangladesh guaranteed' },
    { image: real('hero-7-desktop'), poster: poster('hero-7-desktop'), mobileImage: real('hero-7-mobile'), mobilePoster: poster('hero-7-mobile'), link: '/products', alt: 'Authentic Fennel and Kodomo beauty, delivered across Bangladesh, best price guaranteed' },
    { image: real('hero-4-desktop'), poster: poster('hero-4-desktop'), mobileImage: real('hero-4-mobile'), mobilePoster: poster('hero-4-mobile'), link: '/products', alt: 'Authentic beauty, delivered across Bangladesh' },
  ]),
  section('strip', 'Promise strip', { ticker: ['Best price in Bangladesh, guaranteed', '100% authentic', 'Cash on delivery', 'Nationwide delivery'], viewAllLink: '/products' }),
  section('image-grid', 'Shop our favourites', { ratio: R(1, 1), cols: { mobile: 2, tablet: 4, desktop: 4 }, mobileLayout: 'grid', accent: '#A41B15' }, [
    { image: real('fav-mascara'), poster: poster('fav-mascara'), link: '/product/fennel-volume-express-mascara-4681586', alt: 'Fennel Volume Express Mascara, best price in Bangladesh guaranteed' },
    { image: real('fav-powder'), poster: poster('fav-powder'), link: '/product/fennel-loose-rice-powder-2489019', alt: 'Fennel Loose Rice Powder, best price in Bangladesh guaranteed' },
    { image: real('fav-lipstick'), poster: poster('fav-lipstick'), link: '/product/fennel-matte-lipstick-6708026', alt: 'Fennel Matte Lipstick, best price in Bangladesh guaranteed' },
    { image: real('fav-bbcream'), poster: poster('fav-bbcream'), link: '/product/fennel-bb-cream-spf-35-0303543', alt: 'Fennel BB Cream SPF 35, best price in Bangladesh guaranteed' },
  ]),
  section('image-grid', 'Top brands and offers', { ratio: R(2, 1), cols: { mobile: 1, tablet: 2, desktop: 3 }, mobileLayout: 'scroll', accent: '#3B0D2E' },
    [
      art('brand-1', '/products?brand=KODOMO', 'Kodomo baby care: gentle care for little ones'),
      art('brand-2', '/products?brand=FENNEL&category=Makeup', 'Fennel makeup: colour, best price in Bangladesh guaranteed'),
      art('brand-3', '/products?brand=FENNEL&category=Skin%20Care', 'Fennel skincare: serums and face washes, best price in Bangladesh guaranteed'),
      art('brand-4', '/products?brand=GDM', 'GDM skin and hair care'),
      art('brand-5', '/products?brand=KIDLON', 'Kidlon baby essentials and gift sets'),
      art('brand-6', '/products?brand=MISTINE', 'Mistine Acne Clear facial foam'),
    ]),
  section('product-rail', 'Flash sale', { source: 'trending', limit: 12, viewAllLink: '/offers', countdownTo: null, accent: '#A41B15' }, [], 'Grab them before the timer runs out'),
  section('image-grid', 'Limited time offers', { ratio: R(5, 2), cols: { mobile: 2, tablet: 4, desktop: 4 }, mobileLayout: 'grid', accent: '#D8B26E' }, [
    // Art is deliberately neutral (no deal mechanics): "Gift sets", "Combos", "Offers", "New in". Names keep the old file ids.
    art('offer-bogo', '/products?q=gift', 'Gift sets'),
    art('offer-combo', '/products?q=combo', 'Combos'),
    art('offer-offers', '/offers', 'Current offers, best price in Bangladesh guaranteed'),
    art('offer-clearance', '/products', 'New in, best price in Bangladesh guaranteed'),
  ]),
  section('image-grid', 'Shop by category', { ratio: R(3, 2), cols: { mobile: 2, tablet: 3, desktop: 3 }, mobileLayout: 'grid', accent: '#A41B15' }, [
    // The six real catalogue categories. K-Beauty, Fragrance and Tools have no products yet, so no tiles (placeholders cat-k-beauty/-fragrance/-tools remain on disk).
    catArt('makeup', 'Makeup', 'Makeup'), catArt('skin', 'Skin Care', 'Skin care'), catArt('hair', 'Hair Care', 'Hair care'),
    catArt('bath-body', 'Bath & Body', 'Bath and body'), catArt('mom-baby', 'Baby & Kids Care', 'Mom and baby'), catArt('personal-care', 'Personal Care', 'Personal care'),
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
  section('trust-badges', 'Why DealHobe', {}),
];

/** Defaults with stable fake ids, for rendering before anything is saved. */
export const defaultSections = (): HomeSection[] =>
  DEFAULT_SECTIONS.map((s, i) => ({ ...s, _id: `default-${i}`, order: i }));

export const DEFAULT_STOREFRONT: Storefront = {
  navPills: [
    { label: 'Makeup',        link: '/products?category=Makeup',                color: '#A41B15' },
    { label: 'Skin Care',     link: '/products?category=Skin%20Care',           color: '#AD1457' },
    { label: 'Hair Care',     link: '/products?category=Hair%20Care',           color: '#6A1B9A' },
    { label: 'Bath & Body',   link: '/products?category=Bath%20%26%20Body',     color: '#00695C' },
    { label: 'Personal Care', link: '/products?category=Personal%20Care',       color: '#1259AB' },
    { label: 'Mom & Baby',    link: '/products?category=Baby%20%26%20Kids%20Care', color: '#B83E00' },
    { label: 'Serums',        link: '/products?q=serum',                        color: '#7E2F66' },
    { label: 'Lipsticks',     link: '/products?q=lipstick',                     color: '#AD1457' },
    { label: 'Sunscreen',     link: '/products?q=sunscreen',                    color: '#F9A825' },
    { label: 'Body Lotion',   link: '/products?q=lotion',                       color: '#256B29' },
    { label: 'Offers',        link: '/offers',                                  color: '#9A5B12' },
    { label: 'New In',        link: '/products',                                color: '#006A73' },
    { label: 'Beauty Blog',   link: '/blogs',                                   color: '#3B0D2E' },
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
  searchPlaceholders: [
    'matte lipstick', 'niacinamide serum', 'sunscreen SPF 50', 'vitamin C serum', 'Korean skincare',
    'hair oil', 'body lotion', 'blush on', 'face wash', 'Fennel',
  ],
};
