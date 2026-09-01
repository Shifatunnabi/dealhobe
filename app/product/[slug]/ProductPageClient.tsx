"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiShoppingCart,
  FiChevronRight,
  FiCheck,
  FiPlus,
  FiMinus,
  FiShare2,
  FiCopy,
  FiX,
  FiUser,
  FiFacebook,
  FiInstagram,
} from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";

import { cn } from "@/lib/utils";
import {
  fadeUp,
  slideInLeft,
  slideInRight,
  staggerContainer,
  scaleIn,
} from "@/components/animations/variants";
import ColorfulTitle from "@/components/ui/ColorfulTitle";
import { useCart } from "@/components/cart/CartProvider";

/* ─── Stock Badge ────────────────────────────────────────────── */
function StockBadge({ stockStr, qty }: { stockStr?: string, qty?: number }) {
  let status = "in_stock";
  if (qty === 0) status = "out_of_stock";
  else if (qty && qty < 10) status = "low_stock";
  else if (stockStr === "out_of_stock") status = "out_of_stock";

  const config: Record<string, { label: string; dot: string; pill: string }> = {
    in_stock: {
      label: "In Stock",
      dot: "bg-green-500",
      pill: "bg-green-50 text-green-700 border-green-200",
    },
    low_stock: {
      label: "Low Stock",
      dot: "bg-yellow-500",
      pill: "bg-yellow-50 text-yellow-700 border-yellow-200",
    },
    out_of_stock: {
      label: "Out of Stock",
      dot: "bg-red-500",
      pill: "bg-red-50 text-red-700 border-red-200",
    },
  };
  const { label, dot, pill } = config[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-inter text-xs font-semibold",
        pill,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", dot)} />
      {label}
    </span>
  );
}

