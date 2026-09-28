import { sanitize, SVG_NS } from './svg'

export interface SerializedSvgNode {
  tag: string
  attrs: Record<string, string>
  children?: SerializedSvgNode[]
}

/** @deprecated Use SerializedSvgNode */
export type SerializedSvgElement = SerializedSvgNode

export interface LoadedSvgViewBox {
  x: number
  y: number
  width: number
  height: number
}

export interface ParsedSvg {
  sourceFileName: string
  viewBox: LoadedSvgViewBox
  nodes: SerializedSvgNode[]
}

const DRAWABLE_TAGS = new Set([
  'path',
  'line',
  'polyline',
  'polygon',
  'circle',
  'rect',
  'ellipse',
])

const SKIP_TAGS = new Set([
  'defs',
  'style',
  'metadata',
  'title',
  'desc',
  'script',
  'filter',
  'lineargradient',
  'radialgradient',
  'clippath',
  'mask',
  'pattern',
  'text',
  'image',
  'tspan',
])

const STRIP_ATTRS = new Set(['id', 'filter', 'class', 'data-name', 'style'])

const LENGTH_UNIT: Record<string, number> = {
  mm: 1,
  cm: 10,
  in: 25.4,
  pt: 25.4 / 72,
  pc: 25.4 / 6,
  px: 25.4 / 96,
}

function parseLength(raw: string | null): number {
  if (!raw) return 0
  const trimmed = raw.trim()
  const match = trimmed.match(/^([\d.+-]+)\s*([a-z%]*)$/i)
  if (!match) return 0
  const value = parseFloat(match[1]!)
  if (!Number.isFinite(value)) return 0
  const unit = (match[2] ?? '').toLowerCase()
  if (!unit || unit === 'mm') return value
  if (unit === '%') return value
  return value * (LENGTH_UNIT[unit] ?? 1)
}

function extractDeclaredViewBox(svg: SVGSVGElement): LoadedSvgViewBox {
  const vb = svg.viewBox?.baseVal
  if (vb && vb.width > 0 && vb.height > 0) {
    return { x: vb.x, y: vb.y, width: vb.width, height: vb.height }
  }

  const w = parseLength(svg.getAttribute('width'))
  const h = parseLength(svg.getAttribute('height'))
  if (w > 0 && h > 0) return { x: 0, y: 0, width: w, height: h }

  return { x: 0, y: 0, width: 100, height: 100 }
}

function copyAttrs(el: Element): Record<string, string> {
  const attrs: Record<string, string> = {}
  for (const attr of Array.from(el.attributes)) {
    const name = attr.name
    if (STRIP_ATTRS.has(name)) continue
    if (name === 'href' || name === 'xlink:href') continue
    if (URL_REF_RE.test(attr.value) && (name === 'fill' || name === 'stroke')) continue
    attrs[name] = attr.value
  }
  return attrs
}

