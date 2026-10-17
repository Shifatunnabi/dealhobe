type ImageSource = {
  images?: string[];
  hasVariants?: boolean;
  variants?: { useMainImage?: boolean; image?: string }[];
};

/**
 * Every photo to show for a product: the main gallery first, then each variant's
 * own photo (deduped). With no main photos, the first variant photo leads, so it
 * becomes the main image and the product-card image.
 */
export function getProductImages(product: ImageSource | null | undefined): string[] {
  if (!product) return [];
  const main = (product.images ?? []).filter(Boolean);
  const variantImages =
    product.hasVariants !== false && Array.isArray(product.variants)
      ? product.variants.filter((v) => !v.useMainImage && v.image).map((v) => v.image as string)
      : [];
  return Array.from(new Set([...main, ...variantImages]));
}

/** The photo used for cards, search results and cart lines. */
export function getProductCoverImage(product: ImageSource | null | undefined): string | null {
  return getProductImages(product)[0] ?? null;
}
