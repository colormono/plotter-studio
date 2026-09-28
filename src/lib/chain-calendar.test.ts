import { describe, expect, it } from 'vitest'
import {
  buildSnakeColumnPositions,
  cellIndexToPosition,
  cellIndexToRowPosition,
  clampDays,
  computeChainLayout,
  DEFAULT_CHAIN_CONFIG,
  formatDaysLabel,
  snakeShapeOffset,
} from './chain-calendar'

describe('chain-calendar', () => {
  it('clamps days between 7 and 365', () => {
    expect(clampDays(3)).toBe(7)
    expect(clampDays(400)).toBe(365)
    expect(clampDays(66)).toBe(66)
  })

  it('formats 365 as 1 YEAR', () => {
    expect(formatDaysLabel(365)).toBe('1 YEAR')
    expect(formatDaysLabel(66)).toBe('66 DAYS')
  })

  it('fills rows left to right', () => {
    expect(cellIndexToRowPosition(0, 5)).toEqual({ col: 0, row: 0 })
    expect(cellIndexToRowPosition(6, 5)).toEqual({ col: 1, row: 1 })
  })

  it('maps vertical snake: col 0 bottom-up, col 1 top-down', () => {
    const positions = buildSnakeColumnPositions(10, 3, 4)
    expect(positions[0]).toEqual({ col: 0, row: 3 })
    expect(positions[3]).toEqual({ col: 0, row: 0 })
    expect(positions[4]).toEqual({ col: 1, row: 0 })
    expect(positions[7]).toEqual({ col: 1, row: 3 })
    expect(positions[8]).toEqual({ col: 2, row: 3 })
  })

  it('places day 1 at bottom of first snake column', () => {
    const pos = cellIndexToPosition(0, 12, 31, 365, 'snake')
    expect(pos.col).toBe(0)
    expect(pos.row).toBe(30)
  })

  it('offsets snake shapes along path tangent without connectors', () => {
    const cellSize = 10
    const up = snakeShapeOffset(1, 3, 4, 10, cellSize)
    expect(up.dy).toBeLessThan(0)

    const turn = snakeShapeOffset(3, 3, 4, 10, cellSize)
    expect(turn.dx).toBeGreaterThan(0)
  })

  it('centers subtitle independently from title', () => {
    const layout = computeChainLayout(
      { width: 210, height: 297 },
      14,
      { ...DEFAULT_CHAIN_CONFIG, goalTitle: 'SHORT', days: 365, pathOrder: 'snake' },
    )
    expect(layout.subtitle).toBe('1 YEAR')
    expect(layout.subtitleX).toBeGreaterThan(layout.titleX)
  })

  it('fits grid inside A4 landscape with title', () => {
    const layout = computeChainLayout(
      { width: 297, height: 210 },
      14,
      { ...DEFAULT_CHAIN_CONFIG, days: 66 },
    )
    expect(layout.cols * layout.rows).toBeGreaterThanOrEqual(66)
    expect(layout.cellSize).toBeGreaterThanOrEqual(3)
    const gridBottom = layout.gridY + layout.gridH
    expect(gridBottom).toBeLessThanOrEqual(210 - 14 + 0.5)
  })
})
