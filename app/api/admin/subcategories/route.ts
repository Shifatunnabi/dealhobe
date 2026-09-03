import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { revalidatePath, revalidateTag } from 'next/cache';
import connectDB from '@/lib/mongodb';
import SubCategory from '@/lib/models/SubCategory';

export async function GET(req: NextRequest) {
  await connectDB();
  const categoryId = req.nextUrl.searchParams.get('category');
  const query = categoryId ? { category: categoryId } : {};
  const subCategories = await SubCategory.find(query).sort({ order: 1, createdAt: -1 });
  return NextResponse.json(subCategories);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const body = await req.json();
  if (!body.name || !body.category) {
    return NextResponse.json({ error: 'Name and category are required' }, { status: 400 });
  }
  const subCategory = await SubCategory.create(body);
  revalidateTag('categories', { expire: 0 });
  revalidatePath('/products');
  revalidatePath('/admin/categories/[id]', 'page');
  return NextResponse.json(subCategory, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const { id, ...data } = await req.json();
  const updated = await SubCategory.findByIdAndUpdate(id, data, { new: true });
  revalidateTag('categories', { expire: 0 });
  revalidatePath('/products');
  revalidatePath('/admin/categories/[id]', 'page');
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const { id } = await req.json();
  await SubCategory.findByIdAndDelete(id);
  revalidateTag('categories', { expire: 0 });
  revalidatePath('/products');
  revalidatePath('/admin/categories/[id]', 'page');
  return NextResponse.json({ success: true });
}
