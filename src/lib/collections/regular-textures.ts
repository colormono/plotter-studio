import { Collection, Rect } from '../../types'
import { svgEl } from '../svg'

/** Spacing between lines in mm. */
const STEP = 4
const SW = '0.3' // stroke-width in mm

function horizontalLines(bounds: Rect): SVGElement[] {
  const { x, y, width, height } = bounds
  const lines: SVGElement[] = []
  for (let cy = y + STEP; cy < y + height; cy += STEP) {
    lines.push(svgEl('line', { x1: x, y1: cy, x2: x + width, y2: cy, 'stroke-width': SW }))
  }
  return lines
}

function verticalLines(bounds: Rect): SVGElement[] {
  const { x, y, width, height } = bounds
  const lines: SVGElement[] = []
  for (let cx = x + STEP; cx < x + width; cx += STEP) {
    lines.push(svgEl('line', { x1: cx, y1: y, x2: cx, y2: y + height, 'stroke-width': SW }))
  }
  return lines
}

function crosshatch(bounds: Rect): SVGElement[] {
  return [...horizontalLines(bounds), ...verticalLines(bounds)]
}

function diagonalLines(bounds: Rect, angle: 1 | -1): SVGElement[] {
  const { x, y, width, height } = bounds
  const lines: SVGElement[] = []
  // Generate diagonal lines by stepping along the x-axis.
  // Lines run at ±45° — slope of ±1 (in mm space).
  const span = width + height
  for (let offset = -height; offset < width; offset += STEP) {
    const x1 = x + offset
    const y1 = y
    const x2 = x + offset + span * angle
    const y2 = y + span
    // Clip to bounds using a rectangular clip approach: only draw within the box.
    // Simple approximation: extend beyond and rely on SVG clipPath in the future.
    // For now, clamp endpoints to the bounding box.
    lines.push(
      svgEl('line', {
        x1: Math.max(x, Math.min(x + width, x1)),
        y1: Math.max(y, Math.min(y + height, y1)),
        x2: Math.max(x, Math.min(x + width, x2)),
        y2: Math.max(y, Math.min(y + height, y2)),
        'stroke-width': SW,
      }),
    )
  }
  return lines
}

function dotGrid(bounds: Rect): SVGElement[] {
  const { x, y, width, height } = bounds
  const dots: SVGElement[] = []
  for (let cy = y + STEP; cy < y + height; cy += STEP) {
    for (let cx = x + STEP; cx < x + width; cx += STEP) {
      // A dot is a very short line segment centered on the point
      dots.push(
        svgEl('circle', { cx, cy, r: 0.4, 'stroke-width': SW }),
      )
    }
  }
  return dots
}

function zigzagLines(bounds: Rect): SVGElement[] {
  const { x, y, width, height } = bounds
  const lines: SVGElement[] = []
  const amplitude = STEP / 2
  for (let cy = y + STEP; cy < y + height; cy += STEP) {
    const points: string[] = []
    let toggle = 0
    for (let cx = x; cx <= x + width; cx += STEP / 2) {
      const vy = cy + (toggle % 2 === 0 ? -amplitude : amplitude)
      points.push(`${cx},${vy}`)
      toggle++
    }
    const polyline = svgEl('polyline', {
      points: points.join(' '),
      'stroke-width': SW,
    })
    lines.push(polyline)
  }
  return lines
}

// Value 0 → silence (handled by catalog wrapper)
// Value 1 → horizontal lines
// Value 2 → vertical lines
// Value 3 → crosshatch
// Value 4 → diagonal NE
// Value 5 → dots
// Value 6 → zigzag
const TEXTURES: ((bounds: Rect) => SVGElement[])[] = [
  horizontalLines,  // 1
  verticalLines,    // 2
  crosshatch,       // 3
  (b) => diagonalLines(b, 1),  // 4
  dotGrid,          // 5
  zigzagLines,      // 6
]

export const regularTexturesCollection: Collection = {
  id: 'regular-textures',
  label: 'Regular textures',
  kind: 'draw',
  render: (value, bounds) => {
    if (value === 0) return []
    const idx = ((value - 1) % TEXTURES.length)
    return TEXTURES[idx]!(bounds)
  },
}
