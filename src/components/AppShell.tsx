import { useDocumentStore } from '../store/document'
import { PlotterCanvas } from './PlotterCanvas'
import { LayerPanel } from './LayerPanel'
import styles from './AppShell.module.css'

export function AppShell() {
  const document = useDocumentStore((s) => s.document)
  const clearDocument = useDocumentStore((s) => s.clearDocument)

  if (!document) return null

  const visibleLayers = document.layers.filter((l) => l.visible)

  return (
    <div className={styles.shell}>
      <header className={styles.topbar}>
        <span className={styles.docName}>{document.name}</span>
        <span className={styles.format}>{document.paperFormat}</span>
        <button className={styles.newBtn} onClick={clearDocument}>
          New
        </button>
      </header>

      <div className={styles.body}>
        <aside className={styles.panelLeft} aria-label="Layers">
          <LayerPanel />
        </aside>

        <main className={styles.canvasArea}>
          <PlotterCanvas paperFormat={document.paperFormat} layers={visibleLayers} />
        </main>

        <aside className={styles.panelRight} aria-label="Properties">
          <p className={styles.panelLabel}>Properties</p>
        </aside>
      </div>
    </div>
  )
}
