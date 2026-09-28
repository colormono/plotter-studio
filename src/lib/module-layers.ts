import { Layer, LayerRole, ModuleId, Technique } from '../types'
import { generateGame } from './tictactoe'
import type { TicTacToeConfig } from './modules/tictactoe'
import type { LoadedSvgConfig } from './loaded-svg'
import { DEFAULT_CHAIN_CONFIG, normalizeChainConfig, type ChainConfig } from './chain-calendar'

function makeId(): string {
  return crypto.randomUUID()
}

function baseLayer(
  partial: Pick<Layer, 'name' | 'penColor' | 'technique' | 'order' | 'layerRole' | 'primaryCollection'> &
    Partial<Pick<Layer, 'collectionWeight' | 'emptySpace' | 'moduleConfig'>>,
): Layer {
  return {
    id: makeId(),
    visible: true,
    secondaryCollection: null,
    collectionWeight: partial.collectionWeight ?? 3,
    emptySpace: partial.emptySpace ?? 0,
    module: 'grid',
    moduleConfig: partial.moduleConfig ?? {},
    ...partial,
  }
}

function registrationLayer(order: number, module: string): Layer {
  return {
    ...baseLayer({
      name: 'Esquinas',
      penColor: '#DC2626',
      technique: 'cut',
      order,
      layerRole: 'registration',
      primaryCollection: 'regular-textures',
      collectionWeight: 0,
      emptySpace: 0,
    }),
    module,
  }
}

export function isFixedLayer(layer: Layer): boolean {
  if (layer.layerRole === 'registration') return true
  if (layer.module === 'grid' && (layer.layerRole === 'frame' || layer.layerRole === 'cut-border')) {
    return true
  }
  if (
    layer.module === 'tictactoe' &&
    (layer.layerRole === 'board' || layer.layerRole === 'player-x' || layer.layerRole === 'player-o')
  ) {
    return true
  }
  if (layer.module === 'test-sheet' && (layer.layerRole === 'content' || layer.layerRole === 'cut')) {
    return true
  }
  if (layer.module === 'loaded-svg' && (layer.layerRole === 'content' || layer.layerRole === 'cut')) {
    return true
  }
  if (
    layer.module === 'chain' &&
    (layer.layerRole === 'title' || layer.layerRole === 'calendar' || layer.layerRole === 'cut')
  ) {
    return true
  }
  return false
}

/** @deprecated */
export function isGridSemanticLayer(layer: Layer): boolean {
  return isFixedLayer(layer) && layer.module === 'grid'
}

export function isContentLayer(layer: Layer): boolean {
  return layer.layerRole === 'content' && layer.module === 'grid'
}

export function createGridContentLayer(
  name: string,
  penColor: string,
  technique: Technique,
  order: number,
  primaryCollection: string,
): Layer {
  return {
    ...baseLayer({ name, penColor, technique, order, layerRole: 'content', primaryCollection }),
    module: 'grid',
  }
}

export function createGridModuleLayers(): Layer[] {
  return [
    registrationLayer(0, 'grid'),
    {
      ...baseLayer({
        name: 'Corte',
        penColor: '#DC2626',
        technique: 'cut',
        order: 1,
        layerRole: 'cut-border',
        primaryCollection: 'regular-textures',
        collectionWeight: 0,
      }),
      module: 'grid',
    },
    {
      ...baseLayer({
        name: 'Marco',
        penColor: '#0A0A0A',
        technique: 'draw',
        order: 2,
        layerRole: 'frame',
        primaryCollection: 'regular-textures',
        collectionWeight: 0,
      }),
      module: 'grid',
    },
    createGridContentLayer('Tramas', '#0A0A0A', 'draw', 3, 'regular-textures'),
  ]
}

export function createTicTacToeModuleLayers(): Layer[] {
  const groupId = makeId()
  const board = generateGame()

  const sharedConfig = { board, groupId } as unknown as Record<string, unknown>

  return [
    registrationLayer(0, 'tictactoe'),
    {
      ...baseLayer({
        name: 'Tablero',
        penColor: '#0A0A0A',
        technique: 'draw',
        order: 1,
        layerRole: 'board',
        primaryCollection: 'regular-textures',
        collectionWeight: 0,
        moduleConfig: sharedConfig,
      }),
      module: 'tictactoe',
    },
    {
      ...baseLayer({
        name: 'Jugador 1',
        penColor: '#2563EB',
        technique: 'draw',
        order: 2,
        layerRole: 'player-x',
        primaryCollection: 'regular-textures',
        collectionWeight: 0,
        moduleConfig: sharedConfig,
      }),
      module: 'tictactoe',
    },
    {
      ...baseLayer({
        name: 'Jugador 2',
        penColor: '#EA580C',
        technique: 'draw',
        order: 3,
        layerRole: 'player-o',
        primaryCollection: 'regular-textures',
        collectionWeight: 0,
        moduleConfig: sharedConfig,
      }),
      module: 'tictactoe',
    },
  ]
}

