import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { useDocumentStore } from '../store/document'
import { LayerItem } from './LayerItem'
import styles from './LayerPanel.module.css'

export function LayerPanel() {
  const document = useDocumentStore((s) => s.document)
  const activeLayerId = useDocumentStore((s) => s.activeLayerId)
  const addLayer = useDocumentStore((s) => s.addLayer)
  const addTicTacToeModule = useDocumentStore((s) => s.addTicTacToeModule)
  const addTestSheetModule = useDocumentStore((s) => s.addTestSheetModule)
  const reorderLayers = useDocumentStore((s) => s.reorderLayers)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  if (!document) return null

  const layers = [...document.layers].sort((a, b) => a.order - b.order)
  const ids = layers.map((l) => l.id)

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = ids.indexOf(active.id as string)
    const newIndex = ids.indexOf(over.id as string)
    reorderLayers(arrayMove(ids, oldIndex, newIndex))
  }

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <span className={styles.label}>Layers</span>
        <button className={styles.addBtn} onClick={addLayer} title="Add grid layer" aria-label="Add layer">
          +
        </button>
        <button
          className={styles.addTttBtn}
          onClick={addTicTacToeModule}
          title="Add tictactoe module"
          aria-label="Add tictactoe module"
        >
          ✕○
        </button>
        <button
          className={styles.addTttBtn}
          onClick={addTestSheetModule}
          title="Add test sheet"
          aria-label="Add test sheet"
        >
          ⊕
        </button>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={ids} strategy={verticalListSortingStrategy}>
          <div className={styles.list}>
            {layers.length === 0 && (
              <p className={styles.empty}>No layers yet. Click + to add one.</p>
            )}
            {layers.map((layer) => (
              <LayerItem key={layer.id} layer={layer} isActive={layer.id === activeLayerId} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  )
}
