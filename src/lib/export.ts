import { PlotterDocument, Layer } from '../types'
import { MODULES } from './modules'
import { SVG_NS, sanitize } from './svg'
import { getPaperDimensions } from './paper'

/**
 * Builds a sanitized SVG string ready for plotter export.
 * Each visible layer becomes a <g id="{name}" stroke="{penColor}">.
 * Layers are ordered by layer.order ascending.
 * Passes through the sanitizer before serialization.
 */
export function buildExportSvg(doc: PlotterDocument, layers: Layer[]): string {
  const { width, height } = getPaperDimensions(doc)

  const root = document.createElementNS(SVG_NS, 'svg') as SVGElement
  root.setAttribute('xmlns', SVG_NS)
  root.setAttribute('viewBox', `0 0 ${width} ${height}`)
  root.setAttribute('width', `${width}mm`)
  root.setAttribute('height', `${height}mm`)
  root.setAttribute('fill', 'none')

  const sorted = [...layers].sort((a, b) => a.order - b.order)

  for (const layer of sorted) {
    const mod = MODULES[layer.module]
    if (!mod) continue

    const elements = mod.render(doc, layer)
    if (elements.length === 0) continue

    const g = document.createElementNS(SVG_NS, 'g') as SVGElement
    g.setAttribute('id', layer.name.replace(/\s+/g, '-'))
    g.setAttribute('stroke', layer.penColor)
    g.setAttribute('fill', 'none')

    for (const el of elements) {
      // Clone so export never moves nodes already mounted in the canvas.
      g.appendChild(el.cloneNode(true))
    }
    root.appendChild(g)
  }

  const clean = sanitize(root)
  return new XMLSerializer().serializeToString(clean)
}

/**
 * Triggers a browser download of the given SVG string.
 */
export function downloadSvg(svgString: string, filename: string): void {
  const blob = new Blob([svgString], { type: 'image/svg+xml' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename.endsWith('.svg') ? filename : `${filename}.svg`
  a.click()
  URL.revokeObjectURL(url)
}
