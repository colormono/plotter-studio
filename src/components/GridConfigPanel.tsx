import { useState } from 'react'
import { useDocumentStore } from '../store/document'
import { GridConfig, Cell } from '../types'
import { DEFAULT_GRID_CONFIG, DEFAULT_SUBGRID_CONFIG } from '../lib/modules/grid'
import { generateValues, GeneratorMode, GeneratorOptions } from '../lib/generators'
import styles from './GridConfigPanel.module.css'

const COLLECTIONS_WITH_VALUES: Record<string, number> = {
  'regular-textures': 6,
  'geometric-shapes': 5,
  dice: 6,
  'irregular-textures': 4,
  silence: 1,
}

function parseWeights(raw: string): number[] | null {
  const trimmed = raw.trim()
  if (!trimmed) return null
  const parts = trimmed.split(',').map((s) => parseFloat(s.trim()))
  if (parts.some(isNaN)) return null
  return parts
}

function formatWeights(w: number[] | null): string {
  return w ? w.join(', ') : ''
}

function buildCells(rows: number, cols: number, values: number[][]): Cell[][] {
  return Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => ({
      primaryValue: values[r]?.[c] ?? 0,
      secondaryValue: null,
      subgrid: null,
    })),
  )
}

function buildDefaultSubgridCells(rows: number, cols: number, maxValue: number): Cell[][] {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({
      primaryValue: Math.floor(Math.random() * maxValue) + 1,
      secondaryValue: null,
      subgrid: null,
    })),
  )
}

interface CellGridEditorProps {
  config: GridConfig
  layerId: string
  maxValue: number
  maxDepth: number
}

function CellGridEditor({ config, layerId, maxValue, maxDepth }: CellGridEditorProps) {
  const [selected, setSelected] = useState<[number, number] | null>(null)
  const updateModuleConfig = useDocumentStore((s) => s.updateModuleConfig)
  const updateCellSubgrid = useDocumentStore((s) => s.updateCellSubgrid)

  function patchCell(r: number, c: number, patch: Partial<Cell>) {
    const cells: Cell[][] = Array.from({ length: config.rows }, (_, ri) =>
      Array.from({ length: config.cols }, (_, ci) => ({
        primaryValue: 0,
        secondaryValue: null,
        subgrid: null,
        ...(config.cells[ri]?.[ci] ?? {}),
        ...(ri === r && ci === c ? patch : {}),
      })),
    )
    updateModuleConfig(layerId, { ...config, cells })
  }

  const selectedCell =
    selected !== null ? (config.cells[selected[0]]?.[selected[1]] ?? null) : null
  const hasSubgrid = selectedCell?.subgrid != null
  const currentDepth = 0

  return (
    <fieldset className={styles.fieldset}>
      <legend>Cells</legend>

      <div
        className={styles.cellGrid}
        style={{ gridTemplateColumns: `repeat(${config.cols}, 1fr)` }}
        role="grid"
        aria-label="Cell grid editor"
      >
        {Array.from({ length: config.rows }, (_, r) =>
          Array.from({ length: config.cols }, (_, c) => {
            const cell = config.cells[r]?.[c]
            const isSelected = selected?.[0] === r && selected?.[1] === c
            const isSub = cell?.subgrid != null

            return (
              <button
                key={`${r}-${c}`}
                role="gridcell"
                aria-label={`Cell ${r + 1},${c + 1}${isSub ? ' (subgrid)' : ` value ${cell?.primaryValue ?? 0}`}`}
                aria-selected={isSelected}
                className={`${styles.cellBtn} ${isSelected ? styles.cellSelected : ''} ${isSub ? styles.cellSub : ''}`}
                onClick={() => setSelected(isSelected ? null : [r, c])}
              >
                {isSub ? (
                  <span className={styles.subIcon} aria-hidden>⊞</span>
                ) : (
                  <span className={styles.cellVal}>{cell?.primaryValue ?? 0}</span>
                )}
              </button>
            )
          }),
        )}
      </div>

      {selected !== null && (
        <div className={styles.cellDetail}>
          {hasSubgrid ? (
            <>
              <span className={styles.cellDetailLabel}>
                Subgrid ({selected[0] + 1},{selected[1] + 1})
              </span>
              <div className={styles.row2}>
                <label className={styles.field}>
                  <span>Rows</span>
                  <input
                    type="number"
                    min={1}
                    max={16}
                    value={selectedCell!.subgrid!.rows}
                    className={styles.numInput}
                    onChange={(e) => {
                      const rows = Math.max(1, parseInt(e.target.value) || 1)
                      const cols = selectedCell!.subgrid!.cols
                      patchCell(selected[0], selected[1], {
                        subgrid: {
                          ...selectedCell!.subgrid!,
                          rows,
                          cells: buildDefaultSubgridCells(rows, cols, maxValue),
                        },
                      })
                    }}
                  />
                </label>
                <label className={styles.field}>
                  <span>Cols</span>
                  <input
                    type="number"
                    min={1}
                    max={16}
                    value={selectedCell!.subgrid!.cols}
                    className={styles.numInput}
                    onChange={(e) => {
                      const cols = Math.max(1, parseInt(e.target.value) || 1)
                      const rows = selectedCell!.subgrid!.rows
                      patchCell(selected[0], selected[1], {
                        subgrid: {
                          ...selectedCell!.subgrid!,
                          cols,
                          cells: buildDefaultSubgridCells(rows, cols, maxValue),
                        },
                      })
                    }}
                  />
                </label>
              </div>
              <label className={styles.field}>
                <span>Gutter (mm)</span>
                <input
                  type="number"
                  min={0}
                  step={0.5}
                  value={selectedCell!.subgrid!.gutter}
                  className={styles.numInput}
                  onChange={(e) =>
                    patchCell(selected[0], selected[1], {
                      subgrid: {
                        ...selectedCell!.subgrid!,
                        gutter: Math.max(0, parseFloat(e.target.value) || 0),
                      },
                    })
                  }
                />
              </label>
              <button
                className={styles.removeSubBtn}
                onClick={() => updateCellSubgrid(layerId, selected[0], selected[1], null)}
              >
                Remove subgrid
              </button>
            </>
          ) : (
            <>
              <span className={styles.cellDetailLabel}>
                Cell ({selected[0] + 1},{selected[1] + 1})
              </span>
              <label className={styles.field}>
                <span>Value (0–{maxValue})</span>
                <input
                  type="number"
                  min={0}
                  max={maxValue}
                  value={selectedCell?.primaryValue ?? 0}
                  className={styles.numInput}
                  onChange={(e) =>
                    patchCell(selected[0], selected[1], {
                      primaryValue: Math.min(maxValue, Math.max(0, parseInt(e.target.value) || 0)),
                    })
                  }
                />
              </label>
              {currentDepth < maxDepth && (
                <button
                  className={styles.addSubBtn}
                  onClick={() => {
                    const { rows, cols } = DEFAULT_SUBGRID_CONFIG
                    updateCellSubgrid(layerId, selected[0], selected[1], {
                      ...DEFAULT_SUBGRID_CONFIG,
                      cells: buildDefaultSubgridCells(rows, cols, maxValue),
                    })
                  }}
                >
                  Add subgrid
                </button>
              )}
            </>
          )}
        </div>
      )}
    </fieldset>
  )
}

