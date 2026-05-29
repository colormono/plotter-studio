import { useMemo, useCallback, useRef, useState, useEffect } from 'react'
import type { KeyboardEvent as ReactKeyboardEvent } from 'react'
import { useDocumentStore } from '../store/document'
import { PlotterCanvas } from './PlotterCanvas'
import { LayerPanel } from './LayerPanel'
import { ModulePanel, ModuleId } from './ModulePanel'
import { CollectionsPanel } from './CollectionsPanel'
import { PaperPanel } from './PaperPanel'
import { GridConfigPanel } from './GridConfigPanel'
import { TicTacToePanel } from './TicTacToePanel'
import { generateArt } from '../lib/art-engine'
import { formatPaperLabel, getPaperDimensions } from '../lib/paper'
import { buildExportSvg, downloadSvg } from '../lib/export'
import { downloadDocument, openDocumentFromFile } from '../lib/persistence'

function countStrokes(art: ReturnType<typeof generateArt>, visibleLayerIds: Set<string>, document: NonNullable<ReturnType<typeof useDocumentStore.getState>['document']>) {
  let count = 0
  for (const layer of document.layers) {
    if (!visibleLayerIds.has(layer.id) || layer.module !== 'grid' || !layer.gridRole) continue
    count += art.layers[layer.gridRole]?.length ?? 0
  }
  return count
}

function DocNameEditor({ name, onCommit }: { name: string; onCommit: (name: string) => void }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(name)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!editing) setDraft(name)
  }, [name, editing])

  function commit() {
    const trimmed = draft.trim()
    if (trimmed) onCommit(trimmed)
    else setDraft(name)
    setEditing(false)
  }

  function handleKeyDown(e: ReactKeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') commit()
    if (e.key === 'Escape') {
      setDraft(name)
      setEditing(false)
    }
  }

  function startEditing() {
    setDraft(name)
    setEditing(true)
    requestAnimationFrame(() => inputRef.current?.select())
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        className="nm-input"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={handleKeyDown}
        aria-label="Nombre del documento"
        autoFocus
      />
    )
  }

  return (
    <span
      className="nm"
      onDoubleClick={startEditing}
      title="Doble clic para renombrar"
    >
      {name}
    </span>
  )
}

export function AppShell() {
  const document = useDocumentStore((s) => s.document)
  const clearDocument = useDocumentStore((s) => s.clearDocument)
  const loadDocument = useDocumentStore((s) => s.loadDocument)
  const updateDocumentName = useDocumentStore((s) => s.updateDocumentName)
  const regenerate = useDocumentStore((s) => s.regenerate)
  const addTicTacToeModule = useDocumentStore((s) => s.addTicTacToeModule)
  const addTestSheetModule = useDocumentStore((s) => s.addTestSheetModule)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [openError, setOpenError] = useState<string | null>(null)
  const [activeModule, setActiveModule] = useState<ModuleId>('grid')

  const art = useMemo(() => (document ? generateArt(document) : null), [document])

  const exportStats = useMemo(() => {
    if (!document || !art) return null
    const visibleIds = new Set(document.layers.filter((l) => l.visible).map((l) => l.id))
    return {
      size: formatPaperLabel(document),
      layers: document.layers.filter((l) => l.visible).length,
      prims: countStrokes(art, visibleIds, document),
      cells: art.stats.cellCount,
    }
  }, [document, art])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'r' && !e.metaKey && !e.ctrlKey && e.target instanceof HTMLElement) {
        const tag = e.target.tagName
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
        regenerate()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [regenerate])

  const handleExport = useCallback(() => {
    if (!document) return
    const visibleLayers = document.layers.filter((l) => l.visible)
    downloadSvg(buildExportSvg(document, visibleLayers), document.name)
  }, [document])

  const handleSave = useCallback(() => {
    if (document) downloadDocument(document)
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
  const paper = getPaperDimensions(document)

  return (
    <div className={'shell' + (openError ? ' shell--error' : '')}>
      <header className="topbar">
        <div className="brand">
          <span className="glyph" aria-hidden />
          <span className="wm">Plotter Studio</span>
        </div>
        <div style={{ width: 1, height: 22, background: 'var(--hairline)' }} aria-hidden />
        <div className="docname">
          <DocNameEditor name={document.name} onCommit={updateDocumentName} />
          <span className="ext">.plotter.json</span>
        </div>
        <div className="tb-sp" />
        {art && (
          <div className="tb-meta">
            <span>
              <b>{art.stats.cellCount}</b> celdas
            </span>
            {exportStats && (
              <span>
                <b>{exportStats.prims}</b> trazos
              </span>
            )}
          </div>
        )}
        <button type="button" className="btn" onClick={regenerate}>
          ↻ Regenerar
        </button>
        <button type="button" className="btn btn--primary" onClick={handleExport}>
          ↓ Exportar
        </button>
        <button type="button" className="btn btn--ghost" onClick={handleSave}>
          Guardar
        </button>
        <button type="button" className="btn btn--ghost" onClick={handleOpenClick}>
          Abrir
        </button>
        <button type="button" className="btn btn--ghost" onClick={clearDocument}>
          Nuevo
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
        <div className="banner banner--error" role="alert">
          <span>⚠</span>
          <span>{openError}</span>
          <button type="button" onClick={() => setOpenError(null)} aria-label="Cerrar">
            ✕
          </button>
        </div>
      )}

      <aside className="rail rail--l" aria-label="Módulos y capas">
        <PaperPanel />
        <ModulePanel activeModule={activeModule} onModule={setActiveModule} />
        <LayerPanel
          onAddTictactoe={() => {
            addTicTacToeModule()
            setActiveModule('tictactoe')
          }}
          onAddTestSheet={() => {
            addTestSheetModule()
            setActiveModule('test-sheet')
          }}
        />
      </aside>

      <main className="stage">
        <PlotterCanvas
          document={document}
          layers={visibleLayers}
          paperWidth={paper.width}
          paperHeight={paper.height}
          moduleLabel={activeModule}
        />
      </main>

      <aside className="rail rail--r" aria-label="Parámetros">
        {activeModule === 'grid' && (
          <>
            <GridConfigPanel art={art} />
            <CollectionsPanel />
            {exportStats && (
              <div className="sec">
                <div className="sec__h">
                  <span className="sec__t">Exportar</span>
                </div>
                <div className="kv">
                  <span className="k">formato</span>
                  <span className="v">{exportStats.size}</span>
                </div>
                <div className="kv">
                  <span className="k">capas visibles</span>
                  <span className="v">{exportStats.layers}</span>
                </div>
                <div className="kv">
                  <span className="k">trazos</span>
                  <span className="v">{exportStats.prims}</span>
                </div>
                <div className="kv">
                  <span className="k">celdas</span>
                  <span className="v">{exportStats.cells}</span>
                </div>
                <button
                  type="button"
                  className="btn btn--primary"
                  style={{ width: '100%', height: 34, marginTop: 8 }}
                  onClick={handleExport}
                >
                  Exportar SVG
                </button>
              </div>
            )}
          </>
        )}
        {activeModule === 'tictactoe' && <TicTacToePanel />}
        {activeModule === 'test-sheet' && (
          <div className="sec">
            <div className="sec__h">
              <span className="sec__t">test-sheet</span>
            </div>
            <p className="help">Añade una capa test-sheet desde el panel de capas (⊕).</p>
          </div>
        )}
      </aside>
    </div>
  )
}
