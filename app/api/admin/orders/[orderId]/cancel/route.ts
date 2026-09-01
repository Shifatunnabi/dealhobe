import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/mongodb";
import Order from "@/lib/models/Order";

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

  await Order.updateOne({ orderNumber: orderId }, { $set: { status: "Cancelled" } });

  return NextResponse.json({ success: true });
}
