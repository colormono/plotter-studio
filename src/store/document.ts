import { create } from 'zustand'
import { PlotterDocument, PaperFormat, Layer, Technique, GridConfig } from '../types'
import { DEFAULT_GRID_CONFIG } from '../lib/modules/grid'

interface DocumentState {
  document: PlotterDocument | null
  activeLayerId: string | null
  createDocument: (name: string, paperFormat: PaperFormat) => void
  clearDocument: () => void
  addLayer: () => void
  updateLayer: (id: string, patch: Partial<Omit<Layer, 'id'>>) => void
  updateModuleConfig: (id: string, config: GridConfig) => void
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
    moduleConfig: DEFAULT_GRID_CONFIG as unknown as Record<string, unknown>,
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
