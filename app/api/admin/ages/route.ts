import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { revalidatePath, revalidateTag } from 'next/cache';
import connectDB from '@/lib/mongodb';
import AgeRange from '@/lib/models/AgeRange';
import { deleteImage } from '@/lib/cloudinary';

export async function GET() {
  await connectDB();
  const ages = await AgeRange.find().sort({ order: 1, createdAt: -1 });
  return NextResponse.json(ages);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const body = await req.json();
  const age  = await AgeRange.create(body);
  revalidateTag('ages', {});
  revalidatePath('/');
  revalidatePath('/products');
  return NextResponse.json(age, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const { id, ...data } = await req.json();
  const updated = await AgeRange.findByIdAndUpdate(id, data, { new: true });
  revalidateTag('ages', {});
  revalidatePath('/');
  revalidatePath('/products');
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const { id } = await req.json();
  const age = await AgeRange.findByIdAndDelete(id);
  if (age?.imagePublicId) await deleteImage(age.imagePublicId);
  revalidateTag('ages', {});
  revalidatePath('/');
  revalidatePath('/products');
  return NextResponse.json({ success: true });
}
