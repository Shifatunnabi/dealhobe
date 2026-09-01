import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { revalidatePath, revalidateTag } from 'next/cache';
import connectDB from '@/lib/mongodb';
import Review from '@/lib/models/Review';

export async function GET() {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const reviews = await Review.find().sort({ createdAt: -1 });
  return NextResponse.json(reviews);
}

export async function POST(req: NextRequest) {
  // Public: customers submit reviews
  await connectDB();
  const body   = await req.json();
  const review = await Review.create(body);
  return NextResponse.json(review, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const { id, ...data } = await req.json();
  const updated = await Review.findByIdAndUpdate(id, data, { new: true });
  revalidateTag('reviews', {});
  revalidatePath('/');
  revalidatePath('/product/[slug]', 'page');
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const { id } = await req.json();
  await Review.findByIdAndDelete(id);
  revalidateTag('reviews', {});
  revalidatePath('/');
  revalidatePath('/product/[slug]', 'page');
  return NextResponse.json({ success: true });
}
