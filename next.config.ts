import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Cloudinary already serves optimized assets; bypass Next's fetch optimizer
    // to avoid intermittent TimeoutError failures on /_next/image.
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "picsum.photos",        pathname: "/**" },
      { protocol: "https", hostname: "images.unsplash.com",  pathname: "/**" },
      { protocol: "https", hostname: "source.unsplash.com",  pathname: "/**" },
      { protocol: "https", hostname: "res.cloudinary.com",   pathname: "/**" },
    ],
  },
};

export default nextConfig;
