import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/mongodb";
import Product from "@/lib/models/Product";
import Order from "@/lib/models/Order";
import Settings from "@/lib/models/Settings";
import { verifyCustomerToken } from "@/lib/auth";
import { sendOrderConfirmationEmail } from "@/lib/email";

const DELIVERY_CHARGE = {
  inside_dhaka: 95,
  outside_dhaka: 120,
} as const;

const SETTINGS_KEY = "global";

const resolveLoyaltyPoints = (
  subtotal: number,
  ranges: Array<{ min: number; max?: number | null; points: number }>,
) => {
  const match = ranges.find((range) => {
    if (range.max === null || range.max === undefined) {
      return subtotal >= range.min;
    }
    return subtotal >= range.min && subtotal <= range.max;
  });
  return match ? match.points : 0;
};

const parseAuthToken = (req: NextRequest) => {
  const header = req.headers.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) return null;
  try {
    return verifyCustomerToken(token);
  } catch {
    return null;
  }
};

export async function POST(req: NextRequest) {
  await connectDB();

  const body = await req.json();
  const items = Array.isArray(body?.items) ? body.items : [];
  const delivery = body?.delivery || {};

  if (!items.length) {
    return NextResponse.json({ error: "Cart is empty." }, { status: 400 });
  }

  if (!delivery.fullName || !delivery.phone || !delivery.address || !delivery.area) {
    return NextResponse.json({ error: "Missing delivery details." }, { status: 400 });
  }

  if (delivery.area !== "inside_dhaka" && delivery.area !== "outside_dhaka") {
    return NextResponse.json({ error: "Invalid delivery area." }, { status: 400 });
  }

  if (delivery.paymentMethod !== "cash_on_delivery") {
    return NextResponse.json({ error: "Invalid payment method." }, { status: 400 });
  }

  const tokenPayload = parseAuthToken(req);
  let userId: string | undefined = tokenPayload?.userId;
  let checkoutMethod: "guest" | "account" = tokenPayload ? "account" : "guest";

  const productIds = items
    .map((item: any) => item?.productId)
    .filter((id: any) => typeof id === "string");

  const products = await Product.find({ _id: { $in: productIds } }).lean();
  const productMap = new Map(products.map((p: any) => [String(p._id), p]));

  const orderItems = [] as any[];
  let subtotal = 0;

  for (const item of items) {
    const product = productMap.get(String(item.productId));
    if (!product) {
      return NextResponse.json({ error: "One or more products are unavailable." }, { status: 400 });
    }
    const qty = Number(item.qty) || 0;
    if (qty <= 0) {
      return NextResponse.json({ error: "Invalid quantity in cart." }, { status: 400 });
    }
    if (product.quantity < qty) {
      return NextResponse.json({ error: `${product.name} is out of stock.` }, { status: 400 });
    }

    const unitPrice = product.salePrice || product.price;
    const lineTotal = unitPrice * qty;
    subtotal += lineTotal;

    orderItems.push({
      productId: String(product._id),
      name: product.name,
      image: product.images?.[0] || "/placeholder.png",
      unitPrice,
      qty,
      lineTotal,
    });
  }

  const area = delivery.area as keyof typeof DELIVERY_CHARGE;
  const baseDeliveryCharge = DELIVERY_CHARGE[area];

  const settings = await Settings.findOne({ key: SETTINGS_KEY }).lean();
  const freeDeliveryThreshold = Number(settings?.freeDeliveryThreshold) || 0;
  const deliveryCharge =
    freeDeliveryThreshold > 0 && subtotal >= freeDeliveryThreshold
      ? 0
      : baseDeliveryCharge;

  const loyaltyPoints = resolveLoyaltyPoints(subtotal, settings?.loyaltyRanges || []);

  const total = subtotal + deliveryCharge;

  const orderId = new mongoose.Types.ObjectId();
  const orderNumber = `JT${orderId.toString().slice(-8).toUpperCase()}`;

  const order = await Order.create({
    _id: orderId,
    orderNumber,
    userId,
    checkoutMethod,
    items: orderItems,
    delivery: {
      fullName: delivery.fullName,
      phone: delivery.phone,
      email: delivery.email || undefined,
      area: delivery.area,
      address: delivery.address,
      paymentMethod: delivery.paymentMethod,
    },
    subtotal,
    deliveryCharge,
    loyaltyPoints,
    total,
    status: "Pending",
  });

  const bulkOps = orderItems.map((item) => ({
    updateOne: {
      filter: { _id: item.productId, quantity: { $gte: item.qty } },
      update: { $inc: { quantity: -item.qty } },
    },
  }));

  const stockResult = await Product.bulkWrite(bulkOps);
  if (stockResult.modifiedCount !== orderItems.length) {
    await Order.findByIdAndDelete(order._id);
    return NextResponse.json({ error: "Stock changed while placing order. Please try again." }, { status: 409 });
  }

  if (delivery.email) {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || "";
    sendOrderConfirmationEmail({
      to: delivery.email,
      orderNumber,
      trackingUrl: siteUrl ? `${siteUrl}/orders/${orderNumber}` : undefined,
      items: orderItems.map((i) => ({ name: i.name, qty: i.qty, unitPrice: i.unitPrice })),
      subtotal,
      deliveryCharge,
      total,
    }).catch(() => {});
  }

  return NextResponse.json({
    orderNumber,
    orderId: String(order._id),
    checkoutMethod,
  });
}

export async function GET(req: NextRequest) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const mine = searchParams.get("mine") === "1";

  if (!mine) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tokenPayload = parseAuthToken(req);
  if (!tokenPayload?.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const orders = await Order.find({ userId: tokenPayload.userId }).sort({ createdAt: -1 });
  return NextResponse.json(orders);
}
