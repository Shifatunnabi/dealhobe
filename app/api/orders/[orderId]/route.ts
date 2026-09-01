import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Order from "@/lib/models/Order";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ orderId: string }> }) {
  await connectDB();
  const { orderId } = await params;

  const order = await Order.findOne({ orderNumber: orderId }).lean();
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  return NextResponse.json(order);
}