export function createTestSheetModuleLayers(): Layer[] {
  return [
    registrationLayer(0, 'test-sheet'),
    {
      ...baseLayer({
        name: 'Dibujo',
        penColor: '#0A0A0A',
        technique: 'draw',
        order: 1,
        layerRole: 'content',
        primaryCollection: 'regular-textures',
        collectionWeight: 0,
      }),
      module: 'test-sheet',
    },
    {
      ...baseLayer({
        name: 'Corte',
        penColor: '#DC2626',
        technique: 'cut',
        order: 2,
        layerRole: 'cut',
        primaryCollection: 'regular-textures',
        collectionWeight: 0,
      }),
      module: 'test-sheet',
    },
  ]
}

export function createLoadedSvgModuleLayers(): Layer[] {
  const groupId = makeId()
  const sharedConfig = { groupId } as unknown as Record<string, unknown>

  return [
    registrationLayer(0, 'loaded-svg'),
    {
      ...baseLayer({
        name: 'Dibujo',
        penColor: '#0A0A0A',
        technique: 'draw',
        order: 1,
        layerRole: 'content',
        primaryCollection: 'regular-textures',
        collectionWeight: 0,
        moduleConfig: sharedConfig,
      }),
      module: 'loaded-svg',
    },
    {
      ...baseLayer({
        name: 'Corte',
        penColor: '#DC2626',
        technique: 'cut',
        order: 2,
        layerRole: 'cut',
        primaryCollection: 'regular-textures',
        collectionWeight: 0,
        moduleConfig: sharedConfig,
      }),
      module: 'loaded-svg',
    },
  ]
}

export function createChainModuleLayers(): Layer[] {
  const groupId = makeId()
  const sharedConfig = { ...DEFAULT_CHAIN_CONFIG, groupId } as unknown as Record<string, unknown>

  return [
    registrationLayer(0, 'chain'),
    {
      ...baseLayer({
        name: 'Título',
        penColor: '#0A0A0A',
        technique: 'draw',
        order: 1,
        layerRole: 'title',
        primaryCollection: 'regular-textures',
        collectionWeight: 0,
        moduleConfig: sharedConfig,
      }),
      module: 'chain',
    },
    {
      ...baseLayer({
        name: 'Calendario',
        penColor: '#0A0A0A',
        technique: 'draw',
        order: 2,
        layerRole: 'calendar',
        primaryCollection: 'regular-textures',
        collectionWeight: 0,
        moduleConfig: sharedConfig,
      }),
      module: 'chain',
    },
    {
      ...baseLayer({
        name: 'Corte',
        penColor: '#DC2626',
        technique: 'cut',
        order: 3,
        layerRole: 'cut',
        primaryCollection: 'regular-textures',
        collectionWeight: 0,
        moduleConfig: sharedConfig,
      }),
      module: 'chain',
    },
  ]
}

export function createLayersForModule(moduleId: ModuleId): Layer[] {
  switch (moduleId) {
    case 'grid':
      return createGridModuleLayers()
    case 'tictactoe':
      return createTicTacToeModuleLayers()
    case 'test-sheet':
      return createTestSheetModuleLayers()
    case 'loaded-svg':
      return createLoadedSvgModuleLayers()
    case 'chain':
      return createChainModuleLayers()
  }
}

/** @deprecated Use createGridModuleLayers */
export function createDefaultGridLayers(): Layer[] {
  return createGridModuleLayers()
}

export function defaultActiveLayerId(layers: Layer[]): string | null {
  const content = layers.find((l) => l.layerRole === 'content')
  return content?.id ?? layers[layers.length - 1]?.id ?? null
}

export function getTicTacToeConfig(layer: Layer): TicTacToeConfig | null {
  if (layer.module !== 'tictactoe') return null
  const cfg = layer.moduleConfig as unknown as TicTacToeConfig
  if (!cfg?.board || !cfg?.groupId) return null
  return cfg
}

export function getChainConfig(layer: Layer): ChainConfig | null {
  if (layer.module !== 'chain') return null
  const cfg = layer.moduleConfig as unknown as ChainConfig
  if (!cfg?.groupId) return null
  return normalizeChainConfig(cfg)
}

export function getLoadedSvgConfig(layer: Layer): LoadedSvgConfig | null {
  if (layer.module !== 'loaded-svg') return null
  const cfg = layer.moduleConfig as unknown as LoadedSvgConfig
  if (!cfg?.groupId) return null
  const nodes = cfg.nodes ?? cfg.elements
  if (!nodes?.length) return null
  return cfg
}

export function pickActiveLayerRole(layers: Layer[]): LayerRole | undefined {
  return layers.find((l) => l.layerRole === 'content')?.layerRole ?? layers[0]?.layerRole
}
