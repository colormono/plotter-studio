import { PlotterDocument, Layer, GridConfig, PAPER_DIMENSIONS } from '../../types'
import { calculateGrid } from '../grid'
import { getCollection, renderCollection } from '../collections'
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

function resolveGridConfig(raw: Record<string, unknown>): GridConfig {
  return {
    ...DEFAULT_GRID_CONFIG,
    ...(raw as Partial<GridConfig>),
  }
}

export const gridModule: Module = {
  id: 'grid',

  render(document: PlotterDocument, layer: Layer): SVGElement[] {
    const config = resolveGridConfig(layer.moduleConfig)
    const paper = PAPER_DIMENSIONS[document.paperFormat]

    let bounds
    try {
      bounds = calculateGrid(config, paper)
    } catch {
      return []
    }

    const collection = (() => {
      try {
        return getCollection(layer.primaryCollection)
      } catch {
        return null
      }
    })()

    if (!collection) return []

    const elements: SVGElement[] = []

    for (let r = 0; r < config.rows; r++) {
      for (let c = 0; c < config.cols; c++) {
        const cell = config.cells[r]?.[c]
        const value = cell?.primaryValue ?? 0
        const cellBounds = bounds[r]?.[c]
        if (!cellBounds) continue
        const rendered = renderCollection(collection, value, cellBounds)
        elements.push(...rendered)
      }
    }

    return elements
  },
}
