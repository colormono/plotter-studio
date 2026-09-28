import { svgEl } from './svg'
import {
  glyphAdvance,
  HERSHEY_CAP_HEIGHT,
  measureText as measureHersheyText,
  measureTextBounds,
  resolveGlyph,
} from './hershey-glyphs'

export { measureHersheyText as measureText }

export interface HersheyTextOptions {
  x: number
  y: number
  height: number
  strokeWidth?: number
  letterSpacing?: number
}

export function fitTextHeight(text: string, maxWidth: number, maxHeight: number): number {
  const trimmed = text.trim()
  if (!trimmed) return Math.min(maxHeight, 8)
  let lo = 3
  let hi = maxHeight
  while (hi - lo > 0.25) {
    const mid = (lo + hi) / 2
    if (measureHersheyText(trimmed, mid) <= maxWidth) lo = mid
    else hi = mid
  }
  return lo
}

export function renderHersheyText(text: string, options: HersheyTextOptions): SVGElement[] {
  const { x, y, height, strokeWidth = 0.35, letterSpacing = 0 } = options
  const scale = height / HERSHEY_CAP_HEIGHT
  const elements: SVGElement[] = []
  let cursorX = x

  for (const char of text) {
    const glyph = resolveGlyph(char)
    for (const stroke of glyph) {
      if (stroke.length < 2) continue
      const [sx, sy] = stroke[0]!
      let d = `M ${cursorX + sx * scale} ${y - sy * scale}`
      for (let i = 1; i < stroke.length; i++) {
        const [px, py] = stroke[i]!
        d += ` L ${cursorX + px * scale} ${y - py * scale}`
      }
      elements.push(
        svgEl('path', {
          d,
          'stroke-width': strokeWidth,
          'vector-effect': 'non-scaling-stroke',
        }),
      )
    }
    cursorX += glyphAdvance(char, scale) + letterSpacing
  }

  return elements
}

const DIGIT_CAP = 14

/** Renders text centered at (cx, cy) using real glyph ink bounds. */
export function renderHersheyTextCentered(
  text: string,
  cx: number,
  cy: number,
  height: number,
  strokeWidth = 0.22,
): SVGElement[] {
  const trimmed = text.trim()
  if (!trimmed) return []

  const bounds = measureTextBounds(trimmed, height)
  if (!bounds) return []

  const scale = height / HERSHEY_CAP_HEIGHT
  const inkCenterX = (bounds.minX + bounds.maxX) / 2
  // Glyph y grows up from baseline; SVG y grows down → baseline sits below visual center.
  const inkHeight = (bounds.maxY - bounds.minY) || DIGIT_CAP * scale
  const baselineY = cy + inkHeight / 2 - bounds.minY

  return renderHersheyText(trimmed, {
    x: cx - inkCenterX,
    y: baselineY,
    height,
    strokeWidth,
  })
}
