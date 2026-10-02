import {
  PlotterDocument,
  Layer,
  GridConfig,
  GridSpec,
  ModuleId,
  LayerRole,
  GridLayerRole,
} from '../types'
import {
  createGridModuleLayers,
  createLayersForModule,
} from './module-layers'
import { DEFAULT_GRID_SPEC } from './art-engine'

interface LegacyDocument {
  id: string
  name: string
  version: string
  moduleId?: ModuleId
  paperFormat: PlotterDocument['paperFormat']
  landscape?: boolean
  maxGridDepth?: number
  margin?: number
  seed?: number
  structure?: boolean
  grid?: Partial<GridSpec>
  collections?: PlotterDocument['collections']
  layers: Layer[]
}

const LEGACY_ROLE_MAP: Record<GridLayerRole, LayerRole | 'content'> = {
  cut: 'cut-border',
  frame: 'frame',
  fill: 'content',
  organic: 'content',
  accent: 'content',
}

const LEGACY_COLLECTION: Record<GridLayerRole, string> = {
  cut: 'geometric-shapes',
  frame: 'regular-textures',
  fill: 'regular-textures',
  organic: 'irregular-textures',
  accent: 'geometric-shapes',
}

function gridFromLegacyLayer(config: Partial<GridConfig>, maxDepth: number): GridSpec {
  return {
    ...DEFAULT_GRID_SPEC,
    rows: config.rows ?? DEFAULT_GRID_SPEC.rows,
    cols: config.cols ?? DEFAULT_GRID_SPEC.cols,
    depth: maxDepth,
    splitProb: DEFAULT_GRID_SPEC.splitProb,
    irregular: config.rowWeights != null || config.colWeights != null,
    threshold: DEFAULT_GRID_SPEC.threshold,
  }
}

function inferModuleId(layers: Layer[]): ModuleId {
  if (layers.some((l) => l.module === 'tictactoe')) return 'tictactoe'
  if (layers.some((l) => l.module === 'test-sheet')) return 'test-sheet'
  if (layers.some((l) => l.module === 'loaded-svg')) return 'loaded-svg'
  if (layers.some((l) => l.module === 'chain')) return 'chain'
  return 'grid'
}

function normalizeLayer(layer: Layer, moduleId: ModuleId, order: number): Layer {
  let layerRole = layer.layerRole
  if (!layerRole && layer.gridRole) {
    layerRole = LEGACY_ROLE_MAP[layer.gridRole]
  }

  if (moduleId === 'tictactoe' && layer.module === 'tictactoe') {
    const cfg = layer.moduleConfig as { role?: string }
    if (!layerRole && cfg.role === 'board') layerRole = 'board'
    if (!layerRole && cfg.role === 'marks') {
      layerRole = layer.name.toLowerCase().includes('2') ? 'player-o' : 'player-x'
    }
  }

  if (moduleId === 'test-sheet' && layer.module === 'test-sheet' && !layerRole) {
    layerRole = layer.technique === 'cut' ? 'cut' : 'content'
  }

  if (moduleId === 'loaded-svg' && layer.module === 'loaded-svg' && !layerRole) {
    layerRole = layer.technique === 'cut' ? 'cut' : 'content'
  }

  if (moduleId === 'chain' && layer.module === 'chain' && !layerRole) {
    if (layer.technique === 'cut') layerRole = 'cut'
    else if (layer.name.toLowerCase().includes('título') || layer.name.toLowerCase().includes('titulo')) {
      layerRole = 'title'
    } else layerRole = 'calendar'
  }

  if (moduleId === 'grid' && layer.module === 'grid' && layer.gridRole && !layer.layerRole) {
    layerRole = LEGACY_ROLE_MAP[layer.gridRole]
  }

  return {
    ...layer,
    module: moduleId,
    order,
    layerRole,
    collectionWeight: layer.collectionWeight ?? (layerRole === 'content' ? 3 : 0),
    emptySpace:
      layer.emptySpace ??
      (layer.primaryCollection === 'silence' && layerRole === 'content' ? 8 : 0),
    primaryCollection:
      layer.primaryCollection === 'silence' || !layer.primaryCollection
        ? layer.gridRole
          ? LEGACY_COLLECTION[layer.gridRole]
          : layer.technique === 'cut'
            ? 'geometric-shapes'
            : 'regular-textures'
        : layer.primaryCollection,
    gridRole: undefined,
  }
}

