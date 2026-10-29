import { ImageResponse } from 'next/og';
import { DefaultCard, OG_SIZE } from '@/lib/og/cards';
import { ogFonts } from '@/lib/og/fonts';
import { heroPack, logoMark, logoWord } from '@/lib/og/assets';

export const alt = 'DealHobe — premium cosmetics, real beauty. Authentic Fennel, Kodomo and more, delivered across Bangladesh.';
export const size = OG_SIZE;
export const contentType = 'image/png';

// The site-wide share image: used by the homepage and every page that does not have its own.
export default async function Image() {
  const p = heroPack();
  const [fonts, mark, word, babyPowder, serum, lipstick, shampoo, blush] = await Promise.all([ogFonts(), logoMark(), logoWord(), p.babyPowder, p.serum, p.lipstick, p.shampoo, p.blush]);
  return new ImageResponse(<DefaultCard mark={mark} word={word} packs={{ babyPowder, serum, lipstick, shampoo, blush }} />, { ...size, fonts });
}
