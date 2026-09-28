import { describe, expect, it } from 'vitest'
import {
  buildTransform,
  defaultPlacement,
  drawingSizeMm,
  normalizeRotation,
} from './loaded-svg'

describe('loaded-svg placement', () => {
  const viewBox = { x: 0, y: 0, width: 100, height: 50 }
  const paper = { width: 210, height: 297 }

  it('fits drawing inside margins by default', () => {
    const placement = defaultPlacement(viewBox, paper, 14)
    const size = drawingSizeMm(viewBox, placement)
    expect(size.width).toBeLessThanOrEqual(210 - 28)
    expect(size.height).toBeLessThanOrEqual(297 - 28)
    expect(placement.x).toBe(105)
    expect(placement.y).toBe(148.5)
  })

  it('swaps dimensions when rotated 90°', () => {
    const placement = { x: 100, y: 100, scale: 2, rotation: 90 }
    const size = drawingSizeMm(viewBox, placement)
    expect(size.width).toBe(100)
    expect(size.height).toBe(200)
  })

  it('normalizes rotation to 90° steps', () => {
    expect(normalizeRotation(95)).toBe(90)
    expect(normalizeRotation(-90)).toBe(270)
    expect(normalizeRotation(360)).toBe(0)
  })

  it('builds a centered transform string', () => {
    const transform = buildTransform(viewBox, { x: 50, y: 50, scale: 1, rotation: 0 })
    expect(transform).toContain('translate(50 50)')
    expect(transform).toContain('scale(1)')
    expect(transform).toContain('translate(-50 -25)')
  })
})
