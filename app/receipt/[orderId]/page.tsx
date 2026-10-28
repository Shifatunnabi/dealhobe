"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { FiCheck, FiChevronDown, FiCopy, FiDownload, FiSearch } from "react-icons/fi";
import { buildInvoicePdf, loadInvoiceLogoDataUrl } from "@/lib/invoice-pdf";
import {
  Card,
  CardTitle,
  ContinueShopping,
  DeliveryDetails,
  HelpCard,
  OrderItems,
  OrderTimeline,
  OrderTotals,
  formatOrderDate,
  type OrderView,
} from "@/components/checkout/OrderParts";
import { cn } from "@/lib/utils";

export default function ReceiptPage() {
  const params = useParams<{ orderId: string }>();
  const orderId = params?.orderId;
  const [order, setOrder] = useState<OrderView | null>(null);
  const [loading, setLoading] = useState(true);
  const [pdfDataUri, setPdfDataUri] = useState("");
  const [logoDataUrl, setLogoDataUrl] = useState("");
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    if (!orderId) return;
    const loadOrder = async () => {
      try {
        const res = await fetch(`/api/orders/${orderId}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Order not found");
        setOrder(data);
        setNotFound(false);
      } catch {
        setOrder(null);
        setNotFound(true);
        setLoading(false);
      }
    };
    loadOrder();
  }, [orderId]);

  useEffect(() => {
    const buildReceipt = async () => {
      if (!order) return;

      const logo = logoDataUrl || (await loadInvoiceLogoDataUrl());
      if (!logoDataUrl && logo) setLogoDataUrl(logo);

      const doc = buildInvoicePdf(order, logo);

      const dataUri = doc.output("datauristring");
      setPdfDataUri(dataUri);
      setLoading(false);
    };

    buildReceipt();
  }, [order, logoDataUrl]);

  const downloadReceipt = () => {
    if (!pdfDataUri) return;
    const link = document.createElement("a");
    link.href = pdfDataUri;
    link.download = `${order?.orderNumber || "DealHobe-Receipt"}.pdf`;
    link.click();
  };

  const copyOrderNumber = async () => {
    if (!order) return;
    try {
      await navigator.clipboard.writeText(order.orderNumber);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked: the number is still visible */
    }
  };

  if (notFound) {
    return (
      <div className="min-h-[70vh] bg-soft-bg px-4 pb-24 pt-8">
        <div className="mx-auto max-w-lg rounded-3xl border border-[#F1E6EA] bg-white px-6 py-14 text-center shadow-card">
          <span className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-plum-soft text-plum">
            <FiSearch size={26} />
          </span>
          <h1 className="font-display text-3xl font-semibold text-text-dark">We couldn&apos;t find that order</h1>
          <p className="mt-2 text-sm text-text-muted">Please check the order number, or contact us and we&apos;ll look it up for you.</p>
          <ContinueShopping className="mt-7" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-[70vh] bg-soft-bg pb-24 pt-8" aria-busy="true">
        <div className="shell max-w-5xl space-y-4">
          <div className="mx-auto h-24 w-24 animate-pulse rounded-full bg-white" />
          <div className="mx-auto h-10 w-72 animate-pulse rounded-xl bg-white" />
          <div className="h-64 animate-pulse rounded-3xl bg-white" />
        </div>
      </div>
    );
  }

  const firstName = order.delivery?.fullName?.trim().split(/\s+/)[0] || "";

  return (
    <div className="min-h-screen bg-soft-bg pb-24 pt-6 md:pt-10">
      <div className="shell max-w-5xl">
        {/* Celebration */}
        <div className="relative overflow-hidden rounded-[28px] border border-[#F1E6EA] bg-gradient-to-b from-white to-[#FFF6F2] px-5 pb-8 pt-10 text-center shadow-card md:px-10 md:pb-10 md:pt-12">
          <Confetti />
          <motion.span
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 16 }}
            className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#1F8A4C] text-white shadow-[0_10px_30px_rgba(31,138,76,0.35)] ring-8 ring-[#1F8A4C]/10"
          >
            <FiCheck size={38} strokeWidth={3} />
          </motion.span>
          <p className="relative mt-6 text-xs font-bold uppercase tracking-[0.18em] text-gold-dark">Order confirmed</p>
          <h1 className="relative mt-2 font-display text-3xl font-semibold text-text-dark md:text-5xl">
            Thank you{firstName ? `, ${firstName}` : ""}!
          </h1>
          <p className="relative mx-auto mt-3 max-w-md text-sm leading-relaxed text-text-muted md:text-base">
            Your order is in. We&apos;re getting it ready — you&apos;ll pay in cash when it reaches your door.
          </p>

          <div className="relative mt-6 inline-flex items-center gap-1 rounded-full border border-[#E9DCE2] bg-white py-1 pl-4 pr-1 shadow-tile">
            <span className="text-xs text-text-muted">Order</span>
            <span className="ml-1 text-sm font-bold tracking-wide text-text-dark">{order.orderNumber}</span>
            <button
              type="button"
              onClick={copyOrderNumber}
              aria-label="Copy order number"
              className="ml-1 flex h-10 w-10 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-plum-soft hover:text-plum"
            >
              {copied ? <FiCheck size={15} className="text-[#1F8A4C]" /> : <FiCopy size={15} />}
            </button>
          </div>
          {order.createdAt && <p className="relative mt-2 text-xs text-text-muted">Placed on {formatOrderDate(order.createdAt)}</p>}

          <div className="relative mx-auto mt-7 flex max-w-md flex-col gap-2.5 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={downloadReceipt}
              disabled={!pdfDataUri}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-primary-pink px-6 text-[15px] font-semibold text-white shadow-button transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-hover disabled:cursor-wait disabled:opacity-70 disabled:hover:translate-y-0"
            >
              <FiDownload size={16} />
              {pdfDataUri ? "Download receipt" : "Preparing receipt…"}
            </button>
            <ContinueShopping />
          </div>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="min-w-0 space-y-5">
            <Card>
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="font-display text-lg font-semibold text-text-dark md:text-xl">Delivery status</h2>
                <Link href={`/orders/${order.orderNumber}`} className="inline-flex min-h-11 items-center text-sm font-semibold text-primary-pink hover:underline">
                  Track order
                </Link>
              </div>
              <OrderTimeline status={order.status} createdAt={order.createdAt} trackingCode={order.steadfastTrackingCode} />
            </Card>
            <Card>
              <CardTitle>Items ({order.items.reduce((n, i) => n + i.qty, 0)})</CardTitle>
              <OrderItems items={order.items} />
            </Card>
          </div>

          <div className="space-y-5">
            <Card>
              <CardTitle>Payment summary</CardTitle>
              <OrderTotals order={order} />
            </Card>
            <Card>
              <CardTitle>Delivering to</CardTitle>
              <DeliveryDetails order={order} />
            </Card>
            <HelpCard />
          </div>
        </div>

        {/* Invoice preview */}
        <section className="mt-5 overflow-hidden rounded-3xl border border-[#F1E6EA] bg-white shadow-tile">
          <button
            type="button"
            onClick={() => setPreviewOpen((v) => !v)}
            aria-expanded={previewOpen}
            className="flex min-h-14 w-full items-center justify-between gap-3 px-5 text-left md:px-6"
          >
            <span className="font-display text-lg font-semibold text-text-dark">Invoice preview</span>
            <FiChevronDown className={cn("text-text-muted transition-transform", previewOpen && "rotate-180")} />
          </button>
          <AnimatePresence initial={false}>
            {previewOpen && (
              <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                <div className="border-t border-[#F4ECEF] p-3 md:p-5">
                  {pdfDataUri ? (
                    <iframe title="Receipt preview" src={pdfDataUri} className="h-[75vh] w-full rounded-2xl border border-[#F1E6EA] bg-gray-50" />
                  ) : (
                    <div className="flex h-60 items-center justify-center text-sm text-text-muted">{loading ? "Preparing receipt…" : "Receipt unavailable."}</div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </div>
    </div>
  );
}

/** A light, one-off burst of brand-coloured confetti behind the check mark. */
function Confetti() {
  const colors = ["#A41B15", "#D8B26E", "#F7D6DF", "#3B0D2E", "#1F8A4C"];
  return (
    <div aria-hidden className="pointer-events-none absolute inset-x-0 top-16 flex justify-center motion-reduce:hidden">
      {Array.from({ length: 18 }).map((_, i) => {
        const angle = (i / 18) * Math.PI * 2;
        const dist = 90 + (i % 3) * 40;
        return (
          <motion.span
            key={i}
            className="absolute h-2 w-2 rounded-[2px]"
            style={{ background: colors[i % colors.length] }}
            initial={{ x: 0, y: 0, opacity: 0, rotate: 0, scale: 0.6 }}
            animate={{ x: Math.cos(angle) * dist * 1.6, y: Math.sin(angle) * dist * 0.7 + 30, opacity: [0, 1, 1, 0], rotate: 220, scale: 1 }}
            transition={{ duration: 1.6, delay: 0.15 + (i % 4) * 0.04, ease: "easeOut" }}
          />
        );
      })}
    </div>
  );
}
