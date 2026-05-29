import { create } from 'zustand'
import { PlotterDocument, PaperFormat, Layer, Technique, GridConfig } from '../types'
import { generateInitialGridConfig } from '../lib/modules/grid'
import { generateGame } from '../lib/tictactoe'
import type { TicTacToeConfig } from '../lib/modules/tictactoe'
import { saveAutosave } from '../lib/persistence'

interface DocumentState {
  document: PlotterDocument | null
  activeLayerId: string | null
  createDocument: (name: string, paperFormat: PaperFormat) => void
  loadDocument: (doc: PlotterDocument) => void
  clearDocument: () => void
  addLayer: () => void
  updateLayer: (id: string, patch: Partial<Omit<Layer, 'id'>>) => void
  updateModuleConfig: (id: string, config: GridConfig) => void
  updateMaxGridDepth: (depth: number) => void
  updateCellSubgrid: (
    layerId: string,
    row: number,
    col: number,
    subgrid: GridConfig | null,
  ) => void
  addTicTacToeModule: () => void
  regenerateTicTacToe: (layerId: string) => void
  addTestSheetModule: () => void
  removeLayer: (id: string) => void
  duplicateLayer: (id: string) => void
  reorderLayers: (orderedIds: string[]) => void
  setActiveLayer: (id: string | null) => void
}

function makeId(): string {
  return crypto.randomUUID()
}

function makeDefaultLayer(order: number): Layer {
  return {
    id: makeId(),
    name: `Layer ${order + 1}`,
    penColor: '#000000',
    technique: 'draw' as Technique,
    visible: true,
    order,
    primaryCollection: 'regular-textures',
    secondaryCollection: null,
    module: 'grid',
    moduleConfig: generateInitialGridConfig() as unknown as Record<string, unknown>,
  }
}

export const useDocumentStore = create<DocumentState>((set, get) => ({
  document: null,
  activeLayerId: null,

  createDocument: (name, paperFormat) =>
    set({
      document: {
        id: makeId(),
        name,
        version: '1',
        paperFormat,
        maxGridDepth: 3,
        layers: [],
      },
      activeLayerId: null,
    }),

  clearDocument: () => set({ document: null, activeLayerId: null }),

  loadDocument: (doc) =>
    set({
      document: doc,
      activeLayerId: doc.layers[0]?.id ?? null,
    }),

  addLayer: () =>
    set((state) => {
      if (!state.document) return state
      const newLayer = makeDefaultLayer(state.document.layers.length)
      return {
        document: {
          ...state.document,
          layers: [...state.document.layers, newLayer],
        },
        activeLayerId: newLayer.id,
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

  updateModuleConfig: (id, config) =>
    set((state) => {
      if (!state.document) return state
      return {
        document: {
          ...state.document,
          layers: state.document.layers.map((l) =>
            l.id === id ? { ...l, moduleConfig: config as unknown as Record<string, unknown> } : l,
          ),
        },
      }
    }),

  updateMaxGridDepth: (depth) =>
    set((state) => {
      if (!state.document) return state
      return { document: { ...state.document, maxGridDepth: Math.max(1, depth) } }
    }),

  updateCellSubgrid: (layerId, row, col, subgrid) =>
    set((state) => {
      if (!state.document) return state
      return {
        document: {
          ...state.document,
          layers: state.document.layers.map((l) => {
            if (l.id !== layerId) return l
            const config = l.moduleConfig as unknown as GridConfig
            const cells: GridConfig['cells'] = Array.from(
              { length: config.rows },
              (_, r) =>
                Array.from({ length: config.cols }, (_, c) => ({
                  ...(config.cells[r]?.[c] ?? {
                    primaryValue: 0,
                    secondaryValue: null,
                    subgrid: null,
                  }),
                  ...(r === row && c === col ? { subgrid } : {}),
                })),
            )
            return {
              ...l,
              moduleConfig: { ...config, cells } as unknown as Record<string, unknown>,
            }
          }),
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

  duplicateLayer: (id) =>
    set((state) => {
      if (!state.document) return state
      const source = state.document.layers.find((l) => l.id === id)
      if (!source) return state
      const copy: Layer = {
        ...source,
        id: makeId(),
        name: `${source.name} copy`,
        order: state.document.layers.length,
      }
      return {
        document: { ...state.document, layers: [...state.document.layers, copy] },
        activeLayerId: copy.id,
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
