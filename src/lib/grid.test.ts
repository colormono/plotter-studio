import { describe, it, expect } from 'vitest'
import { calculateGrid, checkPhysicalResolution, minCellSize, GridConfigError } from './grid'
import { GridConfig, PaperDimensions } from '../types'

const A4: PaperDimensions = { width: 210, height: 297 }

const baseMargins = { top: 10, right: 10, bottom: 10, left: 10 }

function makeConfig(overrides: Partial<GridConfig> = {}): GridConfig {
  return {
    margins: baseMargins,
    gutter: 0,
    rows: 3,
    cols: 3,
    rowWeights: null,
    colWeights: null,
    cells: [],
    ...overrides,
  }
}

// ─── Regular grid ────────────────────────────────────────────────────────────

describe('calculateGrid — regular 3×3 on A4', () => {
  const config = makeConfig()
  // draw area: 190 × 277mm, no gutter
  // cell: 190/3 × 277/3

  it('returns a 3×3 array', () => {
    const bounds = calculateGrid(config, A4)
    expect(bounds).toHaveLength(3)
    bounds.forEach((row) => expect(row).toHaveLength(3))
  })

  it('top-left cell starts at margin origin', () => {
    const bounds = calculateGrid(config, A4)
    expect(bounds[0]![0]!.x).toBeCloseTo(10)
    expect(bounds[0]![0]!.y).toBeCloseTo(10)
  })

  it('all cells have equal width', () => {
    const bounds = calculateGrid(config, A4)
    const expected = (210 - 20) / 3
    bounds.forEach((row) => row.forEach((cell) => expect(cell.width).toBeCloseTo(expected)))
  })

  it('all cells have equal height', () => {
    const bounds = calculateGrid(config, A4)
    const expected = (297 - 20) / 3
    bounds.forEach((row) => row.forEach((cell) => expect(cell.height).toBeCloseTo(expected)))
  })

  it('last cell right edge reaches right margin boundary', () => {
    const bounds = calculateGrid(config, A4)
    const last = bounds[0]![2]!
    expect(last.x + last.width).toBeCloseTo(210 - 10)
  })

  it('last cell bottom edge reaches bottom margin boundary', () => {
    const bounds = calculateGrid(config, A4)
    const last = bounds[2]![0]!
    expect(last.y + last.height).toBeCloseTo(297 - 10)
  })
})

// ─── Irregular grid ───────────────────────────────────────────────────────────

describe('calculateGrid — irregular rows [1, 2, 1]', () => {
  // draw height: 277mm, weights sum: 4
  // row 0: 277 * 1/4 = 69.25
  // row 1: 277 * 2/4 = 138.5
  // row 2: 277 * 1/4 = 69.25

  const config = makeConfig({ rowWeights: [1, 2, 1] })

  it('middle row is twice the height of the outer rows', () => {
    const bounds = calculateGrid(config, A4)
    const h0 = bounds[0]![0]!.height
    const h1 = bounds[1]![0]!.height
    const h2 = bounds[2]![0]!.height
    expect(h1).toBeCloseTo(h0 * 2)
    expect(h2).toBeCloseTo(h0)
  })

  it('rows fill the full draw height', () => {
    const bounds = calculateGrid(config, A4)
    const totalH = bounds.reduce((sum, row) => sum + row[0]!.height, 0)
    expect(totalH).toBeCloseTo(297 - 20)
  })
})

describe('calculateGrid — irregular cols [1, 2, 1]', () => {
  const config = makeConfig({ colWeights: [1, 2, 1] })

  it('middle column is twice the width of the outer columns', () => {
    const bounds = calculateGrid(config, A4)
    const w0 = bounds[0]![0]!.width
    const w1 = bounds[0]![1]!.width
    const w2 = bounds[0]![2]!.width
    expect(w1).toBeCloseTo(w0 * 2)
    expect(w2).toBeCloseTo(w0)
  })
})

// ─── Gutter ───────────────────────────────────────────────────────────────────

describe('calculateGrid — gutter', () => {
  // draw area 190×277, gutter 5mm, 3×3
  // available width = 190 - 5*2 = 180 → cell width = 60
  // available height = 277 - 5*2 = 267 → cell height = 89

  const config = makeConfig({ gutter: 5 })

  it('reduces cell width by gutter total', () => {
    const bounds = calculateGrid(config, A4)
    const expected = (190 - 5 * 2) / 3
    bounds.forEach((row) => row.forEach((cell) => expect(cell.width).toBeCloseTo(expected)))
  })

  it('second column starts after first column width + gutter', () => {
    const bounds = calculateGrid(config, A4)
    const col0 = bounds[0]![0]!
    const col1 = bounds[0]![1]!
    expect(col1.x).toBeCloseTo(col0.x + col0.width + 5)
  })

  it('gutter is NOT added before first column', () => {
    const bounds = calculateGrid(config, A4)
    expect(bounds[0]![0]!.x).toBeCloseTo(10)
  })
})

// ─── Margin validation ────────────────────────────────────────────────────────

describe('calculateGrid — margin errors', () => {
  it('throws when horizontal margins exceed paper width', () => {
    const config = makeConfig({ margins: { top: 10, right: 110, bottom: 10, left: 110 } })
    expect(() => calculateGrid(config, A4)).toThrow(GridConfigError)
    expect(() => calculateGrid(config, A4)).toThrow(/exceed paper width/)
  })

  it('throws when vertical margins exceed paper height', () => {
    const config = makeConfig({ margins: { top: 150, right: 10, bottom: 150, left: 10 } })
    expect(() => calculateGrid(config, A4)).toThrow(GridConfigError)
    expect(() => calculateGrid(config, A4)).toThrow(/exceed paper height/)
  })

  it('throws when rowWeights length mismatches rows', () => {
    const config = makeConfig({ rows: 3, rowWeights: [1, 2] })
    expect(() => calculateGrid(config, A4)).toThrow(GridConfigError)
  })
})

// ─── Physical resolution ──────────────────────────────────────────────────────

describe('checkPhysicalResolution', () => {
  it('returns false for a normal grid with large cells', () => {
    const bounds = calculateGrid(makeConfig(), A4)
    expect(checkPhysicalResolution(bounds)).toBe(false)
  })

  it('returns true when cells are smaller than 2mm threshold', () => {
    // 200 cols in 190mm draw area → each cell ≈ 0.95mm wide
    const config = makeConfig({ cols: 200 })
    const bounds = calculateGrid(config, A4)
    expect(checkPhysicalResolution(bounds)).toBe(true)
  })

  it('respects a custom threshold', () => {
    // cell width ≈ 63.3mm — larger than 50mm threshold → false
    const bounds = calculateGrid(makeConfig(), A4)
    expect(checkPhysicalResolution(bounds, 50)).toBe(false)
    // same grid with threshold 70mm → true (cells are smaller than 70mm)
    expect(checkPhysicalResolution(bounds, 70)).toBe(true)
  })
})

// ─── minCellSize ──────────────────────────────────────────────────────────────

describe('minCellSize', () => {
  it('returns the smallest width and height across all cells', () => {
    const config = makeConfig({ rowWeights: [1, 2, 1], colWeights: [1, 3, 1] })
    const bounds = calculateGrid(config, A4)
    const { width, height } = minCellSize(bounds)
    // smallest col is weight 1 out of sum 5 → 190/5 = 38
    // smallest row is weight 1 out of sum 4 → 277/4 = 69.25
    expect(width).toBeCloseTo(190 / 5)
    expect(height).toBeCloseTo(277 / 4)
  })
})
