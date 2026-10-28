"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiSearch,
  FiShoppingCart,
  FiUser,
  FiHome,
  FiGrid,
  FiTag,
  FiMenu,
  FiX,
  FiChevronRight,
  FiChevronDown,
  FiShoppingBag,
} from "react-icons/fi";
import { FaFacebook, FaWhatsapp, FaInstagram, FaYoutube, FaTiktok } from "react-icons/fa";
import type { Storefront } from "@/lib/homepage/types";

export type NavStorefront = Pick<Storefront, "navPills" | "contact" | "socials" | "searchPlaceholders"> & { logoUrl: string };
import { useCart } from "@/components/cart/CartProvider";
import NavSearchOverlay from "./NavSearchOverlay";
import AnimatedPlaceholder from "./AnimatedPlaceholder";
import PillRow from "./PillRow";

const navLinks = [
  { label: "Home",     href: "/"         },
  { label: "Products", href: "/products" },
  { label: "Offers",   href: "/offers"   },
  { label: "Blogs",    href: "/blogs"    },
];

/**
 * One category row in the sidebar's Categories accordion. Hovering a row
 * that has sub-categories reveals them in a flyout beside it. The flyout is
 * portaled to document.body — the drawer's nav list scrolls (overflow-y-auto),
 * which would otherwise clip anything positioned beside a row via CSS alone.
 *
 * On mobile there is no room beside the row (the flyout runs off-screen), so
 * sub-categories instead expand inline underneath the category.
 */
