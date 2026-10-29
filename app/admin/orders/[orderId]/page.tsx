import connectDB from "@/lib/mongodb";
import Order from "@/lib/models/Order";
import { notFound } from "next/navigation";
import { FiFileText } from 'react-icons/fi';
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
      <div className="admin-page-header order-detail-header">
        <div>
          <h1 className="admin-page-title"><span className="page-icon"><FiFileText size={20} /></span> Order {order.orderNumber}</h1>
          <p className="admin-page-subtitle">Review items, customer details, and download receipt.</p>
        </div>
        <AdminOrderActions order={orderForClient} />
      </div>

      <div className="admin-card">
        <div className="admin-card-header">Customer Details</div>
        <div className="admin-card-body">
          <dl className="admin-dl">
            <dt>Name</dt><dd>{order.delivery.fullName}</dd>
            <dt>Phone</dt><dd>{order.delivery.phone}</dd>
            {order.delivery.email && <><dt>Email</dt><dd>{order.delivery.email}</dd></>}
            <dt>Address</dt><dd>{order.delivery.address}</dd>
          </dl>
        </div>
      </div>

      <div className="admin-card" style={{ marginTop: "1rem" }}>
        <div className="admin-card-header">Order Items</div>
        <div className="admin-card-body">
          <div className="admin-table-wrap admin-table-wrap--stack">
            <table className="admin-table admin-table--stack">
              <thead>
                <tr>
                  <th>Serial</th>
                  <th>Product</th>
                  <th>Qty</th>
                  <th className="num">Unit Price</th>
                  <th className="num">Total</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item: any, index: number) => (
                  <tr key={`${item.productId}-${item.variantKey || index}`}>
                    <td className="hide-stacked">{index + 1}</td>
                    <td className="cell-head"><div><span className="cell-title">{item.name}{item.variantLabel ? ` (${item.variantLabel})` : ""}</span>{item.variantSku && <div className="cell-mono">{item.variantSku}</div>}</div></td>
                    <td data-label="Qty">{item.qty}</td>
                    <td data-label="Unit Price" className="num">৳{item.unitPrice}</td>
                    <td data-label="Total" className="num">৳{item.lineTotal}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="order-totals">
            <div>
              <span>Subtotal</span>
              <strong>৳{order.subtotal}</strong>
            </div>
            <div>
              <span>Delivery Charge</span>
              <strong>৳{order.deliveryCharge}</strong>
            </div>
            <div className="is-grand">
              <span>Total</span>
              <strong>৳{order.total}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
