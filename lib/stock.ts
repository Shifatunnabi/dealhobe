import Product from "@/lib/models/Product";

type StockLine = { productId: string; variantKey?: string; qty: number };

/**
 * Variant-aware stock movement. A variant line moves both its own variant stock and
 * the product total (which mirrors the sum of variants); a plain line moves the total only.
 * `direction: -1` deducts (order placed / re-opened), `+1` returns stock (order cancelled).
 * Deductions are guarded so stock never goes negative; returns false if any line was short.
 */
export async function moveStock(lines: StockLine[], direction: 1 | -1): Promise<boolean> {
  const ops = lines.map((l) => {
    const delta = direction * l.qty;
    const guard = direction === -1 ? { $gte: l.qty } : undefined;
    if (l.variantKey) {
      return {
        updateOne: {
          filter: {
            _id: l.productId,
            variants: { $elemMatch: { key: l.variantKey, ...(guard ? { quantity: guard } : {}) } },
          },
          update: { $inc: { "variants.$.quantity": delta, quantity: delta } },
        },
      };
    }
    return {
      updateOne: {
        filter: { _id: l.productId, ...(guard ? { quantity: guard } : {}) },
        update: { $inc: { quantity: delta } },
      },
    };
  });
  if (!ops.length) return true;
  const res = await Product.bulkWrite(ops);
  return res.modifiedCount === ops.length;
}
