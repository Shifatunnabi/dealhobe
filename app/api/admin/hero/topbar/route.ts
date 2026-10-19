import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongodb';
import { parseOrders, applyOrders } from '@/lib/reorder';
import TopBarText from '@/lib/models/TopBarText';

export async function GET() {
  await connectDB();
  const texts = await TopBarText.find({ isActive: true }).sort({ order: 1 });
  return NextResponse.json(texts);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const body = await req.json();
  const text = await TopBarText.create(body);
  return NextResponse.json(text, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const { id, ...data } = await req.json();
  const updated = await TopBarText.findByIdAndUpdate(id, data, { new: true });
  return NextResponse.json(updated);
}

/** Drag-to-reorder: saves the whole new order in one request. */
export async function PATCH(req: NextRequest) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const orders = parseOrders(await req.json().catch(() => null));
  if (!orders) return NextResponse.json({ error: 'Invalid order payload' }, { status: 400 });

  await connectDB();
  await applyOrders(TopBarText, orders);
  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const { id } = await req.json();
  await TopBarText.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}
