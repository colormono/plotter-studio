import { create } from 'zustand'
import {
  PlotterDocument,
  PaperFormat,
  Layer,
  Technique,
  GridSpec,
  ModuleId,
} from '../types'
import { loadAutosave, saveAutosave } from '../lib/persistence'
import {
  createGridContentLayer,
  createLayersForModule,
  defaultActiveLayerId,
  getChainConfig,
  getLoadedSvgConfig,
  getTicTacToeConfig,
  isContentLayer,
  isFixedLayer,
} from '../lib/module-layers'
import { defaultPlacement, normalizeRotation, type LoadedSvgPlacement } from '../lib/loaded-svg'
import { readSvgFile } from '../lib/svg-import'
import { getPaperDimensions } from '../lib/paper'
import { clampDays, type ChainConfig } from '../lib/chain-calendar'
import { DEFAULT_GRID_SPEC } from '../lib/art-engine'
import { generateGame } from '../lib/tictactoe'
import { nextSeed } from '../lib/rng'
import { collectionsForTechnique } from '../lib/collection-kinds'

interface DocumentState {
  document: PlotterDocument | null
  activeLayerId: string | null
  createDocument: (name: string, paperFormat: PaperFormat) => void
  loadDocument: (doc: PlotterDocument) => void
  clearDocument: () => void
  updateDocumentName: (name: string) => void
  setModule: (moduleId: ModuleId) => void
  updateLayer: (id: string, patch: Partial<Omit<Layer, 'id'>>) => void
  updateGrid: (patch: Partial<GridSpec>) => void
  updatePaperFormat: (paperFormat: PaperFormat) => void
  updateLandscape: (landscape: boolean) => void
  updateMargin: (margin: number) => void
  regenerate: () => void
  addGridLayer: (name: string, penColor: string, technique: Technique) => void
  regenerateTicTacToe: (layerId: string) => void
  loadSvgFile: (file: File) => Promise<void>
  updateLoadedSvgPlacement: (patch: Partial<LoadedSvgPlacement>) => void
  rotateLoadedSvg: (deltaDegrees: number) => void
  updateChainConfig: (patch: Partial<Omit<ChainConfig, 'groupId'>>) => void
  removeLayer: (id: string) => void
  reorderLayers: (orderedIds: string[]) => void
  setActiveLayer: (id: string | null) => void
}

function makeId(): string {
  return crypto.randomUUID()
}

function initialSession(): Pick<DocumentState, 'document' | 'activeLayerId'> {
  const saved = loadAutosave()
  if (!saved) return { document: null, activeLayerId: null }
  return { document: saved, activeLayerId: defaultActiveLayerId(saved.layers) }
}

const restored = initialSession()

function defaultCollectionForTechnique(technique: Technique): string {
  const options = collectionsForTechnique(technique)
  return options[0] ?? 'regular-textures'
}

