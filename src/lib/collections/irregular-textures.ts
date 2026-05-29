import { Collection, Rect } from '../../types'
import { svgEl } from '../svg'

const SW = '0.3'
const STEP = 5   // mm between wavy lines
const SAMPLE = 1 // mm between polyline sample points

/** Minimal LCG PRNG seeded by cell position for reproducibility. */
function makePrng(seed: number): () => number {
  let s = (Math.round(seed) | 0) >>> 0
  if (s === 0) s = 12345
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0
    return s / 4294967296
  }
}

function cellSeed(bounds: Rect): number {
  return bounds.x * 397 + bounds.y * 113
}

// 1: wavy horizontal lines
function wavyHorizontal(bounds: Rect): SVGElement[] {
  const { x, y, width, height } = bounds
  const amplitude = Math.min(STEP * 0.45, height * 0.08)
  const wavelength = Math.min(STEP * 2.5, width * 0.4)
  const lines: SVGElement[] = []

  for (let cy = y + STEP; cy < y + height; cy += STEP) {
    const points: string[] = []
    for (let cx = x; cx <= x + width; cx += SAMPLE) {
      const vy = cy + amplitude * Math.sin((2 * Math.PI * (cx - x)) / wavelength)
      points.push(`${cx.toFixed(2)},${vy.toFixed(2)}`)
    }
    lines.push(svgEl('polyline', { points: points.join(' '), 'stroke-width': SW }))
  }
  return lines
}

// 2: wavy vertical lines
function wavyVertical(bounds: Rect): SVGElement[] {
  const { x, y, width, height } = bounds
  const amplitude = Math.min(STEP * 0.45, width * 0.08)
  const wavelength = Math.min(STEP * 2.5, height * 0.4)
  const lines: SVGElement[] = []

  for (let cx = x + STEP; cx < x + width; cx += STEP) {
    const points: string[] = []
    for (let cy = y; cy <= y + height; cy += SAMPLE) {
      const vx = cx + amplitude * Math.sin((2 * Math.PI * (cy - y)) / wavelength)
      points.push(`${vx.toFixed(2)},${cy.toFixed(2)}`)
    }
    lines.push(svgEl('polyline', { points: points.join(' '), 'stroke-width': SW }))
  }
  return lines
}

// 3: scattered dots at random positions (seeded by cell position)
function scatteredDots(bounds: Rect): SVGElement[] {
  const { x, y, width, height } = bounds
  const rng = makePrng(cellSeed(bounds))
  const dotR = Math.min(width, height) * 0.025
  const count = Math.round((width * height) / 18)
  const dots: SVGElement[] = []

  for (let i = 0; i < count; i++) {
    const cx = x + rng() * width
    const cy = y + rng() * height
    dots.push(svgEl('circle', { cx: cx.toFixed(3), cy: cy.toFixed(3), r: dotR, 'stroke-width': SW }))
  }
  return dots
}

// 4: short strokes at random angles (seeded by cell position)
function randomStrokes(bounds: Rect): SVGElement[] {
  const { x, y, width, height } = bounds
  const rng = makePrng(cellSeed(bounds))
  const strokeLen = Math.min(width, height) * 0.18
  const gridStep = Math.min(width, height) * 0.28
  const strokes: SVGElement[] = []

  for (let gy = y + gridStep / 2; gy < y + height; gy += gridStep) {
    for (let gx = x + gridStep / 2; gx < x + width; gx += gridStep) {
      const angle = rng() * Math.PI
      const jx = (rng() - 0.5) * gridStep * 0.4
      const jy = (rng() - 0.5) * gridStep * 0.4
      const cx = gx + jx
      const cy = gy + jy
      const dx = (Math.cos(angle) * strokeLen) / 2
      const dy = (Math.sin(angle) * strokeLen) / 2
      strokes.push(
        svgEl('line', {
          x1: (cx - dx).toFixed(3),
          y1: (cy - dy).toFixed(3),
          x2: (cx + dx).toFixed(3),
          y2: (cy + dy).toFixed(3),
          'stroke-width': SW,
        }),
      )
    }
  }
  return strokes
}

const TEXTURES: ((bounds: Rect) => SVGElement[])[] = [
  wavyHorizontal, // 1
  wavyVertical,   // 2
  scatteredDots,  // 3
  randomStrokes,  // 4
]

export const irregularTexturesCollection: Collection = {
  id: 'irregular-textures',
  label: 'Irregular textures',
  render: (value, bounds) => {
    if (value === 0) return []
    const idx = (value - 1) % TEXTURES.length
    return TEXTURES[idx]!(bounds)
  },
}
