import {
  PlotterDocument,
  GridSpec,
  CollectionWeight,
  Rect,
  CollectionScaleMode,
} from '../types'
import { getPaperDimensions } from './paper'
import { svgEl } from './svg'
import { makeRng, pick, rnd } from './rng'
import { isContentLayer } from './module-layers'

export interface CellRect {
  x: number
  y: number
  width: number
  height: number
  depth: number
}

export interface ArtStats {
  minCell: number
  cellCount: number
}

export interface GeneratedArt {
  byLayerId: Record<string, SVGElement[]>
  stats: ArtStats
}

type Bounds = { x: number; y: number; w: number; h: number }

interface Primitive {
  k: 'line' | 'path' | 'circle' | 'rect' | 'poly'
  x1?: number
  y1?: number
  x2?: number
  y2?: number
  d?: string
  cx?: number
  cy?: number
  r?: number
  x?: number
  y?: number
  w?: number
  h?: number
  rx?: number
  rot?: number
  pts?: [number, number][]
  closed?: boolean
  faint?: boolean
  dot?: boolean
}

function toBounds(r: Rect): Bounds {
  return { x: r.x, y: r.y, w: r.width, h: r.height }
}

function contentBounds(
  cell: CellRect,
  padding: number,
  scaleMode: CollectionScaleMode,
): Bounds {
  const pad = Math.min(cell.width, cell.height) * padding
  const inner = {
    x: cell.x + pad,
    y: cell.y + pad,
    w: Math.max(0, cell.width - pad * 2),
    h: Math.max(0, cell.height - pad * 2),
  }
  if (scaleMode === 'fit' || inner.w <= 0 || inner.h <= 0) return inner
  const side = Math.min(inner.w, inner.h)
  return {
    x: inner.x + (inner.w - side) / 2,
    y: inner.y + (inner.h - side) / 2,
    w: side,
    h: side,
  }
}

function clipLine(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  xmin: number,
  ymin: number,
  xmax: number,
  ymax: number,
): [number, number, number, number] | null {
  let t0 = 0
  let t1 = 1
  const dx = x1 - x0
  const dy = y1 - y0
  const p = [-dx, dx, -dy, dy]
  const q = [x0 - xmin, xmax - x0, y0 - ymin, ymax - y0]
  for (let i = 0; i < 4; i++) {
    if (p[i] === 0) {
      if (q[i]! < 0) return null
    } else {
      const r = q[i]! / p[i]!
      if (p[i]! < 0) {
        if (r > t1) return null
        if (r > t0) t0 = r
      } else {
        if (r < t0) return null
        if (r < t1) t1 = r
      }
    }
  }
  return [x0 + t0 * dx, y0 + t0 * dy, x0 + t1 * dx, y0 + t1 * dy]
}

function hatch(b: Bounds, angleDeg: number, spacing: number): Primitive[] {
  const out: Primitive[] = []
  const a = (angleDeg * Math.PI) / 180
  const dx = Math.cos(a)
  const dy = Math.sin(a)
  const nx = -dy
  const ny = dx
  const corners: [number, number][] = [
    [b.x, b.y],
    [b.x + b.w, b.y],
    [b.x, b.y + b.h],
    [b.x + b.w, b.y + b.h],
  ]
  let cmin = Infinity
  let cmax = -Infinity
  for (const [cx, cy] of corners) {
    const c = cx * nx + cy * ny
    if (c < cmin) cmin = c
    if (c > cmax) cmax = c
  }
  const start = Math.ceil(cmin / spacing) * spacing
  const BIG = (b.w + b.h) * 2
  for (let c = start; c <= cmax; c += spacing) {
    const px = nx * c
    const py = ny * c
    const seg = clipLine(
      px - dx * BIG,
      py - dy * BIG,
      px + dx * BIG,
      py + dy * BIG,
      b.x,
      b.y,
      b.x + b.w,
      b.y + b.h,
    )
    if (seg) out.push({ k: 'line', x1: seg[0], y1: seg[1], x2: seg[2], y2: seg[3] })
  }
  return out
}

