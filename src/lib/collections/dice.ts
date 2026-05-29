import { Collection, Rect } from '../../types'
import { svgEl } from '../svg'

const SW = '0.3'
const CORNER_RADIUS_RATIO = 0.15

// Normalized dot positions within the die face (0..1 space, 3×3 grid at 25/50/75%)
const POS = {
  TL: [0.25, 0.28] as const,
  TR: [0.75, 0.28] as const,
  ML: [0.25, 0.5] as const,
  MM: [0.5, 0.5] as const,
  MR: [0.75, 0.5] as const,
  BL: [0.25, 0.72] as const,
  BR: [0.75, 0.72] as const,
}

const FACE_DOTS: (readonly [number, number])[][] = [
  [POS.MM],                                     // 1
  [POS.TR, POS.BL],                             // 2
  [POS.TR, POS.MM, POS.BL],                     // 3
  [POS.TL, POS.TR, POS.BL, POS.BR],             // 4
  [POS.TL, POS.TR, POS.MM, POS.BL, POS.BR],     // 5
  [POS.TL, POS.TR, POS.ML, POS.MR, POS.BL, POS.BR], // 6
]

function renderFace(value: number, bounds: Rect): SVGElement[] {
  const { x, y, width, height } = bounds
  const pad = Math.min(width, height) * 0.06
  const rx = Math.min(width, height) * CORNER_RADIUS_RATIO

  const elements: SVGElement[] = []

  // Rounded rectangle border
  elements.push(
    svgEl('rect', {
      x: x + pad,
      y: y + pad,
      width: width - pad * 2,
      height: height - pad * 2,
      rx,
      ry: rx,
      'stroke-width': SW,
    }),
  )

  // Dots
  const dotR = Math.min(width, height) * 0.07
  const faceIndex = value - 1
  const dots = FACE_DOTS[faceIndex]
  if (!dots) return elements

  for (const [nx, ny] of dots) {
    const cx = x + pad + (width - pad * 2) * nx
    const cy = y + pad + (height - pad * 2) * ny
    elements.push(svgEl('circle', { cx, cy, r: dotR, 'stroke-width': SW }))
  }

  return elements
}

export const diceCollection: Collection = {
  id: 'dice',
  label: 'Dice',
  render: (value, bounds) => {
    if (value === 0) return []
    const face = ((value - 1) % 6) + 1
    return renderFace(face, bounds)
  },
}
