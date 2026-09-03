import { FiMove } from 'react-icons/fi';
import type { DragControls } from 'framer-motion';

/** Grip icon that starts a framer-motion Reorder.Item drag — keeps the rest
 *  of the card/row (edit, delete, click-through links) free of drag gestures. */
export default function DragHandle({ dragControls }: { dragControls: DragControls }) {
  return (
    <div
      onPointerDown={(e) => dragControls.start(e)}
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
