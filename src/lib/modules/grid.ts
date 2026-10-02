import { PlotterDocument, Layer } from '../../types'
import { generateArt } from '../art-engine'
import { renderRegistrationMarks } from '../registration-marks'
import { Module } from '../../types'

let cachedKey = ''
let cachedArt: ReturnType<typeof generateArt> | null = null

function documentCacheKey(document: PlotterDocument): string {
  return JSON.stringify({
    paperFormat: document.paperFormat,
    landscape: document.landscape,
    margin: document.margin,
    seed: document.seed,
    grid: document.grid,
    layers: document.layers.map((l) => ({
      id: l.id,
      layerRole: l.layerRole,
      primaryCollection: l.primaryCollection,
      collectionWeight: l.collectionWeight,
      emptySpace: l.emptySpace,
      visible: l.visible,
    })),
  })
}

function getArt(document: PlotterDocument) {
  const key = documentCacheKey(document)
  if (key !== cachedKey || !cachedArt) {
    cachedArt = generateArt(document)
    cachedKey = key
  }
  return cachedArt
}

export const gridModule: Module = {
  id: 'grid',

  render(document: PlotterDocument, layer: Layer): SVGElement[] {
    if (layer.layerRole === 'registration') {
      return renderRegistrationMarks(document).map((el) => el.cloneNode(true) as SVGElement)
    }
    if (!layer.layerRole || layer.layerRole === 'content') {
      const art = getArt(document)
      const elements = art.byLayerId[layer.id] ?? []
      return elements.map((el) => el.cloneNode(true) as SVGElement)
    }
    const art = getArt(document)
    const elements = art.byLayerId[layer.id] ?? []
    return elements.map((el) => el.cloneNode(true) as SVGElement)
  },
}
