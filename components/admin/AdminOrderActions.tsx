"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ReceiptButton from "@/components/orders/ReceiptButton";

interface OrderData {
  orderNumber: string;
  status: string;
  delivery: any;
  items: any[];
  subtotal: number;
  deliveryCharge: number;
  total: number;
  createdAt: string;
  receiptEmailSentAt?: string | null;
  steadfastConsignmentId?: string | null;
  steadfastTrackingCode?: string | null;
  steadfastStatus?: string | null;
  steadfastSentAt?: string | null;
}

export default function AdminOrderActions({ order }: { order: OrderData }) {
  const router = useRouter();
  const [sending, setSending] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [marking, setMarking] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localStatus, setLocalStatus] = useState(order.status);
  const [localSteadfastStatus, setLocalSteadfastStatus] = useState(order.steadfastStatus);
  const [isSent, setIsSent] = useState(!!order.steadfastConsignmentId);
  const [trackingCode, setTrackingCode] = useState(order.steadfastTrackingCode);

  const isCancelled = localStatus === "Cancelled";
  const isDelivered = localStatus === "Delivered";

  async function sendToSteadfast() {
    setSending(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/steadfast/create-consignment/${order.orderNumber}`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to send."); return; }
      setIsSent(true);
      setTrackingCode(data.trackingCode);
      setLocalSteadfastStatus(data.steadfastStatus);
      setLocalStatus("Processing");
      router.refresh();
    } finally {
      setSending(false);
    }
  }

  async function syncStatus() {
    setSyncing(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/steadfast/sync-status/${order.orderNumber}`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to sync."); return; }
      setLocalSteadfastStatus(data.steadfastStatus);
      setLocalStatus(data.orderStatus);
      router.refresh();
    } finally {
      setSyncing(false);
    }
  }

  async function markDelivered() {
    setMarking(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/orders/${order.orderNumber}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Delivered" }),
      });
      if (!res.ok) { setError("Failed to update status."); return; }
      setLocalStatus("Delivered");
      router.refresh();
    } finally {
      setMarking(false);
    }
  }

  async function cancelOrder() {
    if (!confirm(`Cancel order ${order.orderNumber}?`)) return;
    setCancelling(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/orders/${order.orderNumber}/cancel`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to cancel."); return; }
      setLocalStatus("Cancelled");
      router.refresh();
    } finally {
      setCancelling(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", alignItems: "flex-end" }}>
      <div className="flex flex-wrap items-center gap-2">
        <ReceiptButton order={order} className="btn-admin-secondary" />
        {!isCancelled && (
          <button className="btn-admin-danger" onClick={cancelOrder} disabled={cancelling}>
            {cancelling ? "Cancelling…" : "Cancel Order"}
          </button>
        )}
      </div>

      {!isCancelled && (
        <div style={{
          border: "1px solid rgba(45,27,78,0.12)",
          borderRadius: 10,
          padding: "0.85rem 1rem",
          minWidth: 260,
          background: "rgba(45,27,78,0.02)",
        }}>
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: "0.6rem", color: "#2d1b4e" }}>
            Steadfast Courier
          </div>

          {isSent ? (
            <div style={{ fontSize: 13, display: "grid", gap: "0.35rem", marginBottom: "0.75rem" }}>
              <div>
                <span style={{ color: "#6b7280" }}>Tracking: </span>
                <strong>{trackingCode}</strong>
              </div>
              {localSteadfastStatus && (
                <div>
                  <span style={{ color: "#6b7280" }}>Courier status: </span>
                  <strong style={{ color: "#8b5cf6" }}>{localSteadfastStatus}</strong>
                </div>
              )}
              {order.steadfastSentAt && (
                <div style={{ color: "#9ca3af", fontSize: 12 }}>
                  Sent {new Date(order.steadfastSentAt).toLocaleDateString()}
                </div>
              )}
            </div>
          ) : (
            <div style={{ fontSize: 13, color: "#9ca3af", marginBottom: "0.75rem" }}>
              Not yet sent to Steadfast.
            </div>
          )}

          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {!isSent ? (
              <button className="btn-admin-primary" onClick={sendToSteadfast} disabled={sending}>
                {sending ? "Sending…" : "Send to Steadfast"}
              </button>
            ) : (
              <button className="btn-admin-secondary" onClick={syncStatus} disabled={syncing}>
                {syncing ? "Syncing…" : "Sync Status"}
              </button>
            )}
            {!isDelivered && (
              <button className="btn-admin-success" onClick={markDelivered} disabled={marking}>
                {marking ? "…" : "Mark Delivered"}
              </button>
            )}
          </div>

          {error && (
            <div style={{ marginTop: "0.5rem", color: "#ef4444", fontSize: 12 }}>{error}</div>
          )}
        </div>
      )}

      {isCancelled && (
        <div style={{
          border: "1px solid rgba(239,68,68,0.2)",
          borderRadius: 10,
          padding: "0.75rem 1rem",
          background: "rgba(239,68,68,0.04)",
          fontSize: 13,
          color: "#ef4444",
          fontWeight: 600,
        }}>
          This order has been cancelled.
        </div>
      )}
    </div>
  );
}
