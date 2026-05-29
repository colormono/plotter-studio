import { useDocumentStore } from '../store/document'
import { COLLECTIONS } from '../lib/collections'
import styles from './CollectionsPanel.module.css'

export function CollectionsPanel() {
  const document = useDocumentStore((s) => s.document)
  const activeLayerId = useDocumentStore((s) => s.activeLayerId)
  const updateLayer = useDocumentStore((s) => s.updateLayer)

  if (!document) return null

  const activeLayer = document.layers.find((l) => l.id === activeLayerId)

  if (!activeLayer) {
    return (
      <div className={styles.panel}>
        <div className={styles.header}>
          <span className={styles.label}>Collections</span>
        </div>
        <p className={styles.empty}>Select a layer to assign collections.</p>
      </div>
    )
  }

  const isMixed = activeLayer.technique === 'mixed'

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <span className={styles.label}>Collections</span>
        <span className={styles.layerName}>{activeLayer.name}</span>
      </div>

      <div className={styles.body}>
        <label className={styles.field}>
          <span className={styles.fieldLabel}>
            {isMixed ? 'Draw collection' : 'Primary collection'}
          </span>
          <div className={styles.selectRow}>
            {COLLECTIONS.map((col) => (
              <button
                key={col.id}
                className={`${styles.colBtn} ${activeLayer.primaryCollection === col.id ? styles.selected : ''}`}
                onClick={() => updateLayer(activeLayer.id, { primaryCollection: col.id })}
                title={col.label}
              >
                {col.label}
              </button>
            ))}
          </div>
        </label>

        <label className={styles.field}>
          <span className={styles.fieldLabel}>
            {isMixed ? 'Cut collection' : 'Secondary collection'}
          </span>
          <div className={styles.selectRow}>
            <button
              className={`${styles.colBtn} ${activeLayer.secondaryCollection === null ? styles.selected : ''}`}
              onClick={() => updateLayer(activeLayer.id, { secondaryCollection: null })}
            >
              None
            </button>
            {COLLECTIONS.map((col) => (
              <button
                key={col.id}
                className={`${styles.colBtn} ${activeLayer.secondaryCollection === col.id ? styles.selected : ''}`}
                onClick={() => updateLayer(activeLayer.id, { secondaryCollection: col.id })}
                title={col.label}
              >
                {col.label}
              </button>
            ))}
          </div>
        </label>
      </div>
    </div>
  )
}
