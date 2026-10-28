import type { GridProduct } from "@/lib/product-card";

/** Only the fields a product card renders, so server pages don't ship catalog internals to the browser. */
export function slimCard<T extends GridProduct>(p: T): GridProduct {
  return {
    _id: p._id, slug: p.slug, name: p.name, images: p.images, price: p.price, salePrice: p.salePrice,
    offerDiscountType: p.offerDiscountType, offerDiscountAmount: p.offerDiscountAmount, quantity: p.quantity,
    hasVariants: p.hasVariants, brandName: p.brandName, rating: p.rating, reviewCount: p.reviewCount, badge: p.badge,
    variantLabel: p.variantLabel, createdAt: p.createdAt,
  };
}
