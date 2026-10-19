import mongoose, { type Model } from 'mongoose';

type OrderUpdate = { id: string; order: number };

/** Validates a `{ orders: [{ id, order }] }` body from the admin drag-to-reorder UI. */
export function parseOrders(body: unknown): OrderUpdate[] | null {
  const orders = (body as { orders?: unknown })?.orders;
  if (!Array.isArray(orders) || !orders.length) return null;
  const valid = orders.every(
    (o) => o && mongoose.isValidObjectId(o.id) && Number.isInteger(o.order) && o.order >= 0,
  );
  return valid ? (orders as OrderUpdate[]) : null;
}

/** Writes every item's new `order` in a single bulk operation. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- shared by several models; mongoose bulkWrite typing rejects a generic Model<T>
export async function applyOrders(model: Model<any>, orders: OrderUpdate[]): Promise<void> {
  await model.bulkWrite(
    orders.map((o) => ({ updateOne: { filter: { _id: o.id }, update: { $set: { order: o.order } } } })),
  );
}
