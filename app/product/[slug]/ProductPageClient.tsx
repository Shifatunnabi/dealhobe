"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiShoppingCart,
  FiChevronLeft,
  FiChevronRight,
  FiCheck,
  FiPlus,
  FiMinus,
  FiUser,
  FiAlertCircle,
} from "react-icons/fi";

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
import { getProductCoverImage, getProductImages } from "@/lib/product-images";
import ProductPhoto from "@/components/ui/ProductPhoto";

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
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-poppins text-xs font-semibold",
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
  const hasVariants = !!product.hasVariants;
  const router = useRouter();

  return (
    <motion.article
      variants={scaleIn}
      className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-card transition-shadow hover:shadow-hover"
    >
      <Link href={`/product/${product.slug}`} className="block">
        <div className="p-3 pb-0">
          <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-white">
            <ProductPhoto
              src={getProductCoverImage(product) || '/placeholder.png'}
              alt={product.name}
              requestWidth={600}
              imgClassName="transition-transform duration-500 hover:scale-105"
            />
            {product.badge && (
              <span className="absolute left-2 top-2 z-10 rounded-full bg-gradient-primary px-2.5 py-0.5 text-xs font-poppins font-semibold text-white">
                {product.badge}
              </span>
            )}
            {!product.badge && offerBadgeText && (
              <span className="absolute left-2 top-2 z-10 rounded-full bg-gradient-yellow px-2.5 py-0.5 text-xs font-poppins font-semibold text-text-dark">
                {offerBadgeText}
              </span>
            )}
          </div>
        </div>
        <div className="px-3 pb-1 pt-2.5">
          <h3 className="line-clamp-2 font-poppins text-sm font-semibold leading-snug text-gray-900">
            {product.name}
          </h3>
          <div className="mt-1.5 flex items-baseline gap-1.5">
            <p className="font-poppins text-lg font-bold text-primary-pink">
              {hasVariants && <span className="mr-1 text-xs font-medium text-text-muted">From</span>}
              ৳{(product.salePrice || product.price).toLocaleString()}.00
            </p>
            {!!product.salePrice && product.price > product.salePrice && (
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
          if (hasVariants) {
            router.push(`/product/${product.slug}`);
            return;
          }
          addItem(
            {
              productId: product._id,
              slug: product.slug,
              name: product.name,
              image: getProductCoverImage(product) || "/placeholder.png",
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
  const [activeThumb, setActiveThumb] = useState(0);
  const thumbStripRef = useRef<HTMLDivElement>(null);
  const [featuresOpen, setFeaturesOpen] = useState(true);
  const [selectedQty, setSelectedQty] = useState(1);
  // Variant selection: option name → chosen value. Nothing is preselected — the shopper picks
  // every option before adding to cart, and the main product photo shows until they do.
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  // Set when Add to Cart / Buy Now is pressed before every option is chosen.
  const [selectionPrompt, setSelectionPrompt] = useState(false);
  const variantSelectorRef = useRef<HTMLDivElement>(null);
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
    return window.localStorage.getItem("dealhobe_auth_token_v1") || "";
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
      <div className="flex min-h-screen items-center justify-center bg-soft-bg pt-6">
        <div className="text-center">
          <FiAlertCircle size={64} className="mb-4 inline-block text-primary-pink/40" />
          <h2 className="text-card-title mb-2 text-text-dark">
            Product not found
          </h2>
          <p className="text-small mb-6 text-text-muted">
            This product doesn&apos;t exist or may have been removed.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 rounded-2xl bg-primary-pink px-6 py-3 font-poppins font-semibold text-white shadow-button hover:shadow-hover transition-all"
          >
            Browse All Products <FiChevronRight size={16} />
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

  const galleryImages = getProductImages(product);
  const thumbImages: string[] = galleryImages.length > 0 ? galleryImages : ["/placeholder.png"];
  const brandLabel = product.brandDisplay || product.brand?.name || product.brand;
  const categoryLabel = product.categoryDisplay || product.category?.name || product.category;
  const subCategoryLabel = product.subCategoryDisplay || product.subCategory?.name || product.subCategory;
  const categoryPathLabel = subCategoryLabel ? `${categoryLabel} / ${subCategoryLabel}` : categoryLabel;

  const hasVariants = !!product.hasVariants && (product.variants?.length ?? 0) > 0;
  const variantOptions: { name: string; values: string[] }[] = hasVariants ? product.variantOptions || [] : [];
  const allOptionsChosen = variantOptions.every((o) => !!selectedOptions[o.name]);
  const selectedVariant: any = hasVariants && allOptionsChosen
    ? (product.variants as any[]).find((v) =>
        v.options.every((o: any) => selectedOptions[o.name] === o.value),
      )
    : null;
  const needsSelection = hasVariants && !selectedVariant;
  // A value is selectable only if some in-stock variant has it together with the other picks made so far
  // (options not chosen yet match anything).
  const isValueAvailable = (optName: string, value: string) =>
    (product.variants as any[]).some(
      (v) =>
        v.quantity > 0 &&
        v.options.some((o: any) => o.name === optName && o.value === value) &&
        v.options.every((o: any) => o.name === optName || !selectedOptions[o.name] || selectedOptions[o.name] === o.value),
    );
  // Before a variant is chosen, show the cheapest option's price ("From" only when prices differ).
  const variantList: any[] = hasVariants ? product.variants : [];
  const effectivePrice = (v: any) => v.salePrice || v.price;
  const cheapestVariant = variantList.reduce(
    (best: any, v: any) => (!best || effectivePrice(v) < effectivePrice(best) ? v : best),
    null,
  );
  const pricesVary = new Set(variantList.map(effectivePrice)).size > 1;
  const variantImage: string | null =
    selectedVariant && !selectedVariant.useMainImage && selectedVariant.image ? selectedVariant.image : null;
  const variantLabel: string = selectedVariant ? selectedVariant.options.map((o: any) => o.value).join(" / ") : "";
  const priceSource: any = selectedVariant || cheapestVariant;
  const displayPrice: number = priceSource
    ? effectivePrice(priceSource)
    : product.salePrice || product.price;
  const displayOriginal: number | null = priceSource
    ? priceSource.salePrice && priceSource.price > priceSource.salePrice ? priceSource.price : null
    : product.salePrice && product.price > product.salePrice ? product.price : null;

  // Until a variant is chosen, stock is the total across all variants.
  const availableQty = hasVariants
    ? selectedVariant
      ? Number(selectedVariant.quantity ?? 0)
      : variantList.reduce((n: number, v: any) => n + Number(v.quantity || 0), 0)
    : Number(product.quantity ?? product.qty ?? 0);
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

  // Jump to the selected variant's photo in the gallery; back to the first photo otherwise.
  const variantThumbIndex = variantImage ? thumbImages.indexOf(variantImage) : -1;
  useEffect(() => {
    setActiveThumb(Math.max(0, variantThumbIndex));
    scrollThumbIntoView(Math.max(0, variantThumbIndex));
  }, [variantThumbIndex]);

  /** Scrolls the thumbnail strip just enough to bring thumbnail `i` into view. */
  function scrollThumbIntoView(i: number) {
    const strip = thumbStripRef.current;
    const thumb = strip?.children[i] as HTMLElement | undefined;
    if (!strip || !thumb) return;
    const left = thumb.offsetLeft;
    const right = left + thumb.offsetWidth;
    if (left < strip.scrollLeft) strip.scrollTo({ left, behavior: "smooth" });
    else if (right > strip.scrollLeft + strip.clientWidth) strip.scrollTo({ left: right - strip.clientWidth, behavior: "smooth" });
  }

  /** Shows photo `i`, or steps from the current photo when given a function (so rapid arrow clicks all count). */
  const showPhoto = (i: number | ((current: number) => number)) =>
    setActiveThumb((current) => {
      const target = typeof i === "function" ? i(current) : i;
      const next = (target + thumbImages.length) % thumbImages.length;
      requestAnimationFrame(() => scrollThumbIntoView(next));
      return next;
    });

  const cartLine = (qty: number) => ({
    productId: product._id,
    slug: product.slug,
    name: product.name,
    image: variantImage || getProductCoverImage(product) || "/placeholder.png",
    unitPrice: displayPrice,
    qty,
    maxQty: availableQty,
    ...(selectedVariant ? { variantKey: selectedVariant.key, variantLabel } : {}),
  });

  /** True (and the missing options are flagged) when the shopper still has to choose a variant. */
  const promptForSelection = () => {
    if (!needsSelection) return false;
    setSelectionPrompt(true);
    variantSelectorRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    return true;
  };

  const handleAddToCart = () => {
    if (outOfStock || promptForSelection()) return;
    addItem(cartLine(selectedQty), selectedQty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  const handleBuyNow = () => {
    if (outOfStock || promptForSelection()) return;

    clearCart();
    addItem(cartLine(selectedQty), selectedQty);
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

  return (
    <div className="min-h-screen bg-soft-bg pt-6 md:pt-8">
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
            All Products
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
            {/* Main image card: each photo at its own size at most, centred on white (see ProductPhoto).
                Every photo is mounted (only the active one visible) so switching is instant. */}
            <div className="relative aspect-square w-full overflow-hidden rounded-3xl bg-white shadow-card">
              {thumbImages.map((img: string, i: number) => (
                <ProductPhoto
                  key={img}
                  src={img}
                  alt={i === activeThumb ? product.name : ""}
                  requestWidth={1200}
                  quality={100}
                  loading="eager"
                  fetchPriority={i === 0 ? "high" : "low"}
                  className={cn(
                    "transition-opacity duration-150",
                    i === activeThumb ? "opacity-100" : "pointer-events-none opacity-0",
                  )}
                />
              ))}
              {/* Overlay badges */}
              {offerBadgeText && (
                <span className="absolute left-4 top-4 rounded-full bg-gradient-yellow px-3 py-1 font-poppins text-sm font-bold text-text-dark shadow-button">
                  {offerBadgeText} OFF
                </span>
              )}
              {product.badge && !offerBadgeText && (
                <span className="absolute left-4 top-4 rounded-full bg-gradient-primary px-3 py-1 font-poppins text-sm font-bold text-white shadow-button">
                  {product.badge}
                </span>
              )}
            </div>

            {/* Thumbnails: 3 visible on mobile, 5 from sm up; arrows step through the photos */}
            {thumbImages.length > 1 && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => showPhoto((c) => c - 1)}
                  aria-label="Previous photo"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-text-dark shadow-card transition-colors hover:bg-primary-pink hover:text-white"
                >
                  <FiChevronLeft size={18} />
                </button>
                <div
                  ref={thumbStripRef}
                  className="relative flex min-w-0 flex-1 gap-3 overflow-x-auto py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                >
                  {thumbImages.map((img: string, i: number) => (
                    <button
                      key={img}
                      type="button"
                      onClick={() => showPhoto(i)}
                      aria-label={`Show photo ${i + 1}`}
                      aria-current={activeThumb === i}
                      className={cn(
                        "relative aspect-square w-[calc((100%-1.5rem)/3)] shrink-0 overflow-hidden rounded-2xl border-2 bg-white transition-all duration-200 sm:w-[calc((100%-3rem)/5)]",
                        activeThumb === i
                          ? "border-primary-pink shadow-button"
                          : "border-transparent opacity-60 shadow-card hover:opacity-100",
                      )}
                    >
                      <Image
                        src={img}
                        alt={`View ${i + 1}`}
                        fill
                        className="object-contain"
                        sizes="(max-width: 640px) 30vw, 120px"
                      />
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => showPhoto((c) => c + 1)}
                  aria-label="Next photo"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-text-dark shadow-card transition-colors hover:bg-primary-pink hover:text-white"
                >
                  <FiChevronRight size={18} />
                </button>
              </div>
            )}
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
              <span className="rounded-full bg-soft-bg-alt px-3 py-1 font-poppins text-xs font-semibold text-text-muted">
                {categoryPathLabel}
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
              <span className="font-poppins text-4xl font-bold text-primary-pink">
                {needsSelection && pricesVary && (
                  <span className="mr-2 text-base font-medium text-text-muted">From</span>
                )}
                ৳{displayPrice.toLocaleString()}.00
              </span>
              {displayOriginal && (
                <span className="font-poppins text-lg text-text-muted line-through">
                  ৳{displayOriginal.toLocaleString()}.00
                </span>
              )}
            </motion.div>

            {/* Variant selectors */}
            {variantOptions.length > 0 && (
              <motion.div variants={fadeUp} className="space-y-4" ref={variantSelectorRef}>
                {variantOptions.map((opt) => (
                  <div key={opt.name}>
                    <p className="mb-2 font-poppins text-sm font-semibold text-text-dark">
                      {opt.name}
                      {selectedOptions[opt.name] ? (
                        <span className="ml-2 font-normal text-text-muted">{selectedOptions[opt.name]}</span>
                      ) : selectionPrompt ? (
                        <span className="ml-2 font-normal text-red-500">Please select a {opt.name.toLowerCase()}</span>
                      ) : null}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {opt.values.map((val) => {
                        const active = selectedOptions[opt.name] === val;
                        const available = isValueAvailable(opt.name, val);
                        return (
                          <button
                            key={val}
                            type="button"
                            aria-pressed={active}
                            // Clicking the chosen value again clears it.
                            onClick={() =>
                              setSelectedOptions((prev) => {
                                const next = { ...prev };
                                if (active) delete next[opt.name];
                                else next[opt.name] = val;
                                return next;
                              })
                            }
                            className={cn(
                              "rounded-xl border-2 px-4 py-2 font-poppins text-sm font-medium transition-all",
                              active
                                ? "border-primary-pink bg-primary-pink/5 text-primary-pink"
                                : "border-gray-200 text-text-dark hover:border-primary-pink",
                              !available && "opacity-40 line-through",
                            )}
                          >
                            {val}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
                {allOptionsChosen && !selectedVariant && (
                  <p className="font-poppins text-sm text-red-500">No product exists for this combination.</p>
                )}
              </motion.div>
            )}

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
                <span className="font-poppins text-xs text-text-muted">Brand</span>
                <span className="font-poppins text-sm font-semibold text-text-dark">
                  {brandLabel}
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
                <span className="min-w-10 text-center font-poppins text-sm font-semibold text-text-dark">
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
                    "flex items-center justify-center gap-2.5 rounded-2xl border-2 py-4 font-poppins text-base font-semibold transition-all",
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
                    "flex items-center justify-center gap-2.5 rounded-2xl px-4 py-3 font-poppins text-base font-semibold transition-all",
                    outOfStock
                      ? "cursor-not-allowed bg-gray-200 text-gray-400"
                      : "bg-gradient-primary text-white shadow-button hover:shadow-hover",
                  )}
                >
                  Buy Now
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

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

            <motion.div
              variants={fadeUp}
              className="mx-auto w-full rounded-3xl p-6 sm:p-8"
            >
              <p className="mb-3 font-poppins text-xs font-semibold uppercase tracking-widest text-primary-pink">
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
              <p className="mt-2 font-poppins text-sm text-text-muted">
                Share your thoughts on this product.
              </p>
            </motion.div>

            <motion.div variants={fadeUp} className="mb-10 rounded-3xl bg-white p-6 shadow-card">
              {isLoggedIn ? (
                <>
                  <div className="mb-4 flex items-center justify-between">
                    <div className="font-poppins text-sm font-semibold text-text-dark">
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
              <div className="grid grid-cols-1 gap-4 md:auto-rows-fr md:grid-cols-2">
                {reviewList.map((review) => (
                  <div key={review._id} className="h-full rounded-3xl border border-primary-pink/15 bg-white p-5 shadow-card">
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary-pink/10 text-primary-pink">
                          <FiUser className="h-4 w-4" />
                        </span>
                        <div>
                          <div className="font-poppins text-sm font-semibold text-text-dark">
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
                <p className="mt-2 font-poppins text-sm text-text-muted">
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
                  className="inline-flex items-center gap-2 rounded-2xl border-2 border-primary-pink px-6 py-3 font-poppins font-semibold text-primary-pink transition-all hover:bg-primary-pink hover:text-white"
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