function migrateGridLayers(legacyLayers: Layer[], showStructure = true): Layer[] {
  const defaults = createGridModuleLayers()
  const fixedRoles: LayerRole[] = ['registration', 'cut-border', 'frame', 'structure']
  const result: Layer[] = []

  for (const role of fixedRoles) {
    const def = defaults.find((l) => l.layerRole === role)!
    const existing =
      legacyLayers.find((l) => l.layerRole === role) ??
      legacyLayers.find((l) => l.gridRole && LEGACY_ROLE_MAP[l.gridRole] === role)
    result.push(
      existing
        ? normalizeLayer({ ...def, ...existing, layerRole: role }, 'grid', result.length)
        : {
            ...def,
            order: result.length,
            visible: role === 'structure' ? showStructure : def.visible,
          },
    )
  }

  const contentLegacy = legacyLayers.filter(
    (l) =>
      l.gridRole === 'fill' ||
      l.gridRole === 'organic' ||
      l.gridRole === 'accent' ||
      l.layerRole === 'content',
  )

  if (contentLegacy.length === 0) {
    const defContent = defaults.find((l) => l.layerRole === 'content')!
    result.push({ ...defContent, order: result.length })
  } else {
    for (const legacy of contentLegacy) {
      result.push(normalizeLayer(legacy, 'grid', result.length))
    }
  }

  return result
}

export function migrateDocument(raw: LegacyDocument): PlotterDocument {
  const moduleId = raw.moduleId ?? inferModuleId(raw.layers)
  const grid: GridSpec = {
    ...DEFAULT_GRID_SPEC,
    ...raw.grid,
    cellPadding: raw.grid?.cellPadding ?? DEFAULT_GRID_SPEC.cellPadding,
    scaleMode: raw.grid?.scaleMode ?? DEFAULT_GRID_SPEC.scaleMode,
  }

  if (raw.grid && raw.seed != null) {
    let layers: Layer[]
    if (moduleId === 'grid') {
      layers = migrateGridLayers(
        raw.layers.filter((l) => l.module === 'grid' || l.gridRole),
        raw.structure ?? true,
      )
    } else {
      layers = createLayersForModule(moduleId).map((def, i) => {
        const legacy = raw.layers.find((l) => l.module === moduleId && l.order === i)
        return legacy ? normalizeLayer({ ...def, ...legacy }, moduleId, i) : { ...def, order: i }
      })
    }

    return {
      id: raw.id,
      name: raw.name,
      version: raw.version,
      moduleId,
      paperFormat: raw.paperFormat,
      landscape: raw.landscape ?? false,
      margin: raw.margin ?? 14,
      seed: raw.seed,
      structure: raw.structure ?? true,
      grid,
      layers,
    }
  }

  const gridLayers = raw.layers.filter((l) => l.module === 'grid')
  const firstGrid = gridLayers[0]
  const legacyConfig = (firstGrid?.moduleConfig ?? {}) as Partial<GridConfig>
  const margin = legacyConfig.margins?.top ?? raw.margin ?? 14
  const maxDepth = raw.maxGridDepth ?? DEFAULT_GRID_SPEC.depth
  const resolvedModule = inferModuleId(raw.layers)

  const layers =
    resolvedModule === 'grid'
      ? migrateGridLayers(gridLayers, raw.structure ?? true)
      : createLayersForModule(resolvedModule)

  return {
    id: raw.id,
    name: raw.name,
    version: raw.version,
    moduleId: resolvedModule,
    paperFormat: raw.paperFormat,
    landscape: raw.landscape ?? false,
    margin,
    seed: raw.seed ?? 42,
    structure: raw.structure ?? true,
    grid: gridFromLegacyLayer(legacyConfig, maxDepth),
    layers,
  }
}

export function isModernDocument(data: Record<string, unknown>): boolean {
  return 'grid' in data && 'seed' in data && 'margin' in data
}

/** @deprecated */
export { createDefaultGridLayers } from './module-layers'
