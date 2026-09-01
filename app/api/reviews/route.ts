import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Review from "@/lib/models/Review";
import User from "@/lib/models/User";
import { verifyCustomerToken } from "@/lib/auth";

async function getCustomerFromRequest(req: NextRequest) {
  const header = req.headers.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) return null;
  try {
    const payload = verifyCustomerToken(token);
    if (!payload?.userId) return null;
    const user = await User.findById(payload.userId).lean();
    return user || null;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  await connectDB();
  const productId = req.nextUrl.searchParams.get("productId") || "";

  const query: Record<string, any> = { isApproved: true };
  if (productId) {
    query.productId = productId;
  }

  const reviews = await Review.find(query).sort({ createdAt: -1 }).lean();
  return NextResponse.json(reviews);
}

export async function POST(req: NextRequest) {
  await connectDB();
  const customer = await getCustomerFromRequest(req);
  if (!customer) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const productId = String(body?.productId || "").trim();
  const reviewText = String(body?.review || "").trim();
  const rating = Number(body?.rating || 5);

  if (!productId || !reviewText) {
    return NextResponse.json({ error: "Missing review data." }, { status: 400 });
  }

  const existing = await Review.findOne({
    productId,
    customerId: customer._id.toString(),
  }).lean();

  if (existing) {
    return NextResponse.json({ error: "Review already submitted." }, { status: 409 });
  }

  const review = await Review.create({
    customerName: customer.fullName,
    customerId: customer._id.toString(),
    customerEmail: customer.email,
    rating: Math.min(5, Math.max(1, rating)),
    review: reviewText,
    productId,
    isApproved: true,
    isFeatured: false,
  });

  return NextResponse.json(review, { status: 201 });
}
