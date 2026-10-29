// Small brand images embedded in generated share images, read once and cached as data URIs.
import { readOgFile } from './read';

const cache = new Map<string, Promise<string>>();

function dataUri(key: string, rel: string): Promise<string> {
  let hit = cache.get(key);
  if (!hit) {
    hit = readOgFile(rel).then((b) => `data:image/png;base64,${b.toString('base64')}`);
    cache.set(key, hit);
  }
  return hit;
}

export const logoMark = () => dataUri('mark', 'assets/mark.png');
export const logoWord = () => dataUri('word', 'assets/word.png');
export const heroPack = () => ({
  babyPowder: dataUri('powder', 'assets/baby-powder.png'),
  serum: dataUri('serum', 'assets/serum.png'),
  lipstick: dataUri('lipstick', 'assets/lipstick.png'),
  shampoo: dataUri('shampoo', 'assets/shampoo.png'),
  blush: dataUri('blush', 'assets/blush.png'),
});

/** Fetches a remote image as a data URI for embedding (Cloudinary photos are re-cut to a PNG that fits the card). */
export async function remoteImage(url: string | undefined, box = 560): Promise<string | null> {
  if (!url) return null;
  const m = /^(https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/)(.+)$/.exec(url);
  const src = m ? `${m[1]}c_fit,w_${box * 2},h_${box * 2},f_png,q_auto/${m[2]}` : url;
  try {
    const res = await fetch(src, { signal: AbortSignal.timeout(6000) });
    if (!res.ok) return null;
    const type = res.headers.get('content-type') ?? 'image/png';
    if (!/^image\/(png|jpe?g|gif)/.test(type)) return null;   // Satori cannot render webp/avif
    return `data:${type};base64,${Buffer.from(await res.arrayBuffer()).toString('base64')}`;
  } catch {
    return null;
  }
}
