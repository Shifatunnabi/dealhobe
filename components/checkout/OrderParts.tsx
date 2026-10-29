/* Order confirmation / tracking building blocks. No hooks, so server pages can render them too. */
import Link from "next/link";
import { FiCheck, FiMapPin, FiPackage, FiPhone, FiTruck, FiHome, FiXCircle } from "react-icons/fi";
import ProductPhoto from "@/components/ui/ProductPhoto";
import { cn } from "@/lib/utils";
import { AREA_LABEL, SUPPORT_PHONE, money, type DeliveryArea } from "./money";

export interface OrderViewItem {
  productId: string;
  name: string;
  image?: string;
  variantKey?: string;
  variantLabel?: string;
  unitPrice: number;
  qty: number;
  lineTotal: number;
}

export interface OrderView {
  orderNumber: string;
  status?: string;
  items: OrderViewItem[];
  delivery: { fullName: string; phone: string; email?: string; area: DeliveryArea | string; address: string; paymentMethod?: string };
  subtotal: number;
  deliveryCharge: number;
  total: number;
  createdAt?: string | Date;
  steadfastTrackingCode?: string;
}

const STEPS = [
  { key: "Pending", label: "Order placed", sub: "We've received your order", icon: FiCheck },
  { key: "Processing", label: "Confirmed & packing", sub: "Your items are being packed", icon: FiPackage },
  { key: "Shipped", label: "On the way", sub: "Handed to our courier", icon: FiTruck },
  { key: "Delivered", label: "Delivered", sub: "Enjoy your new favourites", icon: FiHome },
] as const;

export const formatOrderDate = (d?: string | Date) =>
  d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "";

export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return <section className={cn("rounded-3xl border border-[#F1E6EA] bg-white p-5 shadow-tile md:p-6", className)}>{children}</section>;
}

export function CardTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="mb-4 font-display text-lg font-semibold text-text-dark md:text-xl">{children}</h2>;
}

export function StatusPill({ status = "Pending" }: { status?: string }) {
  const tone =
    status === "Cancelled"
      ? "bg-red-50 text-red-700"
      : status === "Delivered"
      ? "bg-[#F1FAF4] text-[#1F8A4C]"
      : "bg-plum-soft text-plum";
  const label = STEPS.find((s) => s.key === status)?.label ?? status;
  return <span className={cn("inline-flex items-center rounded-full px-3 py-1 text-xs font-bold", tone)}>{label}</span>;
}

