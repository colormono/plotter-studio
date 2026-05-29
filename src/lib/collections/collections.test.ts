import { describe, it, expect } from 'vitest'
import { COLLECTIONS, getCollection, renderCollection } from './index'
import { silenceCollection } from './silence'
import { regularTexturesCollection } from './regular-textures'
import { geometricShapesCollection } from './geometric-shapes'
import { diceCollection } from './dice'
import { irregularTexturesCollection } from './irregular-textures'
import { Rect } from '../../types'

const bounds: Rect = { x: 10, y: 10, width: 60, height: 60 }

// ─── Catalog ─────────────────────────────────────────────────────────────────

describe('COLLECTIONS', () => {
  it('exports a non-empty array', () => {
    expect(COLLECTIONS.length).toBeGreaterThan(0)
  })

  it('contains all four registered collections', () => {
    const ids = COLLECTIONS.map((c) => c.id)
    expect(ids).toContain('regular-textures')
    expect(ids).toContain('geometric-shapes')
    expect(ids).toContain('dice')
    expect(ids).toContain('irregular-textures')
    expect(ids).not.toContain('silence')
  })

  it('every entry has id, label and render function', () => {
    for (const col of COLLECTIONS) {
      expect(typeof col.id).toBe('string')
      expect(typeof col.label).toBe('string')
      expect(typeof col.render).toBe('function')
    }
  })
})

describe('getCollection', () => {
  it('returns the collection by id', () => {
    const col = getCollection('regular-textures')
    expect(col.id).toBe('regular-textures')
  })

  it('throws for unknown ids', () => {
    expect(() => getCollection('not-real')).toThrow(/not found/)
    expect(() => getCollection('silence')).toThrow(/not found/)
  })
})

// ─── Invariant: value 0 → [] ─────────────────────────────────────────────────

describe('value 0 invariant', () => {
  it('renderCollection always returns [] for value 0, regardless of collection', () => {
    for (const col of COLLECTIONS) {
      expect(renderCollection(col, 0, bounds)).toEqual([])
    }
  })

  it('silence.render returns [] for any value', () => {
    expect(silenceCollection.render(0, bounds)).toEqual([])
    expect(silenceCollection.render(1, bounds)).toEqual([])
    expect(silenceCollection.render(99, bounds)).toEqual([])
  })
})

// ─── silence ─────────────────────────────────────────────────────────────────

describe('silence collection', () => {
  it('always returns an empty array', () => {
    for (const v of [0, 1, 2, 3, 100]) {
      expect(silenceCollection.render(v, bounds)).toEqual([])
    }
  })
})

// ─── regular-textures ────────────────────────────────────────────────────────

function assertNoFill(elements: SVGElement[]) {
  for (const el of elements) {
    const fill = el.getAttribute('fill')
    expect(fill === null || fill === 'none').toBe(true)
  }
}

describe('regular-textures collection', () => {
  it('value 1 returns a non-empty array of SVGElements', () => {
    const els = regularTexturesCollection.render(1, bounds)
    expect(els.length).toBeGreaterThan(0)
  })

  it('value 2 returns a non-empty array of SVGElements', () => {
    const els = regularTexturesCollection.render(2, bounds)
    expect(els.length).toBeGreaterThan(0)
  })

  it('value 3 returns a non-empty array of SVGElements', () => {
    const els = regularTexturesCollection.render(3, bounds)
    expect(els.length).toBeGreaterThan(0)
  })

  it('value 4 returns a non-empty array of SVGElements', () => {
    const els = regularTexturesCollection.render(4, bounds)
    expect(els.length).toBeGreaterThan(0)
  })

  it('values 1–4 produce different element counts (distinct textures)', () => {
    const counts = [1, 2, 3, 4].map(
      (v) => regularTexturesCollection.render(v, bounds).length,
    )
    // Not all counts can be equal — at least two must differ
    const unique = new Set(counts)
    expect(unique.size).toBeGreaterThan(1)
  })

  it('no element has fill other than none', () => {
    for (let v = 1; v <= 6; v++) {
      assertNoFill(regularTexturesCollection.render(v, bounds))
    }
  })

  it('value 0 returns []', () => {
    expect(regularTexturesCollection.render(0, bounds)).toEqual([])
  })

  it('values wrap around — value 7 behaves like value 1', () => {
    const els1 = regularTexturesCollection.render(1, bounds)
    const els7 = regularTexturesCollection.render(7, bounds)
    expect(els7.length).toBe(els1.length)
  })

  it('all elements have stroke-width attribute', () => {
    const els = regularTexturesCollection.render(1, bounds)
    for (const el of els) {
      expect(el.getAttribute('stroke-width')).not.toBeNull()
    }
  })
})

