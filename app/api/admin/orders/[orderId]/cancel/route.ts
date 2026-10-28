import { revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/mongodb";
import Order from "@/lib/models/Order";
import { moveStock } from "@/lib/stock";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> },
) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { orderId } = await params;
  await connectDB();

  const order = await Order.findOne({ orderNumber: orderId });
  if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });

  if (order.status === "Cancelled") {
    return NextResponse.json({ error: "Order is already cancelled." }, { status: 400 });
  }

  // Atomic flip guards against a double cancel returning stock twice.
  const flipped = await Order.findOneAndUpdate(
    { orderNumber: orderId, status: { $ne: "Cancelled" } },
    { $set: { status: "Cancelled" } },
  ).lean();
  if (!flipped) return NextResponse.json({ error: "Order is already cancelled." }, { status: 400 });

  await moveStock(order.items, 1);

  revalidateTag('products', { expire: 0 });
  revalidateTag('orders', { expire: 0 });

  return NextResponse.json({ success: true });
}
