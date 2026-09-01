import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongodb';
import Order from '@/lib/models/Order';
import Product from '@/lib/models/Product';
import Category from '@/lib/models/Category';

export async function GET(req: NextRequest) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();

  const { searchParams } = new URL(req.url);
  const from = searchParams.get('from');
  const to = searchParams.get('to');
  const skuFilter = searchParams.get('sku')?.trim() || '';
  const categoryFilter = searchParams.get('categoryId')?.trim() || '';

  const orderQuery: Record<string, any> = { status: { $ne: 'Cancelled' } };
  if (from || to) {
    orderQuery.createdAt = {};
    if (from) orderQuery.createdAt.$gte = new Date(from + 'T00:00:00.000Z');
    if (to) orderQuery.createdAt.$lte = new Date(to + 'T23:59:59.999Z');
  }

  const orders = await Order.find(orderQuery).sort({ createdAt: 1 }).lean();

  const productIds = [...new Set(orders.flatMap((o: any) => o.items.map((i: any) => i.productId)))];
  const products = await Product.find({ _id: { $in: productIds } }).lean();
  const productMap = new Map(products.map((p: any) => [String(p._id), p]));

  const categories = await Category.find().lean();
  const categoryMap = new Map(categories.map((c: any) => [String(c._id), c.name]));

  const skuStats: Record<string, { sku: string; productName: string; unitsSold: number; revenue: number }> = {};
  const categoryStats: Record<string, { categoryId: string; categoryName: string; unitsSold: number; revenue: number }> = {};
  const dayStats: Record<string, { date: string; orders: number; revenue: number }> = {};

  let totalOrders = 0;
  let totalRevenue = 0;
  let totalItems = 0;

  const hasFilter = !!(skuFilter || categoryFilter);

  for (const order of orders as any[]) {
    const relevantItems = order.items.filter((item: any) => {
      const product = productMap.get(item.productId) as any;
      if (!product) return false;
      if (skuFilter && product.sku !== skuFilter) return false;
      if (categoryFilter && product.category !== categoryFilter) return false;
      return true;
    });

    if (hasFilter && relevantItems.length === 0) continue;

    const itemsForStats = hasFilter ? relevantItems : order.items;
    const orderRevenue = hasFilter
      ? relevantItems.reduce((s: number, i: any) => s + i.lineTotal, 0)
      : order.total;

    totalOrders++;
    totalRevenue += orderRevenue;

    for (const item of itemsForStats) {
      const product = productMap.get(item.productId) as any;
      if (!product) continue;

      const sku = product.sku || 'N/A';
      if (!skuStats[sku]) skuStats[sku] = { sku, productName: product.name, unitsSold: 0, revenue: 0 };
      skuStats[sku].unitsSold += item.qty;
      skuStats[sku].revenue += item.lineTotal;

      const catId = product.category || '';
      if (!categoryStats[catId]) {
        categoryStats[catId] = {
          categoryId: catId,
          categoryName: categoryMap.get(catId) || 'Unknown',
          unitsSold: 0,
          revenue: 0,
        };
      }
      categoryStats[catId].unitsSold += item.qty;
      categoryStats[catId].revenue += item.lineTotal;

      totalItems += item.qty;
    }

    const day = new Date(order.createdAt).toISOString().split('T')[0];
    if (!dayStats[day]) dayStats[day] = { date: day, orders: 0, revenue: 0 };
    dayStats[day].orders++;
    dayStats[day].revenue += orderRevenue;
  }

  return NextResponse.json({
    summary: { totalOrders, totalRevenue, totalItems },
    bySku: Object.values(skuStats).sort((a, b) => b.revenue - a.revenue),
    byCategory: Object.values(categoryStats).sort((a, b) => b.revenue - a.revenue),
    byDay: Object.values(dayStats),
    categories: categories.map((c: any) => ({ _id: String(c._id), name: c.name })),
  });
}
