import { create } from 'zustand'
import {
  PlotterDocument,
  PaperFormat,
  Layer,
  Technique,
  GridSpec,
  CollectionWeight,
} from '../types'
import { generateGame } from '../lib/tictactoe'
import type { TicTacToeConfig } from '../lib/modules/tictactoe'
import { saveAutosave } from '../lib/persistence'
import { createDefaultGridLayers, isGridSemanticLayer } from '../lib/grid-layers'
import { DEFAULT_GRID_SPEC, DEFAULT_COLLECTION_WEIGHTS } from '../lib/art-engine'
import { nextSeed } from '../lib/rng'

interface DocumentState {
  document: PlotterDocument | null
  activeLayerId: string | null
  createDocument: (name: string, paperFormat: PaperFormat) => void
  loadDocument: (doc: PlotterDocument) => void
  clearDocument: () => void
  updateDocumentName: (name: string) => void
  updateLayer: (id: string, patch: Partial<Omit<Layer, 'id'>>) => void
  updateGrid: (patch: Partial<GridSpec>) => void
  updatePaperFormat: (paperFormat: PaperFormat) => void
  updateLandscape: (landscape: boolean) => void
  updateMargin: (margin: number) => void
  updateStructure: (structure: boolean) => void
  updateCollection: (id: string, patch: Partial<Omit<CollectionWeight, 'id'>>) => void
  regenerate: () => void
  addTicTacToeModule: () => void
  regenerateTicTacToe: (layerId: string) => void
  addTestSheetModule: () => void
  removeLayer: (id: string) => void
  reorderLayers: (orderedIds: string[]) => void
  setActiveLayer: (id: string | null) => void
}

function makeId(): string {
  return crypto.randomUUID()
}

export const useDocumentStore = create<DocumentState>((set, get) => ({
  document: null,
  activeLayerId: null,

  createDocument: (name, paperFormat) => {
    const gridLayers = createDefaultGridLayers()
    set({
      document: {
        id: makeId(),
        name,
        version: '1',
        paperFormat,
        landscape: paperFormat === 'Square' ? false : true,
        margin: 14,
        seed: 42,
        structure: true,
        grid: { ...DEFAULT_GRID_SPEC },
        collections: DEFAULT_COLLECTION_WEIGHTS.map((c) => ({ ...c })),
        layers: gridLayers,
      },
      activeLayerId: gridLayers.find((l) => l.gridRole === 'accent')?.id ?? gridLayers[0]?.id ?? null,
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
      activeLayerId: doc.layers.find((l) => l.gridRole === 'accent')?.id ?? doc.layers[0]?.id ?? null,
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

  updateStructure: (structure) =>
    set((state) => {
      if (!state.document) return state
      return { document: { ...state.document, structure } }
    }),

  updateCollection: (id, patch) =>
    set((state) => {
      if (!state.document) return state
      return {
        document: {
          ...state.document,
          collections: state.document.collections.map((c) =>
            c.id === id ? { ...c, ...patch } : c,
          ),
        },
      }
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

  addTicTacToeModule: () =>
    set((state) => {
      if (!state.document) return state
      const groupId = makeId()
      const board = generateGame()
      const order = state.document.layers.length

      const makeLayer = (role: TicTacToeConfig['role'], name: string, offset: number): Layer => ({
        id: makeId(),
        name,
        penColor: '#000000',
        technique: 'draw' as Technique,
        visible: true,
        order: order + offset,
        primaryCollection: 'silence',
        secondaryCollection: null,
        module: 'tictactoe',
        moduleConfig: { role, board, groupId } as unknown as Record<string, unknown>,
      })

      const boardLayer = makeLayer('board', 'Tablero', 0)
      const marksLayer = makeLayer('marks', 'Marcas', 1)

      return {
        document: {
          ...state.document,
          layers: [...state.document.layers, boardLayer, marksLayer],
        },
        activeLayerId: marksLayer.id,
      }
    }),

  regenerateTicTacToe: (layerId) =>
    set((state) => {
      if (!state.document) return state
      const layer = state.document.layers.find((l) => l.id === layerId)
      if (!layer || layer.module !== 'tictactoe') return state
      const { groupId } = layer.moduleConfig as unknown as TicTacToeConfig
      const board = generateGame()
      return {
        document: {
          ...state.document,
          layers: state.document.layers.map((l) => {
            if (l.module !== 'tictactoe') return l
            const cfg = l.moduleConfig as unknown as TicTacToeConfig
            if (cfg.groupId !== groupId) return l
            return { ...l, moduleConfig: { ...cfg, board } as unknown as Record<string, unknown> }
          }),
        },
      }
    }),

  addTestSheetModule: () =>
    set((state) => {
      if (!state.document) return state
      const layer: Layer = {
        id: makeId(),
        name: 'test-sheet',
        penColor: '#000000',
        technique: 'draw' as Technique,
        visible: true,
        order: state.document.layers.length,
        primaryCollection: 'silence',
        secondaryCollection: null,
        module: 'test-sheet',
        moduleConfig: {},
      }
      return {
        document: { ...state.document, layers: [...state.document.layers, layer] },
        activeLayerId: layer.id,
      }
    }),

  removeLayer: (id) =>
    set((state) => {
      if (!state.document) return state
      const target = state.document.layers.find((l) => l.id === id)
      if (target && isGridSemanticLayer(target)) return state
      const remaining = state.document.layers
        .filter((l) => l.id !== id)
        .map((l, i) => ({ ...l, order: i }))
      const activeLayerId =
        state.activeLayerId === id ? (remaining[0]?.id ?? null) : state.activeLayerId
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