export function GridConfigPanel() {
  const document = useDocumentStore((s) => s.document)
  const activeLayerId = useDocumentStore((s) => s.activeLayerId)
  const updateModuleConfig = useDocumentStore((s) => s.updateModuleConfig)
  const updateMaxGridDepth = useDocumentStore((s) => s.updateMaxGridDepth)

  const [genMode, setGenMode] = useState<GeneratorMode>('random')
  const [density, setDensity] = useState(0.8)
  const [gradientDir, setGradientDir] = useState<GeneratorOptions['gradientDir']>('horizontal')
  const [noiseScale, setNoiseScale] = useState(0.3)

  if (!document) return null
  const activeLayer = document.layers.find((l) => l.id === activeLayerId)
  if (!activeLayer || activeLayer.module !== 'grid') return null

  const config: GridConfig = {
    ...DEFAULT_GRID_CONFIG,
    ...(activeLayer.moduleConfig as Partial<GridConfig>),
  }

  const maxValue = COLLECTIONS_WITH_VALUES[activeLayer.primaryCollection] ?? 6

  function patch(next: Partial<GridConfig>) {
    updateModuleConfig(activeLayer!.id, { ...config, ...next })
  }

  function handleGenerate() {
    const values = generateValues(config.rows, config.cols, {
      mode: genMode,
      maxValue,
      density,
      gradientDir,
      noiseScale,
    })
    patch({ cells: buildCells(config.rows, config.cols, values) })
  }

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <span className={styles.label}>Grid</span>
        <span className={styles.layerName}>{activeLayer.name}</span>
      </div>

      <div className={styles.body}>
        {/* Max grid depth (document-level) */}
        <label className={styles.field}>
          <span>Max subgrid depth</span>
          <input
            type="number"
            min={1}
            max={6}
            value={document.maxGridDepth}
            className={styles.numInput}
            onChange={(e) => updateMaxGridDepth(parseInt(e.target.value) || 1)}
          />
        </label>

        <hr className={styles.divider} />

        {/* Rows / Cols */}
        <div className={styles.row2}>
          <label className={styles.field}>
            <span>Rows</span>
            <input
              type="number"
              min={1}
              max={64}
              value={config.rows}
              className={styles.numInput}
              onChange={(e) => {
                const rows = Math.max(1, parseInt(e.target.value) || 1)
                patch({ rows, cells: [] })
              }}
            />
          </label>
          <label className={styles.field}>
            <span>Cols</span>
            <input
              type="number"
              min={1}
              max={64}
              value={config.cols}
              className={styles.numInput}
              onChange={(e) => {
                const cols = Math.max(1, parseInt(e.target.value) || 1)
                patch({ cols, cells: [] })
              }}
            />
          </label>
        </div>

        {/* Gutter */}
        <label className={styles.field}>
          <span>Gutter (mm)</span>
          <input
            type="number"
            min={0}
            step={0.5}
            value={config.gutter}
            className={styles.numInput}
            onChange={(e) => patch({ gutter: Math.max(0, parseFloat(e.target.value) || 0) })}
          />
        </label>

        {/* Margins */}
        <fieldset className={styles.fieldset}>
          <legend>Margins (mm)</legend>
          <div className={styles.row2}>
            {(['top', 'right', 'bottom', 'left'] as const).map((side) => (
              <label key={side} className={styles.field}>
                <span>{side.charAt(0).toUpperCase() + side.slice(1)}</span>
                <input
                  type="number"
                  min={0}
                  step={1}
                  value={config.margins[side]}
                  className={styles.numInput}
                  onChange={(e) =>
                    patch({
                      margins: {
                        ...config.margins,
                        [side]: Math.max(0, parseFloat(e.target.value) || 0),
                      },
                    })
                  }
                />
              </label>
            ))}
          </div>
        </fieldset>

        {/* Weights */}
        <label className={styles.field}>
          <span>Row weights (comma-separated)</span>
          <input
            type="text"
            className={styles.textInput}
            placeholder={`e.g. 1, 2, 1  (${config.rows} values)`}
            defaultValue={formatWeights(config.rowWeights)}
            key={`rw-${activeLayerId}`}
            onBlur={(e) => {
              const w = parseWeights(e.target.value)
              if (w === null || w.length === config.rows) patch({ rowWeights: w })
            }}
          />
        </label>
        <label className={styles.field}>
          <span>Col weights (comma-separated)</span>
          <input
            type="text"
            className={styles.textInput}
            placeholder={`e.g. 1, 2, 1  (${config.cols} values)`}
            defaultValue={formatWeights(config.colWeights)}
            key={`cw-${activeLayerId}`}
            onBlur={(e) => {
              const w = parseWeights(e.target.value)
              if (w === null || w.length === config.cols) patch({ colWeights: w })
            }}
          />
        </label>

        <hr className={styles.divider} />

        {/* Cell grid editor */}
        <CellGridEditor
          config={config}
          layerId={activeLayer.id}
          maxValue={maxValue}
          maxDepth={document.maxGridDepth}
        />

        <hr className={styles.divider} />

        {/* Generator */}
        <fieldset className={styles.fieldset}>
          <legend>Generate values</legend>
          <div className={styles.modeRow}>
            {(['random', 'gradient', 'perlin'] as const).map((m) => (
              <button
                key={m}
                className={`${styles.modeBtn} ${genMode === m ? styles.selected : ''}`}
                onClick={() => setGenMode(m)}
              >
                {m}
              </button>
            ))}
          </div>

          {genMode === 'random' && (
            <label className={styles.field}>
              <span>Density {Math.round(density * 100)}%</span>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={density}
                onChange={(e) => setDensity(parseFloat(e.target.value))}
              />
            </label>
          )}

          {genMode === 'gradient' && (
            <div className={styles.modeRow}>
              {(['horizontal', 'vertical', 'radial'] as const).map((d) => (
                <button
                  key={d}
                  className={`${styles.modeBtn} ${gradientDir === d ? styles.selected : ''}`}
                  onClick={() => setGradientDir(d)}
                >
                  {d}
                </button>
              ))}
            </div>
          )}

          {genMode === 'perlin' && (
            <label className={styles.field}>
              <span>Scale {noiseScale.toFixed(2)}</span>
              <input
                type="range"
                min={0.05}
                max={1}
                step={0.05}
                value={noiseScale}
                onChange={(e) => setNoiseScale(parseFloat(e.target.value))}
              />
            </label>
          )}

          <button className={styles.generateBtn} onClick={handleGenerate}>
            Generate
          </button>
        </fieldset>
      </div>
    </div>
  )
}
