"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FiAlertCircle,
  FiCheck,
  FiMinus,
  FiPlus,
  FiShield,
  FiShoppingBag,
  FiTruck,
  FiRefreshCw,
  FiDollarSign,
  FiZap,
  FiMessageCircle,
} from "react-icons/fi";

import { cn } from "@/lib/utils";
import { cartLineId, useCart } from "@/components/cart/CartProvider";
import { getProductCoverImage, getProductImages } from "@/lib/product-images";
import Countdown from "@/components/home/Countdown";
import Gallery from "@/components/product-page/Gallery";
import Stars from "@/components/product-page/Stars";
import ProductPhoto from "@/components/ui/ProductPhoto";

/* Keep in sync with DELIVERY_CHARGE in app/checkout/page.tsx. */
const DELIVERY = { inside: 95, outside: 120 };
const LOW_STOCK = 5;

const money = (n: number) => `৳${Math.round(n).toLocaleString("en-IN")}`;

type Variant = {
  key: string;
  options: { name: string; value: string }[];
  price: number;
  salePrice?: number;
  sku?: string;
  quantity: number;
  useMainImage: boolean;
  image?: string;
};

export type DetailProduct = {
  _id: string;
  name: string;
  slug: string;
  sku?: string;
  price: number;
  salePrice?: number;
  quantity?: number;
  shortDescription?: string;
  images?: string[];
  hasVariants?: boolean;
  variantOptions?: { name: string; values: string[] }[];
  variants?: Variant[];
  isTopSeller?: boolean;
  isNewArrival?: boolean;
  isTrending?: boolean;
  brandDisplay?: string;
  categoryDisplay?: string;
  subCategoryDisplay?: string;
};

export type ActiveOffer = { title: string; slug: string; endsAt?: string | null } | null;

