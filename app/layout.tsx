import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Fraunces } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import RouteChrome from "@/components/layout/RouteChrome";
import ScrollReset from "@/components/layout/ScrollReset";
import { CartProvider } from "@/components/cart/CartProvider";
import CartSidebar from "@/components/cart/CartSidebar";
import QueryProvider from "@/components/providers/QueryProvider";
import { Toaster } from "react-hot-toast";
import { getStorefront } from "@/lib/data";
import { DEFAULT_STOREFRONT } from "@/lib/homepage/defaults";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const fraunces = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["600", "700"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://dealhobe.com.bd";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "DealHobe - premium cosmetics, real beauty!",
    template: "%s | DealHobe Bangladesh",
  },
  description:
    "DealHobe Bangladesh brings premium imported cosmetics and beauty essentials for every woman. Authentic, safe, and affordable — shop online and get delivered across Dhaka and all of Bangladesh.",
  keywords: [
    "cosmetics Bangladesh",
    "buy cosmetics online Bangladesh",
    "makeup Dhaka",
    "imported cosmetics Bangladesh",
    "skincare Bangladesh",
    "beauty products online BD",
    "cosmetics shop Dhaka",
    "premium cosmetics Bangladesh",
    "authentic makeup Bangladesh",
    "cosmetics store Lalmatia Dhaka",
    "best cosmetics Bangladesh",
    "skincare products BD",
    "beauty essentials Dhaka",
    "DealHobe",
    "dealhobe bangladesh",
    "cosmetics delivery Bangladesh",
    "কসমেটিক্স বাংলাদেশ",
    "মেকআপ পণ্য",
    "কসমেটিক্সের দোকান ঢাকা",
  ],
  authors: [{ name: "DealHobe Bangladesh", url: siteUrl }],
  creator: "DealHobe Bangladesh",
  publisher: "DealHobe Bangladesh",
  category: "shopping",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_BD",
    url: siteUrl,
    siteName: "DealHobe Bangladesh",
    title: "DealHobe - premium cosmetics, real beauty!",
    description:
      "Premium imported cosmetics and beauty essentials for every woman in Bangladesh. Authentic, safe, and affordable — delivered to your door.",
    images: [
      {
        url: "/logo/main-logo.png",
        width: 800,
        height: 600,
        alt: "DealHobe Bangladesh — Premium Imported Cosmetics",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "DealHobe - premium cosmetics, real beauty!",
    description:
      "Premium imported cosmetics and beauty essentials for every woman in Bangladesh. Authentic, safe, and affordable.",
    images: ["/logo/main-logo.png"],
  },
  alternates: {
    canonical: siteUrl,
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Store",
  name: "DealHobe Bangladesh",
  description:
    "Premium imported cosmetics and beauty essentials for every woman in Bangladesh. Authentic, safe, and affordable.",
  url: siteUrl,
  telephone: "+8801338886611",
  email: "dealhobe26@gmail.com",
  address: {
    "@type": "PostalAddress",
    streetAddress: "House 1/10, Block #A, Road #5, Lalmatia",
    addressLocality: "Dhaka",
    addressRegion: "Dhaka Division",
    addressCountry: "BD",
  },
  priceRange: "৳৳",
  areaServed: { "@type": "Country", name: "Bangladesh" },
  currenciesAccepted: "BDT",
  paymentAccepted: "Cash on Delivery, Online Payment",
  image: `${siteUrl}/logo/main-logo.png`,
  logo: `${siteUrl}/logo/main-logo.png`,
};

// The navbar/footer chrome must render even if the database is briefly unreachable.
async function loadStorefront() {
  try {
    return await getStorefront();
  } catch (err) {
    console.error("[layout] storefront settings unavailable:", err instanceof Error ? err.message : err);
    return { ...DEFAULT_STOREFRONT, logoUrl: "/logo/main-logo.png", freeDeliveryThreshold: 0 };
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const storefront = await loadStorefront();
  return (
    <html lang="en-BD">
      <body
        className={`${jakarta.variable} ${fraunces.variable} antialiased bg-soft-bg text-text-dark`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <ScrollReset />

        <QueryProvider>
          <CartProvider>
            <CartSidebar />
            <div className="flex min-h-screen flex-col">
              <Navbar storefront={storefront} />
              <main className="flex-1 pt-36 pb-20 md:pb-0">{children}</main>
              <RouteChrome storefront={storefront} />
            </div>
          </CartProvider>
        </QueryProvider>
        <Toaster position="top-right" toastOptions={{ duration: 3500 }} />
      </body>
    </html>
  );
}
