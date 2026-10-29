import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { revalidatePath, revalidateTag } from 'next/cache';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import { parseOrders, applyOrders } from '@/lib/reorder';
import HomeSection from '@/lib/models/HomeSection';
import { deleteAsset } from '@/lib/cloudinary';
import { notifyLiveSite } from '@/lib/revalidate-live';
import { DEFAULT_SECTIONS } from '@/lib/homepage/defaults';
import { sanitizeSection } from '@/lib/homepage/sanitize';
import type { Tile } from '@/lib/homepage/types';

function refresh() {
  revalidateTag('homepage', { expire: 0 });
  void notifyLiveSite('homepage');
  revalidatePath('/');
}

/** Cloudinary ids a tile list owns (placeholders and seed files have none). */
const publicIds = (tiles: Tile[] = []) =>
  tiles.flatMap((t) => [t.imagePublicId, t.mobileImagePublicId]).filter((id): id is string => !!id);

async function deleteOrphans(before: Tile[], after: Tile[]) {
  const keep = new Set(publicIds(after));
  await Promise.all(publicIds(before).filter((id) => !keep.has(id)).map((id) => deleteAsset(id).catch(() => undefined)));
}

export async function GET() {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const sections = await HomeSection.find().sort({ order: 1, createdAt: 1 }).lean();
  return NextResponse.json(sections);
}

/** Create a section, or `{ action: 'seed-defaults' }` to load the starter layout into an empty builder. */
export async function POST(req: NextRequest) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const body = await req.json().catch(() => null);

  if (body?.action === 'seed-defaults') {
    if (await HomeSection.countDocuments()) {
      return NextResponse.json({ error: 'The builder already has sections' }, { status: 409 });
    }
    await HomeSection.insertMany(DEFAULT_SECTIONS.map((s, order) => ({ ...s, order })));
    refresh();
    return NextResponse.json(await HomeSection.find().sort({ order: 1 }).lean(), { status: 201 });
  }

  const data = sanitizeSection(body);
  if (!data) return NextResponse.json({ error: 'Invalid section' }, { status: 400 });
  const last = await HomeSection.findOne().sort({ order: -1 }).select('order').lean();
  const section = await HomeSection.create({ ...data, order: (last?.order ?? -1) + 1 });
  refresh();
  return NextResponse.json(section, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const body = await req.json().catch(() => null);
  const data = sanitizeSection(body);
  if (!data || !mongoose.isValidObjectId(body?._id)) return NextResponse.json({ error: 'Invalid section' }, { status: 400 });

  const before = await HomeSection.findById(body._id).lean();
  if (!before) return NextResponse.json({ error: 'Section not found' }, { status: 404 });
  const updated = await HomeSection.findByIdAndUpdate(body._id, { $set: data }, { new: true });
  await deleteOrphans(before.tiles, data.tiles);
  refresh();
  return NextResponse.json(updated);
}

/** Drag-to-reorder: saves the whole new order in one request. */
export async function PATCH(req: NextRequest) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const orders = parseOrders(await req.json().catch(() => null));
  if (!orders) return NextResponse.json({ error: 'Invalid order payload' }, { status: 400 });

  await connectDB();
  await applyOrders(HomeSection, orders);
  refresh();
  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const { id } = await req.json().catch(() => ({}));
  if (!mongoose.isValidObjectId(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  const section = await HomeSection.findByIdAndDelete(id).lean();
  if (section) await deleteOrphans(section.tiles, []);
  refresh();
  return NextResponse.json({ success: true });
}
