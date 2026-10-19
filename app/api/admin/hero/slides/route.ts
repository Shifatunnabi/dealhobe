import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { revalidatePath, revalidateTag } from 'next/cache';
import connectDB from '@/lib/mongodb';
import { parseOrders, applyOrders } from '@/lib/reorder';
import HeroSlide from '@/lib/models/HeroSlide';
import { deleteImage } from '@/lib/cloudinary';
import { notifyLiveSite } from '@/lib/revalidate-live';

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
  revalidateTag('hero', { expire: 0 });
  void notifyLiveSite('hero');
  revalidatePath('/');
  return NextResponse.json(slide, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const { id, ...data } = await req.json();
  // Replacing or removing the mobile photo: clean up the old Cloudinary asset.
  const before = await HeroSlide.findById(id).select('mobileImagePublicId');
  const updated = await HeroSlide.findByIdAndUpdate(id, data, { new: true });
  const oldMobileId = before?.mobileImagePublicId;
  if (oldMobileId && 'mobileImagePublicId' in data && data.mobileImagePublicId !== oldMobileId) await deleteImage(oldMobileId);
  revalidateTag('hero', { expire: 0 });
  void notifyLiveSite('hero');
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
  await applyOrders(HeroSlide, orders);
  revalidateTag('hero', { expire: 0 });
  void notifyLiveSite('hero');
  revalidatePath('/');
  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const { id }   = await req.json();
  const slide    = await HeroSlide.findByIdAndDelete(id);
  if (slide?.imagePublicId) await deleteImage(slide.imagePublicId);
  if (slide?.mobileImagePublicId) await deleteImage(slide.mobileImagePublicId);
  revalidateTag('hero', { expire: 0 });
  void notifyLiveSite('hero');
  revalidatePath('/');
  return NextResponse.json({ success: true });
}
