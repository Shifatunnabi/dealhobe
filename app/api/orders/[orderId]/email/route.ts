import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/mongodb";
import Order from "@/lib/models/Order";
import { sendReceiptEmail } from "@/lib/email";

export async function POST(req: NextRequest, { params }: { params: Promise<{ orderId: string }> }) {
  const session = await getServerSession();
  if (!session || (session.user as { role?: string })?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const { orderId } = await params;
  const body = await req.json();
  const pdfBase64 = typeof body?.pdfBase64 === "string" ? body.pdfBase64 : "";

  if (!pdfBase64) {
    return NextResponse.json({ error: "Missing receipt data." }, { status: 400 });
  }

  const order = await Order.findOneAndUpdate(
    {
      orderNumber: orderId,
      receiptEmailSentAt: { $exists: false },
      receiptEmailSending: { $ne: true },
    },
    {
      $set: { receiptEmailSending: true },
    },
    { new: true },
  );

  if (!order) {
    const existing = await Order.findOne({ orderNumber: orderId }).lean();
    if (!existing) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (existing.receiptEmailSentAt) {
      return NextResponse.json({ success: true, alreadySent: true });
    }

    return NextResponse.json(
      { success: false, processing: true, message: "Receipt email is already being processed." },
      { status: 202 },
    );
  }

  if (!order.delivery?.email) {
    await Order.updateOne({ _id: order._id }, { $set: { receiptEmailSending: false } });
    return NextResponse.json({ error: "Email not available for this order." }, { status: 400 });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || "";
  const trackingUrl = siteUrl ? `${siteUrl}/orders/${order.orderNumber}` : "";

  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.5;color:#222;">
      <h2 style="margin-bottom:8px;">Thanks for shopping with JoyToy!</h2>
      <p>Your order <strong>${order.orderNumber}</strong> is confirmed.</p>
      ${trackingUrl ? `<p>Track your order: <a href="${trackingUrl}">${trackingUrl}</a></p>` : ""}
      <p>The receipt is attached as a PDF.</p>
    </div>
  `;

  const result = await sendReceiptEmail({
    to: order.delivery.email,
    subject: `JoyToy Receipt ${order.orderNumber}`,
    html,
    pdfBase64,
    filename: `${order.orderNumber}.pdf`,
  });

  if (!result.success) {
    await Order.updateOne({ _id: order._id }, { $set: { receiptEmailSending: false } });
    return NextResponse.json({ error: result.error || "Email failed to send." }, { status: 500 });
  }

  await Order.updateOne(
    { _id: order._id },
    {
      $set: {
        receiptEmailSentAt: new Date(),
        receiptEmailSending: false,
      },
    },
  );

  return NextResponse.json({ success: true });
}