function CategoryRowWithFlyout({
  category,
  subCategories,
  onNavigate,
}: {
  category: { _id: string; name: string };
  subCategories: Array<{ _id: string; name: string; category: string }>;
  onNavigate: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [rect, setRect] = useState<{ top: number; left: number } | null>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const subs = subCategories.filter((s) => s.category === category._id);

  const clearCloseTimer = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  const handleEnter = () => {
    clearCloseTimer();
    if (isMobile) return;
    if (subs.length === 0 || !rowRef.current) return;
    const r = rowRef.current.getBoundingClientRect();
    setRect({ top: r.top, left: r.right });
    setOpen(true);
  };
  // Closing is delayed so the cursor has time to travel from the row to the
  // flyout (they're separate elements with a gap between them) — closing
  // instantly on mouseleave was firing before the flyout could be reached.
  const scheduleClose = () => {
    clearCloseTimer();
    closeTimer.current = setTimeout(() => setOpen(false), 300);
  };

  useEffect(() => () => clearCloseTimer(), []);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  if (isMobile && subs.length > 0) {
    return (
      <div>
        <div className="flex items-center border-b border-gray-50">
          <Link
            href={`/products?category=${category._id}`}
            onClick={onNavigate}
            className="flex-1 py-2.5 pr-3 text-sm text-text-muted transition-colors hover:text-primary-pink"
          >
            {category.name}
          </Link>
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            aria-label={expanded ? `Hide ${category.name} sub-categories` : `Show ${category.name} sub-categories`}
            className="flex h-9 w-9 shrink-0 items-center justify-center text-text-muted"
          >
            <FiChevronDown size={14} className={`transition-transform ${expanded ? "rotate-180" : ""}`} />
          </button>
        </div>
        {expanded && (
          <div className="ml-3 flex flex-col border-l border-gray-100 pl-3">
            {subs.map((sub) => (
              <Link
                key={sub._id}
                href={`/products?subcategory=${sub._id}`}
                onClick={onNavigate}
                className="border-b border-gray-50 py-2 text-sm text-text-muted transition-colors hover:text-primary-pink"
              >
                {sub.name}
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div ref={rowRef} onMouseEnter={handleEnter} onMouseLeave={scheduleClose} className="relative">
      <Link
        href={`/products?category=${category._id}`}
        onClick={onNavigate}
        className="flex items-center justify-between border-b border-gray-50 py-2.5 pr-3 text-sm text-text-muted transition-colors hover:text-primary-pink"
      >
        {category.name}
        <FiChevronRight size={14} className="shrink-0" />
      </Link>

      {open && subs.length > 0 && rect && typeof document !== "undefined" && createPortal(
        <div
          onMouseEnter={clearCloseTimer}
          onMouseLeave={scheduleClose}
          style={{ position: "fixed", top: rect.top, left: rect.left + 6 }}
          className="z-80 w-56 rounded-2xl border border-gray-100 bg-white p-2 shadow-hover"
        >
          <div className="px-2 pb-1.5 pt-1 text-xs font-semibold uppercase tracking-wide text-text-muted">
            {category.name}
          </div>
          {subs.map((sub) => (
            <Link
              key={sub._id}
              href={`/products?subcategory=${sub._id}`}
              onClick={() => { setOpen(false); onNavigate(); }}
              className="flex items-center justify-between rounded-lg px-2 py-2 text-sm text-text-dark transition-colors hover:bg-soft-bg hover:text-primary-pink"
            >
              {sub.name}
              <FiChevronRight size={12} className="shrink-0 text-text-muted" />
            </Link>
          ))}
        </div>,
        document.body,
      )}
    </div>
  );
}

export default function Navbar({ storefront }: { storefront: NavStorefront }) {
  const pathname = usePathname();
  const router = useRouter();
  const [topbarTexts, setTopbarTexts]   = useState<string[]>([]);
  const [topbarIndex, setTopbarIndex]   = useState(0);
  const [isLoggedIn, setIsLoggedIn]     = useState(false);
  const [sidebarOpen, setSidebarOpen]   = useState(false);
  const [searchOpen, setSearchOpen]     = useState(false);
  const [categories, setCategories]     = useState<Array<{ _id: string; name: string }>>([]);
  const [subCategories, setSubCategories] = useState<Array<{ _id: string; name: string; category: string }>>([]);
  const [openSection, setOpenSection]   = useState<"categories" | null>(null);
  const logoUrl                         = storefront.logoUrl || "/logo/main-logo.png";
  const { itemCount, hydrated, openSidebar: openCart } = useCart();
  const socialLinks = [
    { href: storefront.socials.facebook, label: "Facebook", Icon: FaFacebook },
    { href: storefront.socials.instagram, label: "Instagram", Icon: FaInstagram },
    { href: storefront.socials.youtube, label: "YouTube", Icon: FaYoutube },
    { href: storefront.socials.tiktok, label: "TikTok", Icon: FaTiktok },
    { href: storefront.contact.whatsapp ? `https://wa.me/${storefront.contact.whatsapp.replace(/\D/g, "")}` : "", label: "WhatsApp", Icon: FaWhatsapp },
  ].filter((s) => s.href);
  const cartCount                       = hydrated ? itemCount : 0;

  const isAdminRoute = pathname?.startsWith("/admin");

  const mobileBottomNav = [
    { label: "Home",       type: "link",   href: "/",                    icon: FiHome        },
    { label: "Offers",     type: "link",   href: "/offers",              icon: FiTag         },
    { label: "Cart",       type: "link",   href: "/cart",                icon: FiShoppingCart, isCenter: true },
    { label: "Products",   type: "link",   href: "/products",            icon: FiShoppingBag },
    { label: "Menu",       type: "menu",                                     icon: FiGrid   },
  ];


  useEffect(() => {
    let alive = true;
    const loadTopbarTexts = async () => {
      try {
        const res = await fetch("/api/admin/hero/topbar");
        if (!res.ok) return;
        const data = await res.json();
        if (!alive) return;
        const texts = Array.isArray(data)
          ? data.filter((t) => t?.isActive).map((t) => t?.text).filter(Boolean)
          : [];
        setTopbarTexts(texts);
      } catch {
        if (alive) setTopbarTexts([]);
      }
    };
    loadTopbarTexts();
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    setSidebarOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash) return;
    const targetId = hash.replace("#", "");
    if (!targetId) return;

    let attempts = 0;
    const tryScroll = () => {
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "start" });
        return;
      }
      attempts += 1;
      if (attempts < 10) window.setTimeout(tryScroll, 120);
    };
    window.setTimeout(tryScroll, 80);
  }, [pathname]);

  useEffect(() => {
    router.prefetch("/");
    router.prefetch("/products");
    router.prefetch("/cart");
    router.prefetch("/offers");
    router.prefetch("/blogs");
  }, [router]);

  useEffect(() => {
    let alive = true;
    const loadCategories = async () => {
      try {
        const res = await fetch("/api/admin/categories?visible=1");
        if (!res.ok) return;
        const data = await res.json();
        if (alive) setCategories(Array.isArray(data) ? data : []);
      } catch {
        if (alive) setCategories([]);
      }
    };
    loadCategories();
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    let alive = true;
    const loadSubCategories = async () => {
      try {
        const res = await fetch("/api/admin/subcategories?visible=1");
        if (!res.ok) return;
        const data = await res.json();
        if (alive) setSubCategories(Array.isArray(data) ? data : []);
      } catch {
        if (alive) setSubCategories([]);
      }
    };
    loadSubCategories();
    return () => { alive = false; };
  }, []);


  useEffect(() => {
    const openSidebar = () => setSidebarOpen(true);
    window.addEventListener("dealhobe-open-category-sidebar", openSidebar);
    return () => window.removeEventListener("dealhobe-open-category-sidebar", openSidebar);
  }, []);

  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      setOpenSection(null);
    }
    return () => { document.body.style.overflow = ""; };
  }, [sidebarOpen]);

  useEffect(() => {
    if (topbarTexts.length <= 1) return;
    const id = window.setInterval(() => {
      setTopbarIndex((prev) => (prev + 1) % topbarTexts.length);
    }, 10000);
    return () => window.clearInterval(id);
  }, [topbarTexts]);

  useEffect(() => {
    let alive = true;
    const syncAuth = async () => {
      const token = window.localStorage.getItem("dealhobe_auth_token_v1");
      if (!token) {
        if (alive) setIsLoggedIn(false);
        return;
      }
      try {
        const res = await fetch("/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Invalid token");
        if (alive) setIsLoggedIn(true);
      } catch {
        window.localStorage.removeItem("dealhobe_auth_token_v1");
        window.dispatchEvent(new Event("dealhobe-auth-changed"));
        if (alive) setIsLoggedIn(false);
      }
    };

    syncAuth();
    window.addEventListener("dealhobe-auth-changed", syncAuth);
    return () => {
      alive = false;
      window.removeEventListener("dealhobe-auth-changed", syncAuth);
    };
  }, []);

  if (isAdminRoute) return null;


  const toggleSection = (key: "categories") => {
    setOpenSection((prev) => (prev === key ? null : key));
  };

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <>
      {/* Always-visible header: announcement bar, main row and category pills stay pinned while scrolling. */}
      <div className="fixed inset-x-0 top-0 z-50 shadow-[0_6px_20px_rgba(59,13,46,0.06)]">
        {/* ── Top Bar ─────────────────────────────────────────────── */}
        <div className="h-9 bg-plum text-white text-xs flex items-center">
          <div className="shell flex items-center justify-between gap-3">
            <span className="font-body font-medium relative overflow-hidden h-4 min-w-0 flex-1 truncate">
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={topbarTexts[topbarIndex] || "fallback"}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.25 }}
                  className="block truncate"
                >
                  {topbarTexts[topbarIndex] || (
                    <>100% authentic beauty · Cash on delivery across Bangladesh</>
                  )}
                </motion.span>
              </AnimatePresence>
            </span>
            <div className="hidden items-center gap-4 sm:flex">
              {storefront.contact.phone && (
                <a href={`tel:${storefront.contact.phone}`} className="text-white/80 transition-colors hover:text-gold">
                  {storefront.contact.phone}
                </a>
              )}
              {socialLinks.map(({ href, label, Icon }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="text-white/80 transition-colors hover:text-gold">
                  <Icon size={14} />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* ── Main Navbar ─────────────────────────────────────────── */}
        <header className="relative h-16 border-b border-black/5 bg-white/95 backdrop-blur-md">
          {searchOpen ? (
            <NavSearchOverlay onClose={() => setSearchOpen(false)} placeholders={storefront.searchPlaceholders ?? []} />
          ) : (
            <div className="shell flex h-full items-center gap-2 md:gap-4">
              <button
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-text-dark transition-colors hover:bg-black/5"
                aria-label="Open menu"
                onClick={() => setSidebarOpen(true)}
              >
                <FiMenu size={21} />
              </button>

              <Link href="/" className="shrink-0" aria-label="DealHobe home">
                <Image src={logoUrl} alt="DealHobe" width={48} height={48} className="h-10 w-10 object-contain md:h-12 md:w-12" priority />
              </Link>

              {/* Desktop search field — opens the live search overlay */}
              <button
                type="button"
                onClick={() => { setSidebarOpen(false); setSearchOpen(true); }}
                className="mx-auto hidden h-11 w-full max-w-xl items-center gap-3 rounded-full border border-primary-pink/25 bg-soft-bg-alt/60 px-5 text-left text-sm text-text-muted transition-colors hover:border-primary-pink/60 md:flex"
              >
                <FiSearch size={18} className="shrink-0 text-primary-pink" />
                <AnimatedPlaceholder terms={storefront.searchPlaceholders ?? []} />
              </button>

              <nav className="hidden items-center gap-1 lg:flex">
                {navLinks.slice(1).map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className={`rounded-full px-3.5 py-2 text-sm font-semibold transition-colors hover:bg-primary-pink/8 hover:text-primary-pink ${pathname?.startsWith(link.href) ? "text-primary-pink" : "text-text-dark"}`}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              <div className="ml-auto flex items-center gap-1 md:ml-0">
                <button
                  className="flex h-10 w-10 items-center justify-center rounded-xl text-text-dark transition-colors hover:bg-black/5 md:hidden"
                  aria-label="Search"
                  onClick={() => { setSidebarOpen(false); setSearchOpen(true); }}
                >
                  <FiSearch size={20} />
                </button>
                <Link
                  href={isLoggedIn ? "/profile" : "/auth/login"}
                  aria-label="Account"
                  className="flex h-10 items-center gap-2 rounded-xl px-2 text-text-dark transition-colors hover:bg-black/5"
                >
                  <FiUser size={20} />
                  <span className="hidden text-sm font-semibold xl:inline">{isLoggedIn ? "Account" : "Login"}</span>
                </Link>
                <button
                  type="button"
                  onClick={openCart}
                  aria-label={`Bag, ${cartCount} items`}
                  className="relative hidden h-10 items-center gap-2 rounded-full bg-primary-pink px-4 text-sm font-semibold text-white shadow-button transition-transform hover:-translate-y-0.5 md:flex"
                >
                  <FiShoppingBag size={18} />
                  Bag
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1 text-[11px] font-bold text-primary-pink">{cartCount}</span>
                </button>
              </div>
            </div>
          )}
        </header>

        {/* ── Category pills (edited in Admin › Homepage Builder › Storefront) ── */}
        {storefront.navPills.length > 0 && (
          <div className="h-11 border-b border-black/5 bg-white/95 backdrop-blur-md">
            <PillRow pills={storefront.navPills} />
          </div>
        )}
      </div>

      {/* ── Sidebar ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              key="sidebar-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-60 bg-black/30"
              onClick={closeSidebar}
            />
            <motion.aside
              key="sidebar-panel"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
              className="fixed left-0 top-0 z-70 flex h-full w-80 max-w-[85vw] flex-col bg-white shadow-hover"
            >
              {/* Header */}
              <div className="border-b border-gray-100 px-5 py-4">
                <div className="flex items-center justify-between">
                  <Link href="/" onClick={closeSidebar} className="flex items-center">
                    <Image
                      src={logoUrl}
                      alt="DealHobe"
                      width={120}
                      height={36}
                      className="h-9 w-auto object-contain"
                      priority
                    />
                  </Link>
                  <button
                    onClick={closeSidebar}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-text-muted transition-colors hover:border-primary-pink hover:text-primary-pink"
                    aria-label="Close menu"
                  >
                    <FiX size={16} />
                  </button>
                </div>
              </div>

              {/* Nav items */}
              <div className="flex-1 overflow-y-auto px-3 py-2">

                {/* Home */}
                <Link
                  href="/"
                  onClick={closeSidebar}
                  className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold uppercase tracking-wide text-text-dark transition-colors hover:bg-gray-50 hover:text-primary-pink"
                >
                  <FiHome size={17} className="shrink-0 text-primary-pink" />
                  Home
                </Link>

                {/* Categories — accordion */}
                <div>
                  <button
                    onClick={() => toggleSection("categories")}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold uppercase tracking-wide text-text-dark transition-colors hover:bg-gray-50 hover:text-primary-pink"
                  >
                    <FiGrid size={17} className="shrink-0 text-primary-pink" />
                    <span className="flex-1 text-left">Categories</span>
                    <motion.span
                      animate={{ rotate: openSection === "categories" ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <FiChevronDown size={16} className="text-text-muted" />
                    </motion.span>
                  </button>
                  <AnimatePresence initial={false}>
                    {openSection === "categories" && (
                      <motion.div
                        key="categories-panel"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="ml-8 mb-1 flex flex-col">
                          {categories.map((category) => (
                            <CategoryRowWithFlyout
                              key={category._id}
                              category={category}
                              subCategories={subCategories}
                              onNavigate={closeSidebar}
                            />
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Products / Offers / Blogs */}
                <Link
                  href="/products"
                  onClick={closeSidebar}
                  className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold uppercase tracking-wide text-text-dark transition-colors hover:bg-gray-50 hover:text-primary-pink"
                >
                  <FiShoppingBag size={17} className="shrink-0 text-primary-pink" />
                  Products
                </Link>
                {navLinks.slice(2).map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={closeSidebar}
                    className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold uppercase tracking-wide text-text-dark transition-colors hover:bg-gray-50 hover:text-primary-pink"
                  >
                    <FiChevronRight size={17} className="shrink-0 text-primary-pink" />
                    {link.label}
                  </Link>
                ))}

                {/* Cart */}
                <Link
                  href="/cart"
                  onClick={closeSidebar}
                  className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold uppercase tracking-wide text-text-dark transition-colors hover:bg-gray-50 hover:text-primary-pink"
                >
                  <FiShoppingCart size={17} className="shrink-0 text-primary-pink" />
                  <span className="flex-1">Cart</span>
                  {cartCount > 0 && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-pink text-[10px] font-bold text-white">
                      {cartCount}
                    </span>
                  )}
                </Link>
              </div>

              {/* Footer */}
              <div className="border-t border-gray-100 px-5 py-4">
                <Link
                  href="/products"
                  className="mb-4 inline-flex w-full items-center justify-center rounded-2xl bg-primary-pink px-4 py-2.5 text-sm font-semibold text-white"
                  onClick={closeSidebar}
                >
                  View All Products
                </Link>
                <div className="flex items-center justify-center gap-4 text-text-muted">
                  {socialLinks.map(({ href, label, Icon }) => (
                    <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="transition-colors hover:text-primary-pink">
                      <Icon size={18} />
                    </a>
                  ))}
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Mobile bottom nav ────────────────────────────────────── */}
      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-[#e9edf3] bg-white/95 backdrop-blur-sm md:hidden">
        <div className="relative grid grid-cols-5 gap-0 px-1 pb-[calc(0.35rem+env(safe-area-inset-bottom))] pt-2">
          {mobileBottomNav.map((item) => {
            const Icon = item.icon;
            if (item.type === "link") {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname?.startsWith(item.href ?? "");

              if (item.isCenter) {
                return (
                  <button
                    key={item.label}
                    onClick={() => router.push(item.href ?? "/cart", { scroll: true })}
                    className="flex flex-col items-center justify-center gap-1 text-[11px] font-semibold text-primary-pink"
                    aria-label={item.label}
                  >
                    <span className="relative -mt-7 flex h-14 w-14 items-center justify-center rounded-full bg-primary-pink text-white shadow-button">
                      <Icon size={22} />
                      {cartCount > 0 && (
                        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-white text-[10px] font-bold text-primary-pink shadow">
                          {cartCount}
                        </span>
                      )}
                    </span>
                    <span className="uppercase text-[#6a7280]">{item.label}</span>
                  </button>
                );
              }

              return (
                <button
                  key={item.label}
                  onClick={() => router.push(item.href ?? "/", { scroll: true })}
                  className={`flex min-h-14 flex-col items-center justify-center gap-0.5 rounded-xl text-[11px] font-semibold transition-colors ${
                    isActive ? "text-primary-pink" : "text-[#6a7280]"
                  }`}
                  aria-current={isActive ? "page" : undefined}
                >
                  <Icon size={18} />
                  <span className="uppercase">{item.label}</span>
                </button>
              );
            }

            return (
              <button
                key={item.label}
                onClick={() => setSidebarOpen(true)}
                className="flex min-h-14 flex-col items-center justify-center gap-0.5 rounded-xl text-[11px] font-semibold text-[#6a7280] transition-colors"
              >
                <Icon size={18} />
                <span className="uppercase">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
