import { useState, useRef, KeyboardEvent } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Layer } from '../types'
import { useDocumentStore } from '../store/document'
import { isGridSemanticLayer } from '../lib/grid-layers'

const PEN_LABELS: Record<string, string> = {
  cut: 'rojo · corte',
  frame: 'negro · 0.30mm',
  fill: 'negro · 0.30mm',
  organic: 'negro · 0.30mm',
  accent: 'azul · 0.30mm',
}

function penLabel(layer: Layer): string {
  if (layer.gridRole && PEN_LABELS[layer.gridRole]) return PEN_LABELS[layer.gridRole]!
  if (layer.technique === 'cut') return 'rojo · corte'
  if (layer.technique === 'mixed') return 'azul · 0.30mm'
  return 'negro · 0.30mm'
}

interface LayerItemProps {
  layer: Layer
  isActive: boolean
}

export function LayerItem({ layer, isActive }: LayerItemProps) {
  const updateLayer = useDocumentStore((s) => s.updateLayer)
  const removeLayer = useDocumentStore((s) => s.removeLayer)
  const setActiveLayer = useDocumentStore((s) => s.setActiveLayer)
  const isFixedGrid = isGridSemanticLayer(layer)

  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(layer.name)
  const inputRef = useRef<HTMLInputElement>(null)

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: layer.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  function commitRename() {
    const trimmed = draft.trim()
    if (trimmed && trimmed !== layer.name) updateLayer(layer.id, { name: trimmed })
    else setDraft(layer.name)
    setEditing(false)
  }

  function handleNameKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') commitRename()
    if (e.key === 'Escape') {
      setDraft(layer.name)
      setEditing(false)
    }
  }

  function handleDelete(e: React.MouseEvent) {
    e.stopPropagation()
    if (!confirm(`¿Eliminar capa "${layer.name}"?`)) return
    removeLayer(layer.id)
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={
        'layer' +
        (isActive ? ' is-sel' : '') +
        (layer.visible ? '' : ' is-hidden')
      }
      onClick={() => setActiveLayer(layer.id)}
    >
      <button
        type="button"
        className="grip"
        {...attributes}
        {...listeners}
        aria-label="Arrastrar para reordenar"
      >
        ⠿
      </button>

      <label className="pen-wrap" title="Color de pluma" onClick={(e) => e.stopPropagation()}>
        <span className="pen" style={{ background: layer.penColor }} />
        <input
          type="color"
          value={layer.penColor}
          onChange={(e) => updateLayer(layer.id, { penColor: e.target.value })}
          className="pen-input"
          aria-label="Color de pluma"
        />
      </label>

      <span className="lmeta">
        {editing ? (
          <input
            ref={inputRef}
            className="lname-input"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commitRename}
            onKeyDown={handleNameKeyDown}
            onClick={(e) => e.stopPropagation()}
            autoFocus
          />
        ) : (
          <span
            className="lname"
            onDoubleClick={(e) => {
              e.stopPropagation()
              setDraft(layer.name)
              setEditing(true)
              requestAnimationFrame(() => inputRef.current?.select())
            }}
          >
            {layer.name}
          </span>
        )}
        <span className="ltech">{penLabel(layer)}</span>
      </span>

      <span className="tech-tag">{layer.technique}</span>

      <button
        type="button"
        className="eye"
        onClick={(e) => {
          e.stopPropagation()
          updateLayer(layer.id, { visible: !layer.visible })
        }}
        aria-label={layer.visible ? 'Ocultar capa' : 'Mostrar capa'}
        title={layer.visible ? 'Ocultar' : 'Mostrar'}
      >
        {layer.visible ? '👁' : '○'}
      </button>

      {!isFixedGrid && (
        <button type="button" className="delete" onClick={handleDelete} aria-label="Eliminar capa">
          ✕
        </button>
      )}
    </div>
  )
}
