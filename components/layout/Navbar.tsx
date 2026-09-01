"use client";

import { useState, useEffect, useRef } from "react";
import type { FormEvent } from "react";
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
  FiLayers,
  FiMenu,
  FiX,
  FiChevronRight,
  FiChevronDown,
  FiShoppingBag,
} from "react-icons/fi";
import { FaFacebook, FaWhatsapp } from "react-icons/fa";
import { useCart } from "@/components/cart/CartProvider";

const navLinks = [
  { label: "Boys",     href: "/products?gender=Boys"  },
  { label: "Girls",    href: "/products?gender=Girls" },
  { label: "By Age",   href: "/#shop-by-age"           },
  { label: "Products", href: "/products"               },
  { label: "Offers",   href: "/offers"                 },
  { label: "Blogs",    href: "/blogs"                  },
];

/* Shared logo circle used in both header and sidebar */
function LogoCircle({ logoUrl }: { logoUrl: string }) {
  return (
    <Link href={"/"}>
      <div className="w-17 h-17 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-white overflow-hidden">
        <Image
          src={logoUrl}
          alt="JoyToy"
          width={56}
          height={56}
          className="w-14 h-14 object-contain"
          priority
        />
      </div>
    </Link>
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
  const [searchOpen, setSearchOpen]     = useState(false);
  const [searchValue, setSearchValue]   = useState("");
  const searchInputRef                  = useRef<HTMLInputElement | null>(null);
  const [sidebarOpen, setSidebarOpen]   = useState(false);
  const [categories, setCategories]     = useState<Array<{ _id: string; name: string }>>([]);
  const [ageRanges, setAgeRanges]       = useState<Array<{ _id: string; label: string }>>([]);
  const [openSection, setOpenSection]   = useState<"byAge" | "categories" | null>(null);
  const [logoUrl, setLogoUrl]           = useState("/logo/main-logo.png");
  const [suggestions, setSuggestions]   = useState<Array<{ name: string; slug: string }>>([]);
  const suggestDebounce                 = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { itemCount, hydrated }         = useCart();
  const cartCount                       = hydrated ? itemCount : 0;

  const isAdminRoute = pathname?.startsWith("/admin");

  const mobileBottomNav = [
    { label: "Home",       type: "link",   href: "/",                    icon: FiHome        },
    { label: "By Age",     type: "scroll", targetId: "shop-by-age",      icon: FiLayers      },
    { label: "Cart",       type: "link",   href: "/cart",                icon: FiShoppingCart, isCenter: true },
    { label: "Products",   type: "link",   href: "/products",            icon: FiShoppingBag },
    { label: "Categories", type: "scroll", targetId: "favourite-categories", icon: FiGrid   },
  ];

  /* Hide on scroll-down, reveal on scroll-up */
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      if (searchOpen) setSearchOpen(false);
      if (y < 50) {
        setVisible(true);
      } else if (y > lastScrollY.current) {
        setVisible(false);
      } else {
        setVisible(true);
      }
      lastScrollY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [searchOpen]);

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
    if (searchOpen) {
      window.setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [searchOpen]);

  useEffect(() => {
    setSearchOpen(false);
    setSearchValue("");
    setSuggestions([]);
    setSidebarOpen(false);
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
        el.scrollIntoView({ behavior: "smooth", block: "start" });
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
    const loadAgeRanges = async () => {
      try {
        const res = await fetch("/api/admin/ages");
        if (!res.ok) return;
        const data = await res.json();
        if (alive) setAgeRanges(Array.isArray(data) ? data : []);
      } catch {
        if (alive) setAgeRanges([]);
      }
    };
    loadAgeRanges();
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
    window.addEventListener("joytoy-open-category-sidebar", openSidebar);
    return () => window.removeEventListener("joytoy-open-category-sidebar", openSidebar);
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
      const token = window.localStorage.getItem("joytoy_auth_token_v1");
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
        window.localStorage.removeItem("joytoy_auth_token_v1");
        window.dispatchEvent(new Event("joytoy-auth-changed"));
        if (alive) setIsLoggedIn(false);
      }
    };

    syncAuth();
    window.addEventListener("joytoy-auth-changed", syncAuth);
    return () => {
      alive = false;
      window.removeEventListener("joytoy-auth-changed", syncAuth);
    };
  }, []);

  if (isAdminRoute) return null;

  const handleSearchSubmit = (event: FormEvent) => {
    event.preventDefault();
    const term = searchValue.trim();
    if (!term) {
      setSearchOpen(false);
      return;
    }
    setSuggestions([]);
    router.push(`/products?q=${encodeURIComponent(term)}`);
    setSearchOpen(false);
    setSearchValue("");
  };

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    if (suggestDebounce.current) clearTimeout(suggestDebounce.current);
    if (value.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    suggestDebounce.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/products/search?q=${encodeURIComponent(value.trim())}`);
        if (res.ok) setSuggestions(await res.json());
      } catch {
        setSuggestions([]);
      }
    }, 300);
  };

  const handleScrollTo = (targetId: string) => {
    if (pathname !== "/") {
      router.push(`/#${targetId}`);
      return;
    }
    const el = document.getElementById(targetId);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const toggleSection = (key: "byAge" | "categories") => {
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
        <div className="h-9 bg-[#e0f7fa] text-black text-xs flex items-center">
          <div className="w-full md:w-[62.5%] md:mx-auto flex items-center justify-between px-4 md:px-0">
            <span className="font-inter font-medium relative overflow-hidden h-4">
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
              <a href="https://www.facebook.com/people/JoyToy/61586803048218/?mibextid=wwXIfr&rdid=TgrQrd2ZmYJd8ZO7&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1Gw29e9PZL%2F%3Fmibextid%3DwwXIfr" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="hover:text-[#1877F2] transition-colors">
                <FaFacebook size={14} />
              </a>
              <a href="https://wa.me/8801339562735" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="hover:text-[#25D366] transition-colors">
                <FaWhatsapp size={14} />
              </a>
            </div>
          </div>
        </div>

        {/* ── Main Navbar ─────────────────────────────────────────── */}
        <header className="relative h-16 bg-[#E80281]">

          {/* Logo circle — hangs below navbar into hero */}
          <div className="absolute left-4 md:left-[18.75vw] bottom-0 translate-y-1/2 z-20">
            <LogoCircle logoUrl={logoUrl} />
          </div>

          {/* ── Desktop layout ─────────────────────────────────── */}
          <div className="hidden md:flex h-full items-center mx-auto w-[62.5%]">
            <div className="w-18 shrink-0" />

            <nav className="flex flex-1 items-center justify-center gap-0.5">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="group relative px-4 py-2 font-inter text-sm font-medium text-white rounded-xl transition-colors duration-200 hover:bg-white/15"
                >
                  {link.label}
                  <span className="absolute bottom-1.5 left-4 right-4 h-0.5 rounded-full bg-white/70 scale-x-0 origin-left transition-transform duration-300 group-hover:scale-x-100" />
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-1 shrink-0">
              <motion.button
                whileHover={{ scale: 1.12 }} whileTap={{ scale: 0.92 }}
                transition={{ duration: 0.15 }}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-white transition-colors hover:bg-white/15"
                aria-label="Search"
                onClick={() => setSearchOpen((prev) => !prev)}
              >
                <FiSearch size={19} />
              </motion.button>
              <Link href="/cart">
                <motion.div
                  whileHover={{ scale: 1.12 }} whileTap={{ scale: 0.92 }}
                  transition={{ duration: 0.15 }}
                  className="relative flex h-9 w-9 items-center justify-center rounded-xl text-white transition-colors hover:bg-white/15"
                  aria-label="View cart"
                >
                  <FiShoppingCart size={19} />
                  <AnimatePresence>
                    {cartCount > 0 && (
                      <motion.span
                        key="cart-badge"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        transition={{ type: "spring", stiffness: 420, damping: 22 }}
                        className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-white text-[10px] font-bold text-primary-pink shadow"
                      >
                        {cartCount}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.div>
              </Link>
              <Link href={isLoggedIn ? "/profile" : "/auth/login"}>
                <motion.div
                  whileHover={{ scale: 1.12 }} whileTap={{ scale: 0.92 }}
                  transition={{ duration: 0.15 }}
                  className="flex h-9 w-9 items-center justify-center rounded-xl text-white transition-colors hover:bg-white/15"
                  aria-label="Account"
                >
                  <FiUser size={19} />
                </motion.div>
              </Link>
            </div>
          </div>

          {/* ── Mobile layout ──────────────────────────────────── */}
          <div className="flex md:hidden h-full items-center justify-between px-4">
            <div className="w-16 shrink-0" />
            <div className="flex items-center gap-1">
              <motion.button
                whileHover={{ scale: 1.12 }} whileTap={{ scale: 0.92 }}
                transition={{ duration: 0.15 }}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-white transition-colors hover:bg-white/15"
                aria-label="Search"
                onClick={() => setSearchOpen((prev) => !prev)}
              >
                <FiSearch size={19} />
              </motion.button>
              <Link href={isLoggedIn ? "/profile" : "/auth/login"}>
                <motion.div
                  whileHover={{ scale: 1.12 }} whileTap={{ scale: 0.92 }}
                  transition={{ duration: 0.15 }}
                  className="flex h-9 w-9 items-center justify-center rounded-xl text-white transition-colors hover:bg-white/15"
                  aria-label="Account"
                >
                  <FiUser size={19} />
                </motion.div>
              </Link>
              <motion.button
                whileHover={{ scale: 1.12 }} whileTap={{ scale: 0.92 }}
                transition={{ duration: 0.15 }}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-white transition-colors hover:bg-white/15"
                aria-label="Open menu"
                onClick={() => setSidebarOpen(true)}
              >
                <FiMenu size={20} />
              </motion.button>
            </div>
          </div>
        </header>

        <AnimatePresence>
          {searchOpen && (
            <motion.div
              key="search-bar"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
              className="overflow-hidden"
            >
              <div className="mx-auto w-full px-4 pt-8 md:pt-4 md:w-[50%] md:px-0 pb-2">
                <form
                  onSubmit={handleSearchSubmit}
                  className="flex w-full items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-2 shadow-sm"
                >
                  <FiSearch className="text-primary-pink" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchValue}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    placeholder="Search toys, categories, or brands..."
                    className="w-full bg-transparent text-sm font-inter text-text-dark outline-none placeholder:text-text-muted"
                    autoComplete="off"
                  />
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center rounded-xl bg-primary-pink p-2.5 text-white"
                    aria-label="Search"
                  >
                    <FiSearch size={16} />
                  </button>
                </form>
                {suggestions.length > 0 && (
                  <div className="mt-1 rounded-2xl border border-gray-100 bg-white shadow-md overflow-hidden">
                    {suggestions.map((s) => (
                      <button
                        key={s.slug}
                        type="button"
                        className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-inter text-text-dark hover:bg-gray-50 transition-colors"
                        onClick={() => {
                          setSuggestions([]);
                          router.push(`/products?q=${encodeURIComponent(s.name)}`);
                          setSearchOpen(false);
                          setSearchValue("");
                        }}
                      >
                        <FiSearch size={13} className="text-text-muted shrink-0" />
                        {s.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
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
                      alt="JoyToy"
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
                  className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-text-dark transition-colors hover:bg-gray-50 hover:text-primary-pink"
                >
                  <FiHome size={17} className="shrink-0 text-primary-pink" />
                  Home
                </Link>

                {/* By Age — accordion */}
                <div>
                  <button
                    onClick={() => toggleSection("byAge")}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-text-dark transition-colors hover:bg-gray-50 hover:text-primary-pink"
                  >
                    <FiLayers size={17} className="shrink-0 text-primary-pink" />
                    <span className="flex-1 text-left">By Age</span>
                    <motion.span
                      animate={{ rotate: openSection === "byAge" ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <FiChevronDown size={16} className="text-text-muted" />
                    </motion.span>
                  </button>
                  <AnimatePresence initial={false}>
                    {openSection === "byAge" && (
                      <motion.div
                        key="byAge-panel"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="ml-8 mb-1 flex flex-col">
                          {ageRanges.map((age) => (
                            <Link
                              key={age._id}
                              href={`/products?ageRange=${age._id}`}
                              onClick={closeSidebar}
                              className="flex items-center justify-between border-b border-gray-50 py-2.5 pr-3 text-sm text-text-muted transition-colors hover:text-primary-pink"
                            >
                              {age.label}
                              <FiChevronRight size={14} className="shrink-0" />
                            </Link>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Categories — accordion */}
                <div>
                  <button
                    onClick={() => toggleSection("categories")}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-text-dark transition-colors hover:bg-gray-50 hover:text-primary-pink"
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
                            <Link
                              key={category._id}
                              href={`/products?category=${category._id}`}
                              onClick={closeSidebar}
                              className="flex items-center justify-between border-b border-gray-50 py-2.5 pr-3 text-sm text-text-muted transition-colors hover:text-primary-pink"
                            >
                              {category.name}
                              <FiChevronRight size={14} className="shrink-0" />
                            </Link>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Products */}
                <Link
                  href="/products"
                  onClick={closeSidebar}
                  className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-text-dark transition-colors hover:bg-gray-50 hover:text-primary-pink"
                >
                  <FiShoppingBag size={17} className="shrink-0 text-primary-pink" />
                  Products
                </Link>

                {/* Cart */}
                <Link
                  href="/cart"
                  onClick={closeSidebar}
                  className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-text-dark transition-colors hover:bg-gray-50 hover:text-primary-pink"
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
                  <a href="https://www.facebook.com/people/JoyToy/61586803048218/?mibextid=wwXIfr&rdid=TgrQrd2ZmYJd8ZO7&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1Gw29e9PZL%2F%3Fmibextid%3DwwXIfr" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="transition-colors hover:text-[#1877F2]">
                    <FaFacebook size={18} />
                  </a>
                  <a href="https://wa.me/8801339562735" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="transition-colors hover:text-[#25D366]">
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
                    <span className="text-[#6a7280]">{item.label}</span>
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
                  <span>{item.label}</span>
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
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
