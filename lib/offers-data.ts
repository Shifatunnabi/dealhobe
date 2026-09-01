export interface Offer {
  id: string;
  title: string;
  slug: string;
  blurb: string;
  image: string;
  productIds: string[];
}

export const OFFERS: Offer[] = [
  {
    id: "offer-1",
    title: "Weekend Mega Deal",
    slug: "weekend-mega-deal",
    blurb: "Big savings on crowd-pleasing weekend picks.",
    image: "/offer/offer1.png",
    productIds: ["3", "5", "6"],
  },
  {
    id: "offer-2",
    title: "Birthday Gift Special",
    slug: "birthday-gift-special",
    blurb: "Birthday-ready toys that wow on the first try.",
    image: "/offer/offer3.png",
    productIds: ["1", "8", "9"],
  },
  {
    id: "offer-3",
    title: "Creative Learning Bundle",
    slug: "creative-learning-bundle",
    blurb: "Hands-on toys that grow skills through play.",
    image: "/offer/offer1.png",
    productIds: ["3", "5", "10"],
  },
  {
    id: "offer-4",
    title: "Family Pick of the Week",
    slug: "family-pick-of-the-week",
    blurb: "Family favorites chosen for all-ages fun.",
    image: "/offer/offer3.png",
    productIds: ["2", "7", "12"],
  },
  {
    id: "offer-5",
    title: "Safe Play Collection",
    slug: "safe-play-collection",
    blurb: "Soft, safe, and trusted toys for little hands.",
    image: "/offer/offer1.png",
    productIds: ["1", "7", "13"],
  },
  {
    id: "offer-6",
    title: "Imported Toys Flash Sale",
    slug: "imported-toys-flash-sale",
    blurb: "Limited-time prices on imported best sellers.",
    image: "/offer/offer3.png",
    productIds: ["4", "6", "14"],
  },
  {
    id: "offer-7",
    title: "Holiday Joy Bundle",
    slug: "holiday-joy-bundle",
    blurb: "Joy-packed bundles for holiday gifting.",
    image: "/offer/offer1.png",
    productIds: ["5", "8", "15"],
  },
  {
    id: "offer-8",
    title: "Best Seller Offers",
    slug: "best-seller-offers",
    blurb: "Top-rated toys everyone keeps coming back for.",
    image: "/offer/offer3.png",
    productIds: ["5", "6", "16"],
  },
];
