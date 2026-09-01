import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/mongodb";
import Order from "@/lib/models/Order";

export async function GET(req: NextRequest) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const products = searchParams.get("products"); // comma-separated slugs

  await connectDB();

  const dateFilter: Record<string, Date> = {};
  if (from) dateFilter.$gte = new Date(from);
  if (to) {
    const toDate = new Date(to);
    toDate.setHours(23, 59, 59, 999);
    dateFilter.$lte = toDate;
  }

  const query: Record<string, unknown> = {
    status: { $ne: "Cancelled" },
  };
  if (Object.keys(dateFilter).length) query.createdAt = dateFilter;

  const selectedNames = products
    ? products.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  const orders = await Order.find(query).select("items createdAt total").lean();

  const map = new Map<string, { name: string; qty: number; revenue: number; orders: Set<string> }>();

  for (const order of orders) {
    for (const item of (order as any).items) {
      if (selectedNames.length && !selectedNames.includes(item.name)) continue;
      const key = item.name;
      const existing = map.get(key);
      if (existing) {
        existing.qty += item.qty;
        existing.revenue += item.lineTotal;
        existing.orders.add(String((order as any)._id));
      } else {
        map.set(key, {
          name: item.name,
          qty: item.qty,
          revenue: item.lineTotal,
          orders: new Set([String((order as any)._id)]),
        });
      }
    }
  }

  const rows = Array.from(map.values())
    .map((r) => ({ name: r.name, qty: r.qty, revenue: r.revenue, orderCount: r.orders.size }))
    .sort((a, b) => b.revenue - a.revenue);

  const totals = rows.reduce(
    (acc, r) => ({ qty: acc.qty + r.qty, revenue: acc.revenue + r.revenue }),
    { qty: 0, revenue: 0 },
  );

  return NextResponse.json({ rows, totals });
}
