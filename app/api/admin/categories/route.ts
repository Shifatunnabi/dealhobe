import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { revalidatePath, revalidateTag } from 'next/cache';
import connectDB from '@/lib/mongodb';
import { parseOrders, applyOrders } from '@/lib/reorder';
import Category from '@/lib/models/Category';
import SubCategory from '@/lib/models/SubCategory';
import { deleteImage } from '@/lib/cloudinary';
import { notifyLiveSite } from '@/lib/revalidate-live';

export async function GET(req: NextRequest) {
  await connectDB();
  // ?visible=1 is what the storefront uses: hidden categories are left out.
  const visibleOnly = req.nextUrl.searchParams.get('visible') === '1';
  const categories = await Category.find(visibleOnly ? { isHidden: { $ne: true } } : {}).sort({ order: 1, createdAt: -1 });
  return NextResponse.json(categories);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const body     = await req.json();
  const category = await Category.create(body);
  revalidateTag('categories', { expire: 0 });
  void notifyLiveSite('categories');
  revalidatePath('/');
  revalidatePath('/products');
  return NextResponse.json(category, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const { id, ...data } = await req.json();
  const updated = await Category.findByIdAndUpdate(id, data, { new: true });
  revalidateTag('categories', { expire: 0 });
  void notifyLiveSite('categories');
  revalidatePath('/');
  revalidatePath('/products');
  return NextResponse.json(updated);
}

/** Drag-to-reorder: saves the whole new order in one request. */
export async function PATCH(req: NextRequest) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const orders = parseOrders(await req.json().catch(() => null));
  if (!orders) return NextResponse.json({ error: 'Invalid order payload' }, { status: 400 });

  await connectDB();
  await applyOrders(Category, orders);
  revalidateTag('categories', { expire: 0 });
  void notifyLiveSite('categories');
  revalidatePath('/');
  revalidatePath('/products');
  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const { id }     = await req.json();
  const category   = await Category.findByIdAndDelete(id);
  if (category?.imagePublicId) await deleteImage(category.imagePublicId);
  await SubCategory.deleteMany({ category: id });
  revalidateTag('categories', { expire: 0 });
  void notifyLiveSite('categories');
  revalidatePath('/');
  revalidatePath('/products');
  return NextResponse.json({ success: true });
}
