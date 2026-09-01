import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { revalidatePath, revalidateTag } from 'next/cache';
import connectDB from '@/lib/mongodb';
import Brand from '@/lib/models/Brand';
import { deleteImage } from '@/lib/cloudinary';

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
  revalidateTag('brands', {});
  revalidatePath('/');
  return NextResponse.json(brand, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const { id, ...data } = await req.json();
  const updated = await Brand.findByIdAndUpdate(id, data, { new: true });
  revalidateTag('brands', {});
  revalidatePath('/');
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const { id }  = await req.json();
  const brand   = await Brand.findByIdAndDelete(id);
  if (brand?.logoPublicId) await deleteImage(brand.logoPublicId);
  revalidateTag('brands', {});
  revalidatePath('/');
  return NextResponse.json({ success: true });
}
