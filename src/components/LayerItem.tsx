import { useState, useRef, KeyboardEvent } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Layer, Technique } from '../types'
import { useDocumentStore } from '../store/document'
import styles from './LayerItem.module.css'

const TECHNIQUES: { value: Technique; label: string }[] = [
  { value: 'draw', label: 'Draw' },
  { value: 'cut', label: 'Cut' },
  { value: 'mixed', label: 'Mixed' },
]

interface LayerItemProps {
  layer: Layer
  isActive: boolean
}

export function LayerItem({ layer, isActive }: LayerItemProps) {
  const updateLayer = useDocumentStore((s) => s.updateLayer)
  const removeLayer = useDocumentStore((s) => s.removeLayer)
  const duplicateLayer = useDocumentStore((s) => s.duplicateLayer)
  const setActiveLayer = useDocumentStore((s) => s.setActiveLayer)

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

  function startEditing() {
    setDraft(layer.name)
    setEditing(true)
    requestAnimationFrame(() => inputRef.current?.select())
  }

  function handleDelete() {
    const hasContent = layer.moduleConfig && Object.keys(layer.moduleConfig).length > 0
    if (hasContent && !confirm(`Delete layer "${layer.name}"?`)) return
    removeLayer(layer.id)
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${styles.item} ${isActive ? styles.active : ''}`}
      onClick={() => setActiveLayer(layer.id)}
    >
      {/* Drag handle */}
      <button
        className={styles.dragHandle}
        {...attributes}
        {...listeners}
        aria-label="Drag to reorder"
        tabIndex={0}
      >
        ⠿
      </button>

      {/* Visibility toggle */}
      <button
        className={`${styles.visToggle} ${layer.visible ? '' : styles.hidden}`}
        onClick={(e) => {
          e.stopPropagation()
          updateLayer(layer.id, { visible: !layer.visible })
        }}
        aria-label={layer.visible ? 'Hide layer' : 'Show layer'}
        title={layer.visible ? 'Hide' : 'Show'}
      >
        {layer.visible ? '👁' : '○'}
      </button>

      {/* Color swatch */}
      <label
        className={styles.colorLabel}
        title="Pen color"
        onClick={(e) => e.stopPropagation()}
      >
        <span className={styles.colorSwatch} style={{ background: layer.penColor }} />
        <input
          type="color"
          value={layer.penColor}
          onChange={(e) => updateLayer(layer.id, { penColor: e.target.value })}
          className={styles.colorInput}
          aria-label="Pen color"
        />
      </label>

      {/* Name */}
      <div className={styles.nameWrap}>
        {editing ? (
          <input
            ref={inputRef}
            className={styles.nameInput}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commitRename}
            onKeyDown={handleNameKeyDown}
            onClick={(e) => e.stopPropagation()}
            autoFocus
          />
        ) : (
          <span className={styles.name} onDoubleClick={startEditing} title="Double-click to rename">
            {layer.name}
          </span>
        )}
      </div>

      {/* Technique selector */}
      <select
        className={styles.technique}
        value={layer.technique}
        onChange={(e) => updateLayer(layer.id, { technique: e.target.value as Technique })}
        onClick={(e) => e.stopPropagation()}
        aria-label="Technique"
      >
        {TECHNIQUES.map((t) => (
          <option key={t.value} value={t.value}>
            {t.label}
          </option>
        ))}
      </select>

      {/* Actions */}
      <div className={styles.actions}>
        <button
          className={styles.actionBtn}
          onClick={(e) => {
            e.stopPropagation()
            duplicateLayer(layer.id)
          }}
          title="Duplicate layer"
          aria-label="Duplicate"
        >
          ⧉
        </button>
        <button
          className={`${styles.actionBtn} ${styles.deleteBtn}`}
          onClick={(e) => {
            e.stopPropagation()
            handleDelete()
          }}
          title="Delete layer"
          aria-label="Delete"
        >
          ✕
        </button>
      </div>
    </div>
  )
}
