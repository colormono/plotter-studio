export type CollectionKind = 'draw' | 'cut'

const COLLECTION_KINDS: Record<string, CollectionKind> = {
  'regular-textures': 'draw',
  'irregular-textures': 'draw',
  'geometric-shapes': 'cut',
  dice: 'cut',
}

export function getCollectionKind(id: string): CollectionKind {
  return COLLECTION_KINDS[id] ?? 'draw'
}

export function collectionsForTechnique(technique: 'draw' | 'cut' | 'mixed'): string[] {
  if (technique === 'cut' || technique === 'mixed') {
    return Object.entries(COLLECTION_KINDS)
      .filter(([, kind]) => kind === 'cut')
      .map(([id]) => id)
  }
  return Object.entries(COLLECTION_KINDS)
    .filter(([, kind]) => kind === 'draw')
    .map(([id]) => id)
}
