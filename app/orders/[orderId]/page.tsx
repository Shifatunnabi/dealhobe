import connectDB from "@/lib/mongodb";
import Order from "@/lib/models/Order";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function OrderDetailPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  await connectDB();
  const order = await Order.findOne({ orderNumber: orderId }).lean();

  if (!order) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-soft-bg pt-34 pb-24">
      <div className="mx-auto max-w-5xl px-section">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h1 className="font-inter text-2xl font-bold text-text-dark">Order {order.orderNumber}</h1>
          <span className="rounded-2xl bg-white px-4 py-2 font-inter text-lg font-semibold text-primary-pink shadow-card">
            Total - ৳{order.total.toLocaleString()}
          </span>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-card">
          <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm text-text-muted">Delivery Details</p>
              <p className="mt-1 font-inter text-base font-semibold text-text-dark">{order.delivery.fullName}</p>
              <p className="text-sm text-text-muted">{order.delivery.phone}</p>
              {order.delivery.email && (
                <p className="text-sm text-text-muted">{order.delivery.email}</p>
              )}
              <p className="mt-2 text-sm text-text-muted">{order.delivery.address}</p>
            </div>
            <div className="text-sm text-text-muted">
              <p>Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
              <p className="mt-1">Payment: Cash on Delivery</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100 text-xs uppercase tracking-wider text-text-muted">
                  <th className="py-3 pr-2">#</th>
                  <th className="py-3 pr-2">Product</th>
                  <th className="py-3 pr-2">Qty</th>
                  <th className="py-3 pr-2 text-right">Unit</th>
                  <th className="py-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item: any, index: number) => (
                  <tr key={item.productId} className="border-b border-gray-100 last:border-b-0">
                    <td className="py-3 pr-2 text-sm text-text-muted">{index + 1}</td>
                    <td className="py-3 pr-2 font-inter text-sm font-semibold text-text-dark">
                      {item.name}
                    </td>
                    <td className="py-3 pr-2 text-sm text-text-muted">{item.qty}</td>
                    <td className="py-3 pr-2 text-sm text-text-muted text-right">৳{item.unitPrice}</td>
                    <td className="py-3 text-sm font-semibold text-primary-pink text-right">৳{item.lineTotal}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex flex-col items-end gap-2 text-sm">
            <div className="flex w-full max-w-xs items-center justify-between">
              <span className="text-text-muted">Subtotal</span>
              <span className="font-semibold text-text-dark text-right w-24">৳{order.subtotal}</span>
            </div>
            <div className="flex w-full max-w-xs items-center justify-between">
              <span className="text-text-muted">Delivery Charge</span>
              <span className="font-semibold text-text-dark text-right w-24">৳{order.deliveryCharge}</span>
            </div>
            <div className="flex w-full max-w-xs items-center justify-between border-t border-gray-100 pt-2">
              <span className="font-semibold text-text-dark">Total</span>
              <span className="font-semibold text-primary-pink text-right w-24">৳{order.total}</span>
            </div>
          </div>

          <div className="mt-8">
            <Link
              href={`/receipt/${order.orderNumber}`}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-primary px-6 py-3 font-inter font-semibold text-white shadow-button transition-shadow hover:shadow-hover"
            >
              View Receipt
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
