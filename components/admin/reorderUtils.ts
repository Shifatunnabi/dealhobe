/** Renumbers a list to sequential 1..N order values matching its current position. */
export function renumbered<T extends { order: number }>(items: T[]): T[] {
  return items.map((item, i) => ({ ...item, order: i + 1 }));
}

/** Next order value for a new item in an "Add" form — one past the current max. */
export function nextOrder(items: Array<{ order: number }>): number {
  return items.reduce((max, i) => Math.max(max, i.order ?? 0), 0) + 1;
}

// Saves are chained per endpoint so two quick drops can't land out of order.
const queues = new Map<string, Promise<unknown>>();

/** Persists a whole reordered list in one PATCH request (see lib/reorder.ts). Rejects on failure. */
export function saveOrder(endpoint: string, items: Array<{ _id: string; order: number }>): Promise<void> {
  const run = async () => {
    const res = await fetch(endpoint, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orders: items.map((i) => ({ id: i._id, order: i.order })) }),
    });
    if (!res.ok) throw new Error(`Reorder failed (${res.status})`);
  };
  const next = (queues.get(endpoint) ?? Promise.resolve()).catch(() => {}).then(run);
  queues.set(endpoint, next);
  return next;
}
