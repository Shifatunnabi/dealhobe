import { useCallback, useRef } from 'react';

/** Renumbers a list to sequential 1..N order values matching its current position. */
export function renumbered<T extends { order: number }>(items: T[]): T[] {
  return items.map((item, i) => ({ ...item, order: i + 1 }));
}

/** Next order value for a new item in an "Add" form — one past the current max. */
export function nextOrder(items: Array<{ order: number }>): number {
  return items.reduce((max, i) => Math.max(max, i.order ?? 0), 0) + 1;
}

async function persistOrder(
  endpoint: string,
  before: Array<{ _id: string; order: number }>,
  after: Array<{ _id: string; order: number }>,
): Promise<void> {
  const beforeById = new Map(before.map((b) => [b._id, b.order]));
  const updates = after.filter((a) => beforeById.get(a._id) !== a.order);
  if (!updates.length) return;
  await Promise.all(
    updates.map((u) =>
      fetch(endpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: u._id, order: u.order }),
      }),
    ),
  );
}

/**
 * Debounces persisting a drag-reordered list until dragging settles (~400ms
 * of no further reordering) — framer-motion's Reorder.Group fires onReorder
 * on every pointer-crossing during a drag, not just at drop, so persisting
 * immediately would fire a request per crossing instead of one per gesture.
 */
export function useReorderPersist(endpoint: string) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const gestureStart = useRef<Array<{ _id: string; order: number }> | null>(null);

  return useCallback(
    (before: Array<{ _id: string; order: number }>, after: Array<{ _id: string; order: number }>) => {
      if (!gestureStart.current) gestureStart.current = before;
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        const original = gestureStart.current!;
        gestureStart.current = null;
        persistOrder(endpoint, original, after).catch(() => {});
      }, 400);
    },
    [endpoint],
  );
}