const COLLECTION_RENDERERS: Record<
  string,
  { render: (rng: () => number, b: Bounds, scaleMode: CollectionScaleMode) => Primitive[] }
> = {
  silence: { render: () => [] },

  'regular-textures': {
    render: (rng, b) => {
      const style = pick(rng, ['h', 'v', 'd1', 'd2', 'cross', 'rings'] as const)
      const sp = rnd(rng, 1.6, 3.2)
      if (style === 'rings') {
        const out: Primitive[] = []
        const cx = b.x + b.w / 2
        const cy = b.y + b.h / 2
        const rmax = Math.min(b.w, b.h) / 2
        const step = rnd(rng, 1.6, 2.6)
        for (let r = rmax; r > 0.4; r -= step) out.push({ k: 'circle', cx, cy, r })
        return out
      }
      if (style === 'cross') return [...hatch(b, 0, sp), ...hatch(b, 90, sp)]
      const ang = { h: 0, v: 90, d1: 45, d2: 135 }[style]
      return hatch(b, ang, sp)
    },
  },

  'irregular-textures': {
    render: (rng, b) => {
      const out: Primitive[] = []
      const rows = Math.max(3, Math.floor(b.h / rnd(rng, 2.2, 3.4)))
      const amp = rnd(rng, 0.5, 1.4)
      const freq = rnd(rng, 1.2, 2.8)
      const phase0 = rng() * 6.28
      const seg = Math.max(6, Math.floor(b.w / 1.6))
      for (let r = 0; r <= rows; r++) {
        const y0 = b.y + (b.h * r) / rows
        const ph = phase0 + r * 0.6
        let d = ''
        for (let s = 0; s <= seg; s++) {
          const x = b.x + (b.w * s) / seg
          const y = y0 + Math.sin((x / b.w) * freq * 6.28 + ph) * amp
          d += (s === 0 ? 'M' : 'L') + x.toFixed(2) + ' ' + y.toFixed(2) + ' '
        }
        out.push({ k: 'path', d })
      }
      return out
    },
  },

  'geometric-shapes': {
    render: (rng, b, scaleMode) => {
      const cx = b.x + b.w / 2
      const cy = b.y + b.h / 2
      const R = scaleMode === 'fit' ? Math.min(b.w, b.h) * 0.48 : Math.min(b.w, b.h) * 0.34
      const kind = pick(rng, ['circle', 'tri', 'sq', 'nested', 'circleline'] as const)
      if (kind === 'circle') return [{ k: 'circle', cx, cy, r: R }]
      if (kind === 'circleline') {
        return [
          { k: 'circle', cx, cy, r: R },
          { k: 'line', x1: cx - R, y1: cy, x2: cx + R, y2: cy },
        ]
      }
      if (kind === 'tri') {
        const pts = [0, 1, 2].map((i) => {
          const a = -Math.PI / 2 + (i * 2 * Math.PI) / 3
          return [cx + Math.cos(a) * R, cy + Math.sin(a) * R] as [number, number]
        })
        return [{ k: 'poly', pts, closed: true }]
      }
      if (kind === 'nested') {
        const out: Primitive[] = []
        for (let i = 0; i < 3; i++) {
          const r = R * (1 - i * 0.3)
          out.push({ k: 'rect', x: cx - r, y: cy - r, w: r * 2, h: r * 2, rot: i * 15, cx, cy })
        }
        return out
      }
      return [{ k: 'rect', x: cx - R, y: cy - R, w: R * 2, h: R * 2 }]
    },
  },

  dice: {
    render: (rng, b, scaleMode) => {
      const s = scaleMode === 'fit' ? Math.min(b.w, b.h) * 0.92 : Math.min(b.w, b.h) * 0.62
      const x = b.x + (b.w - s) / 2
      const y = b.y + (b.h - s) / 2
      const out: Primitive[] = [{ k: 'rect', x, y, w: s, h: s, rx: s * 0.14 }]
      const val = 1 + Math.floor(rng() * 6)
      const pr = s * 0.07
      const g = (gx: number, gy: number) =>
        out.push({ k: 'circle', cx: x + s * gx, cy: y + s * gy, r: pr, dot: true })
      const L = 0.27
      const M = 0.5
      const H = 0.73
      if (val % 2 === 1) g(M, M)
      if (val >= 2) {
        g(L, L)
        g(H, H)
      }
      if (val >= 4) {
        g(H, L)
        g(L, H)
      }
      if (val === 6) {
        g(L, M)
        g(H, M)
      }
      return out
    },
  },
}

