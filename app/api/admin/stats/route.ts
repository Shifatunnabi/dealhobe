import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongodb';
import AgeRange from '@/lib/models/AgeRange';
import Brand from '@/lib/models/Brand';
import Category from '@/lib/models/Category';
import Blog from '@/lib/models/Blog';
import Review from '@/lib/models/Review';
import ParentingTip from '@/lib/models/ParentingTip';
import Product from '@/lib/models/Product';
import Offer from '@/lib/models/Offer';

export async function GET() {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();

  const [
    totalAges,
    totalBrands,
    totalCategories,
    totalBlogs,
    totalReviews,
    pendingReviews,
    totalTips,
    totalProducts,
    totalOffers
  ] = await Promise.all([
    AgeRange.countDocuments(),
    Brand.countDocuments(),
    Category.countDocuments(),
    Blog.countDocuments(),
    Review.countDocuments(),
    Review.countDocuments({ isApproved: false }),
    ParentingTip.countDocuments(),
    Product.countDocuments(),
    Offer.countDocuments()
  ]);

  return NextResponse.json({
    totalAges,
    totalBrands,
    totalCategories,
    totalBlogs,
    totalReviews,
    pendingReviews,
    totalTips,
    totalProducts,
    totalOffers
  });
}
