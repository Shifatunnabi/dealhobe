"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { FiChevronRight, FiChevronDown, FiLock, FiCheck, FiAlertCircle, FiMapPin, FiTruck, FiEdit2, FiUser } from "react-icons/fi";
import { cn } from "@/lib/utils";
import { useCart, cartLineId } from "@/components/cart/CartProvider";
import ProductPhoto from "@/components/ui/ProductPhoto";
import { EmptyBag, FreeDeliveryProgress, SummaryRow, TrustRow } from "@/components/checkout/BagParts";
import { Field, FieldMessage, StepCard, TextareaField } from "@/components/checkout/FormBits";
import { useCartInsights } from "@/components/checkout/useCartInsights";
import { AREA_LABEL, DELIVERY_CHARGE, money } from "@/components/checkout/money";

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

type RawAddress = { _id?: unknown; label?: string; fullAddress?: string; address?: string; area?: string; isDefault?: boolean };

const normalizeAddresses = (
  addresses: unknown,
  fallback?: { area?: "inside_dhaka" | "outside_dhaka"; address?: string },
): AddressEntry[] => {
  const raw = (Array.isArray(addresses) ? addresses : []) as RawAddress[];
  const mapped = raw
    .map((item) => {
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
  const [, setAuthToken] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);
  const [addresses, setAddresses] = useState<AddressEntry[]>([]);
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState("");
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState(0);
  // Presentation-only state (inline validation + summary).
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const errorRef = useRef<HTMLDivElement>(null);

  const baseDeliveryCharge = DELIVERY_CHARGE[area];
  const deliveryCharge =
    freeDeliveryThreshold > 0 && subtotal >= freeDeliveryThreshold ? 0 : baseDeliveryCharge;
  const total = subtotal + deliveryCharge;
  const { compareAt, savings } = useCartInsights(items, { upsell: false });

  // Bring server / account errors into view (they render below the form steps).
  useEffect(() => {
    if (error) errorRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [error]);

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
    } catch (err) {
      setError((err as Error)?.message || "Account creation failed.");
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
            variantKey: item.variantKey,
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
    } catch (err) {
      setError((err as Error)?.message || "Order failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };


  /* ── Presentation-only helpers (inline validation, summary) ──────────── */

  const show = (key: string) => submitAttempted || touched[key];
  const touch = (key: string) => () => setTouched((prev) => (prev[key] ? prev : { ...prev, [key]: true }));

  const phoneCompact = phone.replace(/[\s()-]/g, "");
  const errors = {
    fullName: !fullName ? "Please enter the name we should deliver to." : "",
    phone: !phone ? "Please add a mobile number so our rider can reach you." : "",
    address: !address
      ? hasCustomer
        ? "Choose a saved address, or add one from your profile."
        : "Please add your house, road and area so we can find you."
      : "",
    account: createAccount && !accountReady ? "Tap “Create account” to finish, or untick “Create an account” to check out as a guest." : "",
  };
  const phoneWarning =
    phone && !/^(?:\+?88)?01[3-9]\d{8}$/.test(phoneCompact) ? "Double-check this number — Bangladeshi mobiles look like 01XXXXXXXXX." : "";
  const emailWarning = email && !/^\S+@\S+\.\S+$/.test(email) ? "This email looks incomplete." : "";

  const contactDone = Boolean(fullName && phone);
  const deliveryDone = Boolean(address);
  const freeDelivery = deliveryCharge === 0;

  const onFormSubmit = (e: React.FormEvent) => {
    if (!canSubmit) {
      e.preventDefault();
      setSubmitAttempted(true);
      const firstInvalid = errors.fullName
        ? "fullName"
        : errors.phone
        ? "phone"
        : errors.address
        ? hasCustomer
          ? "delivery"
          : "address"
        : errors.account
        ? "account"
        : "";
      const el = firstInvalid ? document.getElementById(firstInvalid) : null;
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) el.focus({ preventScroll: true });
      }
      return;
    }
    handleSubmit(e);
  };

  if (!items.length) {
    return (
      <div className="min-h-[70vh] bg-soft-bg px-4 pb-24 pt-8">
        <div className="mx-auto max-w-lg rounded-3xl border border-[#F1E6EA] bg-white shadow-card">
          <EmptyBag />
        </div>
      </div>
    );
  }

  const summaryLines = (
    <>
      <ul className="space-y-3.5">
        {items.map((item) => (
          <li key={cartLineId(item)} className="flex items-center gap-3">
            <span className="relative h-14 w-14 shrink-0 rounded-xl border border-[#F1E6EA] bg-white">
              <span className="absolute inset-0 overflow-hidden rounded-xl">
                <ProductPhoto src={item.image || "/placeholder.png"} alt={item.name} requestWidth={128} className="p-[8%]" />
              </span>
              <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-plum px-1 text-[10px] font-bold text-white ring-2 ring-white">
                {item.qty}
              </span>
            </span>
            <span className="min-w-0 flex-1">
              <span className="line-clamp-2 text-[13px] font-semibold leading-snug text-text-dark">{item.name}</span>
              {item.variantLabel && <span className="mt-0.5 block text-[11px] text-text-muted">{item.variantLabel}</span>}
            </span>
            <span className="shrink-0 text-right text-[13px] font-bold tabular-nums text-text-dark">
              {money(item.unitPrice * item.qty)}
              {compareAt[cartLineId(item)] ? (
                <s className="block text-[11px] font-normal text-[#7B6A76]">{money(compareAt[cartLineId(item)] * item.qty)}</s>
              ) : null}
            </span>
          </li>
        ))}
      </ul>

      <FreeDeliveryProgress subtotal={subtotal} threshold={freeDeliveryThreshold} className="mt-5" />

      <div className="mt-5 space-y-2.5 border-t border-[#F4ECEF] pt-4">
        <SummaryRow label="Subtotal" value={money(subtotal)} />
        {savings > 0 && <SummaryRow label="Product savings" value={`−${money(savings)}`} tone="savings" />}
        <SummaryRow
          label={`Delivery · ${AREA_LABEL[area]}`}
          value={
            freeDelivery ? (
              <span className="font-bold text-[#1F8A4C]">
                Free <s className="ml-1 font-normal text-text-muted">{money(baseDeliveryCharge)}</s>
              </span>
            ) : (
              money(deliveryCharge)
            )
          }
        />
      </div>
      <div className="mt-4 flex items-baseline justify-between border-t border-dashed border-[#EADDE3] pt-4">
        <span className="font-semibold text-text-dark">Total</span>
        <span className="text-[26px] font-extrabold leading-none tabular-nums text-text-dark">{money(total)}</span>
      </div>
      <p className="mt-1.5 text-right text-xs text-text-muted">Pay in cash on delivery</p>
    </>
  );

  const placeOrderLabel = (
    <>
      <FiLock size={16} />
      <span>Place order</span>
      <span className="opacity-60" aria-hidden>·</span>
      <span className="tabular-nums">{money(total)}</span>
    </>
  );

  return (
    <div className="min-h-screen bg-soft-bg pb-40 pt-5 md:pb-20 md:pt-8">
      <div className="shell">
        {/* Header */}
        <div className="mb-5 flex flex-wrap items-end justify-between gap-x-6 gap-y-3 md:mb-7">
          <div>
            <nav aria-label="Breadcrumb" className="mb-2 flex items-center gap-1.5 text-xs text-text-muted">
              <Link href="/cart" className="transition-colors hover:text-primary-pink">Bag</Link>
              <FiChevronRight size={12} />
              <span className="font-semibold text-text-dark">Checkout</span>
            </nav>
            <h1 className="font-display text-3xl font-semibold text-text-dark md:text-[40px]">Checkout</h1>
          </div>
          <p className="flex items-center gap-2 rounded-full border border-[#E9DCE2] bg-white px-3.5 py-1.5 text-xs font-semibold text-text-muted">
            <FiLock size={13} className="text-[#1F8A4C]" />
            Secure checkout · Cash on delivery
          </p>
        </div>

        <form id="checkout-form" onSubmit={onFormSubmit}>
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-8">
            {/* Mobile: collapsible order summary */}
            <div className="rounded-2xl border border-[#F1E6EA] bg-white shadow-tile lg:hidden">
              <button
                type="button"
                onClick={() => setSummaryOpen((v) => !v)}
                aria-expanded={summaryOpen}
                aria-controls="mobile-summary"
                className="flex min-h-14 w-full items-center justify-between gap-3 px-4 text-left"
              >
                <span className="flex items-center gap-2 text-sm font-semibold text-plum">
                  {summaryOpen ? "Hide" : "Show"} order summary
                  <span className="font-normal text-text-muted">({items.reduce((n, i) => n + i.qty, 0)} items)</span>
                  <FiChevronDown className={cn("transition-transform", summaryOpen && "rotate-180")} />
                </span>
                <span className="text-lg font-extrabold tabular-nums text-text-dark">{money(total)}</span>
              </button>
              <AnimatePresence initial={false}>
                {summaryOpen && (
                  <motion.div
                    id="mobile-summary"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="border-t border-[#F4ECEF] px-4 pb-5 pt-4">{summaryLines}</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Steps */}
            <div className="min-w-0 space-y-4 md:space-y-5">
              <StepCard
                step={1}
                id="contact"
                title="Contact"
                done={contactDone && !isEditing}
                aside={
                  <div className="flex items-center gap-2">
                    {hasCustomer && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-plum-soft px-3 py-1 text-xs font-semibold text-plum">
                        <FiUser size={12} /> Signed in
                      </span>
                    )}
                    {!createAccount && savedInfo && !isEditing && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F1FAF4] px-3 py-1 text-xs font-semibold text-[#1F8A4C]">
                        <FiCheck size={12} /> Saved
                      </span>
                    )}
                    {!hasCustomer && !isEditing && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditing(true);
                          setSavedInfo(false);
                        }}
                        className="inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 text-sm font-semibold text-primary-pink transition-colors hover:bg-primary-pink/5"
                      >
                        <FiEdit2 size={13} /> Edit
                      </button>
                    )}
                  </div>
                }
              >
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field
                    label="Full name"
                    id="fullName"
                    placeholder="e.g. Maliha Rahman"
                    required
                    autoComplete="name"
                    value={fullName}
                    onChange={setFullName}
                    onBlur={touch("fullName")}
                    error={show("fullName") ? errors.fullName : ""}
                    disabled={hasCustomer || !isEditing}
                    className="sm:col-span-2"
                  />
                  <Field
                    label="Mobile number"
                    id="phone"
                    type="tel"
                    inputMode="tel"
                    placeholder="01XXX-XXXXXX"
                    required
                    autoComplete="tel"
                    value={phone}
                    onChange={setPhone}
                    onBlur={touch("phone")}
                    error={show("phone") ? errors.phone : ""}
                    warning={touched.phone ? phoneWarning : ""}
                    disabled={hasCustomer || !isEditing}
                  />
                  <Field
                    label="Email"
                    id="email"
                    type="email"
                    inputMode="email"
                    placeholder="you@example.com"
                    optional
                    autoComplete="email"
                    value={email}
                    onChange={setEmail}
                    onBlur={touch("email")}
                    warning={touched.email ? emailWarning : ""}
                    disabled={hasCustomer || !isEditing}
                  />
                </div>
                {!hasCustomer && (
                  <p className="mt-3 text-xs text-text-muted">We&apos;ll only use your number to confirm and deliver this order. Add an email to get your receipt.</p>
                )}
              </StepCard>

              <StepCard
                step={2}
                id="delivery"
                title="Delivery"
                done={deliveryDone && !isEditing}
                aside={
                  hasCustomer ? (
                    <Link href="/profile" className="inline-flex min-h-11 items-center px-1 text-sm font-semibold text-primary-pink hover:underline">
                      Manage addresses
                    </Link>
                  ) : undefined
                }
              >
                {hasCustomer ? (
                  <div className="flex flex-col gap-3">
                    {profileLoading ? (
                      <div className="grid gap-3 sm:grid-cols-2" aria-busy="true">
                        <div className="h-24 animate-pulse rounded-2xl bg-[#F7F0F3]" />
                        <div className="h-24 animate-pulse rounded-2xl bg-[#F7F0F3]" />
                      </div>
                    ) : addresses.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-[#E4D6DC] bg-[#FDFAFB] p-4 text-sm text-text-muted">
                        No saved addresses yet.{" "}
                        <Link href="/profile" className="font-semibold text-primary-pink hover:underline">Add one in your profile</Link>.
                      </div>
                    ) : (
                      <div role="radiogroup" aria-label="Delivery address" className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {addresses.map((addr, index) => {
                          const isActive = index === selectedAddressIndex;
                          return (
                            <button
                              type="button"
                              role="radio"
                              aria-checked={isActive}
                              key={addr._id || `${addr.area}-${index}`}
                              onClick={() => {
                                setSelectedAddressIndex(index);
                                setArea(addr.area);
                                setAddress(addr.fullAddress || addr.address || "");
                              }}
                              className={cn(
                                "relative rounded-2xl border p-4 text-left transition-all",
                                isActive ? "border-plum bg-plum-soft/40 ring-1 ring-plum" : "border-[#E9DCE2] bg-white hover:border-plum/40",
                              )}
                            >
                              <span className="flex items-center gap-2 text-xs font-semibold text-plum">
                                <FiMapPin size={14} />
                                {addr.label ? `${addr.label[0].toUpperCase()}${addr.label.slice(1)} · ` : ""}
                                {AREA_LABEL[addr.area]}
                              </span>
                              <span className="mt-2 block pr-6 text-sm leading-relaxed text-text-dark">{addr.fullAddress || addr.address}</span>
                              {isActive && (
                                <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-plum text-white">
                                  <FiCheck size={12} strokeWidth={3} />
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                    <FieldMessage id="delivery-msg" error={show("address") || submitAttempted ? errors.address : ""} />
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    <fieldset id="area" disabled={!isEditing}>
                      <legend className="mb-1.5 text-[13px] font-semibold text-text-dark">
                        Delivery area <span className="text-primary-pink" aria-hidden>*</span>
                      </legend>
                      <div className="grid grid-cols-2 gap-3">
                        {(["inside_dhaka", "outside_dhaka"] as const).map((value) => {
                          const active = area === value;
                          return (
                            <label
                              key={value}
                              className={cn(
                                "relative flex min-h-[68px] cursor-pointer flex-col justify-center rounded-2xl border px-4 py-3 transition-all has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-plum/10",
                                active ? "border-plum bg-plum-soft/40 ring-1 ring-plum" : "border-[#E4D6DC] bg-white hover:border-plum/40",
                                !isEditing && "cursor-not-allowed opacity-70",
                              )}
                            >
                              <input
                                type="radio"
                                name="area"
                                value={value}
                                checked={active}
                                onChange={() => setArea(value)}
                                className="sr-only"
                              />
                              <span className="text-sm font-semibold text-text-dark">{AREA_LABEL[value]}</span>
                              <span className="mt-0.5 text-[13px] text-text-muted">
                                {freeDeliveryThreshold > 0 && subtotal >= freeDeliveryThreshold ? (
                                  <>
                                    <span className="font-bold text-[#1F8A4C]">Free</span>{" "}
                                    <s>{money(DELIVERY_CHARGE[value])}</s>
                                  </>
                                ) : (
                                  money(DELIVERY_CHARGE[value])
                                )}
                              </span>
                              {active && (
                                <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-plum text-white">
                                  <FiCheck size={12} strokeWidth={3} />
                                </span>
                              )}
                            </label>
                          );
                        })}
                      </div>
                    </fieldset>

                    <TextareaField
                      label="Full address"
                      id="address"
                      placeholder="House, road, area, thana, district"
                      required
                      autoComplete="street-address"
                      value={address}
                      onChange={setAddress}
                      onBlur={touch("address")}
                      error={show("address") ? errors.address : ""}
                      disabled={!isEditing}
                    />

                    {!createAccount && !savedInfo && (
                      <button
                        type="button"
                        onClick={handleSaveInfo}
                        className="inline-flex min-h-11 items-center gap-1.5 self-start rounded-full border border-[#E4D6DC] px-4 text-sm font-semibold text-text-dark transition-colors hover:border-plum hover:text-plum"
                      >
                        <FiCheck size={14} /> Save these details
                      </button>
                    )}
                  </div>
                )}
              </StepCard>

              <StepCard step={3} id="payment" title="Payment" done={paymentMethod === "cash_on_delivery" && contactDone && deliveryDone}>
                <label className="flex cursor-pointer items-center gap-4 rounded-2xl border border-plum bg-plum-soft/40 p-4 ring-1 ring-plum has-[:focus-visible]:ring-4">
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === "cash_on_delivery"}
                    onChange={() => setPaymentMethod("cash_on_delivery")}
                    className="h-5 w-5 shrink-0 accent-[#3B0D2E]"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[15px] font-semibold text-text-dark">Cash on delivery</span>
                    <span className="mt-0.5 block text-[13px] text-text-muted">Pay in cash when your order reaches your door.</span>
                  </span>
                  <FiTruck size={22} className="shrink-0 text-plum" />
                </label>
              </StepCard>

              {!hasCustomer && (
                <section id="account" className="scroll-mt-40 rounded-3xl border border-[#F1E6EA] bg-white p-5 shadow-tile md:p-7">
                  <label className="group flex min-h-11 cursor-pointer items-center gap-3">
                    <input
                      type="checkbox"
                      checked={createAccount}
                      onChange={(e) => {
                        setCreateAccount(e.target.checked);
                        setAccountReady(false);
                        setSavedInfo(false);
                        setIsEditing(true);
                      }}
                      className="peer sr-only"
                    />
                    <span
                      className={cn(
                        "flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 transition-colors peer-focus-visible:ring-4 peer-focus-visible:ring-plum/10",
                        createAccount ? "border-plum bg-plum text-white" : "border-[#D3C0C8] group-hover:border-plum/60",
                      )}
                      aria-hidden
                    >
                      {createAccount && <FiCheck size={14} strokeWidth={3} />}
                    </span>
                    <span>
                      <span className="block text-[15px] font-semibold text-text-dark">Create an account</span>
                      <span className="block text-[13px] text-text-muted">Track this order and check out faster next time. Optional.</span>
                    </span>
                  </label>

                  {createAccount && (
                    <div className="mt-5 flex flex-col gap-4">
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <Field
                          label="Password"
                          id="password"
                          type="password"
                          placeholder="At least 6 characters"
                          required
                          autoComplete="new-password"
                          value={password}
                          onChange={setPassword}
                          disabled={!isEditing}
                        />
                        <Field
                          label="Confirm password"
                          id="confirmPassword"
                          type="password"
                          placeholder="Re-enter password"
                          required
                          autoComplete="new-password"
                          value={confirmPassword}
                          onChange={setConfirmPassword}
                          disabled={!isEditing}
                        />
                      </div>
                      {!accountReady ? (
                        <button
                          type="button"
                          onClick={handleCreateAccount}
                          className="inline-flex min-h-12 items-center justify-center rounded-full border-2 border-plum px-6 text-sm font-semibold text-plum transition-colors hover:bg-plum hover:text-white sm:self-start"
                        >
                          Create account
                        </button>
                      ) : (
                        <p className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#1F8A4C]">
                          <FiCheck size={14} /> Account created — you&apos;re signed in.
                        </p>
                      )}
                      <FieldMessage id="account-msg" error={submitAttempted ? errors.account : ""} />
                    </div>
                  )}
                </section>
              )}

              {error && (
                <div ref={errorRef} role="alert" className="flex scroll-mt-40 items-start gap-2.5 rounded-2xl border border-primary-pink/25 bg-[#FDF1F0] px-4 py-3.5 text-sm font-medium text-primary-pink">
                  <FiAlertCircle size={17} className="mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <TrustRow className="rounded-3xl border border-[#F1E6EA] bg-white px-3 py-5 shadow-tile lg:hidden" />
            </div>

            {/* Desktop: sticky order summary */}
            <aside className="hidden lg:col-start-2 lg:row-start-1 lg:block">
              <div className="sticky top-40 rounded-3xl border border-[#F1E6EA] bg-white p-6 shadow-card">
                <h2 className="mb-5 font-display text-xl font-semibold text-text-dark">Order summary</h2>
                {summaryLines}
                <button
                  type="submit"
                  disabled={loading}
                  className={cn(
                    "mt-5 flex min-h-14 w-full items-center justify-center gap-2 rounded-full px-6 text-base font-semibold shadow-button transition-[transform,box-shadow,background-color] hover:-translate-y-0.5 hover:shadow-hover active:translate-y-0",
                    "bg-primary-pink text-white",
                  )}
                >
                  {placeOrderLabel}
                </button>
                {!canSubmit && submitAttempted && (
                  <p className="mt-2 text-center text-xs font-medium text-primary-pink">Please complete the highlighted details.</p>
                )}
                <TrustRow className="mt-5 border-t border-[#F4ECEF] pt-5" />
                <p className="mt-4 text-center text-[11px] leading-relaxed text-text-muted">
                  By placing your order you agree to our{" "}
                  <Link href="/terms-and-conditions" className="underline underline-offset-2 hover:text-primary-pink">terms</Link> and{" "}
                  <Link href="/refund-return-policy" className="underline underline-offset-2 hover:text-primary-pink">return policy</Link>.
                </p>
              </div>
            </aside>
          </div>

          {/* Mobile: sticky place-order bar above the bottom nav */}
          <div className="fixed inset-x-0 bottom-[calc(4.3rem+env(safe-area-inset-bottom))] z-[45] border-t border-[#F1E6EA] bg-white px-4 pb-[2.1rem] pt-2.5 shadow-[0_-8px_24px_rgba(59,13,46,0.08)] lg:hidden">
            <button
              type="submit"
              disabled={loading}
              className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-full bg-primary-pink px-6 text-base font-semibold text-white shadow-button active:scale-[0.99]"
            >
              {placeOrderLabel}
            </button>
            
          </div>
        </form>
      </div>

      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] flex items-center justify-center bg-plum/40 px-6 backdrop-blur-sm"
            role="status"
            aria-live="polite"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm rounded-3xl bg-white p-7 text-center shadow-hover"
            >
              <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary-pink/15 border-t-primary-pink" />
              <p className="font-display text-lg font-semibold text-text-dark">One moment…</p>
              <p className="mt-1 text-sm text-text-muted">{LOADING_STEPS[loadingStep]}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
