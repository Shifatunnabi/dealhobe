import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/mongodb";
import Order from "@/lib/models/Order";
import { getStatusByConsignmentId, mapSteadfastStatus } from "@/lib/steadfast";

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

  if (!order.steadfastConsignmentId) {
    return NextResponse.json({ error: "Order has not been sent to Steadfast." }, { status: 400 });
  }

  const deliveryStatus = await getStatusByConsignmentId(String(order.steadfastConsignmentId));
  const mappedStatus = mapSteadfastStatus(deliveryStatus);

  const update: Record<string, unknown> = { steadfastStatus: deliveryStatus };
  if (mappedStatus) update.status = mappedStatus;

  await Order.updateOne({ orderNumber: orderId }, { $set: update });

  return NextResponse.json({
    steadfastStatus: deliveryStatus,
    orderStatus: mappedStatus ?? order.status,
  });
}
