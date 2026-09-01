import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Product from "@/lib/models/Product";

export async function GET(req: NextRequest) {
  const q = new URL(req.url).searchParams.get("q")?.trim() ?? "";

  await connectDB();

  const filter =
    q.length >= 2
      ? { name: { $regex: new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i") } }
      : {};

  const products = await Product.find(filter, { name: 1, slug: 1, images: 1, price: 1, salePrice: 1 })
    .sort({ createdAt: -1 })
    .limit(20)
    .lean();

  return NextResponse.json(
    products.map((p: any) => ({ name: p.name, slug: p.slug, image: p.images?.[0] ?? null, price: p.salePrice ?? p.price })),
    { headers: { "Cache-Control": "no-store" } },
  );
}
