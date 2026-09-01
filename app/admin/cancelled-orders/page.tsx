"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

interface OrderRow {
  _id: string;
  orderNumber: string;
  createdAt: string;
  total: number;
  status: string;
  delivery: { fullName: string; phone: string; address: string };
  steadfastTrackingCode?: string;
}

export default function CancelledOrdersPage() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/orders?status=Cancelled");
      const data = await res.json();
      if (res.ok) setOrders(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title"><span className="page-icon">🚫</span> Cancelled Orders</h1>
          <p className="admin-page-subtitle">All orders that have been cancelled.</p>
        </div>
      </div>

      {loading ? (
        <div className="admin-empty">
          <div className="spinner" style={{ margin: "0 auto 1rem" }} />
          <p>Loading…</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="admin-empty">
          <div className="empty-icon">🚫</div>
          <h3>No Cancelled Orders</h3>
          <p>Cancelled orders will appear here.</p>
        </div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Total</th>
                <th>Tracking</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, index) => (
                <tr key={order._id}>
                  <td>{index + 1}</td>
                  <td style={{ fontWeight: 600 }}>{order.orderNumber}</td>
                  <td>
                    <div style={{ fontSize: 13 }}>
                      <div>{order.delivery.fullName}</div>
                      <div style={{ color: "#9ca3af" }}>{order.delivery.phone}</div>
                    </div>
                  </td>
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td>৳{order.total.toLocaleString()}</td>
                  <td style={{ fontSize: 12, color: "#6b7280" }}>
                    {order.steadfastTrackingCode || "—"}
                  </td>
                  <td>
                    <Link href={`/admin/orders/${order.orderNumber}`} className="btn-admin-edit">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
