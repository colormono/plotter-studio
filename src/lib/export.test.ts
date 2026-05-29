import { describe, it, expect } from 'vitest'
import { buildExportSvg } from './export'
import { gridModule } from './modules/grid'
import { createGridModuleLayers } from './module-layers'
import { DEFAULT_GRID_SPEC } from './art-engine'
import type { PlotterDocument } from '../types'
import { SVG_NS } from './svg'

const doc: PlotterDocument = {
  id: 'doc-export',
  name: 'export-test',
  version: '1',
  moduleId: 'grid',
  paperFormat: 'A4',
  landscape: false,
  margin: 14,
  seed: 42,
  structure: true,
  grid: { ...DEFAULT_GRID_SPEC },
  layers: createGridModuleLayers(),
}

describe('buildExportSvg', () => {
  it('does not remove elements already mounted in the canvas', () => {
    const layer = doc.layers.find((l) => l.layerRole === 'frame')!
    const host = document.createElementNS(SVG_NS, 'g') as SVGGElement
    const svg = document.createElementNS(SVG_NS, 'svg') as SVGSVGElement
    svg.appendChild(host)

    for (const el of gridModule.render(doc, layer)) {
      host.appendChild(el)
    }

    const mounted = host.childNodes.length
    expect(mounted).toBeGreaterThan(0)

    buildExportSvg(doc, doc.layers.filter((l) => l.visible))

    expect(host.childNodes.length).toBe(mounted)
  })

  it('returns a non-empty svg string for visible grid layers', () => {
    const svg = buildExportSvg(doc, doc.layers.filter((l) => l.visible))
    expect(svg).toContain('<svg')
    expect(svg.length).toBeGreaterThan(100)
  })
})
