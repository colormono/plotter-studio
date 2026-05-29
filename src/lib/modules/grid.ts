import { PlotterDocument, Layer } from '../../types'
import { generateArt } from '../art-engine'
import { Module } from '../../types'

let cachedKey = ''
let cachedArt: ReturnType<typeof generateArt> | null = null

function documentCacheKey(document: PlotterDocument): string {
  return JSON.stringify({
    paperFormat: document.paperFormat,
    landscape: document.landscape,
    margin: document.margin,
    seed: document.seed,
    structure: document.structure,
    grid: document.grid,
    collections: document.collections,
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
    if (!layer.gridRole) return []
    const art = getArt(document)
    const elements = art.layers[layer.gridRole] ?? []
    return elements.map((el) => el.cloneNode(true) as SVGElement)
  },
}
