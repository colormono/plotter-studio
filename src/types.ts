export type PaperFormat = 'A4' | 'A3' | 'Letter' | 'Legal' | 'Square'

export type Technique = 'draw' | 'cut' | 'mixed'

export type ModuleId = 'grid' | 'tictactoe' | 'test-sheet'

/** Semantic roles shared across modules. */
export type LayerRole =
  | 'registration'
  | 'cut-border'
  | 'frame'
  | 'content'
  | 'cut'
  | 'board'
  | 'player-x'
  | 'player-o'

/** @deprecated Use LayerRole */
export type GridLayerRole = 'cut' | 'frame' | 'fill' | 'organic' | 'accent'

export type CollectionScaleMode = 'proportional' | 'fit'

export interface GridSpec {
  rows: number
  cols: number
  depth: number
  splitProb: number
  irregular: boolean
  threshold: number
  /** Internal cell padding as fraction of min(cell width, height). */
  cellPadding: number
  scaleMode: CollectionScaleMode
}

/** @deprecated Collections are assigned per layer. Kept for migration. */
export interface CollectionWeight {
  id: string
  on: boolean
  weight: number
}

export interface PlotterDocument {
  id: string
  name: string
  version: string
  moduleId: ModuleId
  paperFormat: PaperFormat
  landscape: boolean
  margin: number
  seed: number
  structure: boolean
  grid: GridSpec
  /** @deprecated Kept for migration only. */
  collections?: CollectionWeight[]
  layers: Layer[]
}

export interface Layer {
  id: string
  name: string
  penColor: string
  technique: Technique
  visible: boolean
  order: number
  primaryCollection: string
  secondaryCollection: string | null
  /** Relative weight when picking a layer for each grid cell. */
  collectionWeight: number
  /** Probability of leaving assigned cells empty (0–6, like grid weight). */
  emptySpace: number
  module: string
  layerRole?: LayerRole
  /** @deprecated Use layerRole */
  gridRole?: GridLayerRole
  moduleConfig: Record<string, unknown>
}

/** Legacy per-layer grid config (v1 documents); used only for migration. */
export interface GridConfig {
  margins: {
    top: number
    right: number
    bottom: number
    left: number
  }
  gutter: number
  rows: number
  cols: number
  rowWeights: number[] | null
  colWeights: number[] | null
  cells: Cell[][]
}

export interface Cell {
  primaryValue: number
  secondaryValue: number | null
  subgrid: GridConfig | null
}

export interface Rect {
  x: number
  y: number
  width: number
  height: number
}

export interface Collection {
  id: string
  label: string
  kind: 'draw' | 'cut'
  render: (value: number, bounds: Rect) => SVGElement[]
}

export interface Module {
  id: string
  render: (document: PlotterDocument, layer: Layer) => SVGElement[]
}

export interface PaperDimensions {
  width: number
  height: number
}

export const PAPER_DIMENSIONS: Record<PaperFormat, PaperDimensions> = {
  A4: { width: 210, height: 297 },
  A3: { width: 297, height: 420 },
  Letter: { width: 216, height: 279 },
  Legal: { width: 216, height: 356 },
  Square: { width: 210, height: 210 },
}
