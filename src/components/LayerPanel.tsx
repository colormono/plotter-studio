import { useState } from 'react'
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
import { CirclePlus } from 'lucide-react'
import { useDocumentStore } from '../store/document'
import { LayerItem } from './LayerItem'
import { Icon } from './Icon'
import { Technique } from '../types'

export function LayerPanel() {
  const document = useDocumentStore((s) => s.document)
  const activeLayerId = useDocumentStore((s) => s.activeLayerId)
  const reorderLayers = useDocumentStore((s) => s.reorderLayers)
  const addGridLayer = useDocumentStore((s) => s.addGridLayer)

  const [adding, setAdding] = useState(false)
  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState('#0A0A0A')
  const [newTechnique, setNewTechnique] = useState<Technique>('draw')

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  if (!document) return null

  const layers = [...document.layers].sort((a, b) => a.order - b.order)
  const ids = layers.map((l) => l.id)
  const isGrid = document.moduleId === 'grid'

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = ids.indexOf(active.id as string)
    const newIndex = ids.indexOf(over.id as string)
    reorderLayers(arrayMove(ids, oldIndex, newIndex))
  }

  function handleAddLayer() {
    const trimmed = newName.trim()
    if (!trimmed) return
    addGridLayer(trimmed, newColor, newTechnique)
    setNewName('')
    setAdding(false)
  }

  return (
    <div className="sec">
      <div className="sec__h">
        <span className="sec__t">Capas</span>
        {isGrid && (
          <button
            type="button"
            className="sec__a"
            onClick={() => setAdding((v) => !v)}
            title="Añadir capa"
            aria-label="Añadir capa"
            aria-expanded={adding}
          >
            <Icon icon={CirclePlus} size={14} strokeWidth={1.75} />
          </button>
        )}
      </div>

      {adding && isGrid && (
        <div className="add-layer" style={{ padding: '0 12px 10px', display: 'grid', gap: 8 }}>
          <input
            className="new-input"
            style={{ height: 30, fontSize: 12 }}
            placeholder="Nombre de capa"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            autoFocus
          />
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <label className="pen-wrap" title="Color">
              <span className="pen" style={{ background: newColor, width: 18, height: 18 }} />
              <input
                type="color"
                value={newColor}
                onChange={(e) => setNewColor(e.target.value)}
                className="pen-input"
                aria-label="Color de pluma"
              />
            </label>
            <select
              className="new-input"
              style={{ flex: 1, height: 30, fontSize: 12 }}
              value={newTechnique}
              onChange={(e) => setNewTechnique(e.target.value as Technique)}
              aria-label="Tipo de capa"
            >
              <option value="draw">Dibujo</option>
              <option value="cut">Corte</option>
            </select>
          </div>
          <button type="button" className="btn btn--primary" style={{ height: 30 }} onClick={handleAddLayer}>
            Añadir
          </button>
        </div>
      )}

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
