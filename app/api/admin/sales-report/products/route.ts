import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/mongodb";
import Product from "@/lib/models/Product";

// All products (lightweight) for the sales-report product picker.
export async function GET() {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const products = await Product.find({}, { name: 1, slug: 1, images: 1, price: 1, salePrice: 1 })
    .sort({ name: 1 })
    .lean();

  return NextResponse.json(
    products.map((p: any) => ({
      id: String(p._id),
      name: p.name,
      slug: p.slug,
      image: p.images?.[0] ?? null,
      price: p.salePrice ?? p.price,
    })),
    { headers: { "Cache-Control": "no-store" } },
  );
}
