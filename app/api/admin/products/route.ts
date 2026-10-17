import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { revalidatePath, revalidateTag } from 'next/cache';
import connectDB from '@/lib/mongodb';
import Product from '@/lib/models/Product';
import { deleteImage } from '@/lib/cloudinary';
import { notifyLiveSite } from '@/lib/revalidate-live';

function generateSku(): string {
  return 'JT-' + Math.random().toString(36).substring(2, 10).toUpperCase();
}

/** Variant SKUs must be unique within the product and across the catalog (product + variant SKUs). */
async function findVariantSkuConflict(variants: any[] | undefined, selfId?: string): Promise<string | null> {
  const skus = (variants || []).map((v) => String(v?.sku || '').trim()).filter(Boolean);
  if (!skus.length) return null;
  const dup = skus.find((s, i) => skus.indexOf(s) !== i);
  if (dup) return `Variant SKU "${dup}" is used more than once.`;
  const other = await Product.findOne({
    ...(selfId ? { _id: { $ne: selfId } } : {}),
    $or: [{ sku: { $in: skus } }, { 'variants.sku': { $in: skus } }],
  }).select('name sku variants.sku').lean();
  if (!other) return null;
  const hit = skus.find((s) => (other as any).sku === s || ((other as any).variants || []).some((v: any) => v.sku === s));
  return `SKU "${hit}" is already used by "${(other as any).name}".`;
}

export async function GET() {
  // Includes costPrice, so admin-only.
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const products = await Product.find().select('+costPrice +variants.costPrice').sort({ createdAt: -1 });
  return NextResponse.json(products);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const body = await req.json();
  if (!body.sku) body.sku = generateSku();
  const conflict = await findVariantSkuConflict(body.hasVariants ? body.variants : [], undefined);
  if (conflict) return NextResponse.json({ error: conflict }, { status: 400 });
  try {
    const product = await Product.create(body);
    revalidateTag('products', { expire: 0 });
    void notifyLiveSite('product');
    revalidatePath('/');
    revalidatePath('/products');
    revalidatePath('/product/[slug]', 'page');
    return NextResponse.json(product, { status: 201 });
  } catch (err: any) {
    if (err.code === 11000) {
      if (err.message?.includes('sku')) {
        return NextResponse.json({ error: 'A product with this SKU already exists.' }, { status: 400 });
      }
      return NextResponse.json({ error: 'A product with this slug already exists.' }, { status: 400 });
    }
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const { id, ...data } = await req.json();
  if (!data.sku) data.sku = generateSku();
  if (data.variants) {
    const conflict = await findVariantSkuConflict(data.hasVariants === false ? [] : data.variants, id);
    if (conflict) return NextResponse.json({ error: conflict }, { status: 400 });
  }
  const updated = await Product.findByIdAndUpdate(id, data, { new: true });
  revalidateTag('products', { expire: 0 });
  void notifyLiveSite('product');
  revalidatePath('/');
  revalidatePath('/products');
  revalidatePath('/product/[slug]', 'page');
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const { id } = await req.json();
  const product = await Product.findByIdAndDelete(id);
  if (product && product.imagePublicIds) {
    for (const pid of product.imagePublicIds) {
       await deleteImage(pid);
    }
  }
  revalidateTag('products', { expire: 0 });
  void notifyLiveSite('product');
  revalidatePath('/');
  revalidatePath('/products');
  revalidatePath('/product/[slug]', 'page');
  return NextResponse.json({ success: true });
}
