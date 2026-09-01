"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiFilter,
  FiX,
  FiShoppingCart,
  FiCheck,
  FiChevronLeft,
  FiChevronRight,
  FiPlus,
  FiMinus,
} from "react-icons/fi";
import { cn } from "@/lib/utils";
import { staggerContainer, scaleIn, fadeUp } from "@/components/animations/variants";
import { useCart } from "@/components/cart/CartProvider";

/* ─── Filter Constants ───────────────────────────────────────── */
const GENDERS = ["Boys", "Girls"] as const;
type Gender = (typeof GENDERS)[number] | "";
const PRICE_MIN = 0;
const PRICE_MAX = 10000;
const PER_PAGE = 16;

/* ─── Price Range Slider ─────────────────────────────────────── */
function PriceRangeSlider({
  value,
  onChange,
}: {
  value: [number, number];
  onChange: (v: [number, number]) => void;
}) {
  const [min, max] = value;
  const minPct = ((min - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100;
  const maxPct = ((max - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100;

  return (
    <div className="px-1 pt-2 pb-1">
      {/* Track container */}
      <div className="relative flex h-6 items-center">
        {/* Background track */}
        <div className="absolute h-1.5 w-full rounded-full bg-gray-200" />
        {/* Active fill */}
        <div
          className="absolute h-1.5 rounded-full bg-primary-pink"
          style={{ left: `${minPct}%`, width: `${maxPct - minPct}%` }}
        />
        {/* Min input */}
        <input
          type="range"
          min={PRICE_MIN}
          max={PRICE_MAX}
          step={100}
          value={min}
          onChange={(e) => {
            const v = Math.min(Number(e.target.value), max - 100);
            onChange([v, max]);
          }}
          className="range-thumb"
          style={{ zIndex: min > PRICE_MAX * 0.9 ? 5 : 3 }}
        />
        {/* Max input */}
        <input
          type="range"
          min={PRICE_MIN}
          max={PRICE_MAX}
          step={100}
          value={max}
          onChange={(e) => {
            const v = Math.max(Number(e.target.value), min + 100);
            onChange([min, v]);
          }}
          className="range-thumb"
          style={{ zIndex: 4 }}
        />
      </div>
      {/* Value labels */}
      <div className="mt-3 flex justify-between gap-2">
        <div className="rounded-xl border border-gray-100 bg-soft-bg px-3 py-1.5 text-sm font-inter font-semibold text-text-dark">
          ৳{min.toLocaleString()}
        </div>
        <div className="rounded-xl border border-gray-100 bg-soft-bg px-3 py-1.5 text-sm font-inter font-semibold text-text-dark">
          ৳{max.toLocaleString()}
        </div>
      </div>
    </div>
  );
}

/* ─── Filter Section ─────────────────────────────────────────── */
function FilterSection({
  title,
  children,
  collapsible = true,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  collapsible?: boolean;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-100 pb-5 last:border-0 last:pb-0">
      <div className="flex items-center justify-between">
        <h3 className="font-inter text-base font-semibold text-text-dark">
          {title}
        </h3>
        {collapsible && (
          <button
            onClick={() => setOpen((o) => !o)}
            className="flex h-6 w-6 items-center justify-center rounded-full border border-primary-pink text-primary-pink transition-all hover:bg-primary-pink hover:text-white"
          >
            {open ? <FiMinus size={12} /> : <FiPlus size={12} />}
          </button>
        )}
      </div>
      {collapsible ? (
        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              key="content"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
              className="overflow-hidden"
            >
              <div className="pt-3">{children}</div>
            </motion.div>
          )}
        </AnimatePresence>
      ) : (
        <div className="mt-3">{children}</div>
      )}
    </div>
  );
}

/* ─── Checkbox Option ─────────────────────────────────────────── */
function CheckboxOption({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="group flex cursor-pointer items-center gap-2.5 py-1.5">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only"
      />
      <div
        className={cn(
          "flex h-4 w-4 shrink-0 items-center justify-center rounded border-2 transition-colors duration-150",
          checked
            ? "border-primary-pink bg-primary-pink"
            : "border-gray-300 group-hover:border-primary-pink/60",
        )}
      >
        {checked && (
          <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
            <path
              d="M1 3.5L3.5 6L8 1"
              stroke="white"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>
      <span
        className={cn(
          "text-sm transition-colors",
          checked
            ? "font-semibold text-text-dark"
            : "text-text-muted group-hover:text-text-dark",
        )}
      >
        {label}
      </span>
    </label>
  );
}

/* ─── Radio Option ───────────────────────────────────────────── */
function RadioOption({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="group flex cursor-pointer items-center gap-2.5 py-1.5">
      <input
        type="radio"
        checked={checked}
        onChange={onChange}
        className="sr-only"
      />
      <div
        className={cn(
          "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors duration-150",
          checked
            ? "border-primary-pink bg-primary-pink"
            : "border-gray-300 group-hover:border-primary-pink/60",
        )}
      >
        {checked && (
          <div className="h-1.5 w-1.5 rounded-full bg-white" />
        )}
      </div>
      <span
        className={cn(
          "text-sm transition-colors",
          checked
            ? "font-semibold text-text-dark"
            : "text-text-muted group-hover:text-text-dark",
        )}
      >
        {label}
      </span>
    </label>
  );
}

/* ─── Shop Product Card ──────────────────────────────────────── */
function ShopProductCard({
  product,
  index,
}: {
  product: any;
  index: number;
}) {
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();
  const offerBadgeText = product.offerDiscountType
    ? product.offerDiscountType === "percentage"
      ? `-${product.offerDiscountAmount}%`
      : `-৳${product.offerDiscountAmount}`
    : null;
  const availableQty = Number(product.quantity ?? product.qty ?? 0);
  const outOfStock = availableQty <= 0;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
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
  };

  return (
    <motion.article
      variants={scaleIn}
      custom={index}
      className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-card transition-shadow duration-300 hover:shadow-hover"
    >
      {/* ── Image area ── */}
      <Link href={`/product/${product.slug}`} className="flex flex-1 flex-col">
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
            {/* Offer badge (shown only when product is in an active offer) */}
            {offerBadgeText && (
              <span className="absolute left-2 top-2 z-10 rounded-full bg-gradient-yellow px-2.5 py-0.5 text-xs font-inter font-semibold text-text-dark shadow-sm">
                {offerBadgeText}
              </span>
            )}
          </div>
        </div>

        {/* ── Info ── */}
        <div className="flex flex-1 flex-col px-3 pb-1 pt-2.5">
          <h3 className="truncate font-inter text-sm font-semibold text-gray-900">
            {product.name}
          </h3>
          <div className="mt-auto flex items-baseline gap-1.5 whitespace-nowrap">
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

      {/* ── Cart button ── */}
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={handleAdd}
        className={cn(
          "mt-auto flex w-full items-center justify-center rounded-b-2xl py-3 transition-colors duration-300",
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

/* ─── Pagination ─────────────────────────────────────────────── */
function Pagination({
  current,
  total,
  onChange,
}: {
  current: number;
  total: number;
  onChange: (p: number) => void;
}) {
  const pages: (number | "...")[] = [];

  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i);
  } else {
    pages.push(1);
    if (current > 3) pages.push("...");
    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (current < total - 2) pages.push("...");
    pages.push(total);
  }

  const btnBase =
    "flex h-9 w-9 items-center justify-center rounded-full text-sm font-inter font-semibold transition-all";

  return (
    <div className="mt-12 flex items-center justify-center gap-2">
      <button
        onClick={() => onChange(current - 1)}
        disabled={current === 1}
        className={cn(
          btnBase,
          "border border-gray-200 bg-white text-text-dark shadow-soft hover:border-primary-pink hover:text-primary-pink disabled:cursor-not-allowed disabled:opacity-40",
        )}
      >
        <FiChevronLeft size={16} />
      </button>

      {pages.map((p, i) =>
        p === "..." ? (
          <span key={`dots-${i}`} className="px-1 text-text-muted">
            ...
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p as number)}
            className={cn(
              btnBase,
              p === current
                ? "bg-primary-pink text-white shadow-button"
                : "border border-gray-200 bg-white text-text-dark shadow-soft hover:border-primary-pink hover:text-primary-pink",
            )}
          >
            {p}
          </button>
        ),
      )}

      <button
        onClick={() => onChange(current + 1)}
        disabled={current === total}
        className={cn(
          btnBase,
          "border border-gray-200 bg-white text-text-dark shadow-soft hover:border-primary-pink hover:text-primary-pink disabled:cursor-not-allowed disabled:opacity-40",
        )}
      >
        <FiChevronRight size={16} />
      </button>
    </div>
  );
}

/* ─── Empty State ─────────────────────────────────────────────── */
function EmptyState({ onClear }: { onClear: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <span className="mb-4 text-6xl">🧸</span>
      <h3 className="text-card-title mb-2 text-text-dark">No toys found</h3>
      <p className="text-small mb-6 text-text-muted">
        Try adjusting your filters to discover something fun!
      </p>
      <button
        onClick={onClear}
        className="rounded-2xl bg-primary-pink px-6 py-3 font-inter font-semibold text-white shadow-button transition-all hover:shadow-hover"
      >
        Clear All Filters
      </button>
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────────────── */
export default function ProductsPageClient({
  categories = [],
  ages = [],
  brands = [],
  products = [],
  offers = [],
  offerParam,
  searchQuery,
}: {
  categories?: any[];
  ages?: any[];
  brands?: any[];
  products?: any[];
  offers?: any[];
  offerParam?: string;
  searchQuery?: string;
}) {
  const searchParams = useSearchParams();
  const normalizedSearch = (searchQuery || "").trim().toLowerCase();
  const searchTokens = useMemo(
    () => (normalizedSearch ? normalizedSearch.split(/\s+/).filter(Boolean) : []),
    [normalizedSearch],
  );
  const categoryNameById = useMemo(() => {
    const map = new Map<string, string>();
    categories.forEach((cat) => map.set(cat._id, String(cat.name || "").toLowerCase()));
    return map;
  }, [categories]);
  const brandNameById = useMemo(() => {
    const map = new Map<string, string>();
    brands.forEach((brand) => map.set(brand._id, String(brand.name || "").toLowerCase()));
    return map;
  }, [brands]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [autoOpenedFilters, setAutoOpenedFilters] = useState(false);
  const expandCategories = searchParams.get("expand") === "categories";
  const offerFromUrl = offerParam ?? searchParams.get("offer");

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedAges, setSelectedAges] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedGender, setSelectedGender] = useState<Gender>("");
  const [selectedOffer, setSelectedOffer] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState<[number, number]>([
    PRICE_MIN,
    PRICE_MAX,
  ]);
  const [currentPage, setCurrentPage] = useState(1);

  /* Initialise filters from URL search params (runs once after mount) */
  useEffect(() => {
    if (initialized) return;
    const gender = searchParams.get("gender");
    const age = searchParams.get("age");
    const category = searchParams.get("category");
    const brand = searchParams.get("brand");
    const initOfferId = searchParams.get("offer"); // expecting an Offer ID from URL

    if (gender && (GENDERS as readonly string[]).includes(gender)) setSelectedGender(gender as Gender);
    if (age) setSelectedAges([age]);
    if (category) {
      const matchedCat = categories.find(
        (c) => c.name.toLowerCase() === category.toLowerCase()
      );
      setSelectedCategories([matchedCat?._id || category]);
    }
    if (brand) {
      const matchedBrand = brands.find(
        (b) => b._id === brand || b.name === brand,
      );
      setSelectedBrands([matchedBrand?._id || brand]);
    }
    if (offerFromUrl) setSelectedOffer(offerFromUrl);
    else if (initOfferId) setSelectedOffer(initOfferId);

    setInitialized(true);
  }, [searchParams, initialized, offerFromUrl, brands]);

  /* Responsive detection */
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (!expandCategories || !isMobile || autoOpenedFilters) return;
    setSidebarOpen(true);
    setAutoOpenedFilters(true);
  }, [expandCategories, isMobile, autoOpenedFilters]);

  /* Body scroll lock when mobile sidebar open */
  useEffect(() => {
    if (sidebarOpen && isMobile) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen, isMobile]);

  /* Filtering */
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (searchTokens.length > 0) {
        const brandId = typeof p.brand === "string" ? p.brand : p.brand?._id;
        const brandName = typeof p.brand === "string" ? brandNameById.get(p.brand) : String(p.brand?.name || "").toLowerCase();
        const categoryName = categoryNameById.get(p.category) || "";
        const haystack = [
          p.name,
          p.slug,
          p.description,
          categoryName,
          brandName,
          brandId,
          p.toysFor,
        ]
          .filter(Boolean)
          .map((value) => String(value).toLowerCase())
          .join(" ");

        const matches = searchTokens.every((token) => haystack.includes(token));
        if (!matches) return false;
      }

      const brandId = typeof p.brand === "string" ? p.brand : p.brand?._id;
      const brandName = typeof p.brand === "string" ? undefined : p.brand?.name;

      if (selectedOffer) {
        const offer = offers.find(o => o._id === selectedOffer || o.slug === selectedOffer);
        if(offer) {
             if(offer.productSelection === 'selected') {
                 if (!offer.selectedProducts?.includes(p._id)) return false;
             }
        }
      }
      if (
        selectedCategories.length > 0 &&
        !selectedCategories.includes(p.category)
      )
        return false;
      if (selectedAges.length > 0 && !selectedAges.includes(p.ageRange))
        return false;
      if (
        selectedBrands.length > 0 &&
        !selectedBrands.some((selected) => selected === brandId || selected === brandName)
      )
        return false;
        
      const pPrice = p.salePrice || p.price;
      if (pPrice < priceRange[0] || pPrice > priceRange[1]) return false;
      
      // Gender filter
      if (selectedGender !== "" && p.toysFor !== 'both') {
          if (selectedGender.toLowerCase() !== p.toysFor) return false;
      }
      return true;
    });
  }, [
    selectedCategories,
    selectedAges,
    selectedBrands,
    priceRange,
    selectedGender,
    selectedOffer,
    products,
    offers,
    searchTokens,
    categoryNameById,
    brandNameById,
  ]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PER_PAGE));
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * PER_PAGE,
    currentPage * PER_PAGE,
  );

  const hasFilters =
    selectedCategories.length > 0 ||
    selectedAges.length > 0 ||
    selectedBrands.length > 0 ||
    selectedOffer !== null ||
    selectedGender !== "" ||
    priceRange[0] > PRICE_MIN ||
    priceRange[1] < PRICE_MAX;

  const activeFilterCount =
    selectedCategories.length +
    selectedAges.length +
    selectedBrands.length +
    (selectedOffer !== null ? 1 : 0) +
    (selectedGender !== "" ? 1 : 0) +
    (priceRange[0] > PRICE_MIN || priceRange[1] < PRICE_MAX ? 1 : 0);

  const resetFilters = () => {
    setSelectedCategories([]);
    setSelectedAges([]);
    setSelectedBrands([]);
    setSelectedOffer(null);
    setSelectedGender("");
    setPriceRange([PRICE_MIN, PRICE_MAX]);
    setCurrentPage(1);
  };

  const handlePageChange = (p: number) => {
    setCurrentPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleCategory = (cat: string, checked: boolean) => {
    setSelectedCategories((prev) =>
      checked ? [...prev, cat] : prev.filter((x) => x !== cat),
    );
    setCurrentPage(1);
  };

  const toggleAge = (age: string, checked: boolean) => {
    setSelectedAges((prev) =>
      checked ? [...prev, age] : prev.filter((x) => x !== age),
    );
    setCurrentPage(1);
  };

  const toggleBrand = (brand: string, checked: boolean) => {
    setSelectedBrands((prev) =>
      checked ? [...prev, brand] : prev.filter((x) => x !== brand),
    );
    setCurrentPage(1);
  };

  /* ── Sidebar content (shared between mobile & desktop) ── */
  const SidebarContent = (
    <div className="w-full space-y-5">
      {/* Sidebar header */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <span className="font-inter text-lg font-semibold text-text-dark">
            Filters
          </span>
          {isMobile && (
            <button
              onClick={() => setSidebarOpen(false)}
              className="rounded-full p-1 transition-colors hover:bg-gray-100"
            >
              <FiX size={18} className="text-text-muted" />
            </button>
          )}
        </div>
        <hr className="border-gray-100" />
      </div>

      {/* Gender */}
      <FilterSection title="Shop For" defaultOpen>
        <div className="flex flex-wrap gap-x-4">
          {GENDERS.map((g) => (
            <RadioOption
              key={g}
              label={g}
              checked={selectedGender === g}
              onChange={() => {
                setSelectedGender((prev) => (prev === g ? "" : g));
                setCurrentPage(1);
              }}
            />
          ))}
        </div>
      </FilterSection>

      {/* Categories */}
      <FilterSection title="Categories" defaultOpen={expandCategories}>
        {categories.map((cat) => (
          <CheckboxOption
            key={cat._id}
            label={cat.name}
            checked={selectedCategories.includes(cat._id)}
            onChange={(checked) => toggleCategory(cat._id, checked)}
          />
        ))}
      </FilterSection>

      {/* Age Group */}
      <FilterSection title="Age Group">
        {ages.map((age) => (
          <CheckboxOption
            key={age._id}
            label={`${age.label} yrs`}
            checked={selectedAges.includes(age._id)}
            onChange={(checked) => toggleAge(age._id, checked)}
          />
        ))}
      </FilterSection>

      {/* Price Range */}
      <FilterSection title="Price Range" collapsible={false}>
        <PriceRangeSlider
          value={priceRange}
          onChange={(v) => {
            setPriceRange(v);
            setCurrentPage(1);
          }}
        />
      </FilterSection>

      {/* Brands */}
      <FilterSection title="Brands">
        {brands.map((brand) => (
          <CheckboxOption
            key={brand._id}
            label={brand.name}
            checked={selectedBrands.includes(brand._id)}
            onChange={(checked) => toggleBrand(brand._id, checked)}
          />
        ))}
      </FilterSection>

      {/* Clear */}
      {hasFilters && (
        <button
          onClick={resetFilters}
          className="w-full rounded-xl border border-gray-200 py-2 font-inter text-sm font-semibold text-text-muted transition-colors hover:text-primary-pink"
        >
          Clear All
        </button>
      )}

      {/* Apply — mobile only */}
      <motion.button
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.96 }}
        onClick={() => setSidebarOpen(false)}
        className="lg:hidden w-full rounded-2xl bg-gradient-primary py-3 font-inter font-semibold text-white shadow-button hover:shadow-hover"
      >
        Apply Filters
      </motion.button>
    </div>
  );

  /* ── Render ── */
  return (
    <div className="min-h-screen bg-soft-bg pt-26 pb-20">
      {/* ─── Header ─── */}
      <div className="px-section pt-8">
        {/* Breadcrumb */}
        <nav
          aria-label="breadcrumb"
          className="mb-5 flex items-center justify-center gap-2 text-small text-text-muted"
        >
          <Link
            href="/"
            className="transition-colors hover:text-primary-pink"
          >
            Home
          </Link>
          <FiChevronRight size={12} />
          <span className="font-semibold text-text-dark">
            {normalizedSearch ? "Search Results" : "All Toys"}
          </span>
        </nav>

        {/* Title + Filter toggle (mobile only) */}
        <div className="relative flex items-center justify-center">
          <h1
            className={cn(
              "text-section-title text-center",
              normalizedSearch ? "text-primary-pink" : "text-text-dark",
            )}
          >
            {normalizedSearch ? "Search Results" : "All Toys"}{" "}
            <span className="font-inter text-xl font-normal text-text-muted">
              ({filteredProducts.length} items)
            </span>
          </h1>
          <motion.button
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={cn(
              "lg:hidden absolute right-0 flex shrink-0 items-center gap-2 rounded-2xl px-4 py-2.5 font-inter font-semibold text-sm transition-all",
              sidebarOpen
                ? "bg-primary-pink text-white shadow-button"
                : "bg-white text-text-dark shadow-card hover:shadow-soft",
            )}
          >
            <FiFilter size={15} />
            Filters
            {activeFilterCount > 0 && (
              <span
                className={cn(
                  "flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold",
                  sidebarOpen
                    ? "bg-white/25 text-white"
                    : "bg-primary-pink text-white",
                )}
              >
                {activeFilterCount}
              </span>
            )}
          </motion.button>
        </div>

        {/* Active filter chips */}
        <AnimatePresence>
          {hasFilters && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mt-4 flex flex-wrap items-center justify-center gap-2"
            >
              {selectedGender && (
                <span
                  className="flex items-center gap-1.5 rounded-full border border-primary-pink/30 bg-white px-3 py-1 text-xs font-semibold text-text-dark shadow-soft"
                >
                  {selectedGender}
                  <button
                    onClick={() => setSelectedGender("")}
                    className="text-text-muted hover:text-primary-pink"
                  >
                    <FiX size={11} />
                  </button>
                </span>
              )}
              {selectedCategories.map((cId) => (
                <span
                  key={cId}
                  className="flex items-center gap-1.5 rounded-full border border-primary-pink/30 bg-white px-3 py-1 text-xs font-semibold text-text-dark shadow-soft"
                >
                  {categories.find(c => c._id === cId)?.name || 'Category'}
                  <button
                    onClick={() =>
                      setSelectedCategories((p) => p.filter((x) => x !== cId))
                    }
                    className="text-text-muted hover:text-primary-pink"
                  >
                    <FiX size={11} />
                  </button>
                </span>
              ))}
              {selectedOffer && (
                <span className="flex items-center gap-1.5 rounded-full border border-primary-pink/30 bg-white px-3 py-1 text-xs font-semibold text-text-dark shadow-soft">
                  {offers.find(o => o._id === selectedOffer || o.slug === selectedOffer)?.title ?? "Offer"}
                  <button
                    onClick={() => setSelectedOffer(null)}
                    className="text-text-muted hover:text-primary-pink"
                  >
                    <FiX size={11} />
                  </button>
                </span>
              )}
              {selectedAges.map((aId) => (
                <span
                  key={aId}
                  className="flex items-center gap-1.5 rounded-full border border-primary-pink/30 bg-white px-3 py-1 text-xs font-semibold text-text-dark shadow-soft"
                >
                  {ages.find(a => a._id === aId)?.label} yrs
                  <button
                    onClick={() =>
                      setSelectedAges((p) => p.filter((x) => x !== aId))
                    }
                    className="text-text-muted hover:text-primary-pink"
                  >
                    <FiX size={11} />
                  </button>
                </span>
              ))}
              {selectedBrands.map((bId) => (
                <span
                  key={bId}
                  className="flex items-center gap-1.5 rounded-full border border-primary-pink/30 bg-white px-3 py-1 text-xs font-semibold text-text-dark shadow-soft"
                >
                  {brands.find(b => b._id === bId)?.name}
                  <button
                    onClick={() =>
                      setSelectedBrands((p) => p.filter((x) => x !== bId))
                    }
                    className="text-text-muted hover:text-primary-pink"
                  >
                    <FiX size={11} />
                  </button>
                </span>
              ))}
              {(priceRange[0] > PRICE_MIN || priceRange[1] < PRICE_MAX) && (
                <span className="flex items-center gap-1.5 rounded-full border border-primary-pink/30 bg-white px-3 py-1 text-xs font-semibold text-text-dark shadow-soft">
                  ৳{priceRange[0].toLocaleString()} –{" "}
                  ৳{priceRange[1].toLocaleString()}
                  <button
                    onClick={() => setPriceRange([PRICE_MIN, PRICE_MAX])}
                    className="text-text-muted hover:text-primary-pink"
                  >
                    <FiX size={11} />
                  </button>
                </span>
              )}
              <button
                onClick={resetFilters}
                className="text-xs font-semibold text-primary-pink transition-opacity hover:underline"
              >
                Clear all
              </button>
            </motion.div>
          )}
        </AnimatePresence>
        <hr className="mt-4 border-gray-100" />
      </div>

      {/* ─── Main layout ─── */}
      <div className="flex items-start gap-6 px-section pb-section">
        {/* Desktop sidebar — always visible */}
        <aside className="hidden w-70 shrink-0 lg:block">
          <div
            className="sticky top-26 overflow-y-auto rounded-3xl bg-white p-5 shadow-card"
            style={{ maxHeight: "calc(100vh - 104px)" }}
          >
            {SidebarContent}
          </div>
        </aside>

        {/* Mobile sidebar (fixed overlay) */}
        <AnimatePresence>
          {sidebarOpen && isMobile && (
            <>
              {/* Backdrop */}
              <motion.div
                key="backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-40 bg-dark-bg/50 backdrop-blur-sm"
                onClick={() => setSidebarOpen(false)}
              />
              {/* Drawer */}
              <motion.aside
                key="mobile-drawer"
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                className="fixed left-0 top-0 z-50 h-full w-75 overflow-y-auto bg-white p-5 shadow-hover"
              >
                {SidebarContent}
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* ─── Product Grid ─── */}
        <div className="min-w-0 flex-1">
          {paginatedProducts.length === 0 ? (
            <EmptyState onClear={resetFilters} />
          ) : (
            <motion.div
              key={`page-${currentPage}-${selectedGender}-${selectedOffer ?? ""}-${selectedCategories.join()}-${selectedAges.join()}-${selectedBrands.join()}-${priceRange.join()}`}
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4"
            >
              {paginatedProducts.map((product, i) => (
                <ShopProductCard key={product._id} product={product} index={i} />
              ))}
            </motion.div>
          )}

          {/* Pagination — always visible */}
          <Pagination
            current={currentPage}
            total={totalPages}
            onChange={handlePageChange}
          />
        </div>
      </div>
    </div>
  );
}
