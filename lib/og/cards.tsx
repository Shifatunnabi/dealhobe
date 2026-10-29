/* eslint-disable @next/next/no-img-element -- next/og renders plain <img> elements */
import type { ReactNode } from 'react';

// 1200×630 share cards (Open Graph / Twitter large card). Plum + gold + ivory, Fraunces headlines, Plus Jakarta Sans text.

export const OG_SIZE = { width: 1200, height: 630 } as const;

const C = { plum: '#3B0D2E', plumLift: '#531445', gold: '#E9C98C', ivory: '#FFF8F1', red: '#A41B15', ink: '#24121F' };

const Pill = ({ mark, word }: { mark: string; word: string }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 14, height: 72, padding: '0 28px 0 20px', borderRadius: 999, background: '#fff' }}>
    <img src={mark} height={50} style={{ height: 50 }} alt="" />
    <img src={word} height={28} style={{ height: 28 }} alt="" />
  </div>
);

const Frame = ({ children, bg = C.plum }: { children: ReactNode; bg?: string }) => (
  <div style={{ width: '100%', height: '100%', display: 'flex', background: bg, fontFamily: 'Jakarta', color: '#fff', position: 'relative' }}>{children}</div>
);

/** Site-wide card: headline on the left, real product packshots on the right. */
export function DefaultCard({ mark, word, packs }: { mark: string; word: string; packs: { babyPowder: string; serum: string; lipstick: string; shampoo: string; blush: string } }) {
  return (
    <Frame>
      <div style={{ position: 'absolute', right: -120, top: -140, width: 760, height: 760, borderRadius: 999, background: C.plumLift, display: 'flex' }} />
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 92, background: '#2A0821', display: 'flex' }} />
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', width: 620, padding: '0 0 0 72px', position: 'relative' }}>
        <div style={{ display: 'flex' }}><Pill mark={mark} word={word} /></div>
        <div style={{ display: 'flex', fontFamily: 'Fraunces', fontWeight: 700, fontSize: 72, lineHeight: 1.04, marginTop: 40, letterSpacing: -2 }}>Premium cosmetics, real beauty.</div>
        <div style={{ display: 'flex', fontWeight: 500, fontSize: 27, color: C.gold, marginTop: 26, lineHeight: 1.38 }}>Authentic Fennel, Kodomo and more · Cash on delivery across Bangladesh</div>
      </div>
      <div style={{ position: 'absolute', right: 36, bottom: 70, display: 'flex', alignItems: 'flex-end' }}>
        <img src={packs.shampoo} height={262} style={{ height: 262 }} alt="" />
        <img src={packs.babyPowder} height={345} style={{ height: 345, marginLeft: -4 }} alt="" />
        <img src={packs.serum} height={288} style={{ height: 288, marginLeft: -2 }} alt="" />
        <img src={packs.lipstick} height={205} style={{ height: 205, marginLeft: 4 }} alt="" />
      </div>
    </Frame>
  );
}

/** Product card: packshot on white, brand / name / price on plum. */
export function ProductCardOg({ mark, word, photo, brand, name, price, was, note }: { mark: string; word: string; photo: string | null; brand?: string; name: string; price: string; was?: string; note: string }) {
  const long = name.length > 46;
  return (
    <Frame>
      <div style={{ width: 630, height: 630, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        {photo ? <img src={photo} style={{ width: 540, height: 540, objectFit: 'contain' }} alt="" /> : <img src={mark} height={200} style={{ height: 200 }} alt="" />}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', width: 570, height: 630, padding: '52px 56px 52px 56px', position: 'relative' }}>
        <div style={{ display: 'flex' }}><Pill mark={mark} word={word} /></div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {brand ? <div style={{ display: 'flex', fontWeight: 700, fontSize: 24, letterSpacing: 5, color: C.gold, textTransform: 'uppercase', marginBottom: 14 }}>{brand}</div> : null}
          <div style={{ display: 'flex', fontFamily: 'Fraunces', fontWeight: 700, fontSize: long ? 46 : 56, lineHeight: 1.08, letterSpacing: -1, maxHeight: long ? 150 : 180, overflow: 'hidden' }}>{name}</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 18, marginTop: 28 }}>
            <div style={{ display: 'flex', fontWeight: 700, fontSize: 64, color: '#fff' }}>{price}</div>
            {was ? <div style={{ display: 'flex', fontWeight: 500, fontSize: 32, color: '#C9A9BF', textDecoration: 'line-through' }}>{was}</div> : null}
          </div>
        </div>
        <div style={{ display: 'flex', fontWeight: 500, fontSize: 24, color: C.gold }}>{note}</div>
      </div>
    </Frame>
  );
}

/** Article card: cover photo with a plum fade, headline bottom-left. */
export function PostCardOg({ mark, word, cover, title, label }: { mark: string; word: string; cover: string | null; title: string; label: string }) {
  const long = title.length > 60;
  return (
    <Frame>
      {cover ? <img src={cover} style={{ position: 'absolute', left: 0, top: 0, width: 1200, height: 630, objectFit: 'cover' }} alt="" /> : null}
      <div style={{ position: 'absolute', left: 0, top: 0, width: 1200, height: 630, display: 'flex', background: cover ? 'linear-gradient(180deg, rgba(59,13,46,0.35) 0%, rgba(59,13,46,0.72) 40%, rgba(42,8,33,0.97) 78%)' : C.plum }} />
      <div style={{ position: 'absolute', left: 72, top: 56, display: 'flex' }}><Pill mark={mark} word={word} /></div>
      <div style={{ position: 'absolute', left: 72, right: 72, bottom: 64, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', fontWeight: 700, fontSize: 24, letterSpacing: 5, color: C.gold, textTransform: 'uppercase' }}>{label}</div>
        <div style={{ display: 'flex', fontFamily: 'Fraunces', fontWeight: 700, fontSize: long ? 58 : 72, lineHeight: 1.05, letterSpacing: -1.5, marginTop: 18 }}>{title}</div>
      </div>
    </Frame>
  );
}
