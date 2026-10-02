import { describe, expect, it } from 'vitest'
import { generateArt, DEFAULT_GRID_SPEC } from './art-engine'
import { createGridModuleLayers } from './module-layers'
import type { PlotterDocument } from '../types'

function docWith(collection: string, seed: number, depth = 2): PlotterDocument {
  const layers = createGridModuleLayers()
  const content = layers.find((l) => l.layerRole === 'content')!
  content.primaryCollection = collection
  content.emptySpace = 0
  return {
    id: 't',
    name: 't',
    version: '1',
    moduleId: 'grid',
    paperFormat: 'A4',
    landscape: true,
    margin: 14,
    seed,
    structure: true,
    grid: { ...DEFAULT_GRID_SPEC, depth },
    layers,
  }
}

interface Box {
  x: number
  y: number
  w: number
  h: number
}

function num(el: Element, name: string): number {
  return Number(el.getAttribute(name))
}

function pointsOf(el: Element): Array<[number, number]> {
  const tag = el.tagName.toLowerCase()
  if (tag === 'g') {
    return Array.from(el.children).flatMap((child) => pointsOf(child))
  }
  if (tag === 'line') {
    return [
      [num(el, 'x1'), num(el, 'y1')],
      [num(el, 'x2'), num(el, 'y2')],
    ]
  }
  if (tag === 'circle') return [[num(el, 'cx'), num(el, 'cy')]]
  if (tag === 'rect') {
    const x = num(el, 'x')
    const y = num(el, 'y')
    const w = num(el, 'width')
    const h = num(el, 'height')
    return [[x + w / 2, y + h / 2]]
  }
  if (tag === 'polygon' || tag === 'polyline') {
    return (el.getAttribute('points') ?? '')
      .trim()
      .split(/\s+/)
      .map((pair) => pair.split(',').map(Number) as [number, number])
  }
  if (tag === 'path') {
    const pts: Array<[number, number]> = []
    const d = el.getAttribute('d') ?? ''
    for (const match of d.matchAll(/[ML]\s*(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)/g)) {
      pts.push([Number(match[1]), Number(match[2])])
    }
    return pts
  }
  return []
}

function cellBoxes(elements: SVGElement[]): Box[] {
  return elements.flatMap((el) => {
    const rect = el.tagName.toLowerCase() === 'rect' ? el : el.querySelector('rect')
    if (!rect) return []
    return [
      {
        x: num(rect, 'x'),
        y: num(rect, 'y'),
        w: num(rect, 'width'),
        h: num(rect, 'height'),
      },
    ]
  })
}

function contains(box: Box, x: number, y: number): boolean {
  const eps = 0.75
  return x >= box.x - eps && x <= box.x + box.w + eps && y >= box.y - eps && y <= box.y + box.h + eps
}

function emptyCellCount(doc: PlotterDocument): number {
  const art = generateArt(doc)
  const structure = doc.layers.find((l) => l.layerRole === 'structure')!
  const content = doc.layers.find((l) => l.layerRole === 'content')!
  const cells = cellBoxes(art.byLayerId[structure.id]!)
  const points = art.byLayerId[content.id]!.flatMap((el) => pointsOf(el))
  return cells.filter((cell) => !points.some(([x, y]) => contains(cell, x, y))).length
}

describe('empty space 10 blanks every assigned cell', () => {
  it('leaves the grid empty', () => {
    const doc = docWith('regular-textures', 4, 0)
    const content = doc.layers.find((l) => l.layerRole === 'content')!
    content.emptySpace = 10
    const art = generateArt(doc)
    expect(emptyCellCount(doc)).toBe(art.stats.cellCount)
    expect(art.stats.cellCount).toBeGreaterThan(0)
  })
})

describe('grid cells stay filled when empty space is 0', () => {
  const collections = ['regular-textures', 'irregular-textures', 'geometric-shapes', 'dice'] as const

  for (const collection of collections) {
    it(`${collection} leaves no blank cells`, () => {
      for (const depth of [0, 2]) {
        for (let seed = 1; seed <= 12; seed++) {
          const empty = emptyCellCount(docWith(collection, seed, depth))
          expect(empty, `${collection} depth=${depth} seed=${seed}`).toBe(0)
        }
      }
    })
  }
})
