import type { PaperDimensions } from '../types'
import { fitTextHeight, measureText, renderHersheyText, renderHersheyTextCentered } from './hershey-text'
import { svgEl } from './svg'

export type ChainCellShape = 'circle' | 'square'
export type ChainPathOrder = 'row' | 'snake'

export interface ChainConfig {
  groupId: string
  goalTitle: string
  days: number
  cellShape: ChainCellShape
  pathOrder: ChainPathOrder
  showDayNumbers: boolean
}

export interface ChainLayout {
  margin: number
  titleX: number
  titleY: number
  titleHeight: number
  subtitle: string
  subtitleX: number
  subtitleY: number
  subtitleHeight: number
  gridX: number
  gridY: number
  gridW: number
  gridH: number
  cols: number
  rows: number
  cellSize: number
  gap: number
}

export const DEFAULT_CHAIN_CONFIG: Omit<ChainConfig, 'groupId'> = {
  goalTitle: "Don't Break the Chain",
  days: 66,
  cellShape: 'circle',
  pathOrder: 'snake',
  showDayNumbers: true,
}

const SW = '0.35'
const MIN_CELL = 3
const TITLE_GAP = 4
const SUBTITLE_GAP = 2

export function clampDays(days: number): number {
  if (!Number.isFinite(days)) return DEFAULT_CHAIN_CONFIG.days
  return Math.max(7, Math.min(365, Math.round(days)))
}

export function formatDaysLabel(days: number): string {
  if (days === 365) return '1 YEAR'
  return `${days} DAYS`
}

/** Horizontal fill: left → right, top → bottom. */
export function cellIndexToRowPosition(index: number, cols: number): { col: number; row: number } {
  return { col: index % cols, row: Math.floor(index / cols) }
}

/** Vertical serpentine: column 0 bottom→top, column 1 top→bottom, etc. */
export function buildSnakeColumnPositions(
  days: number,
  cols: number,
  rows: number,
): Array<{ col: number; row: number }> {
  const positions: Array<{ col: number; row: number }> = []

  for (let col = 0; col < cols && positions.length < days; col++) {
    const count = Math.min(rows, days - positions.length)
    if (col % 2 === 0) {
      for (let i = 0; i < count; i++) {
        positions.push({ col, row: rows - 1 - i })
      }
    } else {
      for (let i = 0; i < count; i++) {
        positions.push({ col, row: i })
      }
    }
  }

  return positions
}

export function cellIndexToPosition(
  index: number,
  cols: number,
  rows: number,
  totalDays: number,
  pathOrder: ChainPathOrder,
): { col: number; row: number } {
  if (pathOrder === 'row') return cellIndexToRowPosition(index, cols)
  return buildSnakeColumnPositions(totalDays, cols, rows)[index] ?? { col: 0, row: 0 }
}

function computeGrid(
  days: number,
  availW: number,
  availH: number,
  gap: number,
  pathOrder: ChainPathOrder,
): Pick<ChainLayout, 'cols' | 'rows' | 'cellSize' | 'gap'> {
  let best = { cols: 1, rows: days, cellSize: 0, gap }

  for (let cols = 1; cols <= days; cols++) {
    const rows = Math.ceil(days / cols)
    const cellW = (availW - (cols - 1) * gap) / cols
    const cellH = (availH - (rows - 1) * gap) / rows
    const cellSize = Math.min(cellW, cellH)
    if (cellSize < MIN_CELL) continue

    const snakeBonus = pathOrder === 'snake' && cols >= rows * 0.45 ? 1.04 : 1
    const score = cellSize * snakeBonus
    if (score > best.cellSize) best = { cols, rows, cellSize, gap }
  }

  if (best.cellSize === 0) {
    const cols = Math.max(1, Math.floor(Math.sqrt(days)))
    const rows = Math.ceil(days / cols)
    return { cols, rows, cellSize: MIN_CELL, gap }
  }

  return best
}

export function computeChainLayout(
  paper: PaperDimensions,
  margin: number,
  config: Pick<ChainConfig, 'goalTitle' | 'days' | 'pathOrder'>,
): ChainLayout {
  const contentX = margin
  const contentY = margin
  const contentW = paper.width - margin * 2
  const contentH = paper.height - margin * 2

  const titleMaxH = contentH * 0.2
  const titleHeight = fitTextHeight(config.goalTitle, contentW * 0.95, titleMaxH)
  const subtitleHeight = Math.max(3.5, titleHeight * 0.42)
  const titleBlockH = titleHeight + TITLE_GAP + subtitleHeight + SUBTITLE_GAP

  const gridAvailH = Math.max(contentH - titleBlockH, MIN_CELL * 2)
  const gap = Math.max(1.2, Math.min(3, contentW / 80))

  const grid = computeGrid(config.days, contentW, gridAvailH, gap, config.pathOrder)
  const usedW = grid.cols * grid.cellSize + (grid.cols - 1) * gap
  const usedH = grid.rows * grid.cellSize + (grid.rows - 1) * gap

  const title = config.goalTitle.trim() || DEFAULT_CHAIN_CONFIG.goalTitle
  const subtitle = formatDaysLabel(config.days)
  const titleWidth = measureText(title, titleHeight)
  const subtitleWidth = measureText(subtitle, subtitleHeight)

  return {
    margin,
    titleX: contentX + (contentW - titleWidth) / 2,
    titleY: contentY + titleHeight,
    titleHeight,
    subtitle,
    subtitleX: contentX + (contentW - subtitleWidth) / 2,
    subtitleY: contentY + titleHeight + TITLE_GAP + subtitleHeight,
    subtitleHeight,
    gridX: contentX + (contentW - usedW) / 2,
    gridY: contentY + titleBlockH + (gridAvailH - usedH) / 2,
    gridW: usedW,
    gridH: usedH,
    cols: grid.cols,
    rows: grid.rows,
    cellSize: grid.cellSize,
    gap,
  }
}

