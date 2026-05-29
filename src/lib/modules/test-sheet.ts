import { PlotterDocument, Layer, Module } from '../../types'
import { getPaperDimensions } from '../paper'
import { renderRegistrationMarks } from '../registration-marks'
import { svgEl } from '../svg'

const MARGIN = 10
const GRID_COLS = 10
const GRID_ROWS = 10
const CROSS_HALF = 3
const SW = '0.4'

function renderBorder(x: number, y: number, w: number, h: number): SVGElement {
  return svgEl('rect', { x, y, width: w, height: h, 'stroke-width': SW })
}

function renderGrid(x: number, y: number, w: number, h: number): SVGElement[] {
  const elements: SVGElement[] = []
  const cellW = w / GRID_COLS
  const cellH = h / GRID_ROWS

  for (let c = 1; c < GRID_COLS; c++) {
    const lx = x + c * cellW
    elements.push(svgEl('line', { x1: lx, y1: y, x2: lx, y2: y + h, 'stroke-width': SW }))
  }
  for (let r = 1; r < GRID_ROWS; r++) {
    const ly = y + r * cellH
    elements.push(svgEl('line', { x1: x, y1: ly, x2: x + w, y2: ly, 'stroke-width': SW }))
  }
  return elements
}

function renderRegistrationCrosses(x: number, y: number, w: number, h: number): SVGElement[] {
  const cs = CROSS_HALF
  const centers = [
    [x + w / 2, y],
    [x + w / 2, y + h],
    [x, y + h / 2],
    [x + w, y + h / 2],
  ]
  return centers.flatMap(([cx, cy]) => [
    svgEl('line', { x1: cx - cs, y1: cy, x2: cx + cs, y2: cy, 'stroke-width': SW }),
    svgEl('line', { x1: cx, y1: cy - cs, x2: cx, y2: cy + cs, 'stroke-width': SW }),
  ])
}

function renderLabel(doc: PlotterDocument, x: number, y: number, w: number): SVGElement {
  const { width, height } = getPaperDimensions(doc)
  const label = `${doc.paperFormat} \u2014 ${width}\u00d7${height}mm`
  const el = svgEl('text', {
    x: x + w / 2,
    y: y - 3,
    'text-anchor': 'middle',
    'font-size': '3',
    stroke: 'currentColor',
    'stroke-width': '0.2',
    'font-family': 'monospace',
  })
  el.textContent = label
  return el
}

function renderCutBorder(doc: PlotterDocument): SVGElement[] {
  const { width, height } = getPaperDimensions(doc)
  const ti = Math.min(doc.margin * 0.45, 6)
  return [
    svgEl('rect', {
      x: ti,
      y: ti,
      width: width - ti * 2,
      height: height - ti * 2,
      'stroke-width': SW,
    }),
  ]
}

export const testSheetModule: Module = {
  id: 'test-sheet',

  render(doc: PlotterDocument, layer: Layer): SVGElement[] {
    if (layer.layerRole === 'registration') {
      return renderRegistrationMarks(doc)
    }

    if (layer.layerRole === 'cut') {
      return renderCutBorder(doc)
    }

    if (layer.layerRole !== 'content') return []

    const { width, height } = getPaperDimensions(doc)
    const x = MARGIN
    const y = MARGIN
    const w = width - 2 * MARGIN
    const h = height - 2 * MARGIN

    return [
      renderBorder(x, y, w, h),
      ...renderGrid(x, y, w, h),
      ...renderRegistrationCrosses(x, y, w, h),
      renderLabel(doc, x, y, w),
    ]
  },
}
