import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { revalidatePath, revalidateTag } from 'next/cache';
import connectDB from '@/lib/mongodb';
import { parseOrders, applyOrders } from '@/lib/reorder';
import Brand from '@/lib/models/Brand';
import { deleteImage } from '@/lib/cloudinary';
import { notifyLiveSite } from '@/lib/revalidate-live';

export async function GET() {
  await connectDB();
  const brands = await Brand.find().sort({ order: 1, createdAt: -1 });
  return NextResponse.json(brands);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const body  = await req.json();
  const brand = await Brand.create(body);
  revalidateTag('brands', { expire: 0 });
  void notifyLiveSite('brands');
  revalidatePath('/');
  return NextResponse.json(brand, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const { id, ...data } = await req.json();
  const updated = await Brand.findByIdAndUpdate(id, data, { new: true });
  revalidateTag('brands', { expire: 0 });
  void notifyLiveSite('brands');
  revalidatePath('/');
  return NextResponse.json(updated);
}

/** Drag-to-reorder: saves the whole new order in one request. */
export async function PATCH(req: NextRequest) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const orders = parseOrders(await req.json().catch(() => null));
  if (!orders) return NextResponse.json({ error: 'Invalid order payload' }, { status: 400 });

  await connectDB();
  await applyOrders(Brand, orders);
  revalidateTag('brands', { expire: 0 });
  void notifyLiveSite('brands');
  revalidatePath('/');
  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const { id }  = await req.json();
  const brand   = await Brand.findByIdAndDelete(id);
  if (brand?.logoPublicId) await deleteImage(brand.logoPublicId);
  revalidateTag('brands', { expire: 0 });
  void notifyLiveSite('brands');
  revalidatePath('/');
  return NextResponse.json({ success: true });
}
