"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

interface OrderRow {
  _id: string;
  orderNumber: string;
  createdAt: string;
  total: number;
  status: string;
  steadfastConsignmentId?: string;
  steadfastTrackingCode?: string;
  steadfastStatus?: string;
}

const STATUS_COLORS: Record<string, string> = {
  Pending: "#f59e0b",
  Processing: "#3b82f6",
  Shipped: "#8b5cf6",
  Delivered: "#22c55e",
  Cancelled: "#ef4444",
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkSending, setBulkSending] = useState(false);
  const [bulkResult, setBulkResult] = useState<string | null>(null);
  const [balance, setBalance] = useState<number | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      // Exclude cancelled orders — they live in /admin/cancelled-orders
      const res = await fetch("/api/admin/orders");
      const data: OrderRow[] = await res.json();
      if (res.ok) setOrders(data.filter((o) => o.status !== "Cancelled"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    fetch("/api/admin/steadfast/balance")
      .then((r) => r.json())
      .then((d) => { if (d.balance !== undefined) setBalance(d.balance); })
      .catch(() => {});
  }, [load]);

  function toggleSelect(orderNumber: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(orderNumber)) next.delete(orderNumber);
      else next.add(orderNumber);
      return next;
    });
  }

  function toggleAll() {
    const eligible = orders
      .filter((o) => !o.steadfastConsignmentId && o.status !== "Cancelled")
      .map((o) => o.orderNumber);
    if (eligible.every((n) => selected.has(n))) {
      setSelected(new Set());
    } else {
      setSelected(new Set(eligible));
    }
  }

  async function sendSingle(orderNumber: string) {
    setActionLoading(orderNumber);
    try {
      const res = await fetch(`/api/admin/steadfast/create-consignment/${orderNumber}`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) { alert(data.error || "Failed to send to Steadfast."); return; }
      await load();
    } finally {
      setActionLoading(null);
    }
  }

  async function syncStatus(orderNumber: string) {
    setActionLoading(`sync-${orderNumber}`);
    try {
      const res = await fetch(`/api/admin/steadfast/sync-status/${orderNumber}`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) { alert(data.error || "Failed to sync status."); return; }
      await load();
    } finally {
      setActionLoading(null);
    }
  }

  async function markDelivered(orderNumber: string) {
    setActionLoading(`del-${orderNumber}`);
    try {
      const res = await fetch(`/api/admin/orders/${orderNumber}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Delivered" }),
      });
      if (!res.ok) { alert("Failed to update status."); return; }
      await load();
    } finally {
      setActionLoading(null);
    }
  }

  async function cancelOrder(orderNumber: string) {
    if (!confirm(`Cancel order ${orderNumber}? This cannot be undone easily.`)) return;
    setActionLoading(`cancel-${orderNumber}`);
    try {
      const res = await fetch(`/api/admin/orders/${orderNumber}/cancel`, { method: "POST" });
      if (!res.ok) { alert("Failed to cancel order."); return; }
      await load();
    } finally {
      setActionLoading(null);
    }
  }

  async function sendBulk() {
    const orderNumbers = Array.from(selected);
    if (orderNumbers.length === 0) return;
    setBulkSending(true);
    setBulkResult(null);
    try {
      const res = await fetch("/api/admin/steadfast/bulk-create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderNumbers }),
      });
      const data = await res.json();
      if (!res.ok) { setBulkResult(data.error || "Bulk send failed."); return; }
      setBulkResult(`Sent ${data.sent} order(s). Failed: ${data.failed}.`);
      setSelected(new Set());
      await load();
    } finally {
      setBulkSending(false);
    }
  }

  const eligibleOrders = orders.filter((o) => !o.steadfastConsignmentId && o.status !== "Cancelled");
  const allEligibleSelected =
    eligibleOrders.length > 0 && eligibleOrders.every((o) => selected.has(o.orderNumber));

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title"><span className="page-icon">🧾</span> Orders</h1>
          <p className="admin-page-subtitle">Review customer orders and manage Steadfast shipments.</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
          {balance !== null && (
            <div style={{
              background: "rgba(52,199,89,0.1)",
              border: "1px solid rgba(52,199,89,0.25)",
              borderRadius: 8,
              padding: "0.4rem 0.85rem",
              fontSize: 13,
              fontWeight: 600,
              color: "#15803d",
            }}>
              Steadfast Balance: ৳{balance.toLocaleString()}
            </div>
          )}
          {selected.size > 0 && (
            <button className="btn-admin-primary" onClick={sendBulk} disabled={bulkSending}>
              {bulkSending ? "Sending…" : `Send ${selected.size} to Steadfast`}
            </button>
          )}
        </div>
      </div>

      {bulkResult && (
        <div style={{
          marginBottom: "1rem",
          padding: "0.75rem 1rem",
          background: "rgba(59,130,246,0.08)",
          border: "1px solid rgba(59,130,246,0.2)",
          borderRadius: 8,
          fontSize: 14,
        }}>
          {bulkResult}
        </div>
      )}

      {loading ? (
        <div className="admin-empty"><div className="spinner" style={{ margin: "0 auto 1rem" }} /><p>Loading…</p></div>
      ) : orders.length === 0 ? (
        <div className="admin-empty">
          <div className="empty-icon">🧾</div>
          <h3>No Orders Yet</h3>
          <p>Orders will appear here as customers check out.</p>
        </div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: 40 }}>
                  <input
                    type="checkbox"
                    checked={allEligibleSelected}
                    onChange={toggleAll}
                    title="Select all unsent orders"
                  />
                </th>
                <th>#</th>
                <th>Order ID</th>
                <th>Date</th>
                <th>Total</th>
                <th>Status</th>
                <th>Steadfast</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, index) => {
                const isSent = !!order.steadfastConsignmentId;
                const isLoading = actionLoading === order.orderNumber;
                const isSyncing = actionLoading === `sync-${order.orderNumber}`;
                const isMarkingDelivered = actionLoading === `del-${order.orderNumber}`;
                const isCancelling = actionLoading === `cancel-${order.orderNumber}`;

                return (
                  <tr key={order._id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selected.has(order.orderNumber)}
                        disabled={isSent}
                        onChange={() => toggleSelect(order.orderNumber)}
                      />
                    </td>
                    <td>{index + 1}</td>
                    <td style={{ fontWeight: 600 }}>{order.orderNumber}</td>
                    <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td>৳{order.total.toLocaleString()}</td>
                    <td>
                      <span style={{
                        display: "inline-block",
                        padding: "2px 10px",
                        borderRadius: 20,
                        fontSize: 12,
                        fontWeight: 600,
                        background: `${STATUS_COLORS[order.status] || "#6b7280"}20`,
                        color: STATUS_COLORS[order.status] || "#6b7280",
                      }}>
                        {order.status}
                      </span>
                    </td>
                    <td style={{ fontSize: 12 }}>
                      {isSent ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                          <span style={{ color: "#6b7280" }}>{order.steadfastTrackingCode}</span>
                          {order.steadfastStatus && (
                            <span style={{ color: "#8b5cf6", fontWeight: 600 }}>
                              {order.steadfastStatus}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span style={{ color: "#9ca3af" }}>Not sent</span>
                      )}
                    </td>
                    <td>
                      <div className="admin-item-actions" style={{ flexWrap: "wrap", gap: "0.35rem" }}>
                        <Link href={`/admin/orders/${order.orderNumber}`} className="btn-admin-edit">
                          View
                        </Link>
                        {!isSent ? (
                          <button
                            className="btn-admin-primary"
                            style={{ fontSize: 12, padding: "4px 10px" }}
                            onClick={() => sendSingle(order.orderNumber)}
                            disabled={isLoading}
                          >
                            {isLoading ? "Sending…" : "Send"}
                          </button>
                        ) : (
                          <>
                            <button
                              className="btn-admin-secondary"
                              style={{ fontSize: 12, padding: "4px 10px" }}
                              onClick={() => syncStatus(order.orderNumber)}
                              disabled={isSyncing}
                            >
                              {isSyncing ? "Syncing…" : "Sync"}
                            </button>
                            {order.status !== "Delivered" && (
                              <button
                                className="btn-admin-success"
                                style={{ fontSize: 12, padding: "4px 10px" }}
                                onClick={() => markDelivered(order.orderNumber)}
                                disabled={isMarkingDelivered}
                              >
                                {isMarkingDelivered ? "…" : "Delivered"}
                              </button>
                            )}
                          </>
                        )}
                        <button
                          className="btn-admin-danger"
                          style={{ fontSize: 12, padding: "4px 10px" }}
                          onClick={() => cancelOrder(order.orderNumber)}
                          disabled={isCancelling}
                        >
                          {isCancelling ? "…" : "Cancel"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
