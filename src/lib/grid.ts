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

/**
 * Transforms a GridConfig into absolute cell bounds (in mm) within the paper area.
 * Pure function — no side effects.
 */
export function calculateGrid(config: GridConfig, paper: PaperDimensions): CellBounds[][] {
  const { margins, gutter, rows, cols, rowWeights, colWeights } = config
  const { width: paperWidth, height: paperHeight } = paper

  const drawWidth = paperWidth - margins.left - margins.right
  const drawHeight = paperHeight - margins.top - margins.bottom

  if (drawWidth <= 0) {
    throw new GridConfigError(
      `Horizontal margins (${margins.left + margins.right}mm) exceed paper width (${paperWidth}mm).`,
    )
  }
  if (drawHeight <= 0) {
    throw new GridConfigError(
      `Vertical margins (${margins.top + margins.bottom}mm) exceed paper height (${paperHeight}mm).`,
    )
  }
  if (rows < 1 || cols < 1) {
    throw new GridConfigError('Grid must have at least 1 row and 1 column.')
  }
  if (rowWeights !== null && rowWeights.length !== rows) {
    throw new GridConfigError(`rowWeights length (${rowWeights.length}) must match rows (${rows}).`)
  }
  if (colWeights !== null && colWeights.length !== cols) {
    throw new GridConfigError(`colWeights length (${colWeights.length}) must match cols (${cols}).`)
  }

  const rowTracks = distributeTracks(drawHeight, rows, gutter, rowWeights)
  const colTracks = distributeTracks(drawWidth, cols, gutter, colWeights)

  const bounds: CellBounds[][] = []

  for (let r = 0; r < rows; r++) {
    const row: CellBounds[] = []
    const rowTrack = rowTracks[r]!
    for (let c = 0; c < cols; c++) {
      const colTrack = colTracks[c]!
      row.push({
        x: margins.left + colTrack.offset,
        y: margins.top + rowTrack.offset,
        width: colTrack.size,
        height: rowTrack.size,
      })
    }
    bounds.push(row)
  }

  return bounds
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
