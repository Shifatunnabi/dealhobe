import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/mongodb";
import Order from "@/lib/models/Order";
import Product from "@/lib/models/Product";

// Store runs in Bangladesh (UTC+6); interpret report dates in that timezone
// so results don't depend on the server's own timezone.
const TZ_OFFSET = "+06:00";
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export async function GET(req: NextRequest) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const productIds = (searchParams.get("productIds") || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if ((from && !DATE_RE.test(from)) || (to && !DATE_RE.test(to))) {
    return NextResponse.json({ error: "Invalid date format" }, { status: 400 });
  }

  const dateFilter: Record<string, Date> = {};
  if (from) dateFilter.$gte = new Date(`${from}T00:00:00.000${TZ_OFFSET}`);
  if (to) dateFilter.$lte = new Date(`${to}T23:59:59.999${TZ_OFFSET}`);
  if (dateFilter.$gte && dateFilter.$lte && dateFilter.$gte > dateFilter.$lte) {
    return NextResponse.json({ error: "'From' date is after 'To' date" }, { status: 400 });
  }

  try {
    await connectDB();

    const query: Record<string, unknown> = { status: { $ne: "Cancelled" } };
    if (Object.keys(dateFilter).length) query.createdAt = dateFilter;
    if (productIds.length) query["items.productId"] = { $in: productIds };

    const orders = await Order.find(query).select("items createdAt").sort({ createdAt: 1 }).lean();

    // Orders placed before cost tracking have no per-item cost snapshot, so fall
    // back to the product's current cost price.
    const usedIds = new Set<string>();
    for (const order of orders as any[]) {
      for (const item of order.items) {
        if (typeof item.costPrice !== "number") usedIds.add(item.productId);
      }
    }
    const costDocs = usedIds.size
      ? await Product.find({ _id: { $in: [...usedIds] } }).select("+costPrice").lean()
      : [];
    const currentCost = new Map<string, number>(
      costDocs
        .filter((p: any) => typeof p.costPrice === "number")
        .map((p: any) => [String(p._id), p.costPrice as number]),
    );

    const map = new Map<
      string,
      { name: string; qty: number; revenue: number; cost: number; missingCost: boolean; orders: Set<string>; variants: Map<string, { qty: number; revenue: number; cost: number; orders: Set<string> }> }
    >();

    for (const order of orders as any[]) {
      for (const item of order.items) {
        if (productIds.length && !productIds.includes(item.productId)) continue;
        const unitCost: number | undefined =
          typeof item.costPrice === "number" ? item.costPrice : currentCost.get(item.productId);
        const lineCost = (unitCost ?? 0) * item.qty;
        let entry = map.get(item.productId);
        if (!entry) {
          entry = {
            name: item.name,
            qty: 0,
            revenue: 0,
            cost: 0,
            missingCost: false,
            orders: new Set<string>(),
            variants: new Map(),
          };
          map.set(item.productId, entry);
        }
        if (item.variantLabel) {
          const vr = entry.variants.get(item.variantLabel) || { qty: 0, revenue: 0, cost: 0, orders: new Set<string>() };
          vr.orders.add(String(order._id));
          vr.qty += item.qty;
          vr.revenue += item.lineTotal;
          vr.cost += lineCost;
          entry.variants.set(item.variantLabel, vr);
        }
        {
          entry.name = item.name; // latest name wins (orders sorted oldest → newest)
          entry.qty += item.qty;
          entry.revenue += item.lineTotal;
          entry.cost += lineCost;
          if (unitCost === undefined) entry.missingCost = true;
          entry.orders.add(String(order._id));
        }
      }
    }

    // When specific products are picked, list every one of their variants — including unsold (0) ones.
    const variantCatalog = new Map<string, string[]>();
    if (productIds.length) {
      const docs = await Product.find({ _id: { $in: productIds } }).select("name hasVariants variants.options").lean();
      for (const p of docs as any[]) {
        if (p.hasVariants && p.variants?.length) {
          variantCatalog.set(
            String(p._id),
            p.variants.map((v: any) => v.options.map((o: any) => o.value).join(" / ")),
          );
        }
      }
      // Picked variant products with no sales at all still get their rows.
      for (const [pid] of variantCatalog) {
        if (!map.has(pid)) {
          const doc = (docs as any[]).find((d) => String(d._id) === pid);
          map.set(pid, { name: doc.name, qty: 0, revenue: 0, cost: 0, missingCost: false, orders: new Set(), variants: new Map() });
        }
      }
    }

    const rows = Array.from(map.entries())
      .map(([productId, r]) => {
        const variants = Array.from(r.variants.entries()).map(([label, v]) => ({
          label,
          orderCount: v.orders.size,
          qty: v.qty,
          revenue: v.revenue,
          profit: v.revenue - v.cost,
        }));
        for (const label of variantCatalog.get(productId) || []) {
          if (!r.variants.has(label)) variants.push({ label, orderCount: 0, qty: 0, revenue: 0, profit: 0 });
        }
        // Lines without a variant label on a variant product (e.g. sold before variants existed).
        if (variants.length) {
          const vq = variants.reduce((s, v) => s + v.qty, 0);
          if (r.qty > vq) {
            const vr = variants.reduce((s, v) => s + v.revenue, 0);
            const vp = variants.reduce((s, v) => s + v.profit, 0);
            variants.push({ label: "(no variant)", orderCount: 0, qty: r.qty - vq, revenue: r.revenue - vr, profit: r.revenue - r.cost - vp });
          }
        }
        // Group order: best-selling variant first; unsold ones last, in catalog order.
        variants.sort((a, b) => b.revenue - a.revenue);
        return {
          productId,
          name: r.name,
          qty: r.qty,
          revenue: r.revenue,
          cost: r.cost,
          profit: r.revenue - r.cost,
          margin: r.revenue > 0 ? ((r.revenue - r.cost) / r.revenue) * 100 : 0,
          missingCost: r.missingCost,
          orderCount: r.orders.size,
          variants,
        };
      })
      .sort((a, b) => b.revenue - a.revenue);

    const totals = rows.reduce(
      (acc, r) => ({
        qty: acc.qty + r.qty,
        revenue: acc.revenue + r.revenue,
        cost: acc.cost + r.cost,
        profit: acc.profit + r.profit,
      }),
      { qty: 0, revenue: 0, cost: 0, profit: 0 },
    );

    return NextResponse.json({
      rows,
      totals: { ...totals, margin: totals.revenue > 0 ? (totals.profit / totals.revenue) * 100 : 0 },
    });
  } catch (err) {
    console.error("Sales report failed:", err);
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 });
  }
}