function weights(rng: () => number, n: number, irregular: boolean): number[] {
  if (!irregular) return Array(n).fill(1)
  return Array.from({ length: n }, () => rnd(rng, 0.6, 1.7))
}

function splitWeighted(start: number, total: number, ws: number[]): number[] {
  const sum = ws.reduce((a, c) => a + c, 0)
  const edges = [start]
  let acc = start
  for (const w of ws) {
    acc += (w / sum) * total
    edges.push(acc)
  }
  return edges
}

function buildGrid(
  b: Bounds,
  spec: GridSpec,
  rng: () => number,
  depth: number,
  stats: { minCell: number },
): CellRect[] {
  const cols = depth === 0 ? spec.cols : 1 + Math.floor(rng() * 2) + 1
  const rows = depth === 0 ? spec.rows : 1 + Math.floor(rng() * 2) + 1
  const cw = weights(rng, cols, depth === 0 && spec.irregular)
  const rw = weights(rng, rows, depth === 0 && spec.irregular)
  const xs = splitWeighted(b.x, b.w, cw)
  const ys = splitWeighted(b.y, b.h, rw)
  const cells: CellRect[] = []

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cell: CellRect = {
        x: xs[c]!,
        y: ys[r]!,
        width: xs[c + 1]! - xs[c]!,
        height: ys[r + 1]! - ys[r]!,
        depth,
      }
      const minDim = Math.min(cell.width, cell.height)
      if (minDim < stats.minCell) stats.minCell = minDim
      const canSplit =
        depth < spec.depth && minDim > spec.threshold * 3 && rng() < spec.splitProb
      if (canSplit) {
        cells.push(...buildGrid(toBounds(cell), spec, rng, depth + 1, stats))
      } else {
        cells.push(cell)
      }
    }
  }
  return cells
}

function primitiveToSvg(p: Primitive, faint: boolean): SVGElement {
  const sw = faint ? '0.18' : '0.32'
  if (p.k === 'line') {
    return svgEl('line', {
      x1: p.x1!,
      y1: p.y1!,
      x2: p.x2!,
      y2: p.y2!,
      'stroke-width': sw,
      'vector-effect': 'non-scaling-stroke',
    })
  }
  if (p.k === 'path') {
    return svgEl('path', { d: p.d!.trim(), 'stroke-width': sw, 'vector-effect': 'non-scaling-stroke' })
  }
  if (p.k === 'circle') {
    const el = svgEl('circle', {
      cx: p.cx!,
      cy: p.cy!,
      r: p.r!,
      'stroke-width': sw,
      'vector-effect': 'non-scaling-stroke',
    })
    if (p.dot) el.setAttribute('fill', 'currentColor')
    return el
  }
  if (p.k === 'rect') {
    const el = svgEl('rect', {
      x: p.x!,
      y: p.y!,
      width: p.w!,
      height: p.h!,
      rx: p.rx ?? 0,
      'stroke-width': sw,
      'vector-effect': 'non-scaling-stroke',
    })
    if (p.rot != null && p.cx != null && p.cy != null) {
      el.setAttribute('transform', `rotate(${p.rot} ${p.cx} ${p.cy})`)
    }
    return el
  }
  const pts = p.pts!.map((q) => q.join(',')).join(' ')
  return svgEl(p.closed ? 'polygon' : 'polyline', {
    points: pts,
    'stroke-width': sw,
    'vector-effect': 'non-scaling-stroke',
  })
}

