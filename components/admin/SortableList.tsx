'use client';

import { useMemo, type CSSProperties, type ElementType, type ReactNode } from 'react';
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { CSS } from '@dnd-kit/utilities';

/** Swallows the click that follows a drop, so dropping onto a clickable card
 *  (e.g. a category card that navigates) doesn't also trigger it. */
function suppressNextClick() {
  const stop = (e: MouseEvent) => { e.stopPropagation(); e.preventDefault(); };
  window.addEventListener('click', stop, { capture: true, once: true });
  setTimeout(() => window.removeEventListener('click', stop, { capture: true }), 0);
}

/**
 * Drag-to-reorder container. `layout="grid"` handles multi-column CSS grids
 * (cards move in both axes); `layout="list"` is a single vertical column.
 * The list is only reordered on drop — during the drag items just shift via
 * transforms, so nothing re-renders or hits the API mid-gesture.
 */
export function SortableList<T extends { _id: string }>({
  items, onReorder, layout = 'list', as: Tag = 'div', className, style, children,
}: {
  items: T[];
  onReorder: (next: T[]) => void;
  layout?: 'grid' | 'list';
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const ids = useMemo(() => items.map((i) => i._id), [items]);

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    suppressNextClick();
    if (!over || active.id === over.id) return;
    const from = ids.indexOf(String(active.id));
    const to = ids.indexOf(String(over.id));
    if (from < 0 || to < 0) return;
    onReorder(arrayMove(items, from, to));
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      modifiers={layout === 'list' ? [restrictToVerticalAxis] : undefined}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={ids} strategy={layout === 'grid' ? rectSortingStrategy : verticalListSortingStrategy}>
        <Tag className={className} style={style}>{children}</Tag>
      </SortableContext>
    </DndContext>
  );
}

export type SortableHandle = ReturnType<typeof useSortableItem>['handle'];

/** Per-item hook: spread `setNodeRef`/`style` onto the item element and pass `handle` to <DragHandle>. */
export function useSortableItem(id: string) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } =
    useSortable({ id });
  const style: CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
    position: 'relative',
    zIndex: isDragging ? 20 : undefined,
  };
  return {
    setNodeRef,
    style,
    isDragging,
    handle: { setActivator: setActivatorNodeRef, attributes, listeners },
  };
}
