"use client";

import { useEffect, useState, useCallback } from "react";
import { FiSlash } from 'react-icons/fi';
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
          <h1 className="admin-page-title"><span className="page-icon"><FiSlash size={20} /></span> Cancelled Orders</h1>
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
          <div className="empty-icon"><FiSlash size={40} /></div>
          <h3>No Cancelled Orders</h3>
          <p>Cancelled orders will appear here.</p>
        </div>
      ) : (
        <div className="admin-table-wrap admin-table-wrap--stack">
          <table className="admin-table admin-table--stack">
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
                  <td className="hide-stacked">{index + 1}</td>
                  <td className="cell-head" style={{ fontWeight: 600 }}>{order.orderNumber}</td>
                  <td data-label="Customer">
                    <div style={{ fontSize: 13 }}>
                      <div>{order.delivery.fullName}</div>
                      <div className="cell-sub">{order.delivery.phone}</div>
                    </div>
                  </td>
                  <td data-label="Date" className="nowrap">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td data-label="Total" className="nowrap">৳{order.total.toLocaleString()}</td>
                  <td data-label="Tracking" style={{ fontSize: 12, color: "var(--text-muted)" }}>
                    {order.steadfastTrackingCode || "—"}
                  </td>
                  <td className="cell-actions-td">
                    <div className="cell-actions">
                      <Link href={`/admin/orders/${order.orderNumber}`} className="btn-admin-edit btn-sm">
                        View
                      </Link>
                    </div>
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
