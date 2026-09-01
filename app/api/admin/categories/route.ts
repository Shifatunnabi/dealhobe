import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { revalidatePath, revalidateTag } from 'next/cache';
import connectDB from '@/lib/mongodb';
import Category from '@/lib/models/Category';
import { deleteImage } from '@/lib/cloudinary';

export async function GET() {
  await connectDB();
  const categories = await Category.find().sort({ order: 1, createdAt: -1 });
  return NextResponse.json(categories);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const body     = await req.json();
  const category = await Category.create(body);
  revalidateTag('categories', {});
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
  revalidateTag('categories', {});
  revalidatePath('/');
  revalidatePath('/products');
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const { id }     = await req.json();
  const category   = await Category.findByIdAndDelete(id);
  if (category?.imagePublicId) await deleteImage(category.imagePublicId);
  revalidateTag('categories', {});
  revalidatePath('/');
  revalidatePath('/products');
  return NextResponse.json({ success: true });
}
