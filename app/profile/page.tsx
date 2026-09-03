"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiChevronRight,
  FiCheckCircle,
  FiEdit2,
  FiPackage,
  FiUser,
  FiMapPin,
  FiLogOut,
  FiSettings,
  FiPlus,
  FiTrash2,
  FiCalendar,
  FiSlash,
} from "react-icons/fi";
import { cn } from "@/lib/utils";
import { fadeUp, staggerContainer, scaleIn } from "@/components/animations/variants";
import { ColorfulTitle } from "@/components/ui";

type Tab = "orders" | "profile" | "addresses" | "settings";
type OrderStatus = "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled";
type DeliveryArea = "inside_dhaka" | "outside_dhaka";
type AddressLabel = "home" | "office" | "other";

interface Order {
  _id: string;
  orderNumber: string;
  createdAt: string;
  status: OrderStatus;
  items: { name: string; image: string; qty: number }[];
  total: number;
}

interface AddressEntry {
  _id?: string;
  label: AddressLabel;
  fullAddress: string;
  area: DeliveryArea;
  isDefault: boolean;
}

const AUTH_TOKEN_KEY = "dealhobe_auth_token_v1";

const STATUS_STYLES: Record<OrderStatus, string> = {
  Pending: "bg-yellow-50 text-yellow-700",
  Processing: "bg-secondary-yellow/25 text-secondary-yellow-dark",
  Shipped: "bg-accent-blue/15 text-accent-blue-dark",
  Delivered: "bg-green-100 text-green-700",
  Cancelled: "bg-red-100 text-red-600",
};

