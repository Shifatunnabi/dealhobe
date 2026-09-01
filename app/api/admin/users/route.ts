import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/mongodb";
import User from "@/lib/models/User";
import Order from "@/lib/models/Order";

export async function GET(req: NextRequest) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = 15;
  const skip = (page - 1) * limit;

  const query: Record<string, unknown> = {};
  if (search.trim()) {
    const regex = new RegExp(search.trim(), "i");
    query.$or = [{ fullName: regex }, { email: regex }, { phone: regex }];
  }

  const [users, total] = await Promise.all([
    User.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    User.countDocuments(query),
  ]);

  const userIds = users.map((u: any) => String(u._id));
  const orderCounts = await Order.aggregate([
    { $match: { userId: { $in: userIds } } },
    { $group: { _id: "$userId", count: { $sum: 1 } } },
  ]);
  const orderCountMap: Record<string, number> = {};
  orderCounts.forEach((item: any) => {
    orderCountMap[item._id] = item.count;
  });

  const result = users.map((u: any) => ({
    _id: String(u._id),
    fullName: u.fullName,
    phone: u.phone,
    email: u.email || null,
    area: u.area,
    address: u.address,
    addresses: (u.addresses || []).map((a: any) => ({
      _id: a._id ? String(a._id) : undefined,
      label: a.label,
      fullAddress: a.fullAddress || a.address || "",
      area: a.area,
      isDefault: Boolean(a.isDefault),
    })),
    babies: (u.babies || []).map((b: any) => ({
      _id: b._id ? String(b._id) : undefined,
      name: b.name,
      birthday: b.birthday,
    })),
    isBanned: Boolean(u.isBanned),
    createdAt: u.createdAt,
    totalOrders: orderCountMap[String(u._id)] || 0,
  }));

  return NextResponse.json({
    users: result,
    total,
    page,
    pages: Math.ceil(total / limit),
  });
}
