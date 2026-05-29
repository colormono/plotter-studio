import { Collection } from '../../types'
import { silenceCollection } from './silence'
import { regularTexturesCollection } from './regular-textures'

export { silenceCollection } from './silence'
export { regularTexturesCollection } from './regular-textures'

/**
 * Central registry of all collections.
 * To add a new collection: import it and append to this array — no other changes needed.
 */
export const COLLECTIONS: Collection[] = [silenceCollection, regularTexturesCollection]

/**
 * Returns the collection with the given id.
 * Throws if the id is not registered.
 */
export function getCollection(id: string): Collection {
  const found = COLLECTIONS.find((c) => c.id === id)
  if (!found) {
    throw new Error(
      `Collection "${id}" not found. Available: ${COLLECTIONS.map((c) => c.id).join(', ')}`,
    )
  }
  return found
}

/**
 * Wraps a collection's render to enforce the value === 0 → [] invariant.
 * All modules should call this instead of collection.render directly.
 */
export function renderCollection(collection: Collection, value: number, bounds: import('../../types').Rect): SVGElement[] {
  if (value === 0) return []
  return collection.render(value, bounds)
}
