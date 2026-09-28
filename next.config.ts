import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Keep the local optimization endpoint enabled. The loader sends Cloudinary
    // requests directly to its CDN, avoiding remote optimizer fetch timeouts.
    loaderFile: "./lib/image-loader.ts",
    remotePatterns: [
      { protocol: "https", hostname: "picsum.photos",        pathname: "/**" },
      { protocol: "https", hostname: "images.unsplash.com",  pathname: "/**" },
      { protocol: "https", hostname: "source.unsplash.com",  pathname: "/**" },
      { protocol: "https", hostname: "res.cloudinary.com",   pathname: "/**" },
    ],
  },
};

export default nextConfig;
