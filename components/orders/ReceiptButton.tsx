"use client";

import { useState } from "react";
import { FiDownload } from "react-icons/fi";
import { buildInvoicePdf, loadInvoiceLogoDataUrl } from "@/lib/invoice-pdf";

export default function ReceiptButton({ order, className = "btn-admin-primary" }: { order: any; className?: string }) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    if (loading) return;
    setLoading(true);

    const logo = await loadInvoiceLogoDataUrl();
    const doc = buildInvoicePdf(order, logo);

    doc.save(`${order.orderNumber}.pdf`);
    setLoading(false);
  };

  return (
    <button
      onClick={handleDownload}
      className={className}
      disabled={loading}
    >
      <FiDownload size={14} />
      {loading ? "Preparing…" : "Download Receipt"}
    </button>
  );
}
