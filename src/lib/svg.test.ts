import { describe, it, expect } from 'vitest'
import { sanitize, SVG_NS } from './svg'

function el(tag: string, attrs: Record<string, string> = {}, children: Element[] = []): SVGElement {
  const node = document.createElementNS(SVG_NS, tag) as SVGElement
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v)
  for (const child of children) node.appendChild(child)
  return node
}

function svg(...children: Element[]): SVGElement {
  return el('svg', { viewBox: '0 0 210 297' }, children)
}

// ─── fill sanitization ────────────────────────────────────────────────────────

describe('sanitize — fill', () => {
  it('replaces fill="red" with fill="none"', () => {
    const root = svg(el('rect', { fill: 'red', width: '10', height: '10' }))
    const clean = sanitize(root)
    expect(clean.querySelector('rect')!.getAttribute('fill')).toBe('none')
  })

  it('preserves fill="none"', () => {
    const root = svg(el('circle', { fill: 'none', r: '5' }))
    const clean = sanitize(root)
    expect(clean.querySelector('circle')!.getAttribute('fill')).toBe('none')
  })

  it('replaces fill="url(#grad)" with fill="none"', () => {
    const root = svg(el('rect', { fill: 'url(#grad)', width: '10', height: '10' }))
    const clean = sanitize(root)
    expect(clean.querySelector('rect')!.getAttribute('fill')).toBe('none')
  })

  it('removes fill attribute set to arbitrary color on the root', () => {
    const root = svg()
    root.setAttribute('fill', 'blue')
    const clean = sanitize(root)
    expect(clean.getAttribute('fill')).toBe('none')
  })
})

// ─── filter sanitization ─────────────────────────────────────────────────────

describe('sanitize — filter elements and references', () => {
  it('removes <filter> child elements', () => {
    const filter = el('filter', { id: 'blur' })
    filter.appendChild(el('feGaussianBlur'))
    const root = svg(filter, el('rect', { filter: 'url(#blur)' }))
    const clean = sanitize(root)
    expect(clean.querySelector('filter')).toBeNull()
  })

  it('removes filter="url(...)" attribute from elements', () => {
    const root = svg(el('rect', { filter: 'url(#blur)', width: '10', height: '10' }))
    const clean = sanitize(root)
    expect(clean.querySelector('rect')!.hasAttribute('filter')).toBe(false)
  })
})

// ─── gradient sanitization ────────────────────────────────────────────────────

describe('sanitize — gradient elements', () => {
  it('removes <linearGradient> elements', () => {
    const grad = el('linearGradient', { id: 'lg' })
    const root = svg(grad, el('rect', { fill: 'url(#lg)' }))
    const clean = sanitize(root)
    expect(clean.querySelector('linearGradient')).toBeNull()
    expect(clean.querySelector('rect')!.getAttribute('fill')).toBe('none')
  })

  it('removes <radialGradient> elements', () => {
    const grad = el('radialGradient', { id: 'rg' })
    const root = svg(grad)
    const clean = sanitize(root)
    expect(clean.querySelector('radialGradient')).toBeNull()
  })
})

// ─── empty <g> pruning ────────────────────────────────────────────────────────

describe('sanitize — empty <g> pruning', () => {
  it('removes empty <g> elements', () => {
    const root = svg(el('g', { id: 'empty' }))
    const clean = sanitize(root)
    expect(clean.querySelector('g')).toBeNull()
  })

  it('preserves <g> elements that have children', () => {
    const g = el('g', { id: 'layer' }, [el('line', { x1: '0', y1: '0', x2: '10', y2: '10' })])
    const root = svg(g)
    const clean = sanitize(root)
    expect(clean.querySelector('g')).not.toBeNull()
    expect(clean.querySelector('line')).not.toBeNull()
  })

  it('removes <g> that becomes empty after its filter child is removed', () => {
    const filter = el('filter', { id: 'f' })
    const g = el('g', { id: 'layer' }, [filter])
    const root = svg(g)
    const clean = sanitize(root)
    expect(clean.querySelector('g')).toBeNull()
  })
})

// ─── non-destructive clone ────────────────────────────────────────────────────

describe('sanitize — non-destructive', () => {
  it('does not mutate the original element', () => {
    const root = svg(el('rect', { fill: 'red' }))
    sanitize(root)
    expect(root.querySelector('rect')!.getAttribute('fill')).toBe('red')
  })
})
