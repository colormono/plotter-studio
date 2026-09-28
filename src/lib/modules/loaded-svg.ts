import { PlotterDocument, Layer, Module } from '../../types'
import { getPaperDimensions } from '../paper'
import { renderRegistrationMarks } from '../registration-marks'
import { svgEl } from '../svg'
import { buildTransform, getConfigNodes, isLoadedSvgConfig } from '../loaded-svg'
import { deserializeNodes } from '../svg-import'

const SW = '0.4'

function renderCutBorder(doc: PlotterDocument): SVGElement[] {
  const { width, height } = getPaperDimensions(doc)
  const ti = Math.min(doc.margin * 0.45, 6)
  return [
    svgEl('rect', {
      x: ti,
      y: ti,
      width: width - ti * 2,
      height: height - ti * 2,
      'stroke-width': SW,
      'vector-effect': 'non-scaling-stroke',
    }),
  ]
}

function renderLoadedContent(layer: Layer): SVGElement[] {
  const cfg = layer.moduleConfig
  if (!isLoadedSvgConfig(cfg)) return []

  const g = svgEl('g', {
    transform: buildTransform(cfg.viewBox, cfg.placement),
  })

  for (const el of deserializeNodes(getConfigNodes(cfg))) {
    g.appendChild(el)
  }

  return [g]
}

export const loadedSvgModule: Module = {
  id: 'loaded-svg',

  render(doc: PlotterDocument, layer: Layer): SVGElement[] {
    if (layer.layerRole === 'registration') {
      return renderRegistrationMarks(doc)
    }

    if (layer.layerRole === 'cut') {
      return renderCutBorder(doc)
    }

    if (layer.layerRole !== 'content') return []

    return renderLoadedContent(layer)
  },
}
