import { FiMove } from 'react-icons/fi';
import type { SortableHandle } from './SortableList';

/** Grip icon that starts a sortable drag — keeps the rest of the card/row
 *  (edit, delete, click-through links) free of drag gestures. */
export default function DragHandle({ handle: { setActivator, attributes, listeners } }: { handle: SortableHandle }) {
  return (
    <div
      ref={setActivator}
      {...attributes}
      {...listeners}
      onClick={(e) => e.stopPropagation()}
      className="drag-handle"
      style={{
        cursor: 'grab',
        touchAction: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--text-muted)',
        flexShrink: 0,
      }}
      aria-label="Drag to reorder"
      title="Drag to reorder"
    >
      <FiMove size={16} />
    </div>
  );
}