// ─── geometric-shapes ────────────────────────────────────────────────────────

describe('geometric-shapes collection', () => {
  it('values 1–5 each return a non-empty array', () => {
    for (let v = 1; v <= 5; v++) {
      expect(geometricShapesCollection.render(v, bounds).length).toBeGreaterThan(0)
    }
  })

  it('value 0 returns []', () => {
    expect(geometricShapesCollection.render(0, bounds)).toEqual([])
  })

  it('values 1–5 produce distinct element counts (distinct shapes)', () => {
    const counts = [1, 2, 3, 4, 5].map((v) => geometricShapesCollection.render(v, bounds).length)
    expect(new Set(counts).size).toBeGreaterThan(1)
  })

  it('no element has fill other than none', () => {
    for (let v = 1; v <= 5; v++) {
      assertNoFill(geometricShapesCollection.render(v, bounds))
    }
  })

  it('wraps around — value 6 behaves like value 1', () => {
    const els1 = geometricShapesCollection.render(1, bounds)
    const els6 = geometricShapesCollection.render(6, bounds)
    expect(els6.length).toBe(els1.length)
  })
})

// ─── dice ─────────────────────────────────────────────────────────────────────

describe('dice collection', () => {
  it('values 1–6 each return a non-empty array', () => {
    for (let v = 1; v <= 6; v++) {
      expect(diceCollection.render(v, bounds).length).toBeGreaterThan(0)
    }
  })

  it('value 0 returns []', () => {
    expect(diceCollection.render(0, bounds)).toEqual([])
  })

  it('each face has the expected number of elements (border + dots)', () => {
    // 1 border + N dots
    expect(diceCollection.render(1, bounds).length).toBe(2)  // border + 1 dot
    expect(diceCollection.render(2, bounds).length).toBe(3)  // border + 2 dots
    expect(diceCollection.render(3, bounds).length).toBe(4)
    expect(diceCollection.render(4, bounds).length).toBe(5)
    expect(diceCollection.render(5, bounds).length).toBe(6)
    expect(diceCollection.render(6, bounds).length).toBe(7)
  })

  it('no element has fill other than none', () => {
    for (let v = 1; v <= 6; v++) {
      assertNoFill(diceCollection.render(v, bounds))
    }
  })
})

// ─── irregular-textures ──────────────────────────────────────────────────────

describe('irregular-textures collection', () => {
  it('values 1–4 each return a non-empty array', () => {
    for (let v = 1; v <= 4; v++) {
      expect(irregularTexturesCollection.render(v, bounds).length).toBeGreaterThan(0)
    }
  })

  it('value 0 returns []', () => {
    expect(irregularTexturesCollection.render(0, bounds)).toEqual([])
  })

  it('no element has fill other than none', () => {
    for (let v = 1; v <= 4; v++) {
      assertNoFill(irregularTexturesCollection.render(v, bounds))
    }
  })

  it('scattered dots (value 3) are reproducible — same bounds → same count', () => {
    const a = irregularTexturesCollection.render(3, bounds)
    const b = irregularTexturesCollection.render(3, bounds)
    expect(a.length).toBe(b.length)
  })

  it('scattered dots differ between cells at different positions', () => {
    const boundsA: Rect = { x: 10, y: 10, width: 60, height: 60 }
    const boundsB: Rect = { x: 80, y: 10, width: 60, height: 60 }
    const aCoords = irregularTexturesCollection.render(3, boundsA).map((el) => el.getAttribute('cx'))
    const bCoords = irregularTexturesCollection.render(3, boundsB).map((el) => el.getAttribute('cx'))
    expect(aCoords).not.toEqual(bCoords)
  })
})
