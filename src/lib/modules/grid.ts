import { PlotterDocument, Layer, GridConfig, Rect, PAPER_DIMENSIONS } from '../../types'
import { calculateGridInBounds } from '../grid'
import { Collection, getCollection, renderCollection } from '../collections'
import { Module } from '../../types'

export const DEFAULT_GRID_CONFIG: GridConfig = {
  margins: { top: 10, right: 10, bottom: 10, left: 10 },
  gutter: 2,
  rows: 4,
  cols: 4,
  rowWeights: null,
  colWeights: null,
  cells: [],
}

export const DEFAULT_SUBGRID_CONFIG: GridConfig = {
  margins: { top: 0, right: 0, bottom: 0, left: 0 },
  gutter: 1,
  rows: 2,
  cols: 2,
  rowWeights: null,
  colWeights: null,
  cells: [],
}

/**
 * Generates an initial grid config with random cell values and some cells
 * randomly converted to subgrids (also with random values).
 */
export function generateInitialGridConfig(
  rows: number = DEFAULT_GRID_CONFIG.rows,
  cols: number = DEFAULT_GRID_CONFIG.cols,
  maxValue: number = 6,
  subgridProbability: number = 0.2,
): GridConfig {
  const cells = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, (): import('../../types').Cell => {
      if (Math.random() < subgridProbability) {
        const subRows = Math.floor(Math.random() * 3) + 2
        const subCols = Math.floor(Math.random() * 3) + 2
        return {
          primaryValue: 0,
          secondaryValue: null,
          subgrid: {
            ...DEFAULT_SUBGRID_CONFIG,
            rows: subRows,
            cols: subCols,
            cells: Array.from({ length: subRows }, () =>
              Array.from({ length: subCols }, () => ({
                primaryValue: Math.floor(Math.random() * maxValue) + 1,
                secondaryValue: null,
                subgrid: null,
              })),
            ),
          },
        }
      }
      return {
        primaryValue: Math.floor(Math.random() * maxValue) + 1,
        secondaryValue: null,
        subgrid: null,
      }
    }),
  )

  return { ...DEFAULT_GRID_CONFIG, cells }
}

function resolveGridConfig(raw: Record<string, unknown>): GridConfig {
  return {
    ...DEFAULT_GRID_CONFIG,
    ...(raw as Partial<GridConfig>),
  }
}

function renderGridRecursive(
  config: GridConfig,
  bounds: Rect,
  collection: Collection,
  depth: number,
  maxDepth: number,
): SVGElement[] {
  if (depth > maxDepth) return []

  let cellBounds
  try {
    cellBounds = calculateGridInBounds(config, bounds)
  } catch {
    return []
  }

  const elements: SVGElement[] = []

  for (let r = 0; r < config.rows; r++) {
    for (let c = 0; c < config.cols; c++) {
      const cell = config.cells[r]?.[c]
      const cb = cellBounds[r]?.[c]
      if (!cb) continue

      if (cell?.subgrid && depth < maxDepth) {
        const subElements = renderGridRecursive(cell.subgrid, cb, collection, depth + 1, maxDepth)
        elements.push(...subElements)
      } else {
        const value = cell?.primaryValue ?? 0
        elements.push(...renderCollection(collection, value, cb))
      }
    }
  }

  return elements
}

export const gridModule: Module = {
  id: 'grid',

  render(document: PlotterDocument, layer: Layer): SVGElement[] {
    const config = resolveGridConfig(layer.moduleConfig)
    const paper = PAPER_DIMENSIONS[document.paperFormat]
    const bounds: Rect = { x: 0, y: 0, width: paper.width, height: paper.height }

    const collection = (() => {
      try {
        return getCollection(layer.primaryCollection)
      } catch {
        return null
      }
    })()

    if (!collection) return []

    return renderGridRecursive(config, bounds, collection, 0, document.maxGridDepth)
  },
}
