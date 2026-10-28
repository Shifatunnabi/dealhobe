/** Taka amount, rounded, with South-Asian digit grouping (৳1,25,000). */
export const money = (n: number) => `৳${Math.round(Number(n) || 0).toLocaleString("en-IN")}`;

/** Flat delivery charge per area (display only; the order API computes the real charge). */
export const DELIVERY_CHARGE = {
  inside_dhaka: 95,
  outside_dhaka: 120,
} as const;

export type DeliveryArea = keyof typeof DELIVERY_CHARGE;

export const AREA_LABEL: Record<DeliveryArea, string> = {
  inside_dhaka: "Inside Dhaka",
  outside_dhaka: "Outside Dhaka",
};

/** Customer support line, as published on the Refund & Return Policy page. */
export const SUPPORT_PHONE = "01338886611";
