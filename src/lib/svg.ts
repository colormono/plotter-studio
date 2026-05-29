export const SVG_NS = 'http://www.w3.org/2000/svg'

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

const GRADIENT_TAGS = new Set(['lineargradient', 'radialgradient', 'filter'])
const URL_REF_RE = /^url\(/i

function sanitizeNode(node: Element): void {
  // Fix fill: anything that is not "none" becomes "none"
  const fill = node.getAttribute('fill')
  if (fill !== null && fill !== 'none') {
    node.setAttribute('fill', 'none')
  }

  // Remove filter / gradient reference attributes
  if (node.hasAttribute('filter')) node.removeAttribute('filter')
  if (URL_REF_RE.test(node.getAttribute('fill') ?? '')) node.setAttribute('fill', 'none')
  if (URL_REF_RE.test(node.getAttribute('stroke') ?? '')) node.removeAttribute('stroke')

  // Process children depth-first so empty-<g> detection is accurate
  const children = Array.from(node.children)
  for (const child of children) {
    const tag = child.tagName.toLowerCase()

    if (GRADIENT_TAGS.has(tag)) {
      node.removeChild(child)
      continue
    }

    sanitizeNode(child as Element)

    // Remove empty <g> after their children have been sanitized
    if (tag === 'g' && child.children.length === 0) {
      node.removeChild(child)
    }
  }
}

/**
 * Deep-clones `root` and returns a sanitized copy safe for plotter export:
 * - All fills are forced to "none"
 * - <filter>, <linearGradient>, <radialGradient> elements are removed
 * - filter / gradient url() references are stripped
 * - Empty <g> elements are pruned
 */
export function sanitize(root: SVGElement): SVGElement {
  const clone = root.cloneNode(true) as SVGElement
  sanitizeNode(clone)
  return clone
}
