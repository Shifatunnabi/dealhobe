export const INFORMATION_LINKS = [
  { label: "About Us", href: "/about-us" },
  { label: "Shipping & Delivery", href: "/shipping-delivery" },
  { label: "Terms & Conditions", href: "/terms-and-conditions" },
  { label: "Refund & Return Policy", href: "/refund-return-policy" },
] as const;

export type InformationPageContent = {
  title: string;
  eyebrow: string;
  description: string;
  highlights: { title: string; text: string }[];
  sections: { id: string; title: string; paragraphs: string[]; bullets?: string[] }[];
};

export const informationPages = {
  "about-us": {
    title: "Beauty for your everyday.",
    eyebrow: "About DealHobe",
    description: "Discover cosmetics, skincare, and beauty essentials in one place. Based in Dhaka, DealHobe brings online beauty shopping to customers across Bangladesh.",
    highlights: [
      { title: "Our mission", text: "To make beauty shopping simpler and more accessible through a thoughtful selection of products, clear information, and helpful customer support." },
      { title: "Our vision", text: "To become a trusted everyday beauty destination in Bangladesh, where people can explore products with confidence and build routines that feel their own." },
    ],
    sections: [
      { id: "our-story", title: "A place to explore your kind of beauty", paragraphs: ["Beauty is personal. Whether you are restocking a favourite or discovering something new, DealHobe brings cosmetics and beauty essentials together so you can shop at your own pace.", "Browse products by category and brand, explore offers, and visit our blog for more beauty content. Our goal is to make the journey from discovery to delivery feel straightforward."] },
      { id: "what-matters", title: "What matters to us", paragraphs: ["We want every visit to help you make a more informed choice."], bullets: ["Choice: explore products across brands and beauty categories.", "Clarity: review product details, prices, and your order total before placing an order.", "Convenience: check out as a guest or use an account to manage saved addresses and orders.", "Connection: reach our team when you need help with a product or an order."] },
      { id: "how-to-shop", title: "From discovery to your doorstep", paragraphs: ["Add your chosen products to the cart, enter your delivery details, and review the final total at checkout. Pay with cash on delivery and keep your order number handy for updates or support.", "Shopping for a regular routine or trying a new look? Start with our product collection and find what fits your needs."] },
      { id: "find-us", title: "Say hello", paragraphs: ["DealHobe is based at House 1/10, Block #A, Road #5, Lalmatia, Dhaka. For product questions, delivery help, or feedback, call 01338886611 or email dealhobe26@gmail.com.", "Please contact us before visiting or sending a parcel so we can guide you."] },
    ],
  },
  "shipping-delivery": {
    title: "From our store to your door.",
    eyebrow: "Shipping & Delivery",
    description: "A simple guide to delivery charges, checkout, and keeping up with your DealHobe order.",
    highlights: [
      { title: "Inside Dhaka · ৳95", text: "Select Inside Dhaka at checkout to apply the standard delivery charge for this area." },
      { title: "Outside Dhaka · ৳120", text: "Select Outside Dhaka at checkout to apply the standard delivery charge for this area." },
    ],
    sections: [
      { id: "coverage", title: "Delivery coverage & charges", paragraphs: ["We accept delivery orders within Bangladesh. Enter your full address and select the correct delivery area at checkout. Contact us if you are unsure about service to your location.", "Your final delivery charge appears in the order summary before you place the order. When a free delivery offer applies to your cart, checkout shows the charge as free."] },
      { id: "placing-an-order", title: "Getting your order ready", paragraphs: ["You can order as a guest or through your DealHobe account. Provide the recipient’s name, a reachable phone number, and a complete delivery address."], bullets: ["Include your house or flat number, road, area, and any useful landmark.", "Review the products, quantities, delivery charge, and total before confirming.", "Cash on delivery is the payment option currently available at checkout.", "Keep your phone available so the delivery team can reach you."] },
      { id: "delivery-updates", title: "Delivery timing & updates", paragraphs: ["Delivery timing depends on your location, order preparation, and courier availability. Contact our team with your order number for an estimate or an update. Holidays, weather, and courier disruptions may affect arrival times.", "Save the order confirmation and order number after checkout. If you provide an email address, we can also send your order confirmation there. Account customers can view their orders from their profile."] },
      { id: "changes", title: "Address changes or delivery issues", paragraphs: ["If you entered the wrong address or phone number, contact us as soon as possible with your order number and the correct details. Changes depend on how far the order has progressed.", "If your parcel is delayed, arrives damaged, or contains an incorrect item, contact us with the order details and photos where available. Keep the packaging while we review the issue."] },
    ],
  },
  "terms-and-conditions": {
    title: "A little clarity before you shop.",
    eyebrow: "Terms & Conditions",
    description: "Please read these shopping terms before placing an order. They explain how orders, prices, accounts, and support work on DealHobe.",
    highlights: [
      { title: "Review before confirming", text: "Check your items, quantities, delivery details, and final total at checkout." },
      { title: "Keep your order number", text: "Use the reference from your confirmation whenever you contact us about an order." },
    ],
    sections: [
      { id: "shopping", title: "Using DealHobe", paragraphs: ["Use the website to browse products and place genuine orders. Provide accurate contact and delivery information so we can process your order and reach you if needed.", "If you create an account, keep your login details private and review your saved addresses before ordering. Contact us if you notice unexpected activity involving your orders."] },
      { id: "product-details", title: "Products & availability", paragraphs: ["Check the product description and available options before adding an item to your cart. Product images help you explore the range; colours may appear differently across screens.", "Availability is checked when an order is placed. If an item becomes unavailable or there is a problem with your order, contact our team for help resolving it."] },
      { id: "pricing", title: "Prices, offers & payment", paragraphs: ["Prices and order totals are shown in Bangladeshi taka (BDT). Your checkout summary includes the product subtotal and applicable delivery charge. Review the final total before confirming your purchase.", "Offers depend on the products and promotions available when you shop. Any applicable free delivery is reflected at checkout. The current checkout payment method is cash on delivery."] },
      { id: "order-changes", title: "Order details & changes", paragraphs: ["After placing an order, keep your order number and confirmation. Contact us promptly if you need to change delivery details or request a cancellation. We will check the order’s current status before confirming what can be changed.", "Delivery information is available on our Shipping & Delivery page. If an item arrives with a problem, follow the support steps on our Refund & Return Policy page."] },
      { id: "questions", title: "Questions about these terms", paragraphs: ["For clarification before ordering, call 01338886611 or email dealhobe26@gmail.com. Include your order number if your question relates to an existing purchase.", "These shopping terms may be updated as our services change. Please review them when placing a new order."] },
    ],
  },
  "refund-return-policy": {
    title: "Let’s put things right.",
    eyebrow: "Refund & Return Policy",
    description: "If something is wrong with your order, our team can help you request a review and understand the next steps.",
    highlights: [
      { title: "Contact us first", text: "Tell us what happened and include your order number before sending any item back." },
      { title: "Keep the details", text: "Retain the product, packaging, and any photos that help explain the issue." },
    ],
    sections: [
      { id: "report-an-issue", title: "When to contact us", paragraphs: ["Contact us promptly if you receive an incorrect item, a damaged product, or an order with something missing. If you have another concern or want to ask about a return before purchasing, our team can explain the options for the specific product.", "Return eligibility is reviewed with the condition of the item and the nature of the issue in mind. Please check with us before opening or using a product you intend to return."] },
      { id: "request-review", title: "How to request a review", paragraphs: ["Email dealhobe26@gmail.com or call 01338886611 with the following details:"], bullets: ["Your order number and the phone number used at checkout.", "The product name and a short description of the issue.", "Clear photos of the item and packaging, where available.", "Whether you are requesting a replacement, return, or refund."] },
      { id: "returning-items", title: "Before sending an item back", paragraphs: ["Our team will review your request and confirm the next steps. Keep the original packaging, labels, and any accessories while the request is being reviewed.", "Wait for return instructions before booking a courier or visiting our address. We will confirm the destination, packaging requirements, and any applicable return delivery costs for your case."] },
      { id: "refunds", title: "Refunds & replacements", paragraphs: ["Submitting a request starts a review; the outcome is confirmed after the order details and issue have been checked. We will discuss whether a return, replacement, or refund is appropriate for your case.", "For an approved refund, our team will confirm the amount, payment method, and expected processing time with you. Since checkout currently uses cash on delivery, refund arrangements need to be confirmed directly with support.", "Replacement availability depends on stock. Please keep your order number and support correspondence until the issue is resolved."] },
      { id: "cancellations", title: "Need to cancel instead?", paragraphs: ["Contact us as soon as possible with your order number to request cancellation. Our team will check whether the order can still be stopped or whether delivery or return steps need to be discussed."] },
    ],
  },
} satisfies Record<string, InformationPageContent>;
