import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongodb';
import Brand from '@/lib/models/Brand';
import Category from '@/lib/models/Category';
import Blog from '@/lib/models/Blog';
import Review from '@/lib/models/Review';
import Product from '@/lib/models/Product';
import Offer from '@/lib/models/Offer';

export async function GET() {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();

  const [
    totalBrands,
    totalCategories,
    totalBlogs,
    totalReviews,
    pendingReviews,
    totalProducts,
    totalOffers
  ] = await Promise.all([
    Brand.countDocuments(),
    Category.countDocuments(),
    Blog.countDocuments(),
    Review.countDocuments(),
    Review.countDocuments({ isApproved: false }),
    Product.countDocuments(),
    Offer.countDocuments()
  ]);

  // Low-stock list is variant-aware: a variant product is flagged per variant, not by its total.
  const LOW = 10;
  const stockDocs = await Product.find({}, { name: 1, quantity: 1, hasVariants: 1, 'variants.key': 1, 'variants.options': 1, 'variants.quantity': 1 }).lean();
  const lowStock: { productId: string; name: string; variant?: string; quantity: number }[] = [];
  for (const p of stockDocs as any[]) {
    if (p.hasVariants && p.variants?.length) {
      for (const v of p.variants) {
        if (v.quantity < LOW) {
          lowStock.push({ productId: String(p._id), name: p.name, variant: v.options.map((o: any) => o.value).join(' / '), quantity: v.quantity });
        }
      }
    } else if (p.quantity < LOW) {
      lowStock.push({ productId: String(p._id), name: p.name, quantity: p.quantity });
    }
  }
  lowStock.sort((a, b) => a.quantity - b.quantity);

  return NextResponse.json({
    lowStockCount: lowStock.length,
    lowStock: lowStock.slice(0, 10),
    totalBrands,
    totalCategories,
    totalBlogs,
    totalReviews,
    pendingReviews,
    totalProducts,
    totalOffers
  });
}
