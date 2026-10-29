import { ImageResponse } from 'next/og';
import { getBlog } from '@/lib/data';
import { PostCardOg, OG_SIZE } from '@/lib/og/cards';
import { ogFonts } from '@/lib/og/fonts';
import { logoMark, logoWord, remoteImage } from '@/lib/og/assets';
import DefaultImage from '@/app/opengraph-image';

export const alt = 'DealHobe Beauty Journal article';
export const size = OG_SIZE;
export const contentType = 'image/png';
export const revalidate = 3600;   // rendered on demand, then cached for an hour

// Share card per article: the cover photo under a plum fade, the headline set in Fraunces.
export default async function Image({ params }: { params: Promise<{ blogId: string }> }) {
  const { blogId } = await params;
  const blog = await getBlog(blogId).catch(() => null);
  if (!blog) return DefaultImage();
  const [fonts, mark, word, cover] = await Promise.all([ogFonts(), logoMark(), logoWord(), remoteImage(blog.imageUrl, 1200)]);
  return new ImageResponse(<PostCardOg mark={mark} word={word} cover={cover} title={blog.title} label={blog.category || 'Beauty Journal'} />, { ...size, fonts });
}
