import { Collection, Rect } from '../../types'
import { svgEl } from '../svg'

const SW = '0.35'

function inscribed(bounds: Rect): { cx: number; cy: number; r: number } {
  const cx = bounds.x + bounds.width / 2
  const cy = bounds.y + bounds.height / 2
  const r = Math.min(bounds.width, bounds.height) / 2 * 0.82
  return { cx, cy, r }
}

function polygonPoints(cx: number, cy: number, r: number, sides: number, startAngle = 0): string {
  return Array.from({ length: sides }, (_, i) => {
    const a = startAngle + (i * 2 * Math.PI) / sides
    return `${(cx + r * Math.cos(a)).toFixed(3)},${(cy + r * Math.sin(a)).toFixed(3)}`
  }).join(' ')
}

// 1: inscribed circle
function shapeCircle(bounds: Rect): SVGElement[] {
  const { cx, cy, r } = inscribed(bounds)
  return [svgEl('circle', { cx, cy, r, 'stroke-width': SW })]
}

// 2: equilateral triangle, apex up
function shapeTriangle(bounds: Rect): SVGElement[] {
  const { cx, cy, r } = inscribed(bounds)
  return [
    svgEl('polygon', {
      points: polygonPoints(cx, cy, r, 3, -Math.PI / 2),
      'stroke-width': SW,
    }),
  ]
}

// 3: square rotated 45° (diamond)
function shapeDiamond(bounds: Rect): SVGElement[] {
  const { cx, cy, r } = inscribed(bounds)
  return [
    svgEl('polygon', {
      points: polygonPoints(cx, cy, r, 4, 0),
      'stroke-width': SW,
    }),
  ]
}

// 4: cross (+ shape as two intersecting lines)
function shapeCross(bounds: Rect): SVGElement[] {
  const { cx, cy, r } = inscribed(bounds)
  const arm = r * 0.9
  return [
    svgEl('line', { x1: cx - arm, y1: cy, x2: cx + arm, y2: cy, 'stroke-width': SW }),
    svgEl('line', { x1: cx, y1: cy - arm, x2: cx, y2: cy + arm, 'stroke-width': SW }),
  ]
}

// 5: hexagon, flat-top
function shapeHexagon(bounds: Rect): SVGElement[] {
  const { cx, cy, r } = inscribed(bounds)
  return [
    svgEl('polygon', {
      points: polygonPoints(cx, cy, r, 6, 0),
      'stroke-width': SW,
    }),
  ]
}

const SHAPES: ((bounds: Rect) => SVGElement[])[] = [
  shapeCircle,   // 1
  shapeTriangle, // 2
  shapeDiamond,  // 3
  shapeCross,    // 4
  shapeHexagon,  // 5
]

export const geometricShapesCollection: Collection = {
  id: 'geometric-shapes',
  label: 'Geometric shapes',
  render: (value, bounds) => {
    if (value === 0) return []
    const idx = (value - 1) % SHAPES.length
    return SHAPES[idx]!(bounds)
  },
}
