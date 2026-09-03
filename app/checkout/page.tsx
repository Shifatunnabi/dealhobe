"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { FiChevronRight, FiLock, FiCheck, FiAlertCircle, FiMapPin, FiShoppingCart } from "react-icons/fi";
import { cn } from "@/lib/utils";
import { fadeUp } from "@/components/animations/variants";
import { ColorfulTitle } from "@/components/ui";
import { useCart } from "@/components/cart/CartProvider";

const DELIVERY_CHARGE = {
  inside_dhaka: 95,
  outside_dhaka: 120,
} as const;

const LOADING_STEPS = [
  "Finding your products",
  "Packing the gift box",
  "Confirming your order",
  "Preparing your receipt",
];

const AUTH_TOKEN_KEY = "dealhobe_auth_token_v1";

interface AddressEntry {
  _id?: string;
  label?: "home" | "office" | "other";
  fullAddress?: string;
  area: "inside_dhaka" | "outside_dhaka";
  address?: string;
  isDefault?: boolean;
}

const normalizeAddresses = (
  addresses: any,
  fallback?: { area?: "inside_dhaka" | "outside_dhaka"; address?: string },
): AddressEntry[] => {
  const raw = Array.isArray(addresses) ? addresses : [];
  const mapped = raw
    .map((item: any) => {
      const fullAddress = String(item?.fullAddress || item?.address || "").trim();
      if (!fullAddress) return null;

      return {
        _id: item?._id ? String(item._id) : undefined,
        label: item?.label === "office" || item?.label === "other" ? item.label : "home",
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

function Field({
  label,
  id,
  type = "text",
  placeholder,
  required = false,
  value,
  onChange,
  disabled = false,
}: {
  label: string;
  id: string;
  type?: string;
  placeholder: string;
  required?: boolean;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="font-poppins text-sm font-medium text-text-dark">
        {label}
        {required && <span className="ml-0.5 text-primary-pink">*</span>}
      </label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        autoComplete="off"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
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

function TextareaField({
  label,
  id,
  placeholder,
  value,
  onChange,
  disabled = false,
}: {
  label: string;
  id: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="font-poppins text-sm font-medium text-text-dark">
        {label}
      </label>
      <textarea
        id={id}
        placeholder={placeholder}
        rows={4}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "w-full resize-none rounded-2xl border px-4 py-3 font-poppins text-sm transition-colors duration-200 focus:outline-none",
          disabled
            ? "border-gray-100 bg-gray-50 text-text-muted cursor-not-allowed"
            : "border-gray-200 bg-soft-bg text-text-dark placeholder:text-text-muted/60 focus:border-primary-pink focus:bg-white",
        )}
      />
    </div>
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [area, setArea] = useState<"inside_dhaka" | "outside_dhaka">("inside_dhaka");
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash_on_delivery");
  const [createAccount, setCreateAccount] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [accountReady, setAccountReady] = useState(false);
  const [savedInfo, setSavedInfo] = useState(false);
  const [isEditing, setIsEditing] = useState(true);
  const [hasCustomer, setHasCustomer] = useState(false);
  const [authToken, setAuthToken] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);
  const [addresses, setAddresses] = useState<AddressEntry[]>([]);
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState("");
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState(0);

  const baseDeliveryCharge = DELIVERY_CHARGE[area];
  const deliveryCharge =
    freeDeliveryThreshold > 0 && subtotal >= freeDeliveryThreshold ? 0 : baseDeliveryCharge;
  const total = subtotal + deliveryCharge;

  useEffect(() => {
    let alive = true;
    const loadSettings = async () => {
      try {
        const res = await fetch("/api/settings");
        const data = await res.json();
        if (!alive) return;
        if (res.ok) setFreeDeliveryThreshold(Number(data?.freeDeliveryThreshold) || 0);
      } catch {
        if (alive) setFreeDeliveryThreshold(0);
      }
    };

    loadSettings();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const token = window.localStorage.getItem(AUTH_TOKEN_KEY);
    const hasToken = Boolean(token);
    if (!hasToken) return;

    setHasCustomer(true);
    setCreateAccount(false);
    setAccountReady(true);
    setIsEditing(false);
    setProfileLoading(true);
    setAuthToken(token || "");

    fetch("/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        setFullName(data?.user?.fullName || "");
        setEmail(data?.user?.email || "");
        setPhone(data?.user?.phone || "");
        const list = normalizeAddresses(data?.user?.addresses, {
          area: data?.user?.area,
          address: data?.user?.address,
        });
        if (list.length > 0) {
          setAddresses(list);
          const defaultIndex = Math.max(0, list.findIndex((item) => item.isDefault));
          const selected = list[defaultIndex] || list[0];
          setSelectedAddressIndex(defaultIndex);
          setArea(selected.area);
          setAddress(selected.fullAddress || selected.address || "");
        }
      })
      .catch(() => {
        setHasCustomer(false);
        setCreateAccount(false);
        setAccountReady(false);
        setIsEditing(true);
        setAuthToken("");
      })
      .finally(() => setProfileLoading(false));
  }, []);

  useEffect(() => {
    if (!loading) return;
    const id = window.setInterval(() => {
      setLoadingStep((prev) => (prev + 1) % LOADING_STEPS.length);
    }, 1200);
    return () => window.clearInterval(id);
  }, [loading]);

  const canSubmit = useMemo(() => {
    const baseValid = Boolean(fullName && phone && address && paymentMethod && items.length);
    if (!baseValid) return false;
    if (!createAccount) return true;
    return accountReady;
  }, [fullName, phone, address, paymentMethod, items.length, createAccount, accountReady]);

  const handleSaveInfo = () => {
    setSavedInfo(true);
    setIsEditing(false);
  };

  const handleSaveEdits = () => {
    handleSaveInfo();
  };

  const handleCreateAccount = async () => {
    setError("");
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          email,
          phone,
          area,
          address,
          password,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create account.");
      if (data?.authToken) {
        window.localStorage.setItem(AUTH_TOKEN_KEY, data.authToken);
        setAuthToken(data.authToken);
      }
      if (data?.user) {
        setFullName(data.user.fullName || fullName);
        setEmail(data.user.email || email);
        setPhone(data.user.phone || phone);
        const list = normalizeAddresses(data?.user?.addresses, {
          area: data?.user?.area,
          address: data?.user?.address,
        });
        if (list.length > 0) {
          setAddresses(list);
          const defaultIndex = Math.max(0, list.findIndex((item) => item.isDefault));
          const selected = list[defaultIndex] || list[0];
          setSelectedAddressIndex(defaultIndex);
          setArea(selected.area);
          setAddress(selected.fullAddress || selected.address || "");
        }
      }
      window.dispatchEvent(new Event("dealhobe-auth-changed"));
      setAccountReady(true);
      setIsEditing(false);
      setHasCustomer(true);
    } catch (err: any) {
      setError(err?.message || "Account creation failed.");
      setAccountReady(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setError("");
    setLoading(true);

    try {
      const token = window.localStorage.getItem(AUTH_TOKEN_KEY);
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.productId,
            qty: item.qty,
          })),
          delivery: {
            fullName,
            phone,
            email: email || undefined,
            area,
            address,
            paymentMethod,
          },
          createAccount: false,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to place order.");

      clearCart();
      router.push(`/receipt/${data.orderNumber}`);
    } catch (err: any) {
      setError(err?.message || "Order failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!items.length) {
    return (
      <div className="min-h-screen bg-soft-bg pt-26 pb-24 flex items-center justify-center px-section">
        <motion.div
          className="w-full max-w-md rounded-3xl bg-white p-10 shadow-card text-center"
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
        >
          <FiShoppingCart size={48} className="text-primary-pink/40" />
          <h2 className="mt-5 font-poppins text-2xl font-bold text-text-dark">
            Your cart is empty
          </h2>
          <p className="mt-2 font-poppins text-sm text-text-muted">
            Add some products before heading to checkout.
          </p>
          <Link
            href="/products"
            className="mt-7 inline-flex items-center gap-2 rounded-2xl bg-gradient-primary px-8 py-3 font-poppins font-semibold text-white shadow-button transition-shadow hover:shadow-hover"
          >
            Browse Products
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-soft-bg pt-34 pb-24">
      <div className="mx-auto max-w-5xl px-section">
        <motion.div
          className="mb-10 text-center"
          initial="hidden"
          animate="visible"
          variants={fadeUp}
        >
          <nav className="mb-5 flex items-center justify-center gap-2 text-small text-text-muted">
            <Link href="/" className="transition-colors hover:text-primary-pink">Home</Link>
            <FiChevronRight size={12} />
            <Link href="/cart" className="transition-colors hover:text-primary-pink">Cart</Link>
            <FiChevronRight size={12} />
            <span className="font-semibold text-text-dark">Checkout</span>
          </nav>
          <ColorfulTitle title="Checkout" as="h1" className="text-primary-pink" />
          <p className="mt-2 font-poppins text-sm text-text-muted">
            Fill in your delivery details and confirm your order.
          </p>
        </motion.div>

        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-stretch lg:gap-8">
            <motion.div
              className="flex-1 rounded-3xl bg-white p-6 shadow-card"
              initial="hidden"
              animate="visible"
              variants={fadeUp}
            >
              <div className="mb-6 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <h2 className="font-poppins text-xl font-semibold text-text-dark">
                    Delivery Details
                  </h2>
                  {!createAccount && savedInfo && !isEditing && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                      <FiCheck size={12} />
                      Info saved
                    </span>
                  )}
                  {createAccount && accountReady && !isEditing && null}
                </div>
                {!hasCustomer && !isEditing && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(true);
                      setSavedInfo(false);
                    }}
                    className="rounded-xl border border-gray-200 px-3 py-1.5 text-xs font-semibold text-text-dark transition-colors hover:border-primary-pink hover:text-primary-pink"
                  >
                    Edit
                  </button>
                )}
              </div>

              <div className="flex flex-col gap-5">
                <Field
                  label="Full Name"
                  id="fullName"
                  placeholder="e.g. Maliha Rahman"
                  required
                  value={fullName}
                  onChange={setFullName}
                  disabled={hasCustomer || !isEditing}
                />

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <Field
                    label="Mobile"
                    id="phone"
                    type="tel"
                    placeholder="+880 1xxx-xxxxxx"
                    required
                    value={phone}
                    onChange={setPhone}
                    disabled={hasCustomer || !isEditing}
                  />
                  <Field
                    label="Email Address"
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={setEmail}
                    disabled={hasCustomer || !isEditing}
                  />
                </div>

                {hasCustomer ? (
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <label className="font-poppins text-sm font-medium text-text-dark">
                        Delivery Address <span className="ml-0.5 text-primary-pink">*</span>
                      </label>
                      <Link
                        href="/profile"
                        className="text-xs font-semibold text-primary-pink hover:underline"
                      >
                        Manage addresses
                      </Link>
                    </div>

                    {profileLoading ? (
                      <p className="text-sm text-text-muted">Loading saved addresses…</p>
                    ) : addresses.length === 0 ? (
                      <p className="text-sm text-text-muted">No saved addresses. Add one in your profile.</p>
                    ) : (
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {addresses.map((addr, index) => {
                          const isActive = index === selectedAddressIndex;
                          return (
                            <button
                              type="button"
                              key={addr._id || `${addr.area}-${index}`}
                              onClick={() => {
                                setSelectedAddressIndex(index);
                                setArea(addr.area);
                                setAddress(addr.fullAddress || addr.address || "");
                              }}
                              className={cn(
                                "rounded-2xl border p-4 text-left transition-all",
                                isActive
                                  ? "border-primary-pink bg-primary-pink/5"
                                  : "border-gray-100 bg-soft-bg hover:border-primary-pink/40",
                              )}
                            >
                              <div className="flex items-center gap-2">
                                <FiMapPin className="text-primary-pink" size={16} />
                                <span className="text-xs font-semibold text-primary-pink">
                                  {addr.label ? `${addr.label[0].toUpperCase()}${addr.label.slice(1)} • ` : ""}
                                  {addr.area === "inside_dhaka" ? "Inside Dhaka" : "Outside Dhaka"}
                                </span>
                              </div>
                              <p className="mt-2 text-sm text-text-dark">{addr.fullAddress || addr.address}</p>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                      <div className="flex flex-col gap-1.5">
                        <label htmlFor="area" className="font-poppins text-sm font-medium text-text-dark">
                          Delivery Area <span className="ml-0.5 text-primary-pink">*</span>
                        </label>
                        <select
                          id="area"
                          value={area}
                          onChange={(e) => setArea(e.target.value as "inside_dhaka" | "outside_dhaka")}
                          disabled={!isEditing}
                          className={cn(
                            "w-full rounded-2xl border px-4 py-3 font-poppins text-sm transition-colors duration-200 focus:outline-none",
                            !isEditing
                              ? "border-gray-100 bg-gray-50 text-text-muted cursor-not-allowed"
                              : "border-gray-200 bg-soft-bg text-text-dark focus:border-primary-pink focus:bg-white",
                          )}
                        >
                          <option value="inside_dhaka">Inside Dhaka (৳{DELIVERY_CHARGE.inside_dhaka})</option>
                          <option value="outside_dhaka">Outside Dhaka (৳{DELIVERY_CHARGE.outside_dhaka})</option>
                        </select>
                      </div>
                    </div>

                    <TextareaField
                      label="Full Address"
                      id="address"
                      placeholder="House no., Road, Area, District…"
                      value={address}
                      onChange={setAddress}
                      disabled={!isEditing}
                    />
                  </>
                )}

                <div className="flex flex-col gap-2">
                  <label className="font-poppins text-sm font-medium text-text-dark">
                    Payment Method <span className="ml-0.5 text-primary-pink">*</span>
                  </label>
                  <label className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-soft-bg px-4 py-3 text-sm">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === "cash_on_delivery"}
                      onChange={() => setPaymentMethod("cash_on_delivery")}
                    />
                    Cash on Delivery
                  </label>
                </div>

                {!hasCustomer && (
                  <label className="group flex cursor-pointer items-center gap-3">
                    <input
                      type="checkbox"
                      checked={createAccount}
                      onChange={(e) => {
                        setCreateAccount(e.target.checked);
                        setAccountReady(false);
                        setSavedInfo(false);
                        setIsEditing(true);
                      }}
                      className="sr-only"
                    />
                    <div
                      className={cn(
                        "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-colors duration-150",
                        createAccount
                          ? "border-primary-pink bg-primary-pink"
                          : "border-gray-300 group-hover:border-primary-pink/60",
                      )}
                    >
                      {createAccount && (
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                          <path
                            d="M1 4L3.5 6.5L9 1"
                            stroke="white"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </div>
                    <span className="font-poppins text-sm text-text-dark">
                      Create an account
                    </span>
                  </label>
                )}

                {createAccount && !hasCustomer && (
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <Field
                      label="Password"
                      id="password"
                      type="password"
                      placeholder="At least 6 characters"
                      required
                      value={password}
                      onChange={setPassword}
                      disabled={!isEditing}
                    />
                    <Field
                      label="Confirm Password"
                      id="confirmPassword"
                      type="password"
                      placeholder="Re-enter password"
                      required
                      value={confirmPassword}
                      onChange={setConfirmPassword}
                      disabled={!isEditing}
                    />
                  </div>
                )}

                {error && (
                  <div className="flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                    <FiAlertCircle className="mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="flex flex-col gap-3 sm:flex-row">
                  {!createAccount && !savedInfo && (
                    <motion.button
                      type="button"
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={handleSaveInfo}
                      className="flex-1 rounded-2xl bg-gradient-primary py-3 font-poppins font-semibold text-white shadow-button transition-all hover:shadow-hover"
                    >
                      Save Info
                    </motion.button>
                  )}

                  {createAccount && !accountReady && (
                    <motion.button
                      type="button"
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={handleCreateAccount}
                      className={cn(
                        "flex-1 rounded-2xl border-2 border-primary-pink py-3 font-poppins font-semibold transition-all",
                        "text-primary-pink hover:bg-primary-pink hover:text-white",
                      )}
                    >
                      Create Account
                    </motion.button>
                  )}
                </div>
              </div>
            </motion.div>

            <motion.div
              className="w-full rounded-3xl bg-white p-6 shadow-card lg:w-80 lg:shrink-0"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.1, ease: [0.4, 0, 0.2, 1] }}
            >
              <h2 className="mb-5 font-poppins text-xl font-semibold text-text-dark">
                Order Summary
              </h2>

              <div className="divide-y divide-gray-100">
                {items.map((item) => (
                  <div key={item.productId} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-gray-50">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 font-poppins text-sm font-semibold leading-snug text-text-dark">
                        {item.name}
                      </p>
                      <p className="mt-0.5 font-poppins text-xs text-text-muted">x{item.qty}</p>
                    </div>
                    <p className="font-poppins text-sm font-bold text-primary-pink shrink-0">
                      ৳{(item.unitPrice * item.qty).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>

              <hr className="my-4 border-gray-100" />

              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-poppins text-sm text-text-muted">Subtotal</span>
                  <span className="font-poppins font-semibold text-text-dark">
                    ৳{subtotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-poppins text-sm text-text-muted">Shipping</span>
                  <span className="font-poppins font-semibold text-text-dark">
                    {deliveryCharge === 0 ? "Free" : `৳${deliveryCharge.toLocaleString()}`}
                  </span>
                </div>
                {freeDeliveryThreshold > 0 && (
                  <p className="text-xs text-text-muted">
                    Free delivery on orders ৳{freeDeliveryThreshold.toLocaleString()} and above.
                  </p>
                )}
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
                <span className="font-poppins text-lg font-bold text-text-dark">Total</span>
                <span className="font-poppins text-2xl font-bold text-primary-pink">
                  ৳{total.toLocaleString()}
                </span>
              </div>

              <motion.button
                type="submit"
                disabled={!canSubmit}
                whileHover={canSubmit ? { y: -2, boxShadow: "0 16px 48px rgba(164, 27, 21, 0.28)" } : {}}
                whileTap={canSubmit ? { scale: 0.97 } : {}}
                transition={{ duration: 0.2 }}
                className={cn(
                  "mt-5 flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 font-poppins font-semibold shadow-button transition-shadow",
                  canSubmit
                    ? "bg-gradient-primary text-white"
                    : "cursor-not-allowed bg-gray-200 text-gray-400",
                )}
              >
                <FiLock size={15} />
                Confirm Purchase
              </motion.button>

              <p className="mt-3 flex items-center justify-center gap-1.5 text-center font-poppins text-xs text-text-muted">
                <FiLock size={12} className="shrink-0" />
                Secure &amp; encrypted checkout
              </p>
            </motion.div>
          </div>
        </form>
      </div>

      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-6"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-hover"
            >
              <div className="mx-auto mb-4 h-12 w-12 rounded-full border-4 border-primary-pink/20 border-t-primary-pink animate-spin" />
              <p className="font-poppins text-sm text-text-muted">{LOADING_STEPS[loadingStep]}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
