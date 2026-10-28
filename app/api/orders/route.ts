import { revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/mongodb";
import Product, { type IVariant } from "@/lib/models/Product";
import Order, { type OrderItem } from "@/lib/models/Order";
import Offer from "@/lib/models/Offer";
import { applyOffersToProduct, isOfferActive } from "@/lib/offers";
import Settings from "@/lib/models/Settings";
import { verifyCustomerToken } from "@/lib/auth";
import { sendOrderConfirmationEmail } from "@/lib/email";
import { getProductCoverImage } from "@/lib/product-images";

const DELIVERY_CHARGE = {
  inside_dhaka: 95,
  outside_dhaka: 120,
} as const;

const SETTINGS_KEY = "global";

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
  const items: { productId?: unknown; qty?: unknown; variantKey?: unknown }[] = Array.isArray(body?.items) ? body.items : [];
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
  const userId: string | undefined = tokenPayload?.userId;
  const checkoutMethod: "guest" | "account" = tokenPayload ? "account" : "guest";

  const productIds = items
    .map((item) => item?.productId)
    .filter((id): id is string => typeof id === "string");

  const products = await Product.find({ _id: { $in: productIds } }).select('+costPrice +variants.costPrice').lean();
  // Charge what the storefront showed: active offers are applied here too, not just in the UI.
  const offers = (await Offer.find().lean()).filter((o) => isOfferActive(o));
  const productMap = new Map(
    products.map((p) => [String(p._id), applyOffersToProduct(p, offers)] as const),
  );

  const orderItems: OrderItem[] = [];
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

    // Variant products: price, stock, image and SKU all come from the chosen variant.
    let variant: IVariant | null | undefined = null;
    if (product.hasVariants) {
      variant = item.variantKey ? (product.variants || []).find((v) => v.key === item.variantKey) : null;
      if (!variant) {
        return NextResponse.json(
          {
            error: item.variantKey
              ? `The selected option of ${product.name} is no longer available. Please remove it from your cart and choose again.`
              : `Please choose an option for ${product.name}.`,
          },
          { status: 400 },
        );
      }
    }
    const available = variant ? variant.quantity : product.quantity;
    if (available < qty) {
      const label = variant ? ` (${variant.options.map((o) => o.value).join(" / ")})` : "";
      return NextResponse.json({ error: `${product.name}${label} is out of stock.` }, { status: 400 });
    }

    const unitPrice = variant ? variant.salePrice || variant.price : product.salePrice || product.price;
    const lineTotal = unitPrice * qty;
    subtotal += lineTotal;

    orderItems.push({
      productId: String(product._id),
      name: product.name,
      image: (variant && !variant.useMainImage && variant.image) || getProductCoverImage(product) || "/placeholder.png",
      ...(variant
        ? {
            variantKey: variant.key,
            variantLabel: variant.options.map((o) => o.value).join(" / "),
            ...(variant.sku ? { variantSku: variant.sku } : {}),
          }
        : {}),
      unitPrice,
      ...(() => {
        const cost = variant && typeof variant.costPrice === "number" ? variant.costPrice : product.costPrice;
        return typeof cost === "number" ? { costPrice: cost } : {};
      })(),
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

  const total = subtotal + deliveryCharge;

  const orderId = new mongoose.Types.ObjectId();
  const orderNumber = `DH${orderId.toString().slice(-8).toUpperCase()}`;

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
    total,
    status: "Pending",
  });

  // Variant lines also decrement their own variant's stock (the product total mirrors the sum).
  const bulkOps = orderItems.map((item) => ({
    updateOne: item.variantKey
      ? {
          filter: { _id: item.productId, variants: { $elemMatch: { key: item.variantKey, quantity: { $gte: item.qty } } } },
          update: { $inc: { "variants.$.quantity": -item.qty, quantity: -item.qty } },
        }
      : {
          filter: { _id: item.productId, quantity: { $gte: item.qty } },
          update: { $inc: { quantity: -item.qty } },
        },
  }));

  const stockResult = await Product.bulkWrite(bulkOps);
  if (stockResult.modifiedCount !== orderItems.length) {
    await Order.findByIdAndDelete(order._id);
    return NextResponse.json({ error: "Stock changed while placing order. Please try again." }, { status: 409 });
  }

  revalidateTag('products', { expire: 0 });
  revalidateTag('orders', { expire: 0 });

  if (delivery.email) {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || "";
    sendOrderConfirmationEmail({
      to: delivery.email,
      orderNumber,
      trackingUrl: siteUrl ? `${siteUrl}/orders/${orderNumber}` : undefined,
      items: orderItems.map((i) => ({ name: i.variantLabel ? `${i.name} (${i.variantLabel})` : i.name, qty: i.qty, unitPrice: i.unitPrice })),
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