export function OrderTimeline({ status = "Pending", createdAt, trackingCode }: { status?: string; createdAt?: string | Date; trackingCode?: string }) {
  if (status === "Cancelled") {
    return (
      <div className="flex items-start gap-3 rounded-2xl bg-red-50 p-4 text-sm text-red-700">
        <FiXCircle size={20} className="mt-0.5 shrink-0" />
        <div>
          <p className="font-semibold">This order was cancelled.</p>
          <p className="mt-0.5 text-red-700/80">Questions? Call us on {SUPPORT_PHONE}.</p>
        </div>
      </div>
    );
  }
  const current = Math.max(0, STEPS.findIndex((s) => s.key === status));
  return (
    <>
      <ol className="relative">
        {STEPS.map((step, i) => {
          const done = i <= current;
          const Icon = step.icon;
          return (
            <li key={step.key} className="relative flex gap-3.5 pb-5 last:pb-0">
              {i < STEPS.length - 1 && (
                <span aria-hidden className={cn("absolute left-[17px] top-9 h-[calc(100%-2.25rem)] w-0.5 rounded-full", i < current ? "bg-[#1F8A4C]" : "bg-[#EDE3E7]")} />
              )}
              <span
                className={cn(
                  "relative z-[1] flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                  done ? "bg-[#1F8A4C] text-white" : "border-2 border-[#EDE3E7] bg-white text-text-muted/60",
                  i === current && "ring-4 ring-[#1F8A4C]/15",
                )}
              >
                <Icon size={16} />
              </span>
              <div className="pt-1">
                <p className={cn("text-sm font-semibold", done ? "text-text-dark" : "text-text-muted")}>
                  {step.label}
                  {i === 0 && createdAt && <span className="ml-2 font-normal text-text-muted">{formatOrderDate(createdAt)}</span>}
                </p>
                <p className="text-xs text-text-muted">{step.sub}</p>
              </div>
            </li>
          );
        })}
      </ol>
      {trackingCode && (
        <p className="mt-4 rounded-xl bg-soft-bg px-3 py-2 text-xs text-text-muted">
          Courier tracking code: <span className="font-bold tracking-wide text-text-dark">{trackingCode}</span>
        </p>
      )}
    </>
  );
}

export function OrderItems({ items }: { items: OrderViewItem[] }) {
  return (
    <ul className="divide-y divide-[#F4ECEF]">
      {items.map((item, index) => (
        <li key={`${item.productId}-${item.variantKey || index}`} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
          <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-[#F1E6EA] bg-white">
            <ProductPhoto src={item.image || "/placeholder.png"} alt={item.name} requestWidth={128} className="p-[8%]" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="line-clamp-2 text-sm font-semibold leading-snug text-text-dark">{item.name}</span>
            {item.variantLabel && <span className="mt-0.5 block text-xs text-text-muted">{item.variantLabel}</span>}
            <span className="mt-0.5 block text-xs text-text-muted">
              {item.qty} × {money(item.unitPrice)}
            </span>
          </span>
          <span className="shrink-0 text-sm font-bold tabular-nums text-text-dark">{money(item.lineTotal)}</span>
        </li>
      ))}
    </ul>
  );
}

export function OrderTotals({ order }: { order: OrderView }) {
  const area = AREA_LABEL[order.delivery.area as DeliveryArea] ?? order.delivery.area;
  return (
    <div className="space-y-2.5 text-sm">
      <div className="flex justify-between gap-3">
        <span className="text-text-muted">Subtotal</span>
        <span className="font-semibold tabular-nums text-text-dark">{money(order.subtotal)}</span>
      </div>
      <div className="flex justify-between gap-3">
        <span className="text-text-muted">Delivery · {area}</span>
        <span className="font-semibold tabular-nums text-text-dark">
          {order.deliveryCharge === 0 ? <span className="text-[#1F8A4C]">Free</span> : money(order.deliveryCharge)}
        </span>
      </div>
      <div className="flex items-baseline justify-between gap-3 border-t border-dashed border-[#EADDE3] pt-3">
        <span className="font-semibold text-text-dark">Total</span>
        <span className="text-2xl font-extrabold tabular-nums text-text-dark">{money(order.total)}</span>
      </div>
      <p className="rounded-xl bg-[#FFF9EE] px-3 py-2 text-center text-xs font-semibold text-[#8A5A00]">
        Pay {money(order.total)} in cash when your order arrives
      </p>
    </div>
  );
}

export function DeliveryDetails({ order }: { order: OrderView }) {
  const d = order.delivery;
  return (
    <div className="space-y-3 text-sm">
      <div className="flex gap-3">
        <FiMapPin size={16} className="mt-0.5 shrink-0 text-plum" />
        <div className="min-w-0">
          <p className="font-semibold text-text-dark">{d.fullName}</p>
          <p className="mt-0.5 break-words leading-relaxed text-text-muted">{d.address}</p>
          <p className="mt-0.5 text-xs text-text-muted">{AREA_LABEL[d.area as DeliveryArea] ?? d.area}</p>
        </div>
      </div>
      <div className="flex gap-3">
        <FiPhone size={16} className="mt-0.5 shrink-0 text-plum" />
        <div className="min-w-0">
          <p className="text-text-dark">{d.phone}</p>
          {d.email && <p className="break-all text-xs text-text-muted">{d.email}</p>}
        </div>
      </div>
    </div>
  );
}

export function HelpCard() {
  return (
    <Card className="bg-gradient-to-br from-white to-[#FFF6F2]">
      <p className="font-display text-lg font-semibold text-text-dark">Need help with your order?</p>
      <p className="mt-1 text-sm text-text-muted">Keep your order number handy and reach us any time.</p>
      <a
        href={`tel:${SUPPORT_PHONE}`}
        className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-full border border-[#E4D6DC] bg-white px-4 text-sm font-semibold text-text-dark transition-colors hover:border-plum hover:text-plum"
      >
        <FiPhone size={14} /> Call {SUPPORT_PHONE}
      </a>
    </Card>
  );
}

export function ContinueShopping({ className }: { className?: string }) {
  return (
    <Link
      href="/products"
      className={cn(
        "inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[#E4D6DC] bg-white px-6 text-[15px] font-semibold text-text-dark transition-colors hover:border-primary-pink hover:text-primary-pink",
        className,
      )}
    >
      Continue shopping
    </Link>
  );
}