/* ─── Related Product Card ───────────────────────────────────── */
function RelatedCard({ product }: { product: any }) {
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();
  const offerBadgeText = product.offerDiscountType
    ? product.offerDiscountType === "percentage"
      ? `-${product.offerDiscountAmount}%`
      : `-৳${product.offerDiscountAmount}`
    : null;
  const availableQty = Number(product.quantity ?? product.qty ?? 0);
  const outOfStock = availableQty <= 0;

  return (
    <motion.article
      variants={scaleIn}
      className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-card transition-shadow hover:shadow-hover"
    >
      <Link href={`/product/${product.slug}`} className="block">
        <div className="p-3 pb-0">
          <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-gray-50">
            <Image
              src={product.images?.[0] || '/placeholder.png'}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-500 hover:scale-105"
              sizes="(max-width: 640px) 50vw, 25vw"
              loading="lazy"
            />
            {product.badge && (
              <span className="absolute left-2 top-2 z-10 rounded-full bg-gradient-primary px-2.5 py-0.5 text-xs font-inter font-semibold text-white">
                {product.badge}
              </span>
            )}
            {!product.badge && offerBadgeText && (
              <span className="absolute left-2 top-2 z-10 rounded-full bg-gradient-yellow px-2.5 py-0.5 text-xs font-inter font-semibold text-text-dark">
                {offerBadgeText}
              </span>
            )}
          </div>
        </div>
        <div className="px-3 pb-1 pt-2.5">
          <h3 className="line-clamp-2 font-inter text-sm font-semibold leading-snug text-gray-900">
            {product.name}
          </h3>
          <div className="mt-1.5 flex items-baseline gap-1.5">
            <p className="font-inter text-lg font-bold text-primary-pink">
              ৳{(product.salePrice || product.price).toLocaleString()}.00
            </p>
            {product.salePrice && product.price > product.salePrice && (
              <span className="text-xs text-text-muted line-through">
                ৳{product.price.toLocaleString()}
              </span>
            )}
          </div>
        </div>
      </Link>
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={() => {
          if (outOfStock) return;
          addItem(
            {
              productId: product._id,
              slug: product.slug,
              name: product.name,
              image: product.images?.[0] || "/placeholder.png",
              unitPrice: product.salePrice || product.price,
              qty: 1,
              maxQty: availableQty,
            },
            1,
          );
          setAdded(true);
          setTimeout(() => setAdded(false), 1600);
        }}
        className={cn(
          "mt-auto flex w-full items-center justify-center rounded-b-2xl py-2.5 transition-colors duration-300",
          outOfStock
            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
            : added
            ? "bg-green-500"
            : "bg-primary-pink hover:bg-primary-pink/90",
        )}
        aria-label="Add to cart"
        disabled={outOfStock}
      >
        <AnimatePresence mode="wait" initial={false}>
          {added ? (
            <motion.span
              key="check"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              <FiCheck size={20} className="text-white" />
            </motion.span>
          ) : (
            <motion.span
              key="cart"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              <FiShoppingCart size={20} className="text-white" />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </motion.article>
  );
}

/* ─── Main Page ──────────────────────────────────────────────── */
export default function ProductDetailPageClient({
  product,
  relatedProducts = [],
  reviews = [],
}: {
  product: any;
  relatedProducts?: any[];
  reviews?: any[];
}) {
  const router = useRouter();
  const [added, setAdded] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeThumb, setActiveThumb] = useState(0);
  const [featuresOpen, setFeaturesOpen] = useState(true);
  const [selectedQty, setSelectedQty] = useState(1);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const { addItem, clearCart, closeSidebar } = useCart();
  const [reviewList, setReviewList] = useState<any[]>(reviews || []);
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewError, setReviewError] = useState("");
  const [reviewSaving, setReviewSaving] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");

  const authToken = useMemo(() => {
    if (typeof window === "undefined") return "";
    return window.localStorage.getItem("joytoy_auth_token_v1") || "";
  }, []);

  useEffect(() => {
    if (!authToken) return;
    fetch("/api/auth/me", {
      headers: { Authorization: `Bearer ${authToken}` },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user?.fullName) {
          setCustomerName(data.user.fullName);
        }
        if (data?.user?.email) {
          setCustomerEmail(data.user.email);
        }
        setIsLoggedIn(true);
      })
      .catch(() => {
        setIsLoggedIn(false);
      });
  }, [authToken]);

  useEffect(() => {
    setReviewList(reviews || []);
  }, [reviews]);

  const hasReviewed = useMemo(() => {
    if (!customerEmail) return false;
    return reviewList.some((item) => item.customerEmail === customerEmail);
  }, [customerEmail, reviewList]);

  /* ── Product not found ── */
  if (!product) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-soft-bg pt-16">
        <div className="text-center">
          <span className="mb-4 block text-7xl">🧸</span>
          <h2 className="text-card-title mb-2 text-text-dark">
            Product not found
          </h2>
          <p className="text-small mb-6 text-text-muted">
            This toy doesn&apos;t exist or may have been removed.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 rounded-2xl bg-primary-pink px-6 py-3 font-inter font-semibold text-white shadow-button hover:shadow-hover transition-all"
          >
            Browse All Toys <FiChevronRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  const offerBadgeText = product.offerDiscountType
    ? product.offerDiscountType === "percentage"
      ? `-${product.offerDiscountAmount}%`
      : `-৳${product.offerDiscountAmount}`
    : null;

  const thumbImages: string[] = product.images?.length > 0 ? product.images : ["/placeholder.png"];
  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const brandLabel = product.brandDisplay || product.brand?.name || product.brand;
  const categoryLabel = product.categoryDisplay || product.category?.name || product.category;
  const rawAgeLabel = product.ageRangeDisplay || product.ageRange?.label || product.ageRange;
  const ageLabel = (() => {
    if (!rawAgeLabel) return "-";
    const lowered = String(rawAgeLabel).toLowerCase();
    if (lowered.includes("year") || lowered.includes("yrs") || lowered.includes("month")) {
      return rawAgeLabel;
    }
    return `${rawAgeLabel} yrs`;
  })();

  const availableQty = Number(product.quantity ?? product.qty ?? 0);
  const outOfStock = availableQty <= 0;
  const canExpandDescription = useMemo(() => {
    const plainText = String(product?.description || "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    return plainText.length > 180;
  }, [product?.description]);

  useEffect(() => {
    if (outOfStock) {
      setSelectedQty(1);
      return;
    }
    setSelectedQty((prev) => Math.min(Math.max(1, prev), availableQty));
  }, [availableQty, outOfStock]);

  const handleAddToCart = () => {
    if (outOfStock) return;
    addItem(
      {
        productId: product._id,
        slug: product.slug,
        name: product.name,
        image: product.images?.[0] || "/placeholder.png",
        unitPrice: product.salePrice || product.price,
        qty: selectedQty,
        maxQty: availableQty,
      },
      selectedQty,
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  const handleBuyNow = () => {
    if (outOfStock) return;

    clearCart();
    addItem(
      {
        productId: product._id,
        slug: product.slug,
        name: product.name,
        image: product.images?.[0] || "/placeholder.png",
        unitPrice: product.salePrice || product.price,
        qty: selectedQty,
        maxQty: availableQty,
      },
      selectedQty,
    );
    closeSidebar();
    router.push("/checkout");
  };

  const reloadReviews = async () => {
    if (!product?._id) return;
    const res = await fetch(`/api/reviews?productId=${product._id}`);
    if (!res.ok) return;
    const data = await res.json();
    setReviewList(Array.isArray(data) ? data : []);
  };

  const handleReviewSubmit = async () => {
    if (!product?._id || !reviewText.trim()) return;
    if (!authToken) {
      setReviewError("Please log in to submit a review.");
      return;
    }

    setReviewSaving(true);
    setReviewError("");
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          productId: product._id,
          review: reviewText.trim(),
          rating: reviewRating,
        }),
      });

      if (res.status === 409) {
        setReviewError("You already reviewed this product.");
        return;
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setReviewError(data?.error || "Failed to submit review.");
        return;
      }

      setReviewText("");
      setReviewRating(5);
      await reloadReviews();
    } finally {
      setReviewSaving(false);
    }
  };

  const handleCopyLink = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  const openShare = (type: "facebook" | "whatsapp" | "instagram") => {
    if (!shareUrl) return;

    if (type === "facebook") {
      window.open(
        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
        "_blank",
        "noopener,noreferrer",
      );
      return;
    }

    if (type === "whatsapp") {
      window.open(
        `https://wa.me/?text=${encodeURIComponent(`Check this out: ${shareUrl}`)}`,
        "_blank",
        "noopener,noreferrer",
      );
      return;
    }

    window.open("https://www.instagram.com/", "_blank", "noopener,noreferrer");
  };

  const handleOrderWhatsApp = () => {
    const message = shareUrl
      ? `Hi! I want to order: ${product.name} - ${shareUrl}`
      : `Hi! I want to order: ${product.name}`;

    window.open(
      `https://wa.me/?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  return (
    <div className="min-h-screen bg-soft-bg pt-26">
      {/* ─── Breadcrumb ─── */}
      <div className="px-section pt-8 pb-2">
        <nav className="flex flex-wrap items-center justify-center gap-2 text-small text-text-muted">
          <Link
            href="/"
            className="transition-colors hover:text-primary-pink"
          >
            Home
          </Link>
          <FiChevronRight size={12} />
          <Link
            href="/products"
            className="transition-colors hover:text-primary-pink"
          >
            All Toys
          </Link>
          <FiChevronRight size={12} />
          <span className="line-clamp-1 font-semibold text-text-dark">
            {product.name}
          </span>
        </nav>
      </div>

      {/* ─── Product Hero ─── */}
      <section className="px-section py-8">
        <div className="mx-auto max-w-7xl grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-14 lg:items-stretch">
          {/* ── Left: Image showcase ── */}
          <motion.div
            variants={slideInLeft}
            initial="hidden"
            animate="visible"
            className="space-y-4"
          >
            {/* Main image card */}
            <div className="relative aspect-square w-full overflow-hidden rounded-3xl bg-white shadow-card">
              <Image
                src={thumbImages[activeThumb]}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
              {/* Overlay badges */}
              {offerBadgeText && (
                <span className="absolute left-4 top-4 rounded-full bg-gradient-yellow px-3 py-1 font-inter text-sm font-bold text-text-dark shadow-button">
                  {offerBadgeText} OFF
                </span>
              )}
              {product.badge && !offerBadgeText && (
                <span className="absolute left-4 top-4 rounded-full bg-gradient-primary px-3 py-1 font-inter text-sm font-bold text-white shadow-button">
                  {product.badge}
                </span>
              )}
            </div>

            {/* Thumbnails */}
            <div className="flex gap-3">
              {thumbImages.map((img: string, i: number) => (
                <button
                  key={i}
                  onClick={() => setActiveThumb(i)}
                  className={cn(
                    "relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-2 transition-all duration-200",
                    activeThumb === i
                      ? "border-primary-pink shadow-button scale-105"
                      : "border-transparent opacity-60 shadow-card hover:opacity-100",
                  )}
                >
                  <Image
                    src={img}
                    alt={`View ${i + 1}`}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </button>
              ))}
            </div>
          </motion.div>

          {/* ── Right: Product details ── */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="flex flex-col space-y-5 lg:overflow-y-auto"
          >
            {/* Stock + category row */}
            <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-3">
              <StockBadge qty={availableQty} stockStr="in_stock" />
              <span className="rounded-full bg-soft-bg-alt px-3 py-1 font-inter text-xs font-semibold text-text-muted">
                {categoryLabel}
              </span>
            </motion.div>

            {/* Name */}
            <motion.h1
              variants={fadeUp}
              className="product-page-title leading-tight text-text-dark"
            >
              {product.name}
            </motion.h1>

            {/* Price */}
            <motion.div variants={fadeUp} className="flex items-baseline gap-3">
              <span className="font-inter text-4xl font-bold text-primary-pink">
                ৳{(product.salePrice || product.price).toLocaleString()}.00
              </span>
              {product.salePrice && product.price > product.salePrice && (
                <span className="font-inter text-lg text-text-muted line-through">
                  ৳{product.price.toLocaleString()}.00
                </span>
              )}
            </motion.div>

            {/* Short description */}
            <motion.p
              variants={fadeUp}
              className="text-body leading-relaxed text-text-muted"
            >
              {product.shortDescription}
            </motion.p>

            {/* Meta pills */}
            <motion.div variants={fadeUp} className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 rounded-2xl border border-gray-100 bg-white px-4 py-2 shadow-soft">
                <span className="font-inter text-xs text-text-muted">Brand</span>
                <span className="font-inter text-sm font-semibold text-text-dark">
                  {brandLabel}
                </span>
              </div>
              <div className="flex items-center gap-2 rounded-2xl border border-gray-100 bg-white px-4 py-2 shadow-soft">
                <span className="font-inter text-xs text-text-muted">Age</span>
                <span className="font-inter text-sm font-semibold text-text-dark">
                  {ageLabel}
                </span>
              </div>
            </motion.div>

            {/* Action buttons */}
            <motion.div
              variants={fadeUp}
              className="flex flex-col gap-3"
            >
              <div className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-2 shadow-soft w-fit">
                <button
                  type="button"
                  onClick={() => setSelectedQty((prev) => Math.max(1, prev - 1))}
                  disabled={outOfStock || selectedQty <= 1}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 text-text-dark transition-colors hover:border-primary-pink hover:text-primary-pink disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Decrease quantity"
                >
                  <FiMinus size={15} />
                </button>
                <span className="min-w-10 text-center font-inter text-sm font-semibold text-text-dark">
                  {selectedQty}
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedQty((prev) => Math.min(availableQty, prev + 1))}
                  disabled={outOfStock || selectedQty >= availableQty}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 text-text-dark transition-colors hover:border-primary-pink hover:text-primary-pink disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Increase quantity"
                >
                  <FiPlus size={15} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Add to Cart */}
                <motion.button
                  whileHover={!outOfStock ? { y: -2 } : {}}
                  whileTap={!outOfStock ? { scale: 0.96 } : {}}
                  onClick={handleAddToCart}
                  disabled={outOfStock}
                  className={cn(
                    "flex items-center justify-center gap-2.5 rounded-2xl border-2 py-4 font-inter text-base font-semibold transition-all",
                    outOfStock
                      ? "cursor-not-allowed border-gray-200 text-gray-400"
                      : added
                        ? "border-green-500 bg-green-500 text-white shadow-button"
                        : "border-primary-pink text-primary-pink hover:bg-primary-pink hover:text-white",
                  )}
                >
                  {added ? <FiCheck size={20} /> : <FiShoppingCart size={20} />}
                  {added
                    ? "Added to Cart!"
                    : outOfStock
                      ? "Out of Stock"
                      : "Add to Cart"}
                </motion.button>

                {/* Buy Now */}
                <motion.button
                  whileHover={!outOfStock ? { y: -2 } : {}}
                  whileTap={!outOfStock ? { scale: 0.96 } : {}}
                  onClick={handleBuyNow}
                  disabled={outOfStock}
                  className={cn(
                    "flex items-center justify-center gap-2.5 rounded-2xl px-4 py-3 font-inter text-base font-semibold transition-all",
                    outOfStock
                      ? "cursor-not-allowed bg-gray-200 text-gray-400"
                      : "bg-gradient-primary text-white shadow-button hover:shadow-hover",
                  )}
                >
                  Buy Now
                </motion.button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Order on WhatsApp */}
                <motion.button
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={handleOrderWhatsApp}
                  className="flex items-center justify-center gap-2.5 rounded-2xl border-2 border-green-500 px-4 py-3 font-inter text-base font-semibold text-green-600 transition-all hover:bg-green-500 hover:text-white"
                >
                  <FaWhatsapp size={18} />
                  Order on WhatsApp
                </motion.button>

                {/* Share */}
                <motion.button
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setShareOpen(true)}
                  className="flex items-center justify-center gap-2 rounded-2xl border-2 border-accent-blue px-4 py-3 font-inter text-sm font-semibold text-accent-blue transition-all hover:bg-accent-blue hover:text-white md:text-base"
                >
                  <FiShare2 size={18} />
                  Share
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Share Modal */}
      <AnimatePresence>
        {shareOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4"
            onClick={() => setShareOpen(false)}
          >
            <motion.div
              initial={{ y: 20, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 14, opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-md rounded-3xl bg-white p-5 shadow-hover"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-inter text-lg font-semibold text-text-dark">Share Product</h3>
                <button
                  onClick={() => setShareOpen(false)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-text-muted transition-colors hover:border-primary-pink hover:text-primary-pink"
                  aria-label="Close share dialog"
                >
                  <FiX size={18} />
                </button>
              </div>

              <div className="border-b border-gray-100 pb-4">
                <p className="mb-3 font-inter text-sm font-semibold text-text-dark">Share via</p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => openShare("facebook")}
                    aria-label="Share on Facebook"
                    className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-blue-200 bg-blue-50 text-blue-700 transition-colors hover:bg-blue-100"
                  >
                    <FiFacebook size={20} />
                  </button>
                  <button
                    onClick={() => openShare("whatsapp")}
                    aria-label="Share on WhatsApp"
                    className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-green-200 bg-green-50 text-green-700 transition-colors hover:bg-green-100"
                  >
                    <FaWhatsapp size={20} />
                  </button>
                  <button
                    onClick={() => openShare("instagram")}
                    aria-label="Share on Instagram"
                    className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-pink-200 bg-pink-50 text-pink-700 transition-colors hover:bg-pink-100"
                  >
                    <FiInstagram size={20} />
                  </button>
                  <button
                    onClick={handleCopyLink}
                    aria-label="Copy link"
                    className={cn(
                      "inline-flex h-12 w-12 items-center justify-center rounded-full border transition-colors",
                      copied
                        ? "border-green-200 bg-green-50 text-green-700"
                        : "border-gray-200 bg-soft-bg text-text-muted hover:bg-gray-100",
                    )}
                  >
                    {copied ? <FiCheck size={20} /> : <FiCopy size={20} />}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Description ─── */}
      <section className="bg-soft-bg px-section py-section">
        <div className="mx-auto max-w-7xl">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
          >
            <div className="mb-6 text-center">
              <ColorfulTitle title="Product Description" className="text-primary-pink" />
            </div>

            {product.whyLoveIt?.length > 0 && (
              <motion.div variants={fadeUp} className="mx-auto w-full rounded-3xl p-6 sm:p-8">
                <p className="mb-3 font-inter text-xs font-semibold uppercase tracking-widest text-primary-pink">
                  What they will love:
                </p>
                <ul className="space-y-2">
                  {product.whyLoveIt.map((feat: string, i: number) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-text-muted">
                      <span className="mt-0.5 shrink-0 font-inter font-bold text-primary-pink">✓</span>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}

            <motion.div
              variants={fadeUp}
              className="mx-auto w-full rounded-3xl p-6 sm:p-8"
            >
              <p className="mb-3 font-inter text-xs font-semibold uppercase tracking-widest text-primary-pink">
                  Everything about this product
                </p>
              <div
                className={cn(
                  "prose prose-sm sm:prose-base max-w-none text-body whitespace-pre-line leading-relaxed text-text-muted",
                  !descriptionExpanded && "line-clamp-2",
                )}
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
              {canExpandDescription && (
                <button
                  type="button"
                  onClick={() => setDescriptionExpanded((prev) => !prev)}
                  className="mt-4 text-sm font-semibold text-primary-pink hover:underline"
                >
                  {descriptionExpanded ? "See less" : "See more"}
                </button>
              )}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ─── Customer Reviews ─── */}
      <section className="bg-soft-bg px-section py-section">
        <div className="mx-auto max-w-7xl">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
          >
            <motion.div variants={fadeUp} className="mb-8 text-center">
              <ColorfulTitle title="Customer Reviews" className="text-primary-pink" />
              <p className="mt-2 font-inter text-sm text-text-muted">
                Share your thoughts on this product.
              </p>
            </motion.div>

            <motion.div variants={fadeUp} className="mb-10 rounded-3xl bg-white p-6 shadow-card">
              {isLoggedIn ? (
                <>
                  <div className="mb-4 flex items-center justify-between">
                    <div className="font-inter text-sm font-semibold text-text-dark">
                      Writing as {customerName || "Customer"}
                    </div>
                  </div>
                  {hasReviewed ? (
                    <p className="text-sm text-text-muted">
                      You have already submitted a review for this product.
                    </p>
                  ) : (
                    <>
                      <textarea
                        rows={4}
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        className="w-full rounded-2xl border border-gray-200 bg-soft-bg px-4 py-3 text-sm text-text-dark outline-none focus:border-primary-pink"
                        placeholder="Write your review..."
                      />
                      {reviewError && (
                        <p className="mt-2 text-sm text-red-500">{reviewError}</p>
                      )}
                      <div className="mt-4 flex justify-end">
                        <button
                          className="inline-flex items-center justify-center rounded-2xl bg-gradient-primary px-6 py-3 text-sm font-semibold text-white shadow-button transition-all disabled:opacity-60"
                          onClick={handleReviewSubmit}
                          disabled={reviewSaving || !reviewText.trim()}
                        >
                          {reviewSaving ? "Submitting..." : "Submit Review"}
                        </button>
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="text-sm text-text-muted">
                  Please <Link href="/auth/login" className="text-primary-pink hover:underline">log in</Link> to write a review.
                </div>
              )}
            </motion.div>

            {reviewList.length === 0 ? (
              <div className="text-center text-sm text-text-muted">No reviews yet.</div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {reviewList.map((review) => (
                  <div key={review._id} className="rounded-3xl border border-primary-pink/15 bg-white p-5 shadow-card">
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary-pink/10 text-primary-pink">
                          <FiUser className="h-4 w-4" />
                        </span>
                        <div>
                          <div className="font-inter text-sm font-semibold text-text-dark">
                            {review.customerName}
                          </div>
                          <div className="text-xs text-text-muted">
                            {new Date(review.createdAt).toLocaleDateString()} {new Date(review.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </div>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-text-muted">&quot;{review.review}&quot;</p>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* ─── Related Products ─── */}
      {relatedProducts.length > 0 && (
        <section className="bg-soft-bg px-section py-section">
          <div className="mx-auto max-w-7xl">
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
            >
              <motion.div variants={fadeUp} className="mb-8 text-center">
                <ColorfulTitle title="YOU MAY ALSO LIKE" className="text-primary-pink" />
                <p className="mt-2 font-inter text-sm text-text-muted">
                  More picks from {product.category.name}
                </p>
              </motion.div>

              <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
                {relatedProducts.map((p) => (
                  <RelatedCard key={p._id} product={p} />
                ))}
              </div>

              <motion.div variants={fadeUp} className="mt-10 text-center">
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 rounded-2xl border-2 border-primary-pink px-6 py-3 font-inter font-semibold text-primary-pink transition-all hover:bg-primary-pink hover:text-white"
                >
                  View All Products
                  <FiChevronRight size={16} />
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </section>
      )}
    </div>
  );
}
