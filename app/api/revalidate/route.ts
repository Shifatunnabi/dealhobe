/**
 * On-demand cache revalidation endpoint.
 *
 * POST /api/revalidate
 * Body: { secret: string, type: RevalidateType, slug?: string }
 *
 * Call this from your admin panel after any content mutation:
 *   - Product created/updated/deleted  → type: "product",  slug: product.slug
 *   - Category changed                 → type: "categories"
 *   - Offer changed                    → type: "offers"
 *   - Hero slide changed               → type: "hero"
 *   - Review approved/deleted          → type: "reviews"
 *   - Parenting tip changed            → type: "tips"
 *   - Blog created/updated/deleted     → type: "blogs",    slug: blog._id
 *   - Full cache wipe                  → type: "all"
 *
 * Requires REVALIDATE_SECRET env variable.
 */

import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag, revalidatePath } from 'next/cache';

type RevalidateType =
  | 'product'
  | 'listing'
  | 'categories'
  | 'ages'
  | 'brands'
  | 'offers'
  | 'hero'
  | 'reviews'
  | 'tips'
  | 'blogs'
  | 'all';

export async function POST(req: NextRequest) {
  let body: { secret?: string; type?: RevalidateType; slug?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { secret, type, slug } = body;

  if (!process.env.REVALIDATE_SECRET) {
    return NextResponse.json(
      { error: 'REVALIDATE_SECRET is not configured on the server' },
      { status: 500 }
    );
  }

  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: 'Invalid secret' }, { status: 401 });
  }

  if (!type) {
    return NextResponse.json({ error: 'Missing type' }, { status: 400 });
  }

  switch (type) {
    case 'product':
      revalidateTag('products', {});
      revalidatePath('/products');
      revalidatePath('/product/[slug]', 'page');
      revalidatePath('/');
      if (slug) revalidatePath(`/product/${slug}`);
      break;

    case 'listing':
      revalidateTag('products', {});
      revalidatePath('/products');
      revalidatePath('/');
      break;

    case 'categories':
      revalidateTag('categories', {});
      revalidatePath('/products');
      revalidatePath('/');
      break;

    case 'ages':
      revalidateTag('ages', {});
      revalidatePath('/products');
      revalidatePath('/');
      break;

    case 'brands':
      revalidateTag('brands', {});
      revalidatePath('/');
      break;

    case 'offers':
      revalidateTag('offers', {});
      revalidateTag('products', {});   // offers affect displayed prices
      revalidatePath('/offers');
      revalidatePath('/products');
      revalidatePath('/');
      break;

    case 'hero':
      revalidateTag('hero', {});
      revalidatePath('/');
      break;

    case 'reviews':
      revalidateTag('reviews', {});
      revalidatePath('/');
      revalidatePath('/product/[slug]', 'page');
      break;

    case 'tips':
      revalidateTag('tips', {});
      revalidatePath('/');
      break;

    case 'blogs':
      revalidateTag('blogs', {});
      revalidatePath('/blogs');
      revalidatePath('/blogs/[blogId]', 'page');
      if (slug) revalidatePath(`/blogs/${slug}`);
      break;

    case 'all':
      (
        ['products', 'categories', 'ages', 'brands', 'offers', 'hero', 'reviews', 'tips', 'blogs'] as const
      ).forEach((tag) => revalidateTag(tag, {}));
      revalidatePath('/', 'layout');  // wipes every cached page
      break;

    default:
      return NextResponse.json(
        { error: `Unknown revalidation type: ${type}` },
        { status: 400 }
      );
  }

  return NextResponse.json({
    revalidated: true,
    type,
    ...(slug && { slug }),
    timestamp: Date.now(),
  });
}
