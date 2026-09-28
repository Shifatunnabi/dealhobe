import { test, expect } from "@playwright/test";
import imageLoader from "../lib/image-loader";

test("local images use the local optimizer and remote images avoid proxy fetches", () => {
  const local = new URL(imageLoader({ src: "/products/a b.jpg", width: 640 }), "http://localhost");
  expect(local.pathname).toBe("/_next/image");
  expect(local.searchParams.get("url")).toBe("/products/a b.jpg");
  expect(local.searchParams.get("w")).toBe("640");
  expect(imageLoader({ src: "https://res.cloudinary.com/shop/image/upload/v123/product.jpg", width: 640 })).toBe("https://res.cloudinary.com/shop/image/upload/c_limit,w_640/f_auto/q_auto/v123/product.jpg");
  for (const src of ["https://res.cloudinary.com/shop/image/upload/s--signature--/v123/product.jpg", "https://images.unsplash.com/photo.jpg", "/logo.svg"]) {
    expect(imageLoader({ src, width: 640 })).toBe(src);
  }
});
