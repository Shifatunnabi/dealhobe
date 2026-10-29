// The site-wide generated share card (app/opengraph-image.tsx). A page that defines its own `openGraph` / `twitter`
// metadata replaces the inherited values entirely, so it must list the image again — spread these in.
export const SHARE_IMAGE = {
  url: '/opengraph-image',
  width: 1200,
  height: 630,
  alt: 'DealHobe — premium cosmetics, real beauty. Authentic Fennel, Kodomo and more, delivered across Bangladesh.',
};
export const shareOg = { images: [SHARE_IMAGE] };
export const shareTwitter = { images: [SHARE_IMAGE.url] };
