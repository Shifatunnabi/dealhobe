import { ImageResponse } from 'next/og';
import { getBrands, getProduct } from '@/lib/data';
import { getProductCoverImage } from '@/lib/product-images';
import { ProductCardOg, OG_SIZE } from '@/lib/og/cards';
import { ogFonts } from '@/lib/og/fonts';
import { logoMark, logoWord, remoteImage } from '@/lib/og/assets';
import DefaultImage from '@/app/opengraph-image';

export const alt = 'DealHobe product';
export const size = OG_SIZE;
export const contentType = 'image/png';
export const revalidate = 3600;   // rendered on demand, then cached for an hour

const tk = (n: number) => `Tk ${Math.round(n).toLocaleString('en-US')}`;

// One share card per product: photo, brand, name and the shopper's price (lowest variant price, offers excluded —
// social previews are cached, so the card shows the regular listed price range rather than a time-limited discount).
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return DefaultImage();

  const brands = await getBrands();
  const isId = /^[a-f0-9]{24}$/i.test(String(product.brand ?? ''));
  const brand = product.brand ? (isId ? brands.find((b) => b._id === product.brand)?.name : product.brand) : undefined;
  const variants = product.hasVariants ? product.variants ?? [] : [];
  const pay = (v: { price: number; salePrice?: number }) => (v.salePrice && v.salePrice < v.price ? v.salePrice : v.price);
  const prices = variants.length ? variants.map(pay) : [pay(product)];
  const low = Math.min(...prices);
  const regular = variants.length ? Math.min(...variants.map((v) => v.price)) : product.price;

  const [fonts, mark, word, photo] = await Promise.all([
    ogFonts(), logoMark(), logoWord(), remoteImage(getProductCoverImage(product as Parameters<typeof getProductCoverImage>[0]) || product.images?.[0], 540),
  ]);
  return new ImageResponse(
    <ProductCardOg mark={mark} word={word} photo={photo} brand={brand} name={product.name}
      price={`${variants.length && Math.max(...prices) !== low ? 'From ' : ''}${tk(low)}`} was={regular > low ? tk(regular) : undefined}
      note="100% authentic · Cash on delivery across Bangladesh" />,
    { ...size, fonts },
  );
}
