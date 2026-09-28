import { describe, expect, it } from 'vitest'
import { glyphBoundingBox, resolveGlyph } from './hershey-glyphs'
import { fitTextHeight, measureText, renderHersheyText, renderHersheyTextCentered } from './hershey-text'

describe('hershey-text', () => {
  it('measures wider text than narrow text', () => {
    expect(measureText('MMMM', 10)).toBeGreaterThan(measureText('II', 10))
  })

  it('fits text height within max width', () => {
    const height = fitTextHeight("Don't Break the Chain", 180, 20)
    expect(measureText("Don't Break the Chain", height)).toBeLessThanOrEqual(180)
    expect(height).toBeLessThanOrEqual(20)
  })

  it('renders stroke paths without fill', () => {
    const els = renderHersheyText('ABC', { x: 10, y: 20, height: 8 })
    expect(els.length).toBeGreaterThan(0)
    expect(els.every((el) => el.tagName.toLowerCase() === 'path')).toBe(true)
  })

  it('draws digit 1 with top serif and stem on baseline', () => {
    const glyph = resolveGlyph('1')
    const box = glyphBoundingBox(glyph)
    expect(box).not.toBeNull()
    expect(box!.minY).toBe(0)
    expect(box!.maxY).toBe(14)
    expect(glyph[1]?.some(([, y]) => y >= 12)).toBe(true)

    const els = renderHersheyTextCentered('1', 20, 20, 8)
    expect(els.length).toBe(2)
    const stem = els[0]?.getAttribute('d') ?? ''
    const nums = [...stem.matchAll(/-?[\d.]+/g)].map((m) => parseFloat(m[0]!))
    const stemYs = nums.filter((_, i) => i % 2 === 1)
    expect(stemYs[0]).toBeGreaterThan(stemYs[1]!)
  })
})
