"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiArrowRight,
  FiCheckCircle,
  FiChevronRight,
  FiEdit2,
  FiLock,
  FiLogOut,
  FiMapPin,
  FiPackage,
  FiPlus,
  FiShoppingBag,
  FiSlash,
  FiTrash2,
  FiUser,
} from "react-icons/fi";
import { cn } from "@/lib/utils";
import Breadcrumbs from "@/components/content/Breadcrumbs";
import PasswordInput from "@/components/content/PasswordInput";
import ProductPhoto from "@/components/ui/ProductPhoto";
import ScrollRow from "@/components/ui/ScrollRow";

type Tab = "orders" | "profile" | "addresses" | "settings";
type OrderStatus = "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled";
type DeliveryArea = "inside_dhaka" | "outside_dhaka";
type AddressLabel = "home" | "office" | "other";

interface Order {
  _id: string;
  orderNumber: string;
  createdAt: string;
  status: OrderStatus;
  items: { name: string; image: string; qty: number; variantLabel?: string }[];
  total: number;
}

interface AddressEntry {
  _id?: string;
  label: AddressLabel;
  fullAddress: string;
  area: DeliveryArea;
  isDefault: boolean;
}

type RawAddress = {
  _id?: unknown;
  fullAddress?: unknown;
  address?: unknown;
  label?: unknown;
  area?: unknown;
  isDefault?: unknown;
} | null;

const AUTH_TOKEN_KEY = "dealhobe_auth_token_v1";

const STATUS_STYLES: Record<OrderStatus, { label: string; cls: string }> = {
  Pending: { label: "Order placed", cls: "bg-[#FBF0D9] text-[#8A5A00]" },
  Processing: { label: "Processing", cls: "bg-plum/[0.07] text-plum" },
  Shipped: { label: "On the way", cls: "bg-[#E7F0FA] text-[#1F5F99]" },
  Delivered: { label: "Delivered", cls: "bg-[#E5F4EA] text-[#1F7A45]" },
  Cancelled: { label: "Cancelled", cls: "bg-primary-pink/10 text-primary-pink" },
};

const money = (n: number) => `৳${Math.round(Number(n) || 0).toLocaleString("en-IN")}`;

const TABS: { id: Tab; label: string; icon: typeof FiPackage }[] = [
  { id: "orders", label: "Orders", icon: FiPackage },
  { id: "profile", label: "Account details", icon: FiUser },
  { id: "addresses", label: "Addresses", icon: FiMapPin },
  { id: "settings", label: "Password", icon: FiLock },
];

const SHOP_LINKS = [
  { label: "Makeup", href: "/products?category=Makeup" },
  { label: "Skin Care", href: "/products?category=Skin%20Care" },
  { label: "Hair Care", href: "/products?category=Hair%20Care" },
  { label: "Offers", href: "/offers" },
];

const normalizeAddresses = (
  addresses: unknown,
  fallback?: { area?: DeliveryArea; address?: string },
): AddressEntry[] => {
  const raw: RawAddress[] = Array.isArray(addresses) ? addresses : [];
  const mapped = raw
    .map((item) => {
      const fullAddress = String(item?.fullAddress || item?.address || "").trim();
      if (!fullAddress) return null;
      const label: AddressLabel =
        item?.label === "office" || item?.label === "other" ? (item.label as AddressLabel) : "home";

      return {
        _id: item?._id ? String(item._id) : undefined,
        label,
        fullAddress,
        area: item?.area === "outside_dhaka" ? "outside_dhaka" : "inside_dhaka",
        isDefault: Boolean(item?.isDefault),
      } as AddressEntry;
    })
    .filter(Boolean) as AddressEntry[];

  if (!mapped.length && fallback?.address) {
    mapped.push({
      label: "home",
      fullAddress: String(fallback.address),
      area: fallback.area === "outside_dhaka" ? "outside_dhaka" : "inside_dhaka",
      isDefault: true,
    });
  }

  if (mapped.length && !mapped.some((item) => item.isDefault)) {
    mapped[0].isDefault = true;
  }

  return mapped;
};