const normalizeAddresses = (
  addresses: any,
  fallback?: { area?: DeliveryArea; address?: string },
): AddressEntry[] => {
  const raw = Array.isArray(addresses) ? addresses : [];
  const mapped = raw
    .map((item: any) => {
      const fullAddress = String(item?.fullAddress || item?.address || "").trim();
      if (!fullAddress) return null;
      const label: AddressLabel =
        item?.label === "office" || item?.label === "other" ? item.label : "home";

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

function StatBadge({ status }: { status: OrderStatus }) {
  if (status === "Pending") {
    return null;
  }

  return (
    <span className={cn("rounded-full px-3 py-0.5 font-poppins text-xs font-semibold", STATUS_STYLES[status])}>
      {status}
    </span>
  );
}

function Field({
  label,
  id,
  type = "text",
  placeholder,
  value,
  onChange,
  disabled = false,
}: {
  label: string;
  id: string;
  type?: string;
  placeholder: string;
  value: string;
  onChange?: (v: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="font-poppins text-sm font-medium text-text-dark">
        {label}
      </label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.value)}
        className={cn(
          "w-full rounded-2xl border px-4 py-3 font-poppins text-sm transition-colors duration-200 focus:outline-none",
          disabled
            ? "border-gray-100 bg-gray-50 text-text-muted cursor-not-allowed"
            : "border-gray-200 bg-soft-bg text-text-dark placeholder:text-text-muted/60 focus:border-primary-pink focus:bg-white",
        )}
      />
    </div>
  );
}

function NavItem({
  icon,
  label,
  active,
  onClick,
  danger = false,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 rounded-2xl px-4 py-3 font-poppins text-sm font-medium transition-all duration-200",
        danger
          ? "text-red-500 hover:bg-red-50"
          : active
            ? "bg-primary-pink/10 text-primary-pink font-semibold"
            : "text-text-muted hover:bg-gray-50 hover:text-text-dark",
      )}
    >
      {icon}
      {label}
    </button>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("orders");
  const sectionContainerRef = useRef<HTMLDivElement | null>(null);

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
      } catch (err: any) {
        setOrdersError(err?.message || "Failed to load orders.");
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
    } catch (err: any) {
      setAddressError(err?.message || "Failed to save address.");
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
    } catch (err: any) {
      setAddressError(err?.message || "Failed to set default address.");
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
    } catch (err: any) {
      setAddressError(err?.message || "Failed to delete address.");
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
    } catch (err: any) {
      setPasswordError(err?.message || "Failed to update password.");
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
      <div className="min-h-screen bg-soft-bg pt-26 pb-24">
        <div className="mx-auto max-w-6xl px-section">
          <div className="rounded-3xl bg-white p-6 text-center shadow-card">
            <p className="font-poppins text-sm text-text-muted">Loading your profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (isBanned) {
    return (
      <div className="min-h-screen bg-soft-bg pt-26 pb-24 flex items-center justify-center">
        <div className="mx-auto max-w-md px-section text-center">
          <div className="rounded-3xl bg-white p-10 shadow-card">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-50">
              <FiSlash size={32} className="text-red-400" />
            </div>
            <h1 className="mb-3 font-poppins text-2xl font-bold text-text-dark">
              Account Banned
            </h1>
            <p className="font-poppins text-sm text-text-muted leading-relaxed">
              Your account has been suspended by the admin. Please contact us for more details.
            </p>
            <Link
              href="/"
              className="mt-6 inline-block rounded-2xl bg-gradient-primary px-6 py-3 font-poppins text-sm font-semibold text-white shadow-button"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-soft-bg pt-34 pb-24">
      <div className="mx-auto max-w-6xl px-section">
        <motion.div className="mb-8 text-center" initial="hidden" animate="visible" variants={fadeUp}>
          <nav className="mb-4 flex items-center justify-center gap-2 text-small text-text-muted">
            <Link href="/" className="transition-colors hover:text-primary-pink">
              Home
            </Link>
            <FiChevronRight size={12} />
            <span className="font-semibold text-text-dark">My Account</span>
          </nav>
          <ColorfulTitle title="My Account" as="h1" className="text-primary-pink" />
        </motion.div>

        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
          <motion.aside
            className="w-full rounded-3xl bg-white p-6 shadow-card lg:w-72 lg:shrink-0"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
          >
            <div className="mb-6 flex flex-col items-center gap-3 text-center">
              <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-primary text-3xl font-bold text-white shadow-button">
                {initials}
              </div>
              <div>
                <p className="font-poppins text-lg font-semibold text-text-dark">{name || "-"}</p>
                <p className="font-poppins text-xs text-text-muted">{userEmail || "-"}</p>
              </div>

              <div className="mt-3 grid w-full grid-cols-2 gap-3 lg:hidden">
                <div className="rounded-2xl border border-gray-100 bg-soft-bg p-3 text-left">
                  <p className="text-xs text-text-muted">Total Orders</p>
                  <p className="mt-1 text-xl font-bold text-text-dark">{orders.length}</p>
                </div>
                <div className="rounded-2xl border border-gray-100 bg-soft-bg p-3 text-left">
                  <p className="text-xs text-text-muted">Member Since</p>
                  <p className="mt-1 text-xl font-bold text-text-dark">{memberSinceLabel}</p>
                </div>
              </div>
            </div>

            <hr className="mb-4 border-gray-100" />

            <nav className="flex flex-col gap-1">
              <NavItem
                icon={<FiPackage size={16} />}
                label="Orders"
                active={activeTab === "orders"}
                onClick={() => handleTabSelect("orders")}
              />
              <NavItem
                icon={<FiUser size={16} />}
                label="Profile"
                active={activeTab === "profile"}
                onClick={() => handleTabSelect("profile")}
              />
              <NavItem
                icon={<FiMapPin size={16} />}
                label="Addresses"
                active={activeTab === "addresses"}
                onClick={() => handleTabSelect("addresses")}
              />
              <NavItem
                icon={<FiSettings size={16} />}
                label="Settings"
                active={activeTab === "settings"}
                onClick={() => handleTabSelect("settings")}
              />
              <div className="my-1 border-t border-gray-100" />
              <NavItem
                icon={<FiLogOut size={16} />}
                label="Sign Out"
                onClick={() => {
                  if (typeof window !== "undefined") {
                    window.localStorage.removeItem(AUTH_TOKEN_KEY);
                    window.localStorage.removeItem("dealhobe_checkout_info_v1");
                    window.dispatchEvent(new Event("dealhobe-auth-changed"));
                  }
                  router.push("/auth/login");
                }}
                danger
              />
            </nav>
          </motion.aside>

          <div ref={sectionContainerRef} className="min-w-0 flex-1 flex flex-col gap-6">
            <motion.div
              className="hidden lg:grid lg:grid-cols-2 lg:gap-4"
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
            >
              <motion.button
                variants={scaleIn}
                custom={0}
                onClick={() => handleTabSelect("orders")}
                className={cn(
                  "flex flex-col items-start gap-2 rounded-2xl bg-white p-4 text-left shadow-card transition-all duration-200 hover:shadow-hover",
                  activeTab === "orders" && "ring-2 ring-primary-pink/40",
                )}
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-pink/10">
                  <FiPackage size={17} className="text-primary-pink" />
                </div>
                <div>
                  <p className="font-poppins text-xs text-text-muted">Total Orders</p>
                  <p className="font-poppins text-2xl font-bold text-text-dark">{orders.length}</p>
                </div>
              </motion.button>

              <motion.div
                variants={scaleIn}
                custom={1}
                className="flex flex-col items-start gap-2 rounded-2xl bg-white p-4 text-left shadow-card"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-pink/10">
                  <FiCalendar size={17} className="text-primary-pink" />
                </div>
                <div>
                  <p className="font-poppins text-xs text-text-muted">Member Since</p>
                  <p className="font-poppins text-2xl font-bold text-text-dark">{memberSinceLabel}</p>
                </div>
              </motion.div>
            </motion.div>

            <AnimatePresence mode="wait">
              {activeTab === "orders" && (
                <motion.div key="orders" {...panelAnim} className="rounded-3xl bg-white p-6 shadow-card">
                  <h2 className="mb-5 font-poppins text-xl font-semibold text-text-dark">My Orders</h2>
                  {ordersLoading ? (
                    <div className="py-10 text-center">
                      <p className="font-poppins text-sm text-text-muted">Loading your orders...</p>
                    </div>
                  ) : ordersError ? (
                    <div className="py-10 text-center">
                      <p className="font-poppins text-sm text-red-500">{ordersError}</p>
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="py-10 text-center">
                      <p className="font-poppins text-sm text-text-muted">No orders yet.</p>
                    </div>
                  ) : (
                    <div className="flex flex-col divide-y divide-gray-100">
                      {orders.map((order) => (
                        <div key={order._id} className="py-5 first:pt-0 last:pb-0">
                          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="font-poppins text-sm font-bold text-text-dark">{order.orderNumber}</span>
                              <StatBadge status={order.status} />
                            </div>
                            <span className="font-poppins text-base font-bold text-primary-pink">
                              ৳{order.total.toLocaleString()}
                            </span>
                          </div>

                          <div className="mb-3 flex items-center gap-2">
                            {order.items.map((item, i) => (
                              <div key={`${order._id}-${i}`} className="relative">
                                <div className="relative h-12 w-12 overflow-hidden rounded-xl bg-gray-50">
                                  <Image src={item.image} alt={item.name} fill className="object-cover" sizes="48px" />
                                </div>
                                {item.qty > 1 && (
                                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary-pink text-[9px] font-bold text-white">
                                    {item.qty}
                                  </span>
                                )}
                              </div>
                            ))}
                            <p className="ml-1 font-poppins text-xs text-text-muted">
                              {order.items.map((i) => i.name).join(", ")}
                            </p>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="font-poppins text-xs text-text-muted">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </span>
                            <Link
                              href={`/orders/${order.orderNumber}`}
                              className="rounded-xl border border-gray-200 px-3 py-1.5 font-poppins text-xs font-semibold text-text-dark transition-colors hover:border-primary-pink hover:text-primary-pink"
                            >
                              View Details
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === "profile" && (
                <motion.div key="profile" {...panelAnim} className="rounded-3xl bg-white p-6 shadow-card">
                  <h2 className="mb-5 font-poppins text-xl font-semibold text-text-dark">Profile Details</h2>
                  <div className="flex flex-col gap-5">
                    <Field label="Full Name" id="pName" placeholder="Your name" value={name} disabled />
                    <Field label="Email Address" id="pEmail" placeholder="you@example.com" value={userEmail} disabled />
                    <Field label="Phone Number" id="pPhone" type="tel" placeholder="+880 1xxx" value={phone} disabled />
                  </div>
                  {/* <p className="mt-5 text-sm text-text-muted">
                    Address management has moved to the Addresses tab.
                  </p> */}
                </motion.div>
              )}

              {activeTab === "addresses" && (
                <motion.div key="addresses" {...panelAnim} className="rounded-3xl bg-white p-6 shadow-card">
                  <div className="mb-5 flex items-center justify-between gap-3">
                    <h2 className="font-poppins text-xl font-semibold text-text-dark">Addresses</h2>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-text-muted">{addresses.length} saved</span>
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
                        className="inline-flex items-center gap-2 rounded-2xl bg-primary-pink/10 px-4 py-2 font-poppins text-sm font-semibold text-primary-pink"
                      >
                        <FiPlus size={14} />
                        Add New
                      </button>
                    </div>
                  </div>

                  {addresses.length === 0 ? (
                    <p className="text-sm text-text-muted">No addresses saved yet.</p>
                  ) : (
                    <div className="grid grid-cols-1 gap-3">
                      {addresses.map((addr) => (
                        <div key={addr._id || `${addr.fullAddress}-${addr.label}`} className="rounded-2xl border border-gray-100 bg-soft-bg p-4">
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                              <FiMapPin className="text-primary-pink" size={16} />
                              <span className="text-sm font-semibold text-text-dark">
                                {addr.label[0].toUpperCase() + addr.label.slice(1)}
                              </span>
                              <span className="text-xs text-text-muted">
                                {addr.area === "inside_dhaka" ? "Inside Dhaka" : "Outside Dhaka"}
                              </span>
                              {addr.isDefault && (
                                <span className="rounded-full bg-primary-pink/10 px-2 py-0.5 text-[11px] font-semibold text-primary-pink">
                                  Default
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleEditAddress(addr)}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-text-dark transition-colors hover:bg-primary-pink/10 hover:text-primary-pink"
                                title="Edit address"
                                aria-label="Edit address"
                              >
                                <FiEdit2 size={14} />
                              </button>
                              {!addr.isDefault && (
                                <button
                                  type="button"
                                  onClick={() => handleSetDefaultAddress(addr._id)}
                                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-primary-pink transition-colors hover:bg-primary-pink/10"
                                  title="Set as default address"
                                  aria-label="Set as default address"
                                >
                                  <FiCheckCircle size={15} />
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => handleDeleteAddress(addr._id)}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-red-500 transition-colors hover:bg-red-50 hover:text-red-600"
                                title="Delete address"
                                aria-label="Delete address"
                              >
                                <FiTrash2 size={14} />
                              </button>
                            </div>
                          </div>
                          <p className="mt-2 text-sm text-text-dark">{addr.fullAddress}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {showAddressForm && (
                  <div className="mt-6 rounded-2xl border border-dashed border-primary-pink/30 bg-primary-pink/5 p-4">
                    <h3 className="mb-4 font-poppins text-base font-semibold text-text-dark">
                      {editingAddressId ? "Edit Address" : "Add New Address"}
                    </h3>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="flex flex-col gap-1.5">
                        <label className="font-poppins text-sm font-medium text-text-dark">Address Label</label>
                        <select
                          value={addrLabel}
                          onChange={(e) => setAddrLabel(e.target.value as AddressLabel)}
                          className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 font-poppins text-sm text-text-dark focus:border-primary-pink focus:outline-none"
                        >
                          <option value="home">Home</option>
                          <option value="office">Office</option>
                          <option value="other">Other</option>
                        </select>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="font-poppins text-sm font-medium text-text-dark">Delivery Area</label>
                        <select
                          value={addrArea}
                          onChange={(e) => setAddrArea(e.target.value as DeliveryArea)}
                          className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 font-poppins text-sm text-text-dark focus:border-primary-pink focus:outline-none"
                        >
                          <option value="inside_dhaka">Inside Dhaka</option>
                          <option value="outside_dhaka">Outside Dhaka</option>
                        </select>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-col gap-1.5">
                      <label className="font-poppins text-sm font-medium text-text-dark">Full Address</label>
                      <textarea
                        rows={3}
                        value={addrText}
                        onChange={(e) => setAddrText(e.target.value)}
                        placeholder="House no., Road, Area, District"
                        className="w-full resize-none rounded-2xl border border-gray-200 bg-white px-4 py-3 font-poppins text-sm text-text-dark focus:border-primary-pink focus:outline-none"
                      />
                    </div>

                    <label className="mt-4 flex items-center gap-2 text-sm text-text-dark">
                      <input
                        type="checkbox"
                        checked={addrDefault}
                        onChange={(e) => setAddrDefault(e.target.checked)}
                      />
                      Set as default delivery address
                    </label>

                    {addressError && <p className="mt-3 text-xs text-red-500">{addressError}</p>}

                    <button
                      type="button"
                      onClick={handleSaveAddress}
                      disabled={addressSaving}
                      className={cn(
                        "mt-4 inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 font-poppins text-sm font-semibold text-white shadow-button transition-all",
                        addressSaving ? "bg-gray-300" : "bg-gradient-primary hover:shadow-hover",
                      )}
                    >
                      <FiPlus size={15} />
                      {addressSaving ? "Saving..." : editingAddressId ? "Save Changes" : "Add New Address"}
                    </button>
                    {editingAddressId && (
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
                        className="ml-3 mt-4 inline-flex items-center rounded-2xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-text-dark hover:border-primary-pink hover:text-primary-pink"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                  )}
                </motion.div>
              )}

              {activeTab === "settings" && (
                <motion.div key="settings" {...panelAnim} className="rounded-3xl bg-white p-6 shadow-card">
                  <h2 className="mb-5 font-poppins text-xl font-semibold text-text-dark">Settings</h2>
                  <h3 className="mb-4 text-lg font-semibold text-text-dark">Change Password</h3>

                  <div className="flex flex-col gap-4">
                    <Field
                      label="Current Password"
                      id="currentPassword"
                      type="password"
                      placeholder="Enter current password"
                      value={currentPassword}
                      onChange={setCurrentPassword}
                    />
                    <Field
                      label="New Password"
                      id="newPassword"
                      type="password"
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={setNewPassword}
                    />
                    <Field
                      label="Confirm New Password"
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={setConfirmPassword}
                    />
                  </div>

                  {passwordError && <p className="mt-3 text-sm text-red-500">{passwordError}</p>}
                  {passwordSuccess && <p className="mt-3 text-sm text-green-600">{passwordSuccess}</p>}

                  <button
                    type="button"
                    onClick={handleChangePassword}
                    disabled={passwordSaving}
                    className={cn(
                      "mt-5 w-full rounded-2xl py-3 font-poppins font-semibold text-white shadow-button transition-all",
                      passwordSaving ? "bg-gray-300" : "bg-gradient-primary hover:shadow-hover",
                    )}
                  >
                    {passwordSaving ? "Updating..." : "Update Password"}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
