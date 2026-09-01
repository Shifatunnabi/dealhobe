export type OfferLike = {
  _id?: string | { toString(): string };
  discountType: "percentage" | "flat";
  discountAmount: number;
  productSelection: "all" | "selected";
  selectedProducts?: Array<string | { toString(): string }>;
  isActive?: boolean;
  endingDate?: string | Date | null;
};

export function isOfferActive(offer: OfferLike, now = new Date()): boolean {
  if (offer.isActive === false) return false;
  if (!offer.endingDate) return true;
  const end = new Date(offer.endingDate);
  if (Number.isNaN(end.getTime())) return true;
  return end >= now;
}

export function applyOffersToProduct<T extends { _id: any; price: number; salePrice?: number }>(
  product: T,
  offers: OfferLike[],
  now = new Date(),
): T & {
  salePrice?: number;
  offerId?: string;
  offerDiscountType?: OfferLike["discountType"];
  offerDiscountAmount?: number;
} {
  const productId = String(product._id);
  const eligibleOffers = offers.filter((offer) => {
    if (!isOfferActive(offer, now)) return false;
    if (offer.discountAmount <= 0) return false;
    if (offer.productSelection === "all") return true;
    return (offer.selectedProducts || []).map((id) => String(id)).includes(productId);
  });

  if (!eligibleOffers.length) {
    return { ...product };
  }

  let bestOffer = eligibleOffers[0];
  let bestPrice = product.price;

  for (const offer of eligibleOffers) {
    const discounted =
      offer.discountType === "percentage"
        ? product.price * (1 - offer.discountAmount / 100)
        : product.price - offer.discountAmount;
    const finalPrice = Math.max(0, discounted);
    if (finalPrice < bestPrice) {
      bestPrice = finalPrice;
      bestOffer = offer;
    }
  }

  if (bestPrice >= product.price) {
    return { ...product };
  }

  return {
    ...product,
    salePrice: Math.round(bestPrice),
    offerId: bestOffer._id ? String(bestOffer._id) : undefined,
    offerDiscountType: bestOffer.discountType,
    offerDiscountAmount: bestOffer.discountAmount,
  };
}

export function applyOffersToProducts<T extends { _id: any; price: number; salePrice?: number }>(
  products: T[],
  offers: OfferLike[],
  now = new Date(),
): Array<T & { salePrice?: number; offerId?: string; offerDiscountType?: OfferLike["discountType"]; offerDiscountAmount?: number; }> {
  return products.map((product) => applyOffersToProduct(product, offers, now));
}
