import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { revalidatePath, revalidateTag } from 'next/cache';
import connectDB from '@/lib/mongodb';
import Offer from '@/lib/models/Offer';
import { deleteImage } from '@/lib/cloudinary';

export async function GET() {
  await connectDB();
  const offers = await Offer.find().sort({ createdAt: -1 });
  return NextResponse.json(offers);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const body = await req.json();
  try {
      const offer = await Offer.create(body);
      revalidateTag('offers', {});
      revalidateTag('products', {});
      revalidatePath('/');
      revalidatePath('/products');
      revalidatePath('/offers');
      return NextResponse.json(offer, { status: 201 });
  } catch(err: any) {
      if (err.code === 11000) return NextResponse.json({ error: 'Offer stub already exists.' }, { status: 400 });
      return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const { id, ...data } = await req.json();
  const updated = await Offer.findByIdAndUpdate(id, data, { new: true });
  revalidateTag('offers', {});
  revalidateTag('products', {});
  revalidatePath('/');
  revalidatePath('/products');
  revalidatePath('/offers');
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const { id } = await req.json();
  const offer = await Offer.findByIdAndDelete(id);
  if (offer && offer.thumbnailPublicId) await deleteImage(offer.thumbnailPublicId);
  revalidateTag('offers', {});
  revalidateTag('products', {});
  revalidatePath('/');
  revalidatePath('/products');
  revalidatePath('/offers');
  return NextResponse.json({ success: true });
}
