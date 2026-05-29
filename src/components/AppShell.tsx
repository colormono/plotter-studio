import { useMemo, useCallback, useRef, useState } from 'react'
import { useDocumentStore } from '../store/document'
import { PlotterCanvas } from './PlotterCanvas'
import { LayerPanel } from './LayerPanel'
import { CollectionsPanel } from './CollectionsPanel'
import { GridConfigPanel } from './GridConfigPanel'
import { TicTacToePanel } from './TicTacToePanel'
import { PAPER_DIMENSIONS, GridConfig } from '../types'
import { DEFAULT_GRID_CONFIG } from '../lib/modules/grid'
import { findMinCellSizeRecursive } from '../lib/grid'
import { buildExportSvg, downloadSvg } from '../lib/export'
import { downloadDocument, openDocumentFromFile } from '../lib/persistence'
import styles from './AppShell.module.css'

const RESOLUTION_THRESHOLD_MM = 2

export function AppShell() {
  const document = useDocumentStore((s) => s.document)
  const clearDocument = useDocumentStore((s) => s.clearDocument)
  const loadDocument = useDocumentStore((s) => s.loadDocument)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [openError, setOpenError] = useState<string | null>(null)

  const resolutionWarning = useMemo(() => {
    if (!document) return null
    const paper = PAPER_DIMENSIONS[document.paperFormat]
    const bounds = { x: 0, y: 0, width: paper.width, height: paper.height }

    let globalMinW = Infinity
    let globalMinH = Infinity

    for (const layer of document.layers) {
      if (!layer.visible || layer.module !== 'grid') continue
      const config: GridConfig = { ...DEFAULT_GRID_CONFIG, ...(layer.moduleConfig as Partial<GridConfig>) }
      const { width, height } = findMinCellSizeRecursive(config, bounds, document.maxGridDepth)
      if (width < globalMinW) globalMinW = width
      if (height < globalMinH) globalMinH = height
    }

    if (globalMinW === Infinity) return null
    const minDim = Math.min(globalMinW, globalMinH)
    if (minDim < RESOLUTION_THRESHOLD_MM) {
      return minDim
    }
    return null
  }, [document])

  const handleExport = useCallback(() => {
    if (!document) return
    const visibleLayers = document.layers.filter((l) => l.visible)
    const svgString = buildExportSvg(document, visibleLayers)
    downloadSvg(svgString, document.name)
  }, [document])

  const handleSave = useCallback(() => {
    if (!document) return
    downloadDocument(document)
  }, [document])

  const handleOpenClick = useCallback(() => {
    setOpenError(null)
    fileInputRef.current?.click()
  }, [])

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return
      openDocumentFromFile(
        file,
        (doc) => {
          loadDocument(doc)
          setOpenError(null)
        },
        (msg) => setOpenError(msg),
      )
      e.target.value = ''
    },
    [loadDocument],
  )

  if (!document) return null

  const visibleLayers = document.layers.filter((l) => l.visible)

  return (
    <div className={styles.shell}>
      <header className={styles.topbar}>
        <span className={styles.docName}>{document.name}</span>
        <span className={styles.format}>{document.paperFormat}</span>
        <button className={styles.exportBtn} onClick={handleExport} aria-label="Export SVG">
          Export SVG
        </button>
        <button className={styles.saveBtn} onClick={handleSave} aria-label="Save document">
          Save
        </button>
        <button className={styles.openBtn} onClick={handleOpenClick} aria-label="Open document">
          Open
        </button>
        <button className={styles.newBtn} onClick={clearDocument}>
          New
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".plotter.json"
          onChange={handleFileChange}
          aria-hidden="true"
          style={{ display: 'none' }}
        />
      </header>

      {openError && (
        <div className={styles.openError} role="alert">
          <span>⚠</span>
          <span>{openError}</span>
          <button onClick={() => setOpenError(null)} aria-label="Dismiss error">✕</button>
        </div>
      )}

      {resolutionWarning !== null && (
        <div className={styles.resolutionWarning} role="alert">
          <span>⚠</span>
          <span>
            Minimum cell size <strong>{resolutionWarning.toFixed(2)} mm</strong> — below plotter
            resolution threshold ({RESOLUTION_THRESHOLD_MM} mm). Some cells may not plot correctly.
          </span>
        </div>
      )}

      <div className={styles.body}>
        <aside className={styles.panelLeft} aria-label="Layers">
          <LayerPanel />
          <GridConfigPanel />
          <TicTacToePanel />
        </aside>

        <main className={styles.canvasArea}>
          <PlotterCanvas document={document} layers={visibleLayers} />
        </main>

        <aside className={styles.panelRight} aria-label="Properties">
          <CollectionsPanel />
        </aside>
      </div>
    </div>
  )
}
