const SVG_NS = 'http://www.w3.org/2000/svg'

type AttrValue = string | number

/**
 * Creates an SVG element with the given attributes.
 * All elements are created with fill="none" by default so they are
 * safe for plotter output without additional sanitization.
 */
export function svgEl(tag: string, attrs: Record<string, AttrValue> = {}): SVGElement {
  const el = document.createElementNS(SVG_NS, tag) as SVGElement
  el.setAttribute('fill', 'none')
  for (const [k, v] of Object.entries(attrs)) {
    el.setAttribute(k, String(v))
  }
  return el
}