function pushPrimitives(target: SVGElement[], prims: Primitive[], faint = false): void {
  for (const p of prims) {
    if (p.faint || faint) {
      const g = svgEl('g', {})
      g.appendChild(primitiveToSvg(p, true))
      target.push(g)
    } else {
      target.push(primitiveToSvg(p, false))
    }
  }
}

function chooseContentLayer(
  rng: () => number,
  contentLayers: PlotterDocument['layers'],
): PlotterDocument['layers'][number] | null {
  const candidates = contentLayers.filter((l) => l.visible && l.collectionWeight > 0)
  if (!candidates.length) return null
  const wsum = candidates.reduce((a, l) => a + l.collectionWeight, 0) || 1
  let r = rng() * wsum
  for (const layer of candidates) {
    if ((r -= layer.collectionWeight) <= 0) return layer
  }
  return candidates[0]!
}

function shouldLeaveEmpty(rng: () => number, emptySpace: number): boolean {
  if (emptySpace <= 0) return false
  return rng() * 6 < emptySpace
}

export const DEFAULT_GRID_SPEC: GridSpec = {
  rows: 5,
  cols: 7,
  depth: 2,
  splitProb: 0.34,
  irregular: false,
  threshold: 2,
  cellPadding: 0.12,
  scaleMode: 'proportional',
}

/** @deprecated Kept for migration. */
export const DEFAULT_COLLECTION_WEIGHTS: CollectionWeight[] = [
  { id: 'silence', on: true, weight: 5 },
  { id: 'regular-textures', on: true, weight: 4 },
  { id: 'irregular-textures', on: true, weight: 2 },
  { id: 'geometric-shapes', on: true, weight: 3 },
  { id: 'dice', on: true, weight: 1 },
]

export function generateArt(document: PlotterDocument): GeneratedArt {
  const paper = getPaperDimensions(document)
  const m = document.margin
  const bounds: Bounds = { x: m, y: m, w: paper.width - m * 2, h: paper.height - m * 2 }
  const rng = makeRng(document.seed)
  const stats = { minCell: Infinity }
  const cells = buildGrid(bounds, document.grid, rng, 0, stats)

  const byLayerId: Record<string, SVGElement[]> = {}
  for (const layer of document.layers) {
    byLayerId[layer.id] = []
  }

  const cutBorder = document.layers.find((l) => l.layerRole === 'cut-border')
  const frame = document.layers.find((l) => l.layerRole === 'frame')
  const contentLayers = document.layers.filter(isContentLayer)

  if (cutBorder) {
    const ti = Math.min(m * 0.45, 6)
    pushPrimitives(byLayerId[cutBorder.id]!, [
      { k: 'rect', x: ti, y: ti, w: paper.width - ti * 2, h: paper.height - ti * 2 },
    ])
  }

  if (frame) {
    pushPrimitives(byLayerId[frame.id]!, [
      { k: 'rect', x: bounds.x, y: bounds.y, w: bounds.w, h: bounds.h },
    ])
  }

  for (const cell of cells) {
    if (document.structure && frame) {
      pushPrimitives(
        byLayerId[frame.id]!,
        [{ k: 'rect', x: cell.x, y: cell.y, w: cell.width, h: cell.height, faint: true }],
        true,
      )
    }

    const layer = chooseContentLayer(rng, contentLayers)
    if (!layer) continue
    if (shouldLeaveEmpty(rng, layer.emptySpace)) continue
    const renderer = COLLECTION_RENDERERS[layer.primaryCollection]
    if (!renderer) continue
    const b = contentBounds(cell, document.grid.cellPadding, document.grid.scaleMode)
    if (b.w <= 0 || b.h <= 0) continue
    const prims = renderer.render(rng, b, document.grid.scaleMode)
    pushPrimitives(byLayerId[layer.id]!, prims)
  }

  return {
    byLayerId,
    stats: {
      minCell: stats.minCell === Infinity ? 0 : stats.minCell,
      cellCount: cells.length,
    },
  }
}