function StatusPill({ status }: { status: OrderStatus }) {
  const s = STATUS_STYLES[status] ?? { label: String(status), cls: "bg-plum/[0.06] text-text-dark" };
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold", s.cls)}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />
      {s.label}
    </span>
  );
}

const inputClass =
  "w-full rounded-xl border border-[#E8DCE1] bg-white px-4 py-3 text-base text-text-dark outline-none transition-[border-color,box-shadow] placeholder:text-[#B3A5AE] focus:border-primary-pink focus:shadow-[0_0_0_4px_rgba(164,27,21,0.08)]";

function Panel({ title, subtitle, action, children }: { title: string; subtitle?: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="md:rounded-2xl md:border md:border-[#F1E7EB] md:bg-white md:p-7 md:shadow-tile">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-semibold text-text-dark md:text-2xl">{title}</h2>
          {subtitle && <p className="mt-1 text-sm text-text-muted">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function SkeletonBlock({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-xl bg-[#F3EAEE]", className)} />;
}

function OrderCard({ order }: { order: Order }) {
  const items = Array.isArray(order.items) ? order.items : [];
  const shown = items.slice(0, 4);
  const extra = items.length - shown.length;
  const date = new Date(order.createdAt);
  const dateLabel = Number.isNaN(date.getTime())
    ? ""
    : date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  const count = items.reduce((n, i) => n + (Number(i.qty) || 1), 0);

  return (
    <article className="group rounded-2xl border border-[#F1E7EB] bg-white p-4 transition-[border-color,box-shadow] hover:border-[#E6D3DA] hover:shadow-tile md:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-text-muted">Order</p>
          <p className="truncate text-[15px] font-extrabold text-text-dark">#{order.orderNumber}</p>
        </div>
        <StatusPill status={order.status} />
      </div>

      <div className="mt-4 flex items-center gap-3">
        <div className="flex shrink-0 -space-x-2">
          {shown.map((item, i) => (
            <div
              key={`${order._id}-${i}`}
              className="relative h-12 w-12 overflow-hidden rounded-xl border-2 border-white bg-white shadow-[0_1px_4px_rgba(59,13,46,0.12)] md:h-14 md:w-14"
            >
              {item.image ? (
                <ProductPhoto src={item.image} alt={item.name} requestWidth={120} className="p-1" />
              ) : (
                <span className="flex h-full w-full items-center justify-center bg-ivory text-gold-dark">
                  <FiShoppingBag size={16} aria-hidden />
                </span>
              )}
            </div>
          ))}
          {extra > 0 && (
            <span className="relative flex h-12 w-12 items-center justify-center rounded-xl border-2 border-white bg-plum text-xs font-bold text-white md:h-14 md:w-14">
              +{extra}
            </span>
          )}
        </div>
        <p className="line-clamp-2 min-w-0 text-xs leading-relaxed text-text-muted md:text-sm">
          {items.map((i) => (i.variantLabel ? `${i.name} (${i.variantLabel})` : i.name)).join(", ")}
        </p>
      </div>

      <div className="mt-4 flex items-end justify-between gap-3 border-t border-dashed border-[#EFE3E8] pt-3.5">
        <div className="text-xs text-text-muted">
          {dateLabel && <span>{dateLabel} · </span>}
          {count} {count === 1 ? "item" : "items"}
          <span className="mt-0.5 block text-base font-extrabold text-text-dark">{money(order.total)}</span>
        </div>
        <Link
          href={`/orders/${order.orderNumber}`}
          className="inline-flex items-center gap-1.5 rounded-full border border-[#E6D3DA] px-4 py-2 text-sm font-bold text-text-dark transition-colors hover:border-primary-pink hover:bg-primary-pink hover:text-white"
          aria-label={`View order ${order.orderNumber}`}
        >
          View <FiChevronRight aria-hidden />
        </Link>
      </div>
    </article>
  );
}

function greetingFor(date: Date) {
  const h = date.getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default function ProfilePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("orders");
  const sectionContainerRef = useRef<HTMLDivElement | null>(null);
  // Rendered only after the client has loaded the profile, so the local time is safe to use.
  const [greeting] = useState(() => greetingFor(new Date()));

  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState("");

  const [authToken, setAuthToken] = useState("");
  const [profileLoading, setProfileLoading] = useState(true);
  const [isBanned, setIsBanned] = useState(false);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [memberSince, setMemberSince] = useState("");

  const [addresses, setAddresses] = useState<AddressEntry[]>([]);

  const [addrLabel, setAddrLabel] = useState<AddressLabel>("home");
  const [addrArea, setAddrArea] = useState<DeliveryArea>("inside_dhaka");
  const [addrText, setAddrText] = useState("");
  const [addrDefault, setAddrDefault] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addressSaving, setAddressSaving] = useState(false);
  const [addressError, setAddressError] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  useEffect(() => {
    let alive = true;
    const token = typeof window !== "undefined" ? window.localStorage.getItem(AUTH_TOKEN_KEY) : "";
    if (!token) {
      router.replace("/auth/login");
      return;
    }

    const loadProfile = async () => {
      try {
        const res = await fetch("/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Unauthorized");
        const data = await res.json();
        if (!alive) return;

        setAuthToken(token);
        if (data?.user?.isBanned) {
          setIsBanned(true);
          return;
        }
        setName(data?.user?.fullName || "");
        setUserEmail(data?.user?.email || "");
        setPhone(data?.user?.phone || "");
        setMemberSince(data?.user?.createdAt || "");
        setAddresses(
          normalizeAddresses(data?.user?.addresses, {
            area: data?.user?.area,
            address: data?.user?.address,
          }),
        );
      } catch {
        if (!alive) return;
        if (typeof window !== "undefined") {
          window.localStorage.removeItem(AUTH_TOKEN_KEY);
          window.dispatchEvent(new Event("dealhobe-auth-changed"));
        }
        router.replace("/auth/login");
      } finally {
        if (alive) setProfileLoading(false);
      }
    };

    loadProfile();
    return () => {
      alive = false;
    };
  }, [router]);

  useEffect(() => {
    if (!authToken) return;

    const loadOrders = async () => {
      setOrdersLoading(true);
      setOrdersError("");
      try {
        const res = await fetch("/api/orders?mine=1", {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load orders.");
        setOrders(data);
      } catch (err) {
        setOrdersError((err instanceof Error && err.message) || "Failed to load orders.");
      } finally {
        setOrdersLoading(false);
      }
    };

    loadOrders();
  }, [authToken]);

  const initials = useMemo(() => {
    if (!name) return "--";
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }, [name]);

  const memberSinceLabel = useMemo(() => {
    if (!memberSince) return "-";
    const date = new Date(memberSince);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  }, [memberSince]);

  const handleSaveAddress = async () => {
    setAddressError("");
    if (!authToken) {
      setAddressError("Please sign in again to update addresses.");
      return;
    }

    if (!addrText.trim()) {
      setAddressError("Please enter full address.");
      return;
    }

    setAddressSaving(true);
    try {
      const res = await fetch("/api/auth/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          action: editingAddressId ? "update_address" : "add_address",
          ...(editingAddressId ? { addressId: editingAddressId } : {}),
          label: addrLabel,
          fullAddress: addrText.trim(),
          area: addrArea,
          isDefault: addrDefault,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save address.");

      setAddresses(
        normalizeAddresses(data?.user?.addresses, {
          area: data?.user?.area,
          address: data?.user?.address,
        }),
      );
      setAddrText("");
      setAddrLabel("home");
      setAddrArea("inside_dhaka");
      setAddrDefault(false);
      setEditingAddressId(null);
      setShowAddressForm(false);
    } catch (err) {
      setAddressError((err instanceof Error && err.message) || "Failed to save address.");
    } finally {
      setAddressSaving(false);
    }
  };

  const handleEditAddress = (address: AddressEntry) => {
    if (!address._id) {
      setAddressError("This address cannot be edited yet. Please add a new one.");
      return;
    }

    setAddressError("");
    setEditingAddressId(address._id);
    setAddrLabel(address.label);
    setAddrArea(address.area);
    setAddrText(address.fullAddress);
    setAddrDefault(Boolean(address.isDefault));
    setShowAddressForm(true);
  };

  const handleSetDefaultAddress = async (addressId?: string) => {
    if (!authToken) return;
    if (!addressId) {
      setAddressError("This address cannot be set as default. Please add it again.");
      return;
    }
    setAddressError("");

    try {
      const res = await fetch("/api/auth/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ action: "set_default_address", addressId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to set default address.");

      setAddresses(
        normalizeAddresses(data?.user?.addresses, {
          area: data?.user?.area,
          address: data?.user?.address,
        }),
      );
    } catch (err) {
      setAddressError((err instanceof Error && err.message) || "Failed to set default address.");
    }
  };

  const handleDeleteAddress = async (addressId?: string) => {
    if (!authToken) return;
    if (!addressId) {
      setAddressError("This address cannot be deleted. Please add it again.");
      return;
    }
    setAddressError("");

    try {
      const res = await fetch("/api/auth/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ action: "delete_address", addressId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete address.");

      setAddresses(
        normalizeAddresses(data?.user?.addresses, {
          area: data?.user?.area,
          address: data?.user?.address,
        }),
      );
      if (editingAddressId === addressId) {
        setEditingAddressId(null);
        setShowAddressForm(false);
        setAddrText("");
      }
    } catch (err) {
      setAddressError((err instanceof Error && err.message) || "Failed to delete address.");
    }
  };

  const handleChangePassword = async () => {
    setPasswordError("");
    setPasswordSuccess("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("Please fill in all password fields.");
      return;
    }

    setPasswordSaving(true);
    try {
      const res = await fetch("/api/auth/password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update password.");

      setPasswordSuccess("Password updated successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPasswordError((err instanceof Error && err.message) || "Failed to update password.");
    } finally {
      setPasswordSaving(false);
    }
  };

  const panelAnim = {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.35, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] },
  };

  const handleTabSelect = (tab: Tab) => {
    setActiveTab(tab);
    if (typeof window === "undefined") return;
    if (window.innerWidth >= 1024) return;

    window.setTimeout(() => {
      sectionContainerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 60);
  };

  if (profileLoading) {
    return (
      <div className="bg-soft-bg pb-24 pt-4 md:pt-6" aria-busy="true" aria-label="Loading your account">
        <div className="shell">
          <SkeletonBlock className="h-4 w-40" />
          <SkeletonBlock className="mt-5 h-36 w-full rounded-2xl md:h-32" />
          <div className="mt-6 grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
            <SkeletonBlock className="hidden h-64 rounded-2xl lg:block" />
            <div className="flex flex-col gap-4">
              <SkeletonBlock className="h-40 rounded-2xl" />
              <SkeletonBlock className="h-40 rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isBanned) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-soft-bg px-4 pb-24 pt-6">
        <div className="w-full max-w-md rounded-[28px] border border-[#F1E7EB] bg-white p-8 text-center shadow-card md:p-10">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary-pink/[0.07]">
            <FiSlash size={26} className="text-primary-pink" aria-hidden />
          </div>
          <h1 className="font-display text-2xl font-semibold text-text-dark">Account suspended</h1>
          <p className="mt-3 text-sm leading-relaxed text-text-muted">
            Your account has been suspended by the admin. Please contact us at 01338886611 or dealhobe26@gmail.com for more details.
          </p>
          <Link
            href="/"
            className="mt-7 inline-flex items-center gap-2 rounded-full bg-primary-pink px-6 py-3 text-sm font-bold text-white shadow-button"
          >
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  const signOut = () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(AUTH_TOKEN_KEY);
      window.localStorage.removeItem("dealhobe_checkout_info_v1");
      window.dispatchEvent(new Event("dealhobe-auth-changed"));
    }
    router.push("/auth/login");
  };

  const firstName = name.trim().split(/\s+/)[0] || "there";
  const defaultAddress = addresses.find((a) => a.isDefault) || addresses[0];
  const activeOrders = orders.filter((o) => o.status === "Pending" || o.status === "Processing" || o.status === "Shipped").length;

  return (
    <div className="bg-soft-bg pb-24 pt-4 md:pt-6">
      <div className="shell">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "My account" }]} />

        {/* Greeting */}
        <header className="relative mt-4 overflow-hidden rounded-[24px] bg-plum px-5 py-6 text-white md:mt-5 md:px-8 md:py-8">
          <div aria-hidden className="pointer-events-none absolute -right-20 -top-28 h-72 w-72 rounded-full bg-primary-pink/45 blur-3xl" />
          <div aria-hidden className="pointer-events-none absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-gold/20 blur-3xl" />
          <div className="relative flex flex-wrap items-center justify-between gap-5">
            <div className="flex min-w-0 items-center gap-4">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-gold/50 bg-white/10 font-display text-xl font-semibold text-[#F2D9A6] md:h-16 md:w-16 md:text-2xl">
                {initials}
              </span>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white/65">{greeting},</p>
                <h1 className="truncate font-display text-[1.65rem] font-semibold leading-tight md:text-[2.1rem]">{firstName}</h1>
                <p className="mt-0.5 truncate text-xs text-white/65 md:text-sm">{userEmail || phone || "DealHobe member"}</p>
              </div>
            </div>
            <dl className="flex w-full gap-2 sm:w-auto md:gap-3">
              {[
                { k: "Orders", v: String(orders.length) },
                { k: "Active", v: String(activeOrders) },
                { k: "Joined", v: memberSinceLabel },
              ].map((s) => (
                <div key={s.k} className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-white/[0.07] px-3 py-2.5 sm:min-w-[118px] md:px-4">
                  <dt className="truncate text-[10px] font-bold uppercase tracking-[0.12em] text-white/55">{s.k}</dt>
                  <dd className="mt-0.5 whitespace-nowrap text-[15px] font-extrabold md:text-lg">{s.v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </header>

        {/* Tabs (phones/tablets) */}
        <div className="sticky top-36 z-20 -mx-4 mt-4 border-b border-[#F1E7EB] bg-soft-bg/95 px-4 py-2 backdrop-blur lg:hidden">
          <ScrollRow label="account sections" arrowSize="sm" trackClassName="no-scrollbar flex gap-2 overflow-x-auto" role="tablist" trackLabel="Account sections">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                role="tab"
                type="button"
                aria-selected={activeTab === id}
                onClick={() => handleTabSelect(id)}
                className={cn(
                  "inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold transition-colors",
                  activeTab === id ? "bg-plum text-white" : "border border-[#EBDDE3] bg-white text-text-dark",
                )}
              >
                <Icon size={14} aria-hidden /> {label}
              </button>
            ))}
          </ScrollRow>
        </div>

        <div className="mt-4 grid gap-6 md:mt-6 lg:grid-cols-[260px_minmax(0,1fr)] lg:items-start">
          {/* Sidebar (desktop) */}
          <aside className="sticky top-40 hidden rounded-2xl border border-[#F1E7EB] bg-white p-3 shadow-tile lg:block">
            <nav aria-label="Account sections" className="flex flex-col gap-0.5">
              {TABS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  aria-current={activeTab === id ? "page" : undefined}
                  onClick={() => handleTabSelect(id)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3.5 py-3 text-left text-sm font-semibold transition-colors",
                    activeTab === id ? "bg-primary-pink/[0.07] text-primary-pink" : "text-text-dark hover:bg-plum/[0.04]",
                  )}
                >
                  <Icon size={16} aria-hidden />
                  <span className="flex-1">{label}</span>
                  {id === "orders" && orders.length > 0 && (
                    <span className="rounded-full bg-plum/[0.07] px-2 py-0.5 text-[11px] font-bold text-plum">{orders.length}</span>
                  )}
                </button>
              ))}
              <div className="my-2 border-t border-[#F1E7EB]" />
              <button
                type="button"
                onClick={signOut}
                className="flex items-center gap-3 rounded-xl px-3.5 py-3 text-left text-sm font-semibold text-text-muted transition-colors hover:bg-primary-pink/[0.05] hover:text-primary-pink"
              >
                <FiLogOut size={16} aria-hidden /> Sign out
              </button>
            </nav>
            <Link
              href="/products"
              className="mt-3 flex items-center justify-between gap-2 rounded-xl bg-ivory px-4 py-3.5 text-sm font-bold text-text-dark transition-colors hover:text-primary-pink"
            >
              <span>
                <span className="block text-[10px] font-bold uppercase tracking-[0.14em] text-gold-dark">New in</span>
                Continue shopping
              </span>
              <FiArrowRight aria-hidden />
            </Link>
          </aside>

          <div ref={sectionContainerRef} className="min-w-0 scroll-mt-52">
            <AnimatePresence mode="wait">
              {activeTab === "orders" && (
                <motion.div key="orders" {...panelAnim}>
                  <Panel
                    title="Order history"
                    subtitle={orders.length ? "Track deliveries and revisit what you loved." : undefined}
                    action={
                      orders.length > 0 ? (
                        <Link href="/products" className="inline-flex items-center gap-1.5 text-sm font-bold text-primary-pink hover:underline">
                          Shop again <FiArrowRight aria-hidden />
                        </Link>
                      ) : undefined
                    }
                  >
                    {ordersLoading ? (
                      <div className="grid gap-3 md:grid-cols-2">
                        <SkeletonBlock className="h-44 rounded-2xl" />
                        <SkeletonBlock className="h-44 rounded-2xl" />
                      </div>
                    ) : ordersError ? (
                      <div role="alert" className="rounded-xl border border-primary-pink/20 bg-primary-pink/[0.05] px-4 py-3 text-sm font-medium text-primary-pink">
                        {ordersError}
                      </div>
                    ) : orders.length === 0 ? (
                      <div className="rounded-2xl bg-ivory px-5 py-10 text-center md:py-14">
                        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white text-primary-pink shadow-tile">
                          <FiShoppingBag size={24} aria-hidden />
                        </span>
                        <p className="mt-5 font-display text-xl font-semibold text-text-dark md:text-2xl">No orders yet</p>
                        <p className="mx-auto mt-2 max-w-sm text-sm text-text-muted">
                          Your first favourite is a few taps away — 100% authentic, with cash on delivery.
                        </p>
                        <Link
                          href="/products"
                          className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary-pink px-6 py-3 text-sm font-bold text-white shadow-button transition-colors hover:bg-[#8E1712]"
                        >
                          Start shopping <FiArrowRight aria-hidden />
                        </Link>
                        <div className="mt-5 flex flex-wrap justify-center gap-2">
                          {SHOP_LINKS.map((l) => (
                            <Link key={l.href} href={l.href} className="rounded-full border border-[#EBDDE3] bg-white px-3.5 py-1.5 text-xs font-bold text-text-dark hover:border-primary-pink hover:text-primary-pink">
                              {l.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="grid gap-3 md:grid-cols-2">
                        {orders.map((order) => (
                          <OrderCard key={order._id} order={order} />
                        ))}
                      </div>
                    )}
                  </Panel>
                </motion.div>
              )}

              {activeTab === "profile" && (
                <motion.div key="profile" {...panelAnim}>
                  <Panel title="Account details" subtitle="Need to change these? Contact us and we’ll update them for you.">
                    <dl className="grid gap-3 sm:grid-cols-2">
                      {[
                        { k: "Full name", v: name },
                        { k: "Mobile number", v: phone },
                        { k: "Email address", v: userEmail },
                        { k: "Member since", v: memberSinceLabel },
                      ].map((f) => (
                        <div key={f.k} className="rounded-xl border border-[#F1E7EB] bg-soft-bg px-4 py-3">
                          <dt className="text-[11px] font-bold uppercase tracking-[0.12em] text-text-muted">{f.k}</dt>
                          <dd className="mt-1 truncate text-[15px] font-semibold text-text-dark">{f.v || "—"}</dd>
                        </div>
                      ))}
                    </dl>
                    {defaultAddress && (
                      <div className="mt-3 flex items-start gap-3 rounded-xl border border-[#F1E7EB] bg-soft-bg px-4 py-3">
                        <FiMapPin className="mt-1 shrink-0 text-primary-pink" aria-hidden />
                        <div className="min-w-0 flex-1">
                          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-text-muted">Default delivery address</p>
                          <p className="mt-1 text-sm text-text-dark">{defaultAddress.fullAddress}</p>
                        </div>
                        <button type="button" onClick={() => handleTabSelect("addresses")} className="shrink-0 text-sm font-bold text-primary-pink hover:underline">
                          Manage
                        </button>
                      </div>
                    )}
                  </Panel>
                </motion.div>
              )}

              {activeTab === "addresses" && (
                <motion.div key="addresses" {...panelAnim}>
                  <Panel
                    title="Saved addresses"
                    subtitle={`${addresses.length} saved · your default is pre-filled at checkout`}
                    action={
                      <button
                        type="button"
                        onClick={() => {
                          const nextShow = !showAddressForm;
                          setShowAddressForm(nextShow);
                          if (nextShow) {
                            setEditingAddressId(null);
                            setAddrLabel("home");
                            setAddrArea("inside_dhaka");
                            setAddrText("");
                            setAddrDefault(false);
                          }
                          setAddressError("");
                        }}
                        className="inline-flex items-center gap-1.5 rounded-full bg-plum px-4 py-2 text-sm font-bold text-white transition-opacity hover:opacity-90"
                      >
                        <FiPlus size={14} aria-hidden /> Add address
                      </button>
                    }
                  >
                    {addresses.length === 0 ? (
                      <p className="rounded-xl bg-ivory px-4 py-6 text-center text-sm text-text-muted">No addresses saved yet.</p>
                    ) : (
                      <div className="grid gap-3 md:grid-cols-2">
                        {addresses.map((addr) => (
                          <div
                            key={addr._id || `${addr.fullAddress}-${addr.label}`}
                            className={cn(
                              "flex flex-col rounded-2xl border p-4",
                              addr.isDefault ? "border-primary-pink/30 bg-primary-pink/[0.03]" : "border-[#F1E7EB] bg-white",
                            )}
                          >
                            <div className="flex flex-wrap items-center gap-2">
                              <FiMapPin className="text-primary-pink" size={15} aria-hidden />
                              <span className="text-sm font-bold text-text-dark">{addr.label[0].toUpperCase() + addr.label.slice(1)}</span>
                              <span className="text-xs text-text-muted">· {addr.area === "inside_dhaka" ? "Inside Dhaka" : "Outside Dhaka"}</span>
                              {addr.isDefault && (
                                <span className="ml-auto rounded-full bg-primary-pink px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">Default</span>
                              )}
                            </div>
                            <p className="mt-2 flex-1 text-sm leading-relaxed text-text-dark">{addr.fullAddress}</p>
                            <div className="mt-3 flex flex-wrap items-center gap-1 border-t border-[#F1E7EB] pt-2.5 text-xs font-bold">
                              <button type="button" onClick={() => handleEditAddress(addr)} className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-text-dark hover:bg-plum/[0.05]">
                                <FiEdit2 size={13} aria-hidden /> Edit
                              </button>
                              {!addr.isDefault && (
                                <button type="button" onClick={() => handleSetDefaultAddress(addr._id)} className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-text-dark hover:bg-plum/[0.05]">
                                  <FiCheckCircle size={13} aria-hidden /> Make default
                                </button>
                              )}
                              <button type="button" onClick={() => handleDeleteAddress(addr._id)} className="ml-auto inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-primary-pink hover:bg-primary-pink/[0.06]" aria-label="Delete address">
                                <FiTrash2 size={13} aria-hidden /> Delete
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {addressError && !showAddressForm && <p role="alert" className="mt-3 text-sm font-medium text-primary-pink">{addressError}</p>}

                    {showAddressForm && (
                      <div className="mt-5 rounded-2xl border border-dashed border-[#E2CDD5] bg-ivory/60 p-4 md:p-5">
                        <h3 className="mb-4 text-base font-bold text-text-dark">{editingAddressId ? "Edit address" : "Add a new address"}</h3>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <div className="flex flex-col gap-1.5">
                            <label htmlFor="addrLabel" className="text-sm font-semibold text-text-dark">Label</label>
                            <select id="addrLabel" value={addrLabel} onChange={(e) => setAddrLabel(e.target.value as AddressLabel)} className={inputClass}>
                              <option value="home">Home</option>
                              <option value="office">Office</option>
                              <option value="other">Other</option>
                            </select>
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <label htmlFor="addrArea" className="text-sm font-semibold text-text-dark">Delivery area</label>
                            <select id="addrArea" value={addrArea} onChange={(e) => setAddrArea(e.target.value as DeliveryArea)} className={inputClass}>
                              <option value="inside_dhaka">Inside Dhaka</option>
                              <option value="outside_dhaka">Outside Dhaka</option>
                            </select>
                          </div>
                        </div>

                        <div className="mt-4 flex flex-col gap-1.5">
                          <label htmlFor="addrText" className="text-sm font-semibold text-text-dark">Full address</label>
                          <textarea
                            id="addrText"
                            rows={3}
                            value={addrText}
                            onChange={(e) => setAddrText(e.target.value)}
                            placeholder="House no., Road, Area, District"
                            className={cn(inputClass, "resize-none")}
                          />
                        </div>

                        <label className="mt-4 flex items-center gap-2.5 text-sm text-text-dark">
                          <input type="checkbox" checked={addrDefault} onChange={(e) => setAddrDefault(e.target.checked)} className="h-4 w-4 accent-[#A41B15]" />
                          Set as default delivery address
                        </label>

                        {addressError && <p role="alert" className="mt-3 text-sm font-medium text-primary-pink">{addressError}</p>}

                        <div className="mt-5 flex flex-wrap gap-3">
                          <button
                            type="button"
                            onClick={handleSaveAddress}
                            disabled={addressSaving}
                            className="inline-flex items-center gap-2 rounded-full bg-primary-pink px-5 py-2.5 text-sm font-bold text-white shadow-button transition-[background-color,opacity] hover:bg-[#8E1712] disabled:opacity-60"
                          >
                            {addressSaving ? "Saving…" : editingAddressId ? "Save changes" : "Save address"}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingAddressId(null);
                              setShowAddressForm(false);
                              setAddrLabel("home");
                              setAddrArea("inside_dhaka");
                              setAddrText("");
                              setAddrDefault(false);
                              setAddressError("");
                            }}
                            className="inline-flex items-center rounded-full border border-[#E6D3DA] bg-white px-5 py-2.5 text-sm font-bold text-text-dark hover:border-primary-pink hover:text-primary-pink"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </Panel>
                </motion.div>
              )}

              {activeTab === "settings" && (
                <motion.div key="settings" {...panelAnim}>
                  <Panel title="Change password" subtitle="Use at least 6 characters. You’ll stay signed in on this device.">
                    <div className="flex max-w-md flex-col gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label htmlFor="currentPassword" className="text-sm font-semibold text-text-dark">Current password</label>
                        <PasswordInput id="currentPassword" value={currentPassword} onChange={setCurrentPassword} placeholder="Enter current password" autoComplete="current-password" />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label htmlFor="newPassword" className="text-sm font-semibold text-text-dark">New password</label>
                        <PasswordInput id="newPassword" value={newPassword} onChange={setNewPassword} placeholder="Enter new password" autoComplete="new-password" />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label htmlFor="confirmPassword" className="text-sm font-semibold text-text-dark">Confirm new password</label>
                        <PasswordInput id="confirmPassword" value={confirmPassword} onChange={setConfirmPassword} placeholder="Confirm new password" autoComplete="new-password" />
                      </div>

                      {passwordError && <p role="alert" className="rounded-xl border border-primary-pink/20 bg-primary-pink/[0.05] px-4 py-3 text-sm font-medium text-primary-pink">{passwordError}</p>}
                      {passwordSuccess && <p role="status" className="rounded-xl border border-[#1F7A45]/20 bg-[#E5F4EA] px-4 py-3 text-sm font-medium text-[#1F7A45]">{passwordSuccess}</p>}

                      <button
                        type="button"
                        onClick={handleChangePassword}
                        disabled={passwordSaving}
                        className="mt-1 h-12 rounded-full bg-primary-pink text-sm font-bold text-white shadow-button transition-[background-color,opacity] hover:bg-[#8E1712] disabled:opacity-60"
                      >
                        {passwordSaving ? "Updating…" : "Update password"}
                      </button>
                    </div>
                  </Panel>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="button"
              onClick={signOut}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-full border border-[#E6D3DA] bg-white py-3 text-sm font-bold text-text-muted lg:hidden"
            >
              <FiLogOut size={15} aria-hidden /> Sign out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
