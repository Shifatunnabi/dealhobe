import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Loader from "@/components/layout/Loader";
import RouteChrome from "@/components/layout/RouteChrome";
import ScrollReset from "@/components/layout/ScrollReset";
import { CartProvider } from "@/components/cart/CartProvider";
import CartSidebar from "@/components/cart/CartSidebar";
import QueryProvider from "@/components/providers/QueryProvider";
import { Toaster } from "react-hot-toast";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://joytoy.com.bd";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "JoyToy - safe toys, happy kids!",
    template: "%s | JoyToy Bangladesh",
  },
  description:
    "JoyToy Bangladesh brings premium imported toys for kids of all ages. Safe, certified, and fun — shop online and get delivered across Dhaka and all of Bangladesh.",
  keywords: [
    "toys Bangladesh",
    "buy toys online Bangladesh",
    "kids toys Dhaka",
    "imported toys Bangladesh",
    "safe toys for kids Bangladesh",
    "children toys online BD",
    "toy shop Dhaka",
    "premium toys Bangladesh",
    "educational toys Bangladesh",
    "toy store Uttara Dhaka",
    "best toys Bangladesh",
    "baby toys BD",
    "toddler toys Dhaka",
    "JoyToy",
    "joytoy bangladesh",
    "toy delivery Bangladesh",
    "খেলনা বাংলাদেশ",
    "শিশুদের খেলনা",
    "খেলনার দোকান ঢাকা",
  ],
  authors: [{ name: "JoyToy Bangladesh", url: siteUrl }],
  creator: "JoyToy Bangladesh",
  publisher: "JoyToy Bangladesh",
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
    siteName: "JoyToy Bangladesh",
    title: "JoyToy - safe toys, happy kids!",
    description:
      "Premium imported toys for kids in Bangladesh. Safe, certified, and fun — delivered to your door.",
    images: [
      {
        url: "/logo/main-logo.png",
        width: 800,
        height: 600,
        alt: "JoyToy Bangladesh — Premium Imported Toys",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "JoyToy - safe toys, happy kids!",
    description:
      "Premium imported toys for kids in Bangladesh. Safe, certified, and fun.",
    images: ["/logo/main-logo.png"],
  },
  alternates: {
    canonical: siteUrl,
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ToyStore",
  name: "JoyToy Bangladesh",
  description:
    "Premium imported toys for children in Bangladesh. Safe, certified, and fun.",
  url: siteUrl,
  telephone: "+8801339562735",
  email: "bdjoytoy@gmail.com",
  address: {
    "@type": "PostalAddress",
    streetAddress: "H 3, Rd - 19/A, Sector 4, Uttara",
    addressLocality: "Dhaka",
    addressRegion: "Dhaka Division",
    postalCode: "1230",
    addressCountry: "BD",
  },
  priceRange: "৳৳",
  areaServed: { "@type": "Country", name: "Bangladesh" },
  currenciesAccepted: "BDT",
  paymentAccepted: "Cash on Delivery, Online Payment",
  image: `${siteUrl}/logo/main-logo.png`,
  logo: `${siteUrl}/logo/main-logo.png`,
  sameAs: [
    "https://www.facebook.com/people/JoyToy/61586803048218/",
    "https://youtube.com/@joytoybd",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-BD">
      <body
        className={`${inter.variable} antialiased bg-soft-bg text-text-dark`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Loader />
        <ScrollReset />

        <QueryProvider>
          <CartProvider>
            <CartSidebar />
            <div className="flex min-h-screen flex-col">
              <Navbar />
              <main className="flex-1 pt-25 pb-20 md:pb-0">{children}</main>
              <RouteChrome />
            </div>
          </CartProvider>
        </QueryProvider>
        <Toaster position="top-right" toastOptions={{ duration: 3500 }} />
      </body>
    </html>
  );
}
