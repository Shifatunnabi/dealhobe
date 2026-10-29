// Brand fonts for generated share images (next/og). Latin-only static instances of Fraunces and Plus Jakarta Sans:
// Satori cannot use variable fonts, and the Bengali taka sign is not in either font, so prices read "Tk 635".

import { readOgFile } from './read';

type OgFont = { name: string; data: ArrayBuffer; weight: 500 | 600 | 700; style: 'normal' };

let cache: Promise<OgFont[]> | null = null;

const load = async (rel: string): Promise<ArrayBuffer> => { const b = await readOgFile(rel); return b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength) as ArrayBuffer; };

export function ogFonts(): Promise<OgFont[]> {
  cache ??= Promise.all([
    load('fonts/Fraunces-Bold.ttf'),
    load('fonts/Fraunces-SemiBold.ttf'),
    load('fonts/PlusJakartaSans-Bold.ttf'),
    load('fonts/PlusJakartaSans-Medium.ttf'),
  ]).then(([frB, frS, jkB, jkM]) => [
    { name: 'Fraunces', data: frB, weight: 700, style: 'normal' },
    { name: 'Fraunces', data: frS, weight: 600, style: 'normal' },
    { name: 'Jakarta', data: jkB, weight: 700, style: 'normal' },
    { name: 'Jakarta', data: jkM, weight: 500, style: 'normal' },
  ]);
  return cache;
}
