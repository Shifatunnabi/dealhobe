"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { FiDownload } from "react-icons/fi";
import { buildInvoicePdf, loadInvoiceLogoDataUrl } from "@/lib/invoice-pdf";

const LOADING_STEPS = [
  "Finding your toys",
  "Packing the gift box",
  "Confirming your order",
  "Preparing your receipt",
];

export default function ReceiptPage() {
  const params = useParams<{ orderId: string }>();
  const orderId = params?.orderId;
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadingStep, setLoadingStep] = useState(0);
  const [pdfDataUri, setPdfDataUri] = useState("");
  const [logoDataUrl, setLogoDataUrl] = useState("");
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const id = window.setInterval(() => {
      setLoadingStep((prev) => (prev + 1) % LOADING_STEPS.length);
    }, 1200);
    return () => window.clearInterval(id);
  }, []);

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


  const receiptTitle = useMemo(
    () => (order ? `Receipt ${order.orderNumber}` : "Receipt"),
    [order],
  );

  return (
    <div className="min-h-screen bg-soft-bg pt-26 pb-24">
      <div className="mx-auto max-w-5xl px-section">
        <div className="rounded-3xl bg-white p-6 shadow-card">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="font-inter text-2xl font-bold text-text-dark">{receiptTitle}</h1>
              <p className="mt-1 text-sm text-text-muted">
                {notFound ? "We could not find this order." : "Download your invoice below."}
              </p>
            </div>
            <button
              onClick={() => {
                if (!pdfDataUri) return;
                const link = document.createElement("a");
                link.href = pdfDataUri;
                link.download = `${order?.orderNumber || "JoyToy-Receipt"}.pdf`;
                link.click();
              }}
              className={
                notFound
                  ? "inline-flex items-center gap-2 rounded-2xl bg-gray-200 px-6 py-3 font-inter font-semibold text-gray-400"
                  : "inline-flex items-center gap-2 rounded-2xl bg-gradient-primary px-6 py-3 font-inter font-semibold text-white shadow-button transition-shadow hover:shadow-hover"
              }
              disabled={notFound}
            >
              <FiDownload size={16} />
              Download Receipt
            </button>
          </div>

          <div className="mt-6 overflow-hidden rounded-2xl border border-gray-100 bg-gray-50">
            {pdfDataUri ? (
              <iframe
                title="Receipt preview"
                src={pdfDataUri}
                className="h-[75vh] w-full"
              />
            ) : (
              <div className="flex h-[60vh] items-center justify-center">
                <span className="text-sm text-text-muted">Preparing receipt…</span>
              </div>
            )}
          </div>
        </div>
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
              <p className="font-inter text-sm text-text-muted">{LOADING_STEPS[loadingStep]}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