export const useDocumentStore = create<DocumentState>((set, get) => ({
  document: restored.document,
  activeLayerId: restored.activeLayerId,

  createDocument: (name, paperFormat) => {
    const layers = createLayersForModule('grid')
    set({
      document: {
        id: makeId(),
        name,
        version: '1',
        moduleId: 'grid',
        paperFormat,
        landscape: paperFormat === 'Square' ? false : true,
        margin: 14,
        seed: 42,
        structure: true,
        grid: { ...DEFAULT_GRID_SPEC },
        layers,
      },
      activeLayerId: defaultActiveLayerId(layers),
    })
  },

  clearDocument: () => set({ document: null, activeLayerId: null }),

  updateDocumentName: (name) =>
    set((state) => {
      if (!state.document) return state
      const trimmed = name.trim()
      if (!trimmed || trimmed === state.document.name) return state
      return { document: { ...state.document, name: trimmed } }
    }),

  loadDocument: (doc) =>
    set({
      document: doc,
      activeLayerId: defaultActiveLayerId(doc.layers),
    }),

  setModule: (moduleId) =>
    set((state) => {
      if (!state.document || state.document.moduleId === moduleId) return state
      const layers = createLayersForModule(moduleId)
      return {
        document: { ...state.document, moduleId, layers },
        activeLayerId: defaultActiveLayerId(layers),
      }
    }),

  updateLayer: (id, patch) =>
    set((state) => {
      if (!state.document) return state
      return {
        document: {
          ...state.document,
          layers: state.document.layers.map((l) => (l.id === id ? { ...l, ...patch } : l)),
        },
      }
    }),

  updateGrid: (patch) =>
    set((state) => {
      if (!state.document) return state
      return {
        document: {
          ...state.document,
          grid: { ...state.document.grid, ...patch },
        },
      }
    }),

  updatePaperFormat: (paperFormat) =>
    set((state) => {
      if (!state.document) return state
      return {
        document: {
          ...state.document,
          paperFormat,
          landscape: paperFormat === 'Square' ? false : state.document.landscape,
        },
      }
    }),

  updateLandscape: (landscape) =>
    set((state) => {
      if (!state.document) return state
      if (state.document.paperFormat === 'Square') return state
      return { document: { ...state.document, landscape } }
    }),

  updateMargin: (margin) =>
    set((state) => {
      if (!state.document) return state
      return { document: { ...state.document, margin: Math.max(4, margin) } }
    }),

  regenerate: () =>
    set((state) => {
      if (!state.document) return state
      return {
        document: {
          ...state.document,
          seed: nextSeed(state.document.seed),
        },
      }
    }),

  addGridLayer: (name, penColor, technique) =>
    set((state) => {
      if (!state.document || state.document.moduleId !== 'grid') return state
      const trimmed = name.trim()
      if (!trimmed) return state
      const order = state.document.layers.length
      const layer = createGridContentLayer(
        trimmed,
        penColor,
        technique,
        order,
        defaultCollectionForTechnique(technique),
      )
      return {
        document: { ...state.document, layers: [...state.document.layers, layer] },
        activeLayerId: layer.id,
      }
    }),

  regenerateTicTacToe: (layerId) =>
    set((state) => {
      if (!state.document) return state
      const layer = state.document.layers.find((l) => l.id === layerId)
      if (!layer || layer.module !== 'tictactoe') return state
      const cfg = getTicTacToeConfig(layer)
      if (!cfg) return state
      const board = generateGame()
      return {
        document: {
          ...state.document,
          layers: state.document.layers.map((l) => {
            if (l.module !== 'tictactoe') return l
            const c = getTicTacToeConfig(l)
            if (!c || c.groupId !== cfg.groupId) return l
            return { ...l, moduleConfig: { ...c, board } as unknown as Record<string, unknown> }
          }),
        },
      }
    }),

  loadSvgFile: async (file) => {
    const state = get()
    if (!state.document || state.document.moduleId !== 'loaded-svg') return

    const parsed = await readSvgFile(file)
    const paper = getPaperDimensions(state.document)
    const contentLayer = state.document.layers.find(
      (l) => l.module === 'loaded-svg' && l.layerRole === 'content',
    )
    const groupId =
      (contentLayer?.moduleConfig as { groupId?: string } | undefined)?.groupId ?? makeId()

    const config = {
      groupId,
      sourceFileName: parsed.sourceFileName,
      viewBox: parsed.viewBox,
      nodes: parsed.nodes,
      placement: defaultPlacement(parsed.viewBox, paper, state.document.margin),
    }

    set({
      document: {
        ...state.document,
        layers: state.document.layers.map((l) => {
          if (l.module !== 'loaded-svg') return l
          return { ...l, moduleConfig: config as unknown as Record<string, unknown> }
        }),
      },
    })
  },

  updateLoadedSvgPlacement: (patch) =>
    set((state) => {
      if (!state.document || state.document.moduleId !== 'loaded-svg') return state
      const contentLayer = state.document.layers.find(
        (l) => l.module === 'loaded-svg' && l.layerRole === 'content',
      )
      const cfg = contentLayer ? getLoadedSvgConfig(contentLayer) : null
      if (!cfg) return state

      const placement: LoadedSvgPlacement = {
        ...cfg.placement,
        ...patch,
        rotation: patch.rotation != null ? normalizeRotation(patch.rotation) : cfg.placement.rotation,
      }

      return {
        document: {
          ...state.document,
          layers: state.document.layers.map((l) => {
            if (l.module !== 'loaded-svg') return l
            const c = l.moduleConfig as unknown as typeof cfg
            if (c.groupId !== cfg.groupId) return l
            return {
              ...l,
              moduleConfig: { ...cfg, placement } as unknown as Record<string, unknown>,
            }
          }),
        },
      }
    }),

  rotateLoadedSvg: (deltaDegrees) =>
    set((state) => {
      if (!state.document || state.document.moduleId !== 'loaded-svg') return state
      const contentLayer = state.document.layers.find(
        (l) => l.module === 'loaded-svg' && l.layerRole === 'content',
      )
      const cfg = contentLayer ? getLoadedSvgConfig(contentLayer) : null
      if (!cfg) return state

      const rotation = normalizeRotation(cfg.placement.rotation + deltaDegrees)
      const placement = { ...cfg.placement, rotation }

      return {
        document: {
          ...state.document,
          layers: state.document.layers.map((l) => {
            if (l.module !== 'loaded-svg') return l
            const c = l.moduleConfig as unknown as typeof cfg
            if (c.groupId !== cfg.groupId) return l
            return {
              ...l,
              moduleConfig: { ...cfg, placement } as unknown as Record<string, unknown>,
            }
          }),
        },
      }
    }),

  updateChainConfig: (patch) =>
    set((state) => {
      if (!state.document || state.document.moduleId !== 'chain') return state
      const refLayer = state.document.layers.find((l) => l.module === 'chain' && l.layerRole === 'calendar')
      const cfg = refLayer ? getChainConfig(refLayer) : null
      if (!cfg) return state

      const next: ChainConfig = {
        ...cfg,
        ...patch,
        days: patch.days != null ? clampDays(patch.days) : cfg.days,
        goalTitle: patch.goalTitle != null ? patch.goalTitle : cfg.goalTitle,
      }

      return {
        document: {
          ...state.document,
          layers: state.document.layers.map((l) => {
            if (l.module !== 'chain') return l
            const c = l.moduleConfig as unknown as ChainConfig
            if (c.groupId !== cfg.groupId) return l
            return { ...l, moduleConfig: next as unknown as Record<string, unknown> }
          }),
        },
      }
    }),

  removeLayer: (id) =>
    set((state) => {
      if (!state.document) return state
      const target = state.document.layers.find((l) => l.id === id)
      if (!target || isFixedLayer(target)) return state
      if (!isContentLayer(target)) return state
      const remaining = state.document.layers
        .filter((l) => l.id !== id)
        .map((l, i) => ({ ...l, order: i }))
      const activeLayerId =
        state.activeLayerId === id ? defaultActiveLayerId(remaining) : state.activeLayerId
      return {
        document: { ...state.document, layers: remaining },
        activeLayerId,
      }
    }),

  reorderLayers: (orderedIds) =>
    set((state) => {
      if (!state.document) return state
      const byId = Object.fromEntries(state.document.layers.map((l) => [l.id, l]))
      const reordered = orderedIds
        .filter((id) => byId[id])
        .map((id, i) => ({ ...byId[id]!, order: i }))
      return { document: { ...state.document, layers: reordered } }
    }),

  setActiveLayer: (id) => {
    const { document } = get()
    if (document && id && !document.layers.find((l) => l.id === id)) return
    set({ activeLayerId: id })
  },
}))

let _prevDocument: PlotterDocument | null = null
useDocumentStore.subscribe((state) => {
  if (state.document !== _prevDocument) {
    _prevDocument = state.document
    if (state.document) {
      saveAutosave(state.document)
    }
  }
})
