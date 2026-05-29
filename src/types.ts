export type PaperFormat = 'A4' | 'A3' | 'Letter' | 'Legal' | 'Square'

export type Technique = 'draw' | 'cut' | 'mixed'

/** Semantic plotter layer roles for the shared grid module (POC model). */
export type GridLayerRole = 'cut' | 'frame' | 'fill' | 'organic' | 'accent'

export interface GridSpec {
  rows: number
  cols: number
  depth: number
  splitProb: number
  irregular: boolean
  threshold: number
}

export interface CollectionWeight {
  id: string
  on: boolean
  weight: number
}

export interface PlotterDocument {
  id: string
  name: string
  version: string
  paperFormat: PaperFormat
  landscape: boolean
  margin: number
  seed: number
  structure: boolean
  grid: GridSpec
  collections: CollectionWeight[]
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
  module: string
  /** Present on fixed grid semantic layers. */
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
