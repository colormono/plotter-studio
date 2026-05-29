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

interface LayerPanelProps {
  onAddTictactoe: () => void
  onAddTestSheet: () => void
}

export function LayerPanel({ onAddTictactoe, onAddTestSheet }: LayerPanelProps) {
  const document = useDocumentStore((s) => s.document)
  const activeLayerId = useDocumentStore((s) => s.activeLayerId)
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
    <div className="sec sec--grow">
      <div className="sec__h">
        <span className="sec__t">Capas</span>
        <span style={{ display: 'flex', gap: 4 }}>
          <button
            type="button"
            className="sec__a"
            onClick={onAddTictactoe}
            title="Añadir tictactoe"
            aria-label="Añadir tictactoe"
          >
            ✕○
          </button>
          <button
            type="button"
            className="sec__a"
            onClick={onAddTestSheet}
            title="Añadir test sheet"
            aria-label="Añadir test sheet"
          >
            ⊕
          </button>
        </span>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={ids} strategy={verticalListSortingStrategy}>
          <div className="layers">
            {layers.map((layer) => (
              <LayerItem key={layer.id} layer={layer} isActive={layer.id === activeLayerId} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  )
}
