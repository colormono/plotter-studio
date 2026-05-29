import { describe, it, expect } from 'vitest'
import { getPaperDimensions, formatPaperLabel, isSquareFormat } from './paper'
import type { PlotterDocument } from '../types'

const base = (patch: Partial<PlotterDocument>): PlotterDocument =>
  ({
    id: '1',
    name: 't',
    version: '1',
    paperFormat: 'A4',
    landscape: false,
    margin: 14,
    seed: 1,
    structure: true,
    grid: { rows: 4, cols: 4, depth: 1, splitProb: 0.3, irregular: false, threshold: 2 },
    collections: [],
    layers: [],
    ...patch,
  }) as PlotterDocument

describe('getPaperDimensions', () => {
  it('returns portrait A4 by default', () => {
    expect(getPaperDimensions(base({}))).toEqual({ width: 210, height: 297 })
  })

  it('swaps dimensions when landscape', () => {
    expect(getPaperDimensions(base({ landscape: true }))).toEqual({ width: 297, height: 210 })
  })

  it('keeps square format at 210×210 regardless of landscape', () => {
    const doc = base({ paperFormat: 'Square', landscape: true })
    expect(getPaperDimensions(doc)).toEqual({ width: 210, height: 210 })
    expect(isSquareFormat('Square')).toBe(true)
  })
})

describe('formatPaperLabel', () => {
  it('includes orientation for non-square formats', () => {
    expect(formatPaperLabel(base({ landscape: true }))).toContain('apaisado')
    expect(formatPaperLabel(base({ landscape: false }))).toContain('vertical')
  })
})