const URL_REF_RE = /^url\(/i

function collectIdMap(root: Element): Map<string, Element> {
  const map = new Map<string, Element>()
  const walk = (node: Element) => {
    const id = node.getAttribute('id')
    if (id) map.set(id, node)
    for (const child of Array.from(node.children)) walk(child as Element)
  }
  walk(root)
  return map
}

function mergeTransforms(...parts: (string | undefined)[]): string | undefined {
  const valid = parts.filter((p) => p && p.trim())
  return valid.length ? valid.join(' ') : undefined
}

function serializeUse(el: Element, idMap: Map<string, Element>): SerializedSvgNode | null {
  const href = el.getAttribute('href') ?? el.getAttribute('xlink:href')
  if (!href?.startsWith('#')) return null

  const ref = idMap.get(href.slice(1))
  if (!ref) return null

  const refNode = serializeNode(ref, idMap)
  if (!refNode) return null

  const attrs = copyAttrs(el)
  const x = attrs.x ?? '0'
  const y = attrs.y ?? '0'
  delete attrs.x
  delete attrs.y
  delete attrs.width
  delete attrs.height

  const translate = x !== '0' || y !== '0' ? `translate(${x} ${y})` : undefined
  const transform = mergeTransforms(translate, attrs.transform)
  delete attrs.transform

  if (transform || Object.keys(attrs).length > 0) {
    const wrapperAttrs: Record<string, string> = {}
    if (transform) wrapperAttrs.transform = transform
    for (const [k, v] of Object.entries(attrs)) wrapperAttrs[k] = v
    return { tag: 'g', attrs: wrapperAttrs, children: [refNode] }
  }

  return refNode
}

function serializeNode(el: Element, idMap: Map<string, Element>): SerializedSvgNode | null {
  const tag = el.tagName.toLowerCase()
  if (SKIP_TAGS.has(tag)) return null

  if (tag === 'use') return serializeUse(el, idMap)

  if (tag === 'g' || tag === 'svg' || tag === 'a' || tag === 'symbol') {
    const children: SerializedSvgNode[] = []
    for (const child of Array.from(el.children)) {
      const serialized = serializeNode(child as Element, idMap)
      if (serialized) children.push(serialized)
    }
    if (children.length === 0) return null
    return { tag: 'g', attrs: copyAttrs(el), children }
  }

  if (DRAWABLE_TAGS.has(tag)) {
    const attrs = copyAttrs(el)
    const hasStroke = attrs.stroke && attrs.stroke !== 'none'
    if (!hasStroke && attrs.fill && attrs.fill !== 'none') {
      attrs.stroke = attrs.fill
      attrs['stroke-width'] = attrs['stroke-width'] ?? '0.35'
      attrs.fill = 'none'
    }
    if (!attrs['vector-effect']) attrs['vector-effect'] = 'non-scaling-stroke'
    return { tag, attrs }
  }

  return null
}

function collectContent(svg: Element, idMap: Map<string, Element>): SerializedSvgNode[] {
  const nodes: SerializedSvgNode[] = []
  for (const child of Array.from(svg.children)) {
    const tag = child.tagName.toLowerCase()
    if (tag === 'defs' || SKIP_TAGS.has(tag)) continue
    const serialized = serializeNode(child as Element, idMap)
    if (serialized) nodes.push(serialized)
  }
  return nodes
}

export function deserializeNode(node: SerializedSvgNode): SVGElement {
  const el = document.createElementNS(SVG_NS, node.tag) as SVGElement
  for (const [k, v] of Object.entries(node.attrs)) {
    el.setAttribute(k, v)
  }
  if (!node.attrs.fill) el.setAttribute('fill', 'none')
  if (node.children) {
    for (const child of node.children) {
      el.appendChild(deserializeNode(child))
    }
  }
  return el
}

export function deserializeNodes(nodes: SerializedSvgNode[]): SVGElement[] {
  return nodes.map((node) => deserializeNode(node))
}

/** @deprecated Use deserializeNodes */
export function deserializeElements(elements: SerializedSvgNode[]): SVGElement[] {
  return deserializeNodes(elements)
}

function countDrawables(nodes: SerializedSvgNode[]): number {
  let count = 0
  for (const node of nodes) {
    if (DRAWABLE_TAGS.has(node.tag)) count++
    if (node.children) count += countDrawables(node.children)
  }
  return count
}

function measureContentBounds(nodes: SerializedSvgNode[]): LoadedSvgViewBox | null {
  if (typeof document === 'undefined' || !document.body) return null

  const measureSvg = document.createElementNS(SVG_NS, 'svg') as SVGSVGElement
  measureSvg.setAttribute('xmlns', SVG_NS)
  measureSvg.style.cssText = 'position:absolute;visibility:hidden;left:-9999px;top:-9999px'

  const g = document.createElementNS(SVG_NS, 'g') as SVGGElement
  for (const node of nodes) {
    g.appendChild(deserializeNode(node))
  }
  measureSvg.appendChild(g)
  document.body.appendChild(measureSvg)

  try {
    if (typeof g.getBBox !== 'function') return null
    const bb = g.getBBox()
    if (bb.width > 0 && bb.height > 0) {
      return { x: bb.x, y: bb.y, width: bb.width, height: bb.height }
    }
  } catch {
    return null
  } finally {
    document.body.removeChild(measureSvg)
  }

  return null
}

function rebuildPreview(nodes: SerializedSvgNode[]): SVGElement {
  const root = document.createElementNS(SVG_NS, 'g') as SVGGElement
  for (const node of nodes) {
    root.appendChild(deserializeNode(node))
  }
  return sanitize(root)
}

export function parseSvgString(source: string, sourceFileName: string): ParsedSvg {
  const doc = new DOMParser().parseFromString(source, 'image/svg+xml')
  const parserError = doc.querySelector('parsererror')
  if (parserError) {
    throw new Error('El archivo SVG no es válido.')
  }

  const svg = doc.documentElement
  if (!svg || svg.tagName.toLowerCase() !== 'svg') {
    throw new Error('No se encontró un elemento raíz <svg>.')
  }

  const idMap = collectIdMap(svg)
  const nodes = collectContent(svg, idMap)

  if (countDrawables(nodes) === 0) {
    throw new Error('El SVG no contiene trazos compatibles (path, line, rect, etc.).')
  }

  rebuildPreview(nodes)

  const measured = measureContentBounds(nodes)
  const declared = extractDeclaredViewBox(svg as unknown as SVGSVGElement)
  const viewBox = measured ?? declared

  return { sourceFileName, viewBox, nodes }
}

export function readSvgFile(file: File): Promise<ParsedSvg> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const text = String(reader.result ?? '')
        resolve(parseSvgString(text, file.name))
      } catch (err) {
        reject(err instanceof Error ? err : new Error('No se pudo leer el SVG.'))
      }
    }
    reader.onerror = () => reject(new Error('No se pudo leer el archivo.'))
    reader.readAsText(file)
  })
}

export function countSvgDrawables(nodes: SerializedSvgNode[]): number {
  return countDrawables(nodes)
}

/** Normalize legacy flat `elements` into `nodes` tree. */
export function normalizeSvgNodes(
  config: { nodes?: SerializedSvgNode[]; elements?: SerializedSvgNode[] },
): SerializedSvgNode[] {
  return config.nodes ?? config.elements ?? []
}
