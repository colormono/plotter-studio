import { Layer, GridLayerRole, Technique } from '../types'

export interface GridLayerDef {
  gridRole: GridLayerRole
  name: string
  penColor: string
  technique: Technique
  order: number
}

/** Bottom → top render order (matches POC). */
export const GRID_LAYER_DEFS: GridLayerDef[] = [
  { gridRole: 'cut', name: 'Corte', penColor: '#DC2626', technique: 'cut', order: 0 },
  { gridRole: 'frame', name: 'Marco', penColor: '#0A0A0A', technique: 'draw', order: 1 },
  { gridRole: 'fill', name: 'Tramas', penColor: '#0A0A0A', technique: 'draw', order: 2 },
  { gridRole: 'organic', name: 'Texturas', penColor: '#0A0A0A', technique: 'draw', order: 3 },
  { gridRole: 'accent', name: 'Figuras', penColor: '#2F5D8A', technique: 'mixed', order: 4 },
]

export function createDefaultGridLayers(): Layer[] {
  return GRID_LAYER_DEFS.map((def) => ({
    id: crypto.randomUUID(),
    name: def.name,
    penColor: def.penColor,
    technique: def.technique,
    visible: true,
    order: def.order,
    primaryCollection: 'silence',
    secondaryCollection: null,
    module: 'grid',
    gridRole: def.gridRole,
    moduleConfig: {},
  }))
}

export function isGridSemanticLayer(layer: Layer): boolean {
  return layer.module === 'grid' && layer.gridRole != null
}
