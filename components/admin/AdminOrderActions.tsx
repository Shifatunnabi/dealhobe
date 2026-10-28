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
    <div className="order-actions">
      <div className="order-actions-row">
        <ReceiptButton order={order} className="btn-admin-secondary" />
        {!isCancelled && (
          <button className="btn-admin-danger" onClick={cancelOrder} disabled={cancelling}>
            {cancelling ? "Cancelling…" : "Cancel Order"}
          </button>
        )}
      </div>

      {!isCancelled && (
        <div className="order-courier-card">
          <div className="order-courier-title">Steadfast Courier</div>

          {isSent ? (
            <div className="order-courier-meta">
              <div>
                <span className="muted">Tracking: </span>
                <strong>{trackingCode}</strong>
              </div>
              {localSteadfastStatus && (
                <div>
                  <span className="muted">Courier status: </span>
                  <strong style={{ color: "#6d28d9" }}>{localSteadfastStatus}</strong>
                </div>
              )}
              {order.steadfastSentAt && (
                <div className="muted" style={{ fontSize: 12 }}>
                  Sent {new Date(order.steadfastSentAt).toLocaleDateString()}
                </div>
              )}
            </div>
          ) : (
            <div className="order-courier-meta muted">
              Not yet sent to Steadfast.
            </div>
          )}

          <div className="order-actions-row" style={{ justifyContent: "flex-start" }}>
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
            <div className="order-courier-error" role="alert">{error}</div>
          )}
        </div>
      )}

      {isCancelled && (
        <div className="order-cancelled-note">
          This order has been cancelled.
        </div>
      )}
    </div>
  );
}
