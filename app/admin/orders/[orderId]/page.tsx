import connectDB from "@/lib/mongodb";
import Order from "@/lib/models/Order";
import { notFound } from "next/navigation";
import AdminOrderActions from "@/components/admin/AdminOrderActions";

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  await connectDB();
  const order = await Order.findOne({ orderNumber: orderId }).lean();

  if (!order) {
    notFound();
  }

  const orderForClient = {
    orderNumber: order.orderNumber,
    status: order.status,
    delivery: order.delivery,
    items: order.items,
    subtotal: order.subtotal,
    deliveryCharge: order.deliveryCharge,
    total: order.total,
    createdAt: order.createdAt?.toISOString?.() || String(order.createdAt),
    receiptEmailSentAt: order.receiptEmailSentAt?.toISOString?.() || null,
    steadfastConsignmentId: order.steadfastConsignmentId ?? null,
    steadfastTrackingCode: order.steadfastTrackingCode ?? null,
    steadfastStatus: order.steadfastStatus ?? null,
    steadfastSentAt: order.steadfastSentAt?.toISOString?.() || null,
  };

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title"><span className="page-icon">🧾</span> Order {order.orderNumber}</h1>
          <p className="admin-page-subtitle">Review items, customer details, and download receipt.</p>
        </div>
        <AdminOrderActions order={orderForClient} />
      </div>

      <div className="admin-card">
        <div className="admin-card-header">Customer Details</div>
        <div className="admin-card-body" style={{ display: "grid", gap: "0.5rem" }}>
          <div><strong>Name:</strong> {order.delivery.fullName}</div>
          <div><strong>Phone:</strong> {order.delivery.phone}</div>
          {order.delivery.email && <div><strong>Email:</strong> {order.delivery.email}</div>}
          <div><strong>Address:</strong> {order.delivery.address}</div>
        </div>
      </div>

      <div className="admin-card" style={{ marginTop: "1rem" }}>
        <div className="admin-card-header">Order Items</div>
        <div className="admin-card-body">
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Serial</th>
                  <th>Product</th>
                  <th>Qty</th>
                  <th style={{ textAlign: "right" }}>Unit Price</th>
                  <th style={{ textAlign: "right" }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item: any, index: number) => (
                  <tr key={item.productId}>
                    <td>{index + 1}</td>
                    <td>{item.name}</td>
                    <td>{item.qty}</td>
                    <td style={{ textAlign: "right" }}>৳{item.unitPrice}</td>
                    <td style={{ textAlign: "right" }}>৳{item.lineTotal}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: "1rem", display: "flex", justifyContent: "flex-end" }}>
            <div style={{ minWidth: 240, display: "grid", gap: "0.35rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Subtotal</span>
                <strong style={{ textAlign: "right", minWidth: 90 }}>৳{order.subtotal}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Delivery Charge</span>
                <strong style={{ textAlign: "right", minWidth: 90 }}>৳{order.deliveryCharge}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid rgba(0,0,0,0.08)", paddingTop: "0.5rem" }}>
                <span>Total</span>
                <strong style={{ color: "var(--primary-pink, #E80281)", textAlign: "right", minWidth: 90 }}>৳{order.total}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
