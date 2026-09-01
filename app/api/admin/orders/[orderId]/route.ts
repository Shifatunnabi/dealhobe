import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/mongodb";
import Order from "@/lib/models/Order";

const ALLOWED_STATUSES = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"] as const;

type OrderStatus = (typeof ALLOWED_STATUSES)[number];

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> },
) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const { orderId } = await params;
  const body = await req.json();

  const status = String(body?.status || "");
  if (!ALLOWED_STATUSES.includes(status as OrderStatus)) {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }

  const updated = await Order.findOneAndUpdate(
    { orderNumber: orderId },
    { $set: { status } },
    { new: true },
  ).lean();

  if (!updated) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  return NextResponse.json({ success: true, status: updated.status });
}
