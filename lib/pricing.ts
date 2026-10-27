// Plain module (no "use client"): used by server code, the search API and client components alike.

type VariantPrice = { price: number; salePrice?: number | null };

/** What a shopper actually pays for a price pair: the sale price when it is set and lower, else the price. */
export const effectivePrice = (v: VariantPrice): number =>
  v.salePrice && v.salePrice > 0 && v.salePrice < v.price ? v.salePrice : v.price;

/**
 * The "From" price of a variant product: the variant with the lowest price a shopper would pay
 * (its sale price when it has a lower one). Returns that variant's own price pair so the card can show
 * "From ৳sale" with the regular price struck through. `salePrice` is undefined when there is no discount.
 */
export function lowestVariantPricing(product: {
  hasVariants?: boolean;
  variants?: VariantPrice[] | null;
}): { price: number; salePrice?: number } | null {
  const variants = product.hasVariants !== false && Array.isArray(product.variants) ? product.variants : [];
  if (!variants.length) return null;
  const best = variants.reduce((a, v) => (effectivePrice(v) < effectivePrice(a) ? v : a));
  const discounted = effectivePrice(best) < best.price;
  return { price: best.price, salePrice: discounted ? effectivePrice(best) : undefined };
}

/**
 * Returns the product with its top-level price/salePrice replaced by the lowest variant's pair, so every
 * card, listing, filter and search result that reads `salePrice || price` shows the true "From" price.
 * Non-variant products are returned unchanged.
 */
export function withLowestVariantPrice<T extends { price: number; salePrice?: number }>(product: T): T {
  const lowest = lowestVariantPricing(product as unknown as { hasVariants?: boolean; variants?: VariantPrice[] });
  return lowest ? { ...product, price: lowest.price, salePrice: lowest.salePrice } : product;
}
