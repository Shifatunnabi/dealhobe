import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { revalidatePath, revalidateTag } from 'next/cache';
import connectDB from '@/lib/mongodb';
import HeroSlide from '@/lib/models/HeroSlide';
import { deleteImage } from '@/lib/cloudinary';

export async function GET() {
  await connectDB();
  const slides = await HeroSlide.find().sort({ order: 1, createdAt: -1 });
  return NextResponse.json(slides);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const body  = await req.json();
  const slide = await HeroSlide.create(body);
  revalidateTag('hero', {});
  revalidatePath('/');
  return NextResponse.json(slide, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const { id, ...data } = await req.json();
  const updated = await HeroSlide.findByIdAndUpdate(id, data, { new: true });
  revalidateTag('hero', {});
  revalidatePath('/');
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const { id }   = await req.json();
  const slide    = await HeroSlide.findByIdAndDelete(id);
  if (slide?.imagePublicId) await deleteImage(slide.imagePublicId);
  revalidateTag('hero', {});
  revalidatePath('/');
  return NextResponse.json({ success: true });
}
