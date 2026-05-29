import { describe, it, expect } from 'vitest'
import { serialize, deserialize } from './persistence'
import { PlotterDocument, GridConfig } from '../types'

// ─── fixtures ─────────────────────────────────────────────────────────────────

const minimalDoc: PlotterDocument = {
  id: 'doc-1',
  name: 'Minimal',
  version: '1',
  paperFormat: 'A4',
  maxGridDepth: 3,
  layers: [],
}

const richDoc: PlotterDocument = {
  id: 'doc-2',
  name: 'Complex',
  version: '1',
  paperFormat: 'A3',
  maxGridDepth: 3,
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
        cells: Array.from({ length: 4 }, () =>
          Array.from({ length: 4 }, () => ({
            primaryValue: 0.5,
            secondaryValue: null,
            subgrid: null,
          })),
        ),
      } as unknown as Record<string, unknown>,
    },
    {
      id: 'layer-2',
      name: 'Cut',
      penColor: '#0000ff',
      technique: 'cut',
      visible: false,
      order: 1,
      primaryCollection: 'silence',
      secondaryCollection: 'geometric-shapes',
      module: 'grid',
      moduleConfig: {} as unknown as Record<string, unknown>,
    },
    {
      id: 'layer-3',
      name: 'test-sheet',
      penColor: '#000000',
      technique: 'draw',
      visible: true,
      order: 2,
      primaryCollection: 'silence',
      secondaryCollection: null,
      module: 'test-sheet',
      moduleConfig: {} as unknown as Record<string, unknown>,
    },
  ],
}

const docWithSubgrid: PlotterDocument = {
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
      } as unknown as Record<string, unknown>,
    },
  ],
}

// ─── serialize / deserialize round-trips ──────────────────────────────────────

describe('serialize + deserialize round-trip', () => {
  it('minimal document survives round-trip', () => {
    expect(deserialize(serialize(minimalDoc))).toEqual(minimalDoc)
  })

  it('document with multiple layers and techniques survives round-trip', () => {
    expect(deserialize(serialize(richDoc))).toEqual(richDoc)
  })

  it('document with nested subgrid survives round-trip', () => {
    expect(deserialize(serialize(docWithSubgrid))).toEqual(docWithSubgrid)
  })

  it('serialize produces valid JSON', () => {
    expect(() => JSON.parse(serialize(richDoc))).not.toThrow()
  })
})

// ─── deserialize error handling ───────────────────────────────────────────────

describe('deserialize error handling', () => {
  it('throws on completely invalid JSON', () => {
    expect(() => deserialize('not json {')).toThrow('Invalid file')
  })

  it('throws when document is an array', () => {
    expect(() => deserialize('[]')).toThrow('expected a JSON object')
  })

  it('throws when a required field is missing', () => {
    const { version: _v, ...withoutVersion } = minimalDoc
    expect(() => deserialize(JSON.stringify(withoutVersion))).toThrow('"version"')
  })

  it('throws on each missing required field', () => {
    const fields = ['id', 'name', 'version', 'paperFormat', 'maxGridDepth', 'layers'] as const
    for (const field of fields) {
      const copy = { ...minimalDoc } as Record<string, unknown>
      delete copy[field]
      expect(() => deserialize(JSON.stringify(copy))).toThrow(`"${field}"`)
    }
  })

  it('throws on unsupported version', () => {
    const doc = { ...minimalDoc, version: '99' }
    expect(() => deserialize(JSON.stringify(doc))).toThrow('Unsupported document version')
  })

  it('throws when layers is not an array', () => {
    const doc = { ...minimalDoc, layers: {} }
    expect(() => deserialize(JSON.stringify(doc))).toThrow('"layers"')
  })
})
