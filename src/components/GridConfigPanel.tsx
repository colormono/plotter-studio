import { useState } from 'react'
import { useDocumentStore } from '../store/document'
import { GridConfig, Cell } from '../types'
import { DEFAULT_GRID_CONFIG } from '../lib/modules/grid'
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

export function GridConfigPanel() {
  const document = useDocumentStore((s) => s.document)
  const activeLayerId = useDocumentStore((s) => s.activeLayerId)
  const updateModuleConfig = useDocumentStore((s) => s.updateModuleConfig)

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

  function patch(next: Partial<GridConfig>) {
    updateModuleConfig(activeLayer!.id, { ...config, ...next })
  }

  function handleGenerate() {
    const maxValue = COLLECTIONS_WITH_VALUES[activeLayer!.primaryCollection] ?? 6
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
