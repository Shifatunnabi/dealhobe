import mongoose, { Schema, Document, Model } from "mongoose";

export type OrderStatus = "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled";
export type CheckoutMethod = "guest" | "account";

export interface OrderItem {
  productId: string;
  name: string;
  image: string;
  unitPrice: number;
  qty: number;
  lineTotal: number;
}

export interface DeliveryDetails {
  fullName: string;
  phone: string;
  email?: string;
  area: "inside_dhaka" | "outside_dhaka";
  address: string;
  paymentMethod: "cash_on_delivery";
}

export interface IOrder extends Document {
  orderNumber: string;
  userId?: string;
  checkoutMethod: CheckoutMethod;
  status: OrderStatus;
  items: OrderItem[];
  delivery: DeliveryDetails;
  subtotal: number;
  deliveryCharge: number;
  total: number;
  receiptEmailSentAt?: Date;
  receiptEmailSending?: boolean;
  steadfastConsignmentId?: string;
  steadfastTrackingCode?: string;
  steadfastStatus?: string;
  steadfastSentAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<OrderItem>(
  {
    productId: { type: String, required: true },
    name: { type: String, required: true },
    image: { type: String, required: true },
    unitPrice: { type: Number, required: true },
    qty: { type: Number, required: true },
    lineTotal: { type: Number, required: true },
  },
  { _id: false },
);

const DeliverySchema = new Schema<DeliveryDetails>(
  {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String },
    area: { type: String, enum: ["inside_dhaka", "outside_dhaka"], required: true },
    address: { type: String, required: true },
    paymentMethod: { type: String, enum: ["cash_on_delivery"], required: true },
  },
  { _id: false },
);

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, required: true, unique: true },
    userId: { type: String },
    checkoutMethod: { type: String, enum: ["guest", "account"], required: true },
    status: {
      type: String,
      enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
      default: "Pending",
    },
    items: { type: [OrderItemSchema], required: true },
    delivery: { type: DeliverySchema, required: true },
    subtotal: { type: Number, required: true },
    deliveryCharge: { type: Number, required: true },
    total: { type: Number, required: true },
    receiptEmailSentAt: { type: Date },
    receiptEmailSending: { type: Boolean, default: false },
    steadfastConsignmentId: { type: String },
    steadfastTrackingCode: { type: String },
    steadfastStatus: { type: String },
    steadfastSentAt: { type: Date },
  },
  { timestamps: true },
);

const Order: Model<IOrder> = mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);

export default Order;