function cellCenter(
  col: number,
  row: number,
  layout: ChainLayout,
): { cx: number; cy: number } {
  const { cellSize, gap, gridX, gridY } = layout
  return {
    cx: gridX + col * (cellSize + gap) + cellSize / 2,
    cy: gridY + row * (cellSize + gap) + cellSize / 2,
  }
}

const SNAKE_OFFSET_RATIO = 0.16

/** Shifts the shape inside its cell toward the path tangent (no connector strokes). */
export function snakeShapeOffset(
  dayIndex: number,
  cols: number,
  rows: number,
  totalDays: number,
  cellSize: number,
): { dx: number; dy: number } {
  const positions = buildSnakeColumnPositions(totalDays, cols, rows)
  const current = positions[dayIndex]
  if (!current) return { dx: 0, dy: 0 }

  const next = positions[dayIndex + 1]
  const prev = dayIndex > 0 ? positions[dayIndex - 1] : undefined

  let vx = 0
  let vy = 0
  if (next) {
    vx += next.col - current.col
    vy += next.row - current.row
  }
  if (prev) {
    vx += current.col - prev.col
    vy += current.row - prev.row
  }

  const len = Math.hypot(vx, vy)
  if (len === 0) return { dx: 0, dy: 0 }

  const amount = cellSize * SNAKE_OFFSET_RATIO
  return { dx: (vx / len) * amount, dy: (vy / len) * amount }
}

function renderCell(
  cx: number,
  cy: number,
  size: number,
  shape: ChainCellShape,
): SVGElement {
  if (shape === 'circle') {
    return svgEl('circle', {
      cx,
      cy,
      r: size / 2,
      'stroke-width': SW,
      'vector-effect': 'non-scaling-stroke',
    })
  }
  const half = size / 2
  return svgEl('rect', {
    x: cx - half,
    y: cy - half,
    width: size,
    height: size,
    'stroke-width': SW,
    'vector-effect': 'non-scaling-stroke',
  })
}

function renderDayNumber(cx: number, cy: number, day: number, cellSize: number): SVGElement[] {
  const label = String(day)
  const height = Math.max(1.4, cellSize * 0.3)
  return renderHersheyTextCentered(label, cx, cy, height, 0.22)
}

export function renderChainTitle(
  layout: ChainLayout,
  config: Pick<ChainConfig, 'goalTitle'>,
): SVGElement[] {
  const title = config.goalTitle.trim() || DEFAULT_CHAIN_CONFIG.goalTitle
  return [
    ...renderHersheyText(title, {
      x: layout.titleX,
      y: layout.titleY,
      height: layout.titleHeight,
      strokeWidth: 0.4,
    }),
    ...renderHersheyText(layout.subtitle, {
      x: layout.subtitleX,
      y: layout.subtitleY,
      height: layout.subtitleHeight,
      strokeWidth: 0.3,
    }),
  ]
}

export function renderChainCells(
  layout: ChainLayout,
  config: Pick<ChainConfig, 'days' | 'cellShape' | 'pathOrder' | 'showDayNumbers'>,
): SVGElement[] {
  const elements: SVGElement[] = []
  const { cols, rows, cellSize } = layout
  const diameter = cellSize * 0.88

  for (let day = 0; day < config.days; day++) {
    const { col, row } = cellIndexToPosition(day, cols, rows, config.days, config.pathOrder)
    const center = cellCenter(col, row, layout)
    const offset =
      config.pathOrder === 'snake'
        ? snakeShapeOffset(day, cols, rows, config.days, cellSize)
        : { dx: 0, dy: 0 }
    const cx = center.cx + offset.dx
    const cy = center.cy + offset.dy
    elements.push(renderCell(cx, cy, diameter, config.cellShape))
    if (config.showDayNumbers) {
      elements.push(...renderDayNumber(cx, cy, day + 1, cellSize))
    }
  }

  return elements
}

export function isChainConfig(value: unknown): value is ChainConfig {
  if (!value || typeof value !== 'object') return false
  const cfg = value as ChainConfig
  return (
    typeof cfg.groupId === 'string' &&
    typeof cfg.goalTitle === 'string' &&
    typeof cfg.days === 'number' &&
    (cfg.cellShape === 'circle' || cfg.cellShape === 'square') &&
    (cfg.pathOrder === 'row' || cfg.pathOrder === 'snake') &&
    (cfg.showDayNumbers === undefined || typeof cfg.showDayNumbers === 'boolean')
  )
}

export function normalizeChainConfig(cfg: ChainConfig): ChainConfig {
  return {
    ...cfg,
    showDayNumbers: cfg.showDayNumbers ?? true,
    cellShape: cfg.cellShape ?? 'circle',
    pathOrder: cfg.pathOrder ?? 'snake',
  }
}
