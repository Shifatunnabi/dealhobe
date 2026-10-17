/**
 * Tell the LIVE site to drop its cached copy after an admin change made somewhere else (e.g. localhost).
 *
 * revalidateTag/revalidatePath only clear the cache of the server that runs them, so a save made on localhost
 * never reaches the production cache. This posts to the live site's /api/revalidate webhook instead.
 *
 * Local .env.local:  LIVE_SITE_URL=https://your-live-site.com   REVALIDATE_SECRET=<same value as on the live site>
 * On the live site itself leave LIVE_SITE_URL unset - it already clears its own cache.
 */

export type LiveRevalidateType =
  | 'product' | 'listing' | 'categories' | 'ages' | 'brands' | 'offers'
  | 'hero' | 'reviews' | 'tips' | 'blogs' | 'all';

export async function notifyLiveSite(type: LiveRevalidateType, slug?: string): Promise<void> {
  const base = (process.env.LIVE_SITE_URL || '').trim().replace(/\/+$/, '');
  const secret = process.env.REVALIDATE_SECRET;
  if (!base || !secret) return;

  // Never call ourselves (the live site would otherwise loop on its own webhook).
  const self = (process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_SITE_URL || '').trim().replace(/\/+$/, '');
  if (self && self === base) return;

  try {
    const res = await fetch(`${base}/api/revalidate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret, type, ...(slug ? { slug } : {}) }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) console.error(`[revalidate-live] ${type} -> ${res.status} ${await res.text().catch(() => '')}`);
  } catch (err) {
    console.error(`[revalidate-live] ${type} failed:`, err instanceof Error ? err.message : err);
  }
}
