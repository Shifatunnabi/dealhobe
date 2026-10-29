import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { revalidatePath, revalidateTag } from 'next/cache';
import connectDB from '@/lib/mongodb';
import Settings from '@/lib/models/Settings';
import { notifyLiveSite } from '@/lib/revalidate-live';
import { DEFAULT_STOREFRONT } from '@/lib/homepage/defaults';
import { sanitizeStorefront } from '@/lib/homepage/sanitize';

const SETTINGS_KEY = 'global';

export async function GET() {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const doc = await Settings.findOne({ key: SETTINGS_KEY }).lean();
  const saved = doc?.storefront ?? {};
  return NextResponse.json({ ...DEFAULT_STOREFRONT, ...saved });
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== 'object' || Array.isArray(body) || !Array.isArray(body.navPills) || !Array.isArray(body.trustBadges)) {
    return NextResponse.json({ error: 'Invalid storefront payload' }, { status: 400 });
  }
  const storefront = sanitizeStorefront(body);
  await Settings.findOneAndUpdate({ key: SETTINGS_KEY }, { $set: { storefront } }, { upsert: true });
  revalidateTag('settings', { expire: 0 });
  void notifyLiveSite('settings');
  revalidatePath('/', 'layout');
  return NextResponse.json(storefront);
}
