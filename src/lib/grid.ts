import { GridConfig, PaperDimensions, Rect } from '../types'

export type CellBounds = Rect

export class GridConfigError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'GridConfigError'
  }
}

/**
 * Distributes `totalSize` across `count` tracks using optional relative weights.
 * Gutter is applied between tracks (not at the edges).
 * Returns an array of { offset, size } in the same unit as `totalSize`.
 */
function distributeTracks(
  totalSize: number,
  count: number,
  gutter: number,
  weights: number[] | null,
): { offset: number; size: number }[] {
  const gutterTotal = gutter * (count - 1)
  const available = totalSize - gutterTotal

  const resolvedWeights = weights ?? Array.from({ length: count }, () => 1)
  const weightSum = resolvedWeights.reduce((a, b) => a + b, 0)

  const tracks: { offset: number; size: number }[] = []
  let cursor = 0

  for (let i = 0; i < count; i++) {
    const size = (resolvedWeights[i]! / weightSum) * available
    tracks.push({ offset: cursor, size })
    cursor += size + gutter
  }

  return tracks
}

function validateGridConfig(config: GridConfig, drawWidth: number, drawHeight: number): void {
  if (drawWidth <= 0) {
    throw new GridConfigError(
      `Horizontal margins (${config.margins.left + config.margins.right}mm) exceed available width.`,
    )
  }
  if (drawHeight <= 0) {
    throw new GridConfigError(
      `Vertical margins (${config.margins.top + config.margins.bottom}mm) exceed available height.`,
    )
  }
  if (config.rows < 1 || config.cols < 1) {
    throw new GridConfigError('Grid must have at least 1 row and 1 column.')
  }
  if (config.rowWeights !== null && config.rowWeights.length !== config.rows) {
    throw new GridConfigError(
      `rowWeights length (${config.rowWeights.length}) must match rows (${config.rows}).`,
    )
  }
  if (config.colWeights !== null && config.colWeights.length !== config.cols) {
    throw new GridConfigError(
      `colWeights length (${config.colWeights.length}) must match cols (${config.cols}).`,
    )
  }
}

/**
 * Transforms a GridConfig into absolute cell bounds within an arbitrary bounding Rect.
 * Margins are applied relative to `bounds`. Pure function — no side effects.
 */
export function calculateGridInBounds(config: GridConfig, bounds: Rect): CellBounds[][] {
  const { margins, gutter, rows, cols, rowWeights, colWeights } = config

  const drawX = bounds.x + margins.left
  const drawY = bounds.y + margins.top
  const drawWidth = bounds.width - margins.left - margins.right
  const drawHeight = bounds.height - margins.top - margins.bottom

  validateGridConfig(config, drawWidth, drawHeight)

  const rowTracks = distributeTracks(drawHeight, rows, gutter, rowWeights)
  const colTracks = distributeTracks(drawWidth, cols, gutter, colWeights)

  const result: CellBounds[][] = []

  for (let r = 0; r < rows; r++) {
    const row: CellBounds[] = []
    const rowTrack = rowTracks[r]!
    for (let c = 0; c < cols; c++) {
      const colTrack = colTracks[c]!
      row.push({
        x: drawX + colTrack.offset,
        y: drawY + rowTrack.offset,
        width: colTrack.size,
        height: rowTrack.size,
      })
    }
    result.push(row)
  }

  return result
}

/**
 * Transforms a GridConfig into absolute cell bounds (in mm) within the paper area.
 * Pure function — no side effects.
 */
export function calculateGrid(config: GridConfig, paper: PaperDimensions): CellBounds[][] {
  return calculateGridInBounds(config, { x: 0, y: 0, width: paper.width, height: paper.height })
}

/**
 * Returns true if any cell is smaller than `thresholdMm` in width or height.
 * Useful for warning the user about cells that a plotter cannot physically execute.
 */
export function checkPhysicalResolution(
  bounds: CellBounds[][],
  thresholdMm: number = 2,
): boolean {
  return bounds.some((row) =>
    row.some((cell) => cell.width < thresholdMm || cell.height < thresholdMm),
  )
}

/**
 * Returns the minimum cell dimensions across all cells in the grid.
 */
export function minCellSize(bounds: CellBounds[][]): { width: number; height: number } {
  let minW = Infinity
  let minH = Infinity
  for (const row of bounds) {
    for (const cell of row) {
      if (cell.width < minW) minW = cell.width
      if (cell.height < minH) minH = cell.height
    }
  }
  return { width: minW, height: minH }
}

/**
 * Recursively finds the minimum cell size across all grid levels (including subgrids).
 * Returns { width, height } in mm. Returns { width: Infinity, height: Infinity } for empty grids.
 */
export function findMinCellSizeRecursive(
  config: GridConfig,
  bounds: Rect,
  maxDepth: number,
  currentDepth: number = 0,
): { width: number; height: number } {
  let cellBounds: CellBounds[][]
  try {
    cellBounds = calculateGridInBounds(config, bounds)
  } catch {
    return { width: Infinity, height: Infinity }
  }

  let minW = Infinity
  let minH = Infinity

  for (let r = 0; r < config.rows; r++) {
    for (let c = 0; c < config.cols; c++) {
      const cb = cellBounds[r]?.[c]
      if (!cb) continue

      if (cb.width < minW) minW = cb.width
      if (cb.height < minH) minH = cb.height

      const cell = config.cells[r]?.[c]
      if (cell?.subgrid && currentDepth < maxDepth) {
        const sub = findMinCellSizeRecursive(cell.subgrid, cb, maxDepth, currentDepth + 1)
        if (sub.width < minW) minW = sub.width
        if (sub.height < minH) minH = sub.height
      }
    }
  }

  return { width: minW, height: minH }
}
