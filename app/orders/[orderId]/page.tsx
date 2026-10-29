import connectDB from "@/lib/mongodb";
import Order from "@/lib/models/Order";
import { notFound } from "next/navigation";
import Link from "next/link";
import { FiChevronRight, FiDownload } from "react-icons/fi";
import {
  Card,
  CardTitle,
  ContinueShopping,
  DeliveryDetails,
  HelpCard,
  OrderItems,
  OrderTimeline,
  OrderTotals,
  StatusPill,
  formatOrderDate,
  type OrderView,
} from "@/components/checkout/OrderParts";

export default async function OrderDetailPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  await connectDB();
  const found = await Order.findOne({ orderNumber: orderId }).lean();

  if (!found) {
    notFound();
  }
  const order = found as unknown as OrderView;

  return (
    <div className="min-h-screen bg-soft-bg pb-24 pt-5 md:pt-8">
      <div className="shell max-w-5xl">
        <nav aria-label="Breadcrumb" className="mb-2 flex items-center gap-1.5 text-xs text-text-muted">
          <Link href="/profile" className="transition-colors hover:text-primary-pink">My account</Link>
          <FiChevronRight size={12} />
          <span className="font-semibold text-text-dark">Order {order.orderNumber}</span>
        </nav>

        <div className="mb-5 flex flex-wrap items-end justify-between gap-4 md:mb-7">
          <div>
            <h1 className="font-display text-3xl font-semibold text-text-dark md:text-[40px]">Order {order.orderNumber}</h1>
            <p className="mt-1.5 flex flex-wrap items-center gap-2 text-sm text-text-muted">
              <StatusPill status={order.status} />
              {order.createdAt && <span>Placed on {formatOrderDate(order.createdAt)}</span>}
              <span aria-hidden>·</span>
              <span>Cash on delivery</span>
            </p>
          </div>
          <div className="flex w-full flex-col gap-2.5 sm:w-auto sm:flex-row">
            <Link
              href={`/receipt/${order.orderNumber}`}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-primary-pink px-6 text-[15px] font-semibold text-white shadow-button transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-hover"
            >
              <FiDownload size={16} />
              View receipt
            </Link>
            <ContinueShopping />
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="min-w-0 space-y-5">
            <Card>
              <CardTitle>Delivery status</CardTitle>
              <OrderTimeline status={order.status} createdAt={order.createdAt} trackingCode={order.steadfastTrackingCode} />
            </Card>
            <Card>
              <CardTitle>Items ({order.items.reduce((n, i) => n + i.qty, 0)})</CardTitle>
              <OrderItems items={order.items} />
            </Card>
          </div>
          <div className="space-y-5">
            <Card>
              <CardTitle>Payment summary</CardTitle>
              <OrderTotals order={order} />
            </Card>
            <Card>
              <CardTitle>Delivering to</CardTitle>
              <DeliveryDetails order={order} />
            </Card>
            <HelpCard />
          </div>
        </div>
      </div>
    </div>
  );
}
