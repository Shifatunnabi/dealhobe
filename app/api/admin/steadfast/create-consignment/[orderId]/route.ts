import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/mongodb";
import Order from "@/lib/models/Order";
import { createConsignment } from "@/lib/steadfast";

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

  if (order.steadfastConsignmentId) {
    return NextResponse.json({ error: "Already sent to Steadfast." }, { status: 400 });
  }

  const consignment = await createConsignment({
    invoice: order.orderNumber,
    recipient_name: order.delivery.fullName,
    recipient_phone: order.delivery.phone,
    recipient_address: order.delivery.address,
    cod_amount: order.total,
    item_description: order.items.map((i) => `${i.name} x${i.qty}`).join(", "),
  });

  await Order.updateOne(
    { orderNumber: orderId },
    {
      $set: {
        steadfastConsignmentId: String(consignment.consignment_id),
        steadfastTrackingCode: consignment.tracking_code,
        steadfastStatus: consignment.status,
        steadfastSentAt: new Date(),
        status: "Processing",
      },
    },
  );

  return NextResponse.json({
    consignmentId: consignment.consignment_id,
    trackingCode: consignment.tracking_code,
    steadfastStatus: consignment.status,
  });
}
