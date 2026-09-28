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
import { FaFacebook, FaWhatsapp } from "react-icons/fa";
import { useCart } from "@/components/cart/CartProvider";
import NavSearchOverlay from "./NavSearchOverlay";

const navLinks = [
  { label: "Home",     href: "/"         },
  { label: "Products", href: "/products" },
  { label: "Offers",   href: "/offers"   },
  { label: "Blogs",    href: "/blogs"    },
];

/* Shared logo used in the navbar */
function Logo({ logoUrl }: { logoUrl: string }) {
  return (
    <Link href={"/"} className="shrink-0">
      <Image
        src={logoUrl}
        alt="DealHobe"
        width={48}
        height={48}
        className="w-11 h-11 md:w-12 md:h-12 object-contain"
        priority
      />
    </Link>
  );
}

/**
 * One category row in the sidebar's Categories accordion. Hovering a row
 * that has sub-categories reveals them in a flyout beside it. The flyout is
 * portaled to document.body — the drawer's nav list scrolls (overflow-y-auto),
 * which would otherwise clip anything positioned beside a row via CSS alone.
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

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [visible, setVisible]           = useState(true);
  const lastScrollY                     = useRef(0);
  const [topbarTexts, setTopbarTexts]   = useState<string[]>([]);
  const [topbarIndex, setTopbarIndex]   = useState(0);
  const [isLoggedIn, setIsLoggedIn]     = useState(false);
  const [sidebarOpen, setSidebarOpen]   = useState(false);
  const [searchOpen, setSearchOpen]     = useState(false);
  const [categories, setCategories]     = useState<Array<{ _id: string; name: string }>>([]);
  const [subCategories, setSubCategories] = useState<Array<{ _id: string; name: string; category: string }>>([]);
  const [openSection, setOpenSection]   = useState<"categories" | null>(null);
  const [logoUrl, setLogoUrl]           = useState("/logo/main-logo.png");
  const { itemCount, hydrated }         = useCart();
  const cartCount                       = hydrated ? itemCount : 0;

  const isAdminRoute = pathname?.startsWith("/admin");

  const mobileBottomNav = [
    { label: "Home",       type: "link",   href: "/",                    icon: FiHome        },
    { label: "Offers",     type: "link",   href: "/offers",              icon: FiTag         },
    { label: "Cart",       type: "link",   href: "/cart",                icon: FiShoppingCart, isCenter: true },
    { label: "Products",   type: "link",   href: "/products",            icon: FiShoppingBag },
    { label: "Categories", type: "scroll", targetId: "top-categories",       icon: FiGrid   },
  ];

  /*
   * Hide on scroll-down, reveal on scroll-up. Reads are batched to once per
   * animation frame and direction only flips past a small threshold — firing
   * setVisible on every raw scroll event (no rAF, no threshold) let tiny
   * momentum-scroll jitter flip it back and forth rapidly, each flip
   * restarting the slide animation and re-rendering, which is what made
   * scrolling feel like it was stuttering/breaking.
   */
  useEffect(() => {
    const DIRECTION_THRESHOLD = 8;
    let ticking = false;

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        const y = window.scrollY;
        if (y < 50) {
          setVisible(true);
        } else {
          const delta = y - lastScrollY.current;
          if (delta > DIRECTION_THRESHOLD) setVisible(false);
          else if (delta < -DIRECTION_THRESHOLD) setVisible(true);
        }
        lastScrollY.current = y;
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
        const res = await fetch("/api/admin/categories");
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
        const res = await fetch("/api/admin/subcategories");
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
    let alive = true;
    const loadLogo = async () => {
      try {
        const res = await fetch("/api/settings");
        const data = await res.json();
        if (!alive) return;
        if (res.ok && data?.logoUrl) setLogoUrl(data.logoUrl);
      } catch {
        if (alive) setLogoUrl("/logo/main-logo.png");
      }
    };
    loadLogo();
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

  const handleScrollTo = (targetId: string) => {
    if (pathname !== "/") {
      router.push(`/#${targetId}`);
      return;
    }
    const el = document.getElementById(targetId);
    if (!el) return;
    el.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "start" });
  };

  const toggleSection = (key: "categories") => {
    setOpenSection((prev) => (prev === key ? null : key));
  };

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <>
      {/* Animated wrapper — slides up on scroll-down, slides back on scroll-up */}
      <motion.div
        className="fixed inset-x-0 top-0 z-50"
        animate={{ y: visible ? 0 : "calc(-100% - 40px)" }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      >
        {/* ── Top Bar ─────────────────────────────────────────────── */}
        <div className="h-9 bg-[#A41B15] text-white text-xs flex items-center">
          <div className="w-full md:w-[62.5%] md:mx-auto flex items-center justify-between px-4 md:px-0">
            <span className="font-poppins font-medium relative overflow-hidden h-4">
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={topbarTexts[topbarIndex] || "fallback"}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.25 }}
                  className="block"
                >
                  {topbarTexts[topbarIndex] || (
                    <>Free shipping over <strong>2999BDT</strong> shopping</>
                  )}
                </motion.span>
              </AnimatePresence>
            </span>
            <div className="flex items-center gap-3">
              <a href="#" aria-label="Facebook" className="hover:text-[#A41B15] transition-colors">
                <FaFacebook size={14} />
              </a>
              <a href="#" aria-label="WhatsApp" className="hover:text-[#A41B15] transition-colors">
                <FaWhatsapp size={14} />
              </a>
            </div>
          </div>
        </div>

        {/* ── Main Navbar ─────────────────────────────────────────── */}
        <header className="relative h-16 bg-white shadow-[0_4px_14px_rgba(0,0,0,0.08)]">
          {searchOpen ? (
            <NavSearchOverlay onClose={() => setSearchOpen(false)} />
          ) : (
            <>
              <div className="mx-auto flex h-full items-center justify-between px-4 md:w-[90%] md:max-w-[1400px]">

                {/* Left: hamburger — pinned to the edge */}
                <motion.button
                  whileHover={{ scale: 1.12 }} whileTap={{ scale: 0.92 }}
                  transition={{ duration: 0.15 }}
                  className="flex h-9 w-9 items-center justify-center rounded-xl text-text-dark transition-colors hover:bg-black/5"
                  aria-label="Open menu"
                  onClick={() => setSidebarOpen(true)}
                >
                  <FiMenu size={20} />
                </motion.button>

                {/* Right: account + search — pinned to the edge */}
                <div className="flex items-center gap-1">
                  <motion.button
                    whileHover={{ scale: 1.12 }} whileTap={{ scale: 0.92 }}
                    transition={{ duration: 0.15 }}
                    className="flex h-9 w-9 items-center justify-center rounded-xl text-text-dark transition-colors hover:bg-black/5"
                    aria-label="Search"
                    onClick={() => {
                      setSidebarOpen(false);
                      setSearchOpen(true);
                    }}
                  >
                    <FiSearch size={19} />
                  </motion.button>
                  <Link href={isLoggedIn ? "/profile" : "/auth/login"}>
                    <motion.div
                      whileHover={{ scale: 1.12 }} whileTap={{ scale: 0.92 }}
                      transition={{ duration: 0.15 }}
                      className="flex h-9 w-9 items-center justify-center rounded-xl text-text-dark transition-colors hover:bg-black/5"
                      aria-label="Account"
                    >
                      <FiUser size={19} />
                    </motion.div>
                  </Link>
                </div>
              </div>

              {/* Center: links hugging the logo, always centered regardless of edge icon widths */}
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="pointer-events-auto flex items-center gap-2 md:gap-4 lg:gap-6">
                  <nav className="hidden md:flex items-center gap-0.5">
                    {navLinks.slice(0, 2).map((link) => (
                      <Link
                        key={link.label}
                        href={link.href}
                        className="group relative px-3 py-2 font-poppins text-sm font-medium uppercase tracking-wide text-text-dark rounded-xl transition-colors duration-200 hover:bg-black/5"
                      >
                        {link.label}
                        <span className="absolute bottom-1.5 left-3 right-3 h-0.5 rounded-full bg-primary-pink/70 scale-x-0 origin-left transition-transform duration-300 group-hover:scale-x-100" />
                      </Link>
                    ))}
                  </nav>
                  <Logo logoUrl={logoUrl} />
                  <nav className="hidden md:flex items-center gap-0.5">
                    {navLinks.slice(2).map((link) => (
                      <Link
                        key={link.label}
                        href={link.href}
                        className="group relative px-3 py-2 font-poppins text-sm font-medium uppercase tracking-wide text-text-dark rounded-xl transition-colors duration-200 hover:bg-black/5"
                      >
                        {link.label}
                        <span className="absolute bottom-1.5 left-3 right-3 h-0.5 rounded-full bg-primary-pink/70 scale-x-0 origin-left transition-transform duration-300 group-hover:scale-x-100" />
                      </Link>
                    ))}
                  </nav>
                </div>
              </div>
            </>
          )}
        </header>
      </motion.div>

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
                  <a href="#" aria-label="Facebook" className="transition-colors hover:text-[#1877F2]">
                    <FaFacebook size={18} />
                  </a>
                  <a href="#" aria-label="WhatsApp" className="transition-colors hover:text-[#25D366]">
                    <FaWhatsapp size={18} />
                  </a>
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
                onClick={() => handleScrollTo(item.targetId ?? "")}
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
