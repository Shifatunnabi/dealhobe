import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { revalidatePath, revalidateTag } from 'next/cache';
import connectDB from '@/lib/mongodb';
import Product from '@/lib/models/Product';
import { deleteImage } from '@/lib/cloudinary';

function generateSku(): string {
  return 'JT-' + Math.random().toString(36).substring(2, 10).toUpperCase();
}

export async function GET() {
  await connectDB();
  const products = await Product.find().sort({ createdAt: -1 });
  return NextResponse.json(products);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const body = await req.json();
  if (!body.sku) body.sku = generateSku();
  try {
    const product = await Product.create(body);
    revalidateTag('products', { expire: 0 });
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
  const updated = await Product.findByIdAndUpdate(id, data, { new: true });
  revalidateTag('products', { expire: 0 });
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
  revalidatePath('/');
  revalidatePath('/products');
  revalidatePath('/product/[slug]', 'page');
  return NextResponse.json({ success: true });
}
