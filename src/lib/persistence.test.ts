import { describe, it, expect } from 'vitest'
import { serialize, deserialize } from './persistence'
import { PlotterDocument, GridConfig } from '../types'
import { DEFAULT_GRID_SPEC, DEFAULT_COLLECTION_WEIGHTS } from './art-engine'
import { createDefaultGridLayers } from './grid-layers'

const modernDoc: PlotterDocument = {
  id: 'doc-1',
  name: 'Modern',
  version: '1',
  paperFormat: 'A4',
  landscape: false,
  margin: 14,
  seed: 42,
  structure: true,
  grid: { ...DEFAULT_GRID_SPEC },
  collections: DEFAULT_COLLECTION_WEIGHTS.map((c) => ({ ...c })),
  layers: createDefaultGridLayers(),
}

const legacyDoc = {
  id: 'doc-2',
  name: 'Legacy',
  version: '1',
  paperFormat: 'A3',
  maxGridDepth: 2,
  layers: [
    {
      id: 'layer-1',
      name: 'Grid',
      penColor: '#ff0000',
      technique: 'draw',
      visible: true,
      order: 0,
      primaryCollection: 'regular-textures',
      secondaryCollection: null,
      module: 'grid',
      moduleConfig: {
        margins: { top: 10, right: 10, bottom: 10, left: 10 },
        gutter: 2,
        rows: 4,
        cols: 4,
        rowWeights: null,
        colWeights: null,
        cells: [],
      },
    },
  ],
}

describe('persistence', () => {
  it('round-trips modern documents', () => {
    const json = serialize(modernDoc)
    const restored = deserialize(json)
    expect(restored.id).toBe(modernDoc.id)
    expect(restored.grid.rows).toBe(modernDoc.grid.rows)
    expect(restored.layers.filter((l) => l.gridRole).length).toBe(5)
  })

  it('migrates legacy documents with maxGridDepth', () => {
    const restored = deserialize(JSON.stringify(legacyDoc))
    expect(restored.grid.depth).toBe(2)
    expect(restored.margin).toBe(10)
    expect(restored.seed).toBe(42)
    expect(restored.collections.length).toBeGreaterThan(0)
    expect(restored.layers.some((l) => l.gridRole === 'frame')).toBe(true)
  })

  it('rejects invalid JSON', () => {
    expect(() => deserialize('not json')).toThrow(/cannot parse/i)
  })

  it('rejects missing required fields', () => {
    const fields = ['id', 'name', 'version', 'paperFormat', 'layers'] as const
    for (const field of fields) {
      const partial = { ...modernDoc }
      delete (partial as Record<string, unknown>)[field]
      expect(() => deserialize(JSON.stringify(partial))).toThrow(new RegExp(field, 'i'))
    }
  })
})

describe('legacy subgrid fixture still parses', () => {
  const docWithSubgrid = {
    id: 'doc-3',
    name: 'Subgrid',
    version: '1',
    paperFormat: 'Letter',
    maxGridDepth: 3,
    layers: [
      {
        id: 'layer-sub',
        name: 'Nested',
        penColor: '#111111',
        technique: 'mixed',
        visible: true,
        order: 0,
        primaryCollection: 'dice',
        secondaryCollection: 'irregular-textures',
        module: 'grid',
        moduleConfig: {
          margins: { top: 5, right: 5, bottom: 5, left: 5 },
          gutter: 1,
          rows: 2,
          cols: 2,
          rowWeights: [1, 2],
          colWeights: [2, 1],
          cells: [
            [
              {
                primaryValue: 0.8,
                secondaryValue: 0.2,
                subgrid: {
                  margins: { top: 0, right: 0, bottom: 0, left: 0 },
                  gutter: 0,
                  rows: 3,
                  cols: 3,
                  rowWeights: null,
                  colWeights: null,
                  cells: Array.from({ length: 3 }, () =>
                    Array.from({ length: 3 }, () => ({
                      primaryValue: 1,
                      secondaryValue: null,
                      subgrid: null,
                    })),
                  ),
                } as GridConfig,
              },
              { primaryValue: 0, secondaryValue: null, subgrid: null },
            ],
            [
              { primaryValue: 0, secondaryValue: null, subgrid: null },
              { primaryValue: 0, secondaryValue: null, subgrid: null },
            ],
          ],
        },
      },
    ],
  }

  it('migrates to shared grid spec', () => {
    const restored = deserialize(JSON.stringify(docWithSubgrid))
    expect(restored.grid.irregular).toBe(true)
    expect(restored.grid.rows).toBe(2)
  })
})
