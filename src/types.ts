export type PaperFormat = 'A4' | 'A3' | 'Letter' | 'Legal'

export type Technique = 'draw' | 'cut' | 'mixed'

export interface PlotterDocument {
  id: string
  name: string
  version: string
  paperFormat: PaperFormat
  maxGridDepth: number
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
  moduleConfig: Record<string, unknown>
}

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
}
