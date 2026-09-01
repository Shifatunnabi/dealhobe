import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { revalidatePath, revalidateTag } from 'next/cache';
import connectDB from '@/lib/mongodb';
import ParentingTip from '@/lib/models/ParentingTip';
import { deleteImage } from '@/lib/cloudinary';

export async function GET() {
  await connectDB();
  const tips = await ParentingTip.find().sort({ order: 1, createdAt: -1 });
  return NextResponse.json(tips);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const body = await req.json();
  const tip  = await ParentingTip.create(body);
  revalidateTag('tips', {});
  revalidatePath('/');
  return NextResponse.json(tip, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const { id, ...data } = await req.json();
  const updated = await ParentingTip.findByIdAndUpdate(id, data, { new: true });
  revalidateTag('tips', {});
  revalidatePath('/');
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const { id } = await req.json();
  const tip    = await ParentingTip.findByIdAndDelete(id);
  if (tip?.imagePublicId) await deleteImage(tip.imagePublicId);
  revalidateTag('tips', {});
  revalidatePath('/');
  return NextResponse.json({ success: true });
}