/** Gallery + buy box + the phone's sticky buy bar. Everything below the fold is server-rendered by the page. */
export default function ProductDetailPageClient({
  product,
  offer = null,
  rating,
  sold = 0,
  freeDeliveryThreshold = 0,
  whatsapp = "",
}: {
  product: DetailProduct;
  offer?: ActiveOffer;
  rating: { avg: number; count: number };
  sold?: number;
  freeDeliveryThreshold?: number;
  whatsapp?: string;
}) {
  const router = useRouter();
  const { addItem, updateQty, items, subtotal, hydrated, closeSidebar } = useCart();
  const [added, setAdded] = useState(false);
  const [selectedQty, setSelectedQty] = useState(1);
  // Variant selection: option name → chosen value. Starts on a default variant (see below); null until
  // the shopper changes it. Deselecting a value still works and brings back the "From ৳…" state.
  const [userOptions, setUserOptions] = useState<Record<string, string> | null>(null);
  // ?variant=<key> preselects a variant. The page is static, so the server (and hydration) render the
  // default; the browser then switches to the URL's variant without a hydration mismatch.
  const urlVariantKey = useSyncExternalStore(noopSubscribe, readVariantParam, () => "");
  // Set when Add to bag / Buy now is pressed before every option is chosen.
  const [selectionPrompt, setSelectionPrompt] = useState(false);
  const variantSelectorRef = useRef<HTMLDivElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  const addedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [showBar, setShowBar] = useState(false);

  /* ── Variants (unchanged rules) ── */
  const variantList: Variant[] = product.hasVariants && (product.variants?.length ?? 0) > 0 ? product.variants! : [];
  const hasVariants = variantList.length > 0;
  const variantOptions = hasVariants ? product.variantOptions || [] : [];
  // Default: the first in-stock variant in admin order, else the first variant.
  const defaultVariant = variantList.find((v) => v.quantity > 0) ?? variantList[0] ?? null;
  const urlVariant = urlVariantKey ? variantList.find((v) => v.key === urlVariantKey) : undefined;
  const selectedOptions: Record<string, string> = userOptions ?? optionsOf(urlVariant ?? defaultVariant);

  // The default variant's own photo leads the gallery, so the first paint (and the LCP image) match the
  // preselected shade. The order is fixed from the default, so it never reshuffles while shopping.
  const galleryImages = getProductImages(product);
  const leadPhoto = defaultVariant && !defaultVariant.useMainImage && defaultVariant.image ? defaultVariant.image : null;
  const ordered = leadPhoto ? [leadPhoto, ...galleryImages.filter((src) => src !== leadPhoto)] : galleryImages;
  const photos: string[] = ordered.length > 0 ? ordered : ["/placeholder.png"];
  const allOptionsChosen = variantOptions.every((o) => !!selectedOptions[o.name]);
  const selectedVariant: Variant | null =
    hasVariants && allOptionsChosen
      ? variantList.find((v) => v.options.every((o) => selectedOptions[o.name] === o.value)) ?? null
      : null;
  const needsSelection = hasVariants && !selectedVariant;
  // A value is selectable only if some in-stock variant has it together with the other picks made so far
  // (options not chosen yet match anything).
  const isValueAvailable = (optName: string, value: string) =>
    variantList.some(
      (v) =>
        v.quantity > 0 &&
        v.options.some((o) => o.name === optName && o.value === value) &&
        v.options.every((o) => o.name === optName || !selectedOptions[o.name] || selectedOptions[o.name] === o.value),
    );
  // Before a variant is chosen, show the cheapest option's price ("From" only when prices differ).
  const effectivePrice = (v: Variant) => v.salePrice || v.price;
  const cheapestVariant = variantList.reduce<Variant | null>(
    (best, v) => (!best || effectivePrice(v) < effectivePrice(best) ? v : best),
    null,
  );
  const pricesVary = new Set(variantList.map(effectivePrice)).size > 1;
  const variantImage = selectedVariant && !selectedVariant.useMainImage && selectedVariant.image ? selectedVariant.image : null;
  const variantLabel = selectedVariant ? selectedVariant.options.map((o) => o.value).join(" / ") : "";
  const priceSource = selectedVariant || cheapestVariant;
  const displayPrice: number = priceSource ? effectivePrice(priceSource) : product.salePrice || product.price;
  const displayOriginal: number | null = priceSource
    ? priceSource.salePrice && priceSource.price > priceSource.salePrice ? priceSource.price : null
    : product.salePrice && product.price > product.salePrice ? product.price : null;
  const saving = displayOriginal ? displayOriginal - displayPrice : 0;
  const savingPct = displayOriginal ? Math.round((saving / displayOriginal) * 100) : 0;
  const fromLabel = needsSelection && pricesVary;

  // Until a variant is chosen, stock is the total across all variants.
  const availableQty = hasVariants
    ? selectedVariant
      ? Number(selectedVariant.quantity ?? 0)
      : variantList.reduce((n, v) => n + Number(v.quantity || 0), 0)
    : Number(product.quantity ?? 0);
  const outOfStock = availableQty <= 0;
  const lowStock = !outOfStock && availableQty <= LOW_STOCK;

  // The chosen quantity, kept within the stock of whatever is selected now.
  const qty = outOfStock ? 1 : Math.min(Math.max(1, selectedQty), availableQty);

  // Jump to the selected variant's photo in the gallery; back to the first photo otherwise.
  const variantPhotoIndex = variantImage ? Math.max(0, photos.indexOf(variantImage)) : 0;

  // Phone sticky buy bar: shown once the main buttons have scrolled up behind the header.
  useEffect(() => {
    const el = actionsRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      ([e]) => setShowBar(!e.isIntersecting && e.boundingClientRect.top < 150),
      { rootMargin: "-144px 0px 0px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => () => { if (addedTimer.current) clearTimeout(addedTimer.current); }, []);

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
    addItem(cartLine(qty), qty);
    setAdded(true);
    if (addedTimer.current) clearTimeout(addedTimer.current);
    addedTimer.current = setTimeout(() => setAdded(false), 2400);
  };

  /** Adds the selection (keeping whatever else is in the bag) and goes straight to checkout. */
  const handleBuyNow = () => {
    if (outOfStock || promptForSelection()) return;
    const line = cartLine(qty);
    const id = cartLineId(line);
    // Buying again something already in the bag: set its quantity rather than stacking another lot.
    if (items.some((i) => cartLineId(i) === id)) updateQty(id, qty);
    else addItem(line, qty);
    closeSidebar();
    router.push("/checkout");
  };

  /* ── Free-delivery nudge (needs the bag, so only after it loads from storage) ── */
  const inBag = items.some((i) => i.productId === product._id);
  const orderValue = subtotal + (inBag ? 0 : displayPrice * qty);
  const toFree = freeDeliveryThreshold > 0 ? Math.max(0, freeDeliveryThreshold - orderValue) : 0;

  const brand = product.brandDisplay;
  const badge = product.isTopSeller ? "Bestseller" : product.isNewArrival ? "New" : product.isTrending ? "Trending" : null;
  const sku = selectedVariant?.sku || product.sku;
  const waText = encodeURIComponent(`Hi DealHobe, I have a question about ${product.name}${variantLabel ? ` (${variantLabel})` : ""}.`);
  const waNumber = whatsapp.replace(/\D/g, "");

  const overlay = (
    <span className="pointer-events-none absolute left-3 top-3 flex flex-col items-start gap-1.5 md:left-4 md:top-4">
      {savingPct > 0 && (
        <span className="rounded-lg bg-primary-pink px-2.5 py-1 text-xs font-extrabold text-white shadow-button">-{savingPct}%</span>
      )}
      {badge && (
        <span className={cn("rounded-lg px-2.5 py-1 text-[11px] font-bold", badge === "Bestseller" ? "bg-plum text-[#E9C98C]" : badge === "New" ? "bg-white text-primary-pink ring-1 ring-primary-pink/25" : "bg-[#FFF1D6] text-[#8A5A00]")}>
          {badge}
        </span>
      )}
    </span>
  );

  return (
    <>
      <div className="grid grid-cols-1 gap-6 md:gap-8 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,1fr)] lg:gap-12 xl:gap-16">
        {/* ── Gallery ── */}
        <div className="-mx-4 min-w-0 sm:mx-0 lg:sticky lg:top-40 lg:self-start">
          <div className="px-4 sm:px-0">
            <Gallery images={photos} alt={product.name} focusIndex={variantPhotoIndex} overlay={overlay} />
          </div>
        </div>

        {/* ── Buy box ── */}
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            {brand && (
              <Link
                href={`/products?brand=${encodeURIComponent(brand)}`}
                className="text-xs font-bold uppercase tracking-[0.18em] text-gold-dark transition-colors hover:text-primary-pink"
              >
                {brand}
              </Link>
            )}
            {product.categoryDisplay && (
              <>
                {brand && <span className="h-3 w-px bg-[#E6D6DD]" aria-hidden />}
                <span className="text-xs font-medium text-text-muted">{product.subCategoryDisplay || product.categoryDisplay}</span>
              </>
            )}
          </div>

          <h1 className="mt-2 font-display text-[1.7rem] font-semibold leading-[1.15] text-text-dark md:text-[2.35rem]">
            {product.name}
          </h1>

          {/* Rating + social proof */}
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm">
            {rating.count > 0 ? (
              <a href="#reviews" className="group inline-flex items-center gap-1.5 font-semibold text-text-dark">
                <Stars value={rating.avg} />
                <span>{rating.avg.toFixed(1)}</span>
                <span className="font-medium text-text-muted underline-offset-4 group-hover:text-primary-pink group-hover:underline">
                  ({rating.count} {rating.count === 1 ? "review" : "reviews"})
                </span>
              </a>
            ) : (
              <a href="#reviews" className="inline-flex items-center gap-1.5 font-medium text-text-muted hover:text-primary-pink">
                <Stars value={0} /> Be the first to review
              </a>
            )}
            {sold >= 5 && (
              <>
                <span className="h-3.5 w-px bg-[#E6D6DD]" aria-hidden />
                <span className="inline-flex items-center gap-1 font-semibold text-text-dark">
                  <FiZap className="text-[#E8A317]" size={14} aria-hidden /> {sold.toLocaleString("en-IN")}+ sold
                </span>
              </>
            )}
          </div>

          {/* Price */}
          <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2">
            <span className="font-body text-[2rem] font-extrabold leading-none tracking-tight text-primary-pink md:text-[2.4rem]">
              {fromLabel && <span className="mr-1.5 align-middle text-sm font-semibold text-text-muted">From</span>}
              {money(displayPrice)}
            </span>
            {displayOriginal && (
              <s className="text-lg font-medium text-[#7B6A76]" aria-label={`Regular price ${money(displayOriginal)}`}>
                {money(displayOriginal)}
              </s>
            )}
            {saving > 0 && (
              <span className="rounded-full bg-[#E8F5EC] px-3 py-1 text-xs font-bold text-[#1F7A45]">
                Save {money(saving)} ({savingPct}%)
              </span>
            )}
          </div>

          {/* Offer */}
          {offer && (
            offer.endsAt ? (
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-plum px-4 py-3 text-white">
                <Link href={`/products/${offer.slug}`} className="min-w-0">
                  <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-gold">Limited-time offer</span>
                  <span className="block truncate text-sm font-semibold hover:underline">{offer.title}</span>
                </Link>
                <span className="flex items-center gap-2 text-xs text-white/70">
                  Ends in <Countdown to={offer.endsAt} />
                </span>
              </div>
            ) : (
              <Link
                href={`/products/${offer.slug}`}
                className="mt-4 inline-flex items-center gap-2 rounded-full border border-gold/50 bg-ivory px-3.5 py-1.5 text-xs font-bold text-gold-dark hover:border-gold"
              >
                <FiZap size={13} aria-hidden /> {offer.title} applied
              </Link>
            )
          )}

          {product.shortDescription && (
            <p className="mt-5 text-[15px] leading-relaxed text-text-muted">{product.shortDescription}</p>
          )}

          <hr className="my-6 border-[#F1E7EB]" />

          {/* Variant pickers */}
          {variantOptions.length > 0 && (
            <div className="space-y-5" ref={variantSelectorRef} style={{ scrollMarginTop: "11rem" }}>
              {variantOptions.map((opt) => {
                // Shade-style swatches when every value has its own photo.
                const photoFor = (val: string) =>
                  variantList.find((v) => !v.useMainImage && v.image && v.options.some((o) => o.name === opt.name && o.value === val))?.image;
                const swatches = opt.values.every((val) => !!photoFor(val));
                const missing = selectionPrompt && !selectedOptions[opt.name];
                return (
                  <fieldset key={opt.name}>
                    <legend className="mb-2.5 flex items-baseline gap-2 text-sm font-bold text-text-dark">
                      {opt.name}
                      {selectedOptions[opt.name] ? (
                        <span className="font-medium text-text-muted">{selectedOptions[opt.name]}</span>
                      ) : missing ? (
                        <span className="font-semibold text-primary-pink">Please select a {opt.name.toLowerCase()}</span>
                      ) : (
                        <span className="font-medium text-text-muted">Choose one</span>
                      )}
                    </legend>
                    <div className={cn("flex flex-wrap gap-2", missing && "animate-[pulse_1s_ease-in-out_1]")}>
                      {opt.values.map((val) => {
                        const active = selectedOptions[opt.name] === val;
                        const available = isValueAvailable(opt.name, val);
                        const toggle = () => {
                          // Clicking the chosen value again clears it.
                          const next = { ...selectedOptions };
                          if (active) delete next[opt.name];
                          else next[opt.name] = val;
                          setUserOptions(next);
                          syncVariantParam(variantList.find((v) => v.options.every((o) => next[o.name] === o.value))?.key);
                        };
                        const photo = swatches ? photoFor(val) : undefined;
                        return photo ? (
                          <button
                            key={val}
                            type="button"
                            aria-pressed={active}
                            aria-label={`${opt.name} ${val}${available ? "" : " (sold out)"}`}
                            title={available ? val : `${val} – sold out`}
                            onClick={toggle}
                            className={cn(
                              "group flex w-[68px] flex-col items-center gap-1 rounded-xl border bg-white p-1 pb-1.5 transition-all",
                              active ? "border-plum ring-1 ring-plum" : missing ? "border-primary-pink/50" : "border-[#EBDDE3] hover:border-[#CDB5BF]",
                              !available && "opacity-45",
                            )}
                          >
                            <span className="relative block aspect-square w-full overflow-hidden rounded-lg bg-white">
                              <ProductPhoto src={photo} alt="" requestWidth={140} className="p-0.5" />
                              {!available && <span className="absolute inset-0 bg-[linear-gradient(to_top_right,transparent_calc(50%-1px),#7B6A76_50%,transparent_calc(50%+1px))]" aria-hidden />}
                            </span>
                            <span className={cn("max-w-full truncate text-[11px] font-semibold", active ? "text-plum" : "text-text-muted")}>{val}</span>
                          </button>
                        ) : (
                          <button
                            key={val}
                            type="button"
                            aria-pressed={active}
                            onClick={toggle}
                            className={cn(
                              "min-w-12 rounded-full border px-4 py-2 text-sm font-semibold transition-all",
                              active
                                ? "border-plum bg-plum text-white"
                                : missing
                                  ? "border-primary-pink/50 bg-white text-text-dark"
                                  : "border-[#EBDDE3] bg-white text-text-dark hover:border-plum",
                              !available && "text-text-muted line-through opacity-50",
                            )}
                          >
                            {val}
                          </button>
                        );
                      })}
                    </div>
                  </fieldset>
                );
              })}
              {allOptionsChosen && !selectedVariant && (
                <p className="text-sm font-medium text-primary-pink">No product exists for this combination.</p>
              )}
            </div>
          )}

          {/* Stock */}
          <p className={cn("flex items-center gap-2 text-sm font-semibold", variantOptions.length > 0 && "mt-5")} aria-live="polite">
            <span
              className={cn(
                "h-2 w-2 rounded-full",
                outOfStock ? "bg-[#B9A9B2]" : lowStock ? "bg-[#E8A317] shadow-[0_0_0_4px_rgba(232,163,23,0.18)]" : "bg-[#1F8A4C] shadow-[0_0_0_4px_rgba(31,138,76,0.14)]",
              )}
              aria-hidden
            />
            {outOfStock ? (
              <span className="text-text-muted">{selectedVariant ? `${variantLabel} is out of stock` : "Out of stock"}</span>
            ) : lowStock ? (
              <span className="text-[#9A6A10]">Only {availableQty} left — order soon</span>
            ) : (
              <span className="text-[#1F7A45]">In stock, ready to ship</span>
            )}
          </p>

          {/* Quantity + actions */}
          <div ref={actionsRef} className="mt-4 space-y-3">
            <div className="flex gap-3">
              <div className="flex h-14 shrink-0 items-center rounded-full border border-[#EBDDE3] bg-white px-1.5">
                <button
                  type="button"
                  onClick={() => setSelectedQty(Math.max(1, qty - 1))}
                  disabled={outOfStock || qty <= 1}
                  className="flex h-10 w-10 items-center justify-center rounded-full text-text-dark transition-colors hover:bg-soft-bg disabled:cursor-not-allowed disabled:opacity-30"
                  aria-label="Decrease quantity"
                >
                  <FiMinus size={16} />
                </button>
                <span className="w-8 text-center text-base font-bold tabular-nums text-text-dark" aria-live="polite" aria-label={`Quantity ${qty}`}>
                  {qty}
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedQty(Math.min(availableQty, qty + 1))}
                  disabled={outOfStock || qty >= availableQty}
                  className="flex h-10 w-10 items-center justify-center rounded-full text-text-dark transition-colors hover:bg-soft-bg disabled:cursor-not-allowed disabled:opacity-30"
                  aria-label="Increase quantity"
                >
                  <FiPlus size={16} />
                </button>
              </div>
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={outOfStock}
                className={cn(
                  "flex h-14 min-w-0 flex-1 items-center justify-center gap-2.5 rounded-full text-base font-bold transition-all duration-200 active:scale-[0.98]",
                  outOfStock
                    ? "cursor-not-allowed bg-[#EFE7EA] text-text-muted"
                    : added
                      ? "bg-[#1F8A4C] text-white shadow-[0_6px_18px_rgba(31,138,76,0.3)]"
                      : "bg-primary-pink text-white shadow-button hover:bg-[#8E1611] hover:shadow-hover",
                )}
              >
                {added ? <FiCheck size={20} strokeWidth={3} /> : <FiShoppingBag size={19} />}
                {outOfStock ? "Out of stock" : added ? "Added to bag" : "Add to bag"}
              </button>
            </div>
            <button
              type="button"
              onClick={handleBuyNow}
              disabled={outOfStock}
              className={cn(
                "flex h-14 w-full items-center justify-center gap-2 rounded-full border-2 text-base font-bold transition-all duration-200 active:scale-[0.98]",
                outOfStock
                  ? "cursor-not-allowed border-[#EFE7EA] text-text-muted"
                  : "border-plum bg-white text-plum hover:bg-plum hover:text-white",
              )}
            >
              Buy now <span className="font-medium opacity-70">· Cash on delivery</span>
            </button>
            {added && (
              <p className="flex items-center justify-center gap-1.5 text-sm text-text-muted md:hidden" role="status">
                <FiCheck className="text-[#1F8A4C]" aria-hidden /> Added to your bag ·
                <Link href="/cart" className="font-bold text-primary-pink">View bag</Link>
              </p>
            )}
          </div>

          {/* Free-delivery nudge */}
          {freeDeliveryThreshold > 0 && hydrated && !outOfStock && (
            <div className="mt-5 rounded-2xl border border-[#F1E7EB] bg-white px-4 py-3">
              <p className="text-sm font-semibold text-text-dark">
                {toFree > 0 ? (
                  <>Add <span className="text-primary-pink">{money(toFree)}</span> more for <span className="text-[#1F7A45]">FREE delivery</span></>
                ) : (
                  <><FiCheck className="mr-1 inline text-[#1F8A4C]" aria-hidden />This order qualifies for <span className="text-[#1F7A45]">FREE delivery</span></>
                )}
              </p>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#F4ECEF]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-gold to-[#1F8A4C] transition-[width] duration-500"
                  style={{ width: `${Math.min(100, (orderValue / freeDeliveryThreshold) * 100)}%` }}
                />
              </div>
            </div>
          )}

          {/* Delivery + trust */}
          <div className="mt-5 overflow-hidden rounded-2xl border border-[#F1E7EB] bg-white">
            <div className="flex items-start gap-3 px-4 py-3.5">
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ivory text-gold-dark"><FiTruck size={17} /></span>
              <div className="min-w-0 flex-1 text-sm">
                <p className="font-bold text-text-dark">Delivery across Bangladesh</p>
                <dl className="mt-1.5 grid grid-cols-2 gap-x-4 gap-y-0.5 text-text-muted">
                  <dt>Inside Dhaka</dt><dd className="text-right font-semibold text-text-dark">{money(DELIVERY.inside)}</dd>
                  <dt>Outside Dhaka</dt><dd className="text-right font-semibold text-text-dark">{money(DELIVERY.outside)}</dd>
                </dl>
                {freeDeliveryThreshold > 0 && (
                  <p className="mt-1.5 text-xs text-text-muted">Free delivery on orders of {money(freeDeliveryThreshold)} or more.</p>
                )}
              </div>
            </div>
            <ul className="grid grid-cols-3 border-t border-[#F1E7EB] text-center">
              {[
                { icon: FiShield, title: "100% authentic", sub: "Genuine products" },
                { icon: FiDollarSign, title: "Cash on delivery", sub: "Pay at your door" },
                { icon: FiRefreshCw, title: "Easy returns", sub: "Policy", href: "/refund-return-policy" },
              ].map(({ icon: Icon, title, sub, href }, i) => {
                const body = (
                  <>
                    <Icon className="mx-auto text-plum" size={18} aria-hidden />
                    <span className="mt-1.5 block text-[12px] font-bold leading-tight text-text-dark">{title}</span>
                    <span className={cn("block text-[11px] leading-tight text-text-muted", href && "underline underline-offset-2")}>{href ? "See policy" : sub}</span>
                  </>
                );
                return (
                  <li key={title} className={cn("px-2 py-3", i > 0 && "border-l border-[#F1E7EB]")}>
                    {href ? <Link href={href} className="block hover:text-primary-pink">{body}</Link> : body}
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Help + meta */}
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-xs text-text-muted">
            {sku ? <span>SKU: <span className="font-semibold text-text-dark">{sku}</span></span> : <span />}
            {waNumber && (
              <a
                href={`https://wa.me/${waNumber}?text=${waText}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 font-semibold text-text-dark hover:text-primary-pink"
              >
                <FiMessageCircle size={14} className="text-[#1F8A4C]" aria-hidden /> Questions? Chat with us on WhatsApp
              </a>
            )}
          </div>
        </div>
      </div>

      {/* ── Phone sticky buy bar: above the bottom nav and its raised cart button, beside the chat button ── */}
      <div
        className={cn(
          "fixed left-3 right-[4.75rem] z-[45] transition-all duration-300 md:hidden",
          "bottom-[calc(5.75rem+env(safe-area-inset-bottom))]",
          showBar ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0",
        )}
        aria-hidden={!showBar}
      >
        <div className="flex items-center gap-3 rounded-2xl border border-[#EFE3E8] bg-white/95 p-2 pl-2 shadow-[0_10px_30px_rgba(59,13,46,0.18)] backdrop-blur">
          <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-[#F4ECEF] bg-white">
            <ProductPhoto src={variantImage || photos[0]} alt="" requestWidth={120} className="p-0.5" />
          </span>
          <span className="min-w-0 flex-1 leading-tight">
            <span className="block truncate text-xs font-medium text-text-muted">{variantLabel || product.name}</span>
            <span className="flex items-baseline gap-1.5">
              <span className="text-base font-extrabold text-primary-pink">{fromLabel && <span className="mr-1 text-[10px] font-semibold text-text-muted">From</span>}{money(displayPrice)}</span>
              {displayOriginal && <s className="text-[11px] text-[#7B6A76]">{money(displayOriginal)}</s>}
            </span>
          </span>
          <button
            type="button"
            tabIndex={showBar ? 0 : -1}
            onClick={handleAddToCart}
            disabled={outOfStock}
            className={cn(
              "flex h-11 shrink-0 items-center gap-1.5 rounded-full px-4 text-sm font-bold transition-colors",
              outOfStock ? "bg-[#EFE7EA] text-text-muted" : added ? "bg-[#1F8A4C] text-white" : "bg-primary-pink text-white shadow-button",
            )}
          >
            {added ? <FiCheck size={16} strokeWidth={3} /> : <FiShoppingBag size={16} />}
            {outOfStock ? "Sold out" : added ? "Added" : needsSelection ? "Select" : "Add to bag"}
          </button>
        </div>
      </div>
    </>
  );
}

const optionsOf = (v: Variant | null | undefined): Record<string, string> =>
  v ? Object.fromEntries(v.options.map((o) => [o.name, o.value])) : {};

const noopSubscribe = () => () => {};
const readVariantParam = () => {
  try { return new URLSearchParams(window.location.search).get("variant") ?? ""; } catch { return ""; }
};

/** Mirrors the chosen variant into ?variant= (no navigation, no history entry) so the selection is shareable. */
function syncVariantParam(key: string | undefined) {
  try {
    const url = new URL(window.location.href);
    if (key) url.searchParams.set("variant", key);
    else url.searchParams.delete("variant");
    window.history.replaceState(window.history.state, "", url);
  } catch { /* ignore */ }
}

/** Shown by the page when the slug resolves to nothing (kept for parity with the old client page). */
export function ProductNotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-soft-bg">
      <div className="text-center">
        <FiAlertCircle size={56} className="mb-4 inline-block text-primary-pink/40" />
        <h2 className="mb-2 font-display text-2xl text-text-dark">Product not found</h2>
        <p className="mb-6 text-sm text-text-muted">This product doesn&apos;t exist or may have been removed.</p>
        <Link href="/products" className="inline-flex rounded-full bg-primary-pink px-6 py-3 font-bold text-white shadow-button">
          Browse all products
        </Link>
      </div>
    </div>
  );
}
