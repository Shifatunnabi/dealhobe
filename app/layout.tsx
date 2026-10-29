import type { Metadata, Viewport } from "next";
import { preconnect } from "react-dom";
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
    alternateLocale: ["bn_BD"],
    siteName: "DealHobe Bangladesh",
    title: "DealHobe - premium cosmetics, real beauty!",
    description:
      "Premium imported cosmetics and beauty essentials for every woman in Bangladesh. Authentic, safe, and affordable — delivered to your door.",
    // images: the generated 1200x630 card in app/opengraph-image.tsx (inherited by every page without its own)
  },
  twitter: {
    card: "summary_large_image",
    title: "DealHobe - premium cosmetics, real beauty!",
    description:
      "Premium imported cosmetics and beauty essentials for every woman in Bangladesh. Authentic, safe, and affordable.",
  },
  // Each page canonicalises to itself (without query string) unless it sets its own; the root must not point everything at "/".
  alternates: {
    canonical: "./",
  },
  applicationName: "DealHobe",
  formatDetection: { telephone: false, email: false, address: false },
  appleWebApp: { capable: true, title: "DealHobe", statusBarStyle: "default" },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION || undefined,
    other: process.env.BING_SITE_VERIFICATION ? { "msvalidate.01": process.env.BING_SITE_VERIFICATION } : undefined,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Colours the browser chrome (Android Chrome address bar, iOS Safari) to match the announcement bar.
  themeColor: "#3B0D2E",
  colorScheme: "light",
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

type Storefront = Awaited<ReturnType<typeof loadStorefront>>;

/**
 * Site-wide structured data (one @graph): the store as an Organization/Store with logo, contact points and
 * social profiles taken from Admin › Homepage Builder › Storefront, and a WebSite with a search action
 * (sitelinks search box) that lands on /products?q=…
 */
function siteGraph(sf: Storefront) {
  const abs = (u: string) => (u.startsWith("/") ? `${siteUrl}${u}` : u);
  const sameAs = Object.values(sf.socials ?? {}).filter((u): u is string => !!u && /^https?:\/\//.test(u));
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["Store", "Organization"],
        "@id": `${siteUrl}/#store`,
        name: "DealHobe Bangladesh",
        alternateName: "DealHobe",
        description: "Premium imported cosmetics and beauty essentials for every woman in Bangladesh. Authentic, safe, and affordable.",
        url: siteUrl,
        logo: { "@type": "ImageObject", url: abs(sf.logoUrl || "/logo/main-logo.png"), width: 1254, height: 1254 },
        image: `${siteUrl}/opengraph-image`,
        telephone: sf.contact.phone,
        email: sf.contact.email,
        address: {
          "@type": "PostalAddress",
          streetAddress: "House 1/10, Block #A, Road #5, Lalmatia",
          addressLocality: "Dhaka",
          addressRegion: "Dhaka Division",
          addressCountry: "BD",
        },
        contactPoint: [{ "@type": "ContactPoint", contactType: "customer service", telephone: sf.contact.phone, email: sf.contact.email, areaServed: "BD", availableLanguage: ["en", "bn"] }],
        ...(sameAs.length ? { sameAs } : {}),
        priceRange: "৳৳",
        areaServed: { "@type": "Country", name: "Bangladesh" },
        currenciesAccepted: "BDT",
        paymentAccepted: "Cash on Delivery",
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        name: "DealHobe",
        url: siteUrl,
        inLanguage: ["en-BD", "bn-BD"],
        publisher: { "@id": `${siteUrl}/#store` },
        potentialAction: {
          "@type": "SearchAction",
          target: { "@type": "EntryPoint", urlTemplate: `${siteUrl}/products?q={search_term_string}` },
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const storefront = await loadStorefront();
  // Early connection to the image CDN: product photos and banners are the LCP element on most pages.
  preconnect("https://res.cloudinary.com");
  return (
    <html lang="en-BD">
      <body
        className={`${jakarta.variable} ${fraunces.variable} antialiased bg-soft-bg text-text-dark`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteGraph(storefront)).replace(/</g, "\\u003c") }}
        />
        <ScrollReset />

        <QueryProvider>
          <CartProvider>
            <CartSidebar />
            <div className="flex min-h-screen flex-col">
              <Navbar storefront={storefront} />
              <main className="flex-1 pt-36">{children}</main>
              <RouteChrome storefront={storefront} />
            </div>
          </CartProvider>
        </QueryProvider>
        <Toaster position="top-right" toastOptions={{ duration: 3500 }} />
      </body>
    </html>
  );
}
