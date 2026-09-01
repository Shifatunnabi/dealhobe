import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/mongodb";
import Order, { type OrderStatus } from "@/lib/models/Order";
import { bulkCreateConsignments } from "@/lib/steadfast";

export async function POST(req: NextRequest) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { orderNumbers } = await req.json();
  if (!Array.isArray(orderNumbers) || orderNumbers.length === 0) {
    return NextResponse.json({ error: "No order numbers provided." }, { status: 400 });
  }

  await connectDB();

  // Exclude already-sent orders (field missing OR null)
  const orders = await Order.find({
    orderNumber: { $in: orderNumbers },
    $or: [
      { steadfastConsignmentId: { $exists: false } },
      { steadfastConsignmentId: null },
    ],
  });

  if (orders.length === 0) {
    return NextResponse.json({ error: "No eligible orders found (already sent or not found)." }, { status: 400 });
  }

  const payloads = orders.map((order) => ({
    invoice: order.orderNumber,
    recipient_name: order.delivery.fullName,
    recipient_phone: order.delivery.phone,
    recipient_address: order.delivery.address,
    cod_amount: order.total,
    item_description: order.items.map((i) => `${i.name} x${i.qty}`).join(", "),
  }));

  const results = await bulkCreateConsignments(payloads);

  const bulkOps = results
    .filter((r) => r.result)
    .map((r) => ({
      updateOne: {
        filter: { orderNumber: r.invoice },
        update: {
          $set: {
            steadfastConsignmentId: String(r.result!.consignment_id),
            steadfastTrackingCode: r.result!.tracking_code,
            steadfastStatus: r.result!.status,
            steadfastSentAt: new Date(),
            status: "Processing" as OrderStatus,
          },
        },
      },
    }));

  if (bulkOps.length > 0) await Order.bulkWrite(bulkOps);

  return NextResponse.json({
    sent: bulkOps.length,
    failed: results.length - bulkOps.length,
    results: results.map((r) => ({
      invoice: r.invoice,
      success: !!r.result,
      trackingCode: r.result?.tracking_code,
    })),
  });
}
