import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/mongodb";
import Order from "@/lib/models/Order";
import { moveStock } from "@/lib/stock";

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

  const current = await Order.findOne({ orderNumber: orderId }).lean();
  if (!current) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  // Keep stock in step with cancellations: cancelling returns it, re-opening takes it again.
  const wasCancelled = current.status === "Cancelled";
  const willCancel = status === "Cancelled";
  if (wasCancelled && !willCancel) {
    const ok = await moveStock(current.items as any[], -1);
    if (!ok) {
      return NextResponse.json({ error: "Not enough stock to re-open this order." }, { status: 409 });
    }
  }

  const updated = await Order.findOneAndUpdate(
    { orderNumber: orderId, status: current.status },
    { $set: { status } },
    { new: true },
  ).lean();
  if (!updated) {
    if (wasCancelled && !willCancel) await moveStock(current.items as any[], 1); // undo the re-open deduction
    return NextResponse.json({ error: "Order changed, please retry." }, { status: 409 });
  }
  if (!wasCancelled && willCancel) {
    await moveStock(current.items as any[], 1);
  }

  return NextResponse.json({ success: true, status: updated.status });
}
