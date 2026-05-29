import {
  PlotterDocument,
  Layer,
  GridConfig,
  GridSpec,
  CollectionWeight,
} from '../types'
import { createDefaultGridLayers } from './grid-layers'
import { DEFAULT_GRID_SPEC, DEFAULT_COLLECTION_WEIGHTS } from './art-engine'

interface LegacyDocument {
  id: string
  name: string
  version: string
  paperFormat: PlotterDocument['paperFormat']
  landscape?: boolean
  maxGridDepth?: number
  margin?: number
  seed?: number
  structure?: boolean
  grid?: GridSpec
  collections?: CollectionWeight[]
  layers: Layer[]
}

function gridFromLegacyLayer(config: Partial<GridConfig>, maxDepth: number): GridSpec {
  return {
    rows: config.rows ?? DEFAULT_GRID_SPEC.rows,
    cols: config.cols ?? DEFAULT_GRID_SPEC.cols,
    depth: maxDepth,
    splitProb: DEFAULT_GRID_SPEC.splitProb,
    irregular: config.rowWeights != null || config.colWeights != null,
    threshold: DEFAULT_GRID_SPEC.threshold,
  }
}

function mergeGridLayers(legacyLayers: Layer[]): Layer[] {
  const defaults = createDefaultGridLayers()
  const byRole = new Map(
    legacyLayers
      .filter((l) => l.module === 'grid' && l.gridRole)
      .map((l) => [l.gridRole!, l]),
  )

  return defaults.map((def) => {
    const existing = byRole.get(def.gridRole!)
    if (!existing) return def
    return {
      ...def,
      id: existing.id,
      name: existing.name,
      penColor: existing.penColor,
      technique: existing.technique,
      visible: existing.visible,
      order: existing.order,
    }
  })
}

export function migrateDocument(raw: LegacyDocument): PlotterDocument {
  if (raw.grid && raw.seed != null && raw.collections) {
    const gridLayers = mergeGridLayers(raw.layers)
    const other = raw.layers.filter((l) => l.module !== 'grid' || !l.gridRole)
    const maxOrder = Math.max(0, ...gridLayers.map((l) => l.order))
    const reorderedOther = other.map((l, i) => ({ ...l, order: maxOrder + 1 + i }))
    return {
      id: raw.id,
      name: raw.name,
      version: raw.version,
      paperFormat: raw.paperFormat,
      landscape: raw.landscape ?? false,
      margin: raw.margin ?? 14,
      seed: raw.seed,
      structure: raw.structure ?? true,
      grid: raw.grid,
      collections: raw.collections,
      layers: [...gridLayers, ...reorderedOther].sort((a, b) => a.order - b.order),
    }
  }

  const gridLayers = raw.layers.filter((l) => l.module === 'grid')
  const firstGrid = gridLayers[0]
  const legacyConfig = (firstGrid?.moduleConfig ?? {}) as Partial<GridConfig>
  const margin = legacyConfig.margins?.top ?? 14
  const maxDepth = raw.maxGridDepth ?? DEFAULT_GRID_SPEC.depth

  const nonGrid = raw.layers.filter((l) => l.module !== 'grid')
  const defaults = createDefaultGridLayers()

  const legacyByName = new Map(gridLayers.map((l) => [l.name.toLowerCase(), l]))
  const mergedGrid = defaults.map((def) => {
    const match =
      legacyByName.get(def.name.toLowerCase()) ??
      gridLayers.find((l) => l.gridRole === def.gridRole)
    if (!match) return def
    return {
      ...def,
      id: match.id,
      name: match.name,
      penColor: match.penColor,
      technique: match.technique,
      visible: match.visible,
      order: match.order,
    }
  })

  const maxOrder = Math.max(4, ...mergedGrid.map((l) => l.order))
  const reorderedOther = nonGrid.map((l, i) => ({ ...l, order: maxOrder + 1 + i }))

  return {
    id: raw.id,
    name: raw.name,
    version: raw.version,
    paperFormat: raw.paperFormat,
    landscape: raw.landscape ?? false,
    margin,
    seed: raw.seed ?? 42,
    structure: raw.structure ?? true,
    grid: raw.grid ?? gridFromLegacyLayer(legacyConfig, maxDepth),
    collections: raw.collections ?? DEFAULT_COLLECTION_WEIGHTS,
    layers: [...mergedGrid, ...reorderedOther].sort((a, b) => a.order - b.order),
  }
}

export function isModernDocument(data: Record<string, unknown>): boolean {
  return 'grid' in data && 'seed' in data && 'collections' in data && 'margin' in data
}
