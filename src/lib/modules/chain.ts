import { PlotterDocument, Layer, Module } from '../../types'
import { getPaperDimensions } from '../paper'
import { renderRegistrationMarks } from '../registration-marks'
import { svgEl } from '../svg'
import {
  computeChainLayout,
  renderChainCells,
  renderChainTitle,
  type ChainConfig,
} from '../chain-calendar'
import { getChainConfig } from '../module-layers'

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

function layoutFor(doc: PlotterDocument, config: ChainConfig) {
  const paper = getPaperDimensions(doc)
  return computeChainLayout(paper, doc.margin, config)
}

export const chainModule: Module = {
  id: 'chain',

  render(doc: PlotterDocument, layer: Layer): SVGElement[] {
    if (layer.layerRole === 'registration') {
      return renderRegistrationMarks(doc)
    }

    if (layer.layerRole === 'cut') {
      return renderCutBorder(doc)
    }

    const config = getChainConfig(layer)
    if (!config) return []

    const layout = layoutFor(doc, config)

    if (layer.layerRole === 'title') {
      return renderChainTitle(layout, { goalTitle: config.goalTitle })
    }

    if (layer.layerRole === 'calendar') {
      return renderChainCells(layout, config)
    }

    return []
  },
}
