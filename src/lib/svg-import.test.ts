import { describe, expect, it } from 'vitest'
import { deserializeNodes, parseSvgString } from './svg-import'

const SIMPLE_SVG = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 80">
  <rect x="10" y="10" width="30" height="20" />
  <path d="M 0 0 L 50 50" />
</svg>`

const GROUPED_SVG = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 100">
  <g transform="translate(0 0)">
    <rect x="0" y="0" width="20" height="20" />
  </g>
  <g transform="translate(80 0)">
    <rect x="0" y="0" width="20" height="20" />
  </g>
</svg>`

const USE_SVG = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 50">
  <defs>
    <rect id="box" x="0" y="0" width="10" height="10" />
  </defs>
  <use href="#box" x="0" y="0" />
  <use href="#box" x="30" y="0" />
</svg>`

const SYMBOL_SVG = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 40">
  <defs>
    <symbol id="glyph" viewBox="0 0 10 30">
      <path d="M 2 0 L 2 30" stroke="#000" stroke-width="0.5" fill="none" />
    </symbol>
  </defs>
  <use href="#glyph" x="0" y="5" />
  <use href="#glyph" x="20" y="5" />
  <use href="#glyph" x="40" y="5" />
</svg>`

const FILL_ONLY_SVG = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50">
  <path fill="#000000" stroke="none" d="M 10 10 L 40 10 L 40 40 L 10 40 Z" />
</svg>`

describe('parseSvgString', () => {
  it('extracts viewBox and drawable elements', () => {
    const parsed = parseSvgString(SIMPLE_SVG, 'test.svg')
    expect(parsed.sourceFileName).toBe('test.svg')
    expect(parsed.viewBox.width).toBeGreaterThan(0)
    expect(parsed.nodes).toHaveLength(2)
  })

  it('preserves group transforms', () => {
    const parsed = parseSvgString(GROUPED_SVG, 'grouped.svg')
    expect(parsed.nodes).toHaveLength(2)
    expect(parsed.nodes.every((n) => n.tag === 'g' && n.attrs.transform?.includes('translate'))).toBe(
      true,
    )
    expect(parsed.nodes[1]?.attrs.transform).toContain('translate(80')
  })

  it('resolves use references with offsets', () => {
    const parsed = parseSvgString(USE_SVG, 'use.svg')
    expect(parsed.nodes).toHaveLength(2)
    expect(parsed.nodes[1]?.attrs.transform).toContain('translate(30')
  })

  it('resolves symbol references used by typography SVGs', () => {
    const parsed = parseSvgString(SYMBOL_SVG, 'symbol.svg')
    expect(parsed.viewBox.width).toBeGreaterThan(30)
    expect(parsed.nodes.length).toBeGreaterThanOrEqual(3)
  })

  it('converts fill-only paths to strokes for plotter output', () => {
    const parsed = parseSvgString(FILL_ONLY_SVG, 'fill.svg')
    const path = parsed.nodes[0]
    expect(path?.attrs.stroke).toBe('#000000')
    expect(path?.attrs.fill).toBe('none')
  })

  it('rejects SVG without drawables', () => {
    const empty = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><text>hola</text></svg>'
    expect(() => parseSvgString(empty, 'empty.svg')).toThrow(/trazos compatibles/)
  })

  it('rejects invalid XML', () => {
    expect(() => parseSvgString('<svg><unclosed', 'bad.svg')).toThrow()
  })
})

describe('deserializeNodes', () => {
  it('rebuilds nested group structure', () => {
    const parsed = parseSvgString(GROUPED_SVG, 'grouped.svg')
    const els = deserializeNodes(parsed.nodes)
    expect(els).toHaveLength(2)
    expect(els[0]?.tagName.toLowerCase()).toBe('g')
    expect(els[0]?.getAttribute('transform')).toContain('translate')
  })
})
