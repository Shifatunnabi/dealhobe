import type { MetadataRoute } from "next";

// Web app manifest: lets phones "Add to Home screen" with the right name, icon and colours.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "DealHobe — premium cosmetics, real beauty",
    short_name: "DealHobe",
    description: "Authentic imported cosmetics, skincare and baby care, delivered across Bangladesh with cash on delivery.",
    id: "/",
    start_url: "/?source=pwa",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#FFFBF8",
    theme_color: "#3B0D2E",
    lang: "en-BD",
    dir: "ltr",
    categories: ["shopping", "beauty", "lifestyle"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Shop all products", short_name: "Shop", url: "/products" },
      { name: "Offers", short_name: "Offers", url: "/offers" },
      { name: "My bag", short_name: "Bag", url: "/cart" },
    ],
  };
}
