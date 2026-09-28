/** Single-stroke glyph coordinates in Hershey-style em box (baseline y=0, cap ~21). */
export type HersheyStroke = ReadonlyArray<readonly [number, number]>
export type HersheyGlyph = ReadonlyArray<HersheyStroke>

const G: Record<string, HersheyGlyph> = {
  ' ': [],
  '-': [[[0, 10], [14, 10]]],
  '.': [[[6, 0], [8, 0]]],
  ',': [[[6, 0], [8, -4]]],
  '!': [[[7, 0], [7, 14]], [[7, 18], [7, 20]]],
  '?': [[[2, 14], [12, 14], [12, 8], [7, 4], [7, 0]], [[7, 18], [7, 20]]],
  "'": [[[6, 18], [8, 14]]],
  '0': [[[4, 0], [2, 4], [2, 10], [4, 14], [10, 14], [12, 10], [12, 4], [10, 0], [4, 0]]],
  '1': [
    [[5, 0], [5, 14]],
    [[3, 12], [5, 14]],
  ],
  '2': [[[2, 10], [4, 14], [10, 14], [12, 10], [2, 0], [12, 0]]],
  '3': [[[2, 14], [12, 14], [8, 7], [12, 0], [2, 0]]],
  '4': [[[10, 0], [10, 14], [2, 5], [12, 5]]],
  '5': [[[12, 14], [2, 14], [2, 7], [10, 7], [12, 4], [10, 0], [2, 0]]],
  '6': [[[10, 14], [4, 10], [2, 4], [4, 0], [10, 0], [12, 4], [10, 7], [4, 7], [2, 4]]],
  '7': [[[2, 14], [12, 14], [6, 0]]],
  '8': [[[4, 7], [2, 10], [4, 14], [10, 14], [12, 10], [10, 7], [4, 7], [2, 4], [4, 0], [10, 0], [12, 4], [10, 7]]],
  '9': [[[10, 7], [4, 7], [2, 10], [4, 14], [10, 14], [12, 10], [10, 4], [4, 4]]],
  A: [[[2, 0], [7, 14], [12, 0]], [[4, 5], [10, 5]]],
  B: [[[2, 0], [2, 14], [9, 14], [11, 12], [9, 7], [2, 7], [9, 7], [11, 5], [9, 0], [2, 0]]],
  C: [[[12, 12], [8, 14], [4, 14], [2, 10], [2, 4], [4, 0], [8, 0], [12, 2]]],
  D: [[[2, 0], [2, 14], [8, 14], [11, 11], [11, 3], [8, 0], [2, 0]]],
  E: [[[12, 14], [2, 14], [2, 0], [12, 0]], [[2, 7], [9, 7]]],
  F: [[[2, 0], [2, 14], [12, 14]], [[2, 7], [9, 7]]],
  G: [[[12, 12], [8, 14], [4, 14], [2, 10], [2, 4], [4, 0], [10, 0], [12, 4], [12, 7], [8, 7]]],
  H: [[[2, 0], [2, 14]], [[12, 0], [12, 14]], [[2, 7], [12, 7]]],
  I: [[[7, 0], [7, 14]], [[4, 14], [10, 14]], [[4, 0], [10, 0]]],
  J: [[[10, 14], [10, 3], [8, 0], [4, 0], [2, 3]]],
  K: [[[2, 0], [2, 14], [12, 14], [2, 7], [12, 0]]],
  L: [[[2, 14], [2, 0], [12, 0]]],
  M: [[[2, 0], [2, 14], [7, 8], [12, 14], [12, 0]]],
  N: [[[2, 0], [2, 14], [12, 0], [12, 14]]],
  O: [[[4, 0], [2, 4], [2, 10], [4, 14], [10, 14], [12, 10], [12, 4], [10, 0], [4, 0]]],
  P: [[[2, 0], [2, 14], [9, 14], [11, 12], [11, 8], [9, 7], [2, 7]]],
  Q: [[[4, 0], [2, 4], [2, 10], [4, 14], [10, 14], [12, 10], [12, 4], [10, 0], [4, 0]], [[8, 2], [12, -2]]],
  R: [[[2, 0], [2, 14], [9, 14], [11, 12], [11, 8], [9, 7], [2, 7], [12, 0]]],
  S: [[[12, 12], [8, 14], [4, 14], [2, 10], [4, 7], [10, 7], [12, 4], [10, 0], [4, 0], [2, 2]]],
  T: [[[2, 14], [12, 14]], [[7, 14], [7, 0]]],
  U: [[[2, 14], [2, 4], [4, 0], [10, 0], [12, 4], [12, 14]]],
  V: [[[2, 14], [7, 0], [12, 14]]],
  W: [[[2, 14], [4, 0], [7, 8], [10, 0], [12, 14]]],
  X: [[[2, 0], [12, 14]], [[12, 0], [2, 14]]],
  Y: [[[2, 14], [7, 7], [12, 14]], [[7, 7], [7, 0]]],
  Z: [[[2, 14], [12, 14], [2, 0], [12, 0]]],
}

const LOWER_MAP: Record<string, string> = {
  a: 'A', b: 'B', c: 'C', d: 'D', e: 'E', f: 'F', g: 'G', h: 'H', i: 'I', j: 'J', k: 'K', l: 'L',
  m: 'M', n: 'N', o: 'O', p: 'P', q: 'Q', r: 'R', s: 'S', t: 'T', u: 'U', v: 'V', w: 'W', x: 'X', y: 'Y', z: 'Z',
  '\u00e1': 'A', '\u00e9': 'E', '\u00ed': 'I', '\u00f3': 'O', '\u00fa': 'U', '\u00f1': 'N', '\u00fc': 'U',
  '\u00bf': '?', '\u00a1': '!',
}

const ADVANCE: Record<string, number> = {
  ' ': 8, '.': 6, ',': 6, '!': 6, '?': 10, "'": 6, '-': 10,
  '0': 10, '1': 7, '2': 10, '3': 10, '4': 10, '5': 10, '6': 10, '7': 10, '8': 10, '9': 10,
}

export const HERSHEY_CAP_HEIGHT = 21

export function resolveGlyph(char: string): HersheyGlyph {
  if (G[char]) return G[char]!
  const mapped = LOWER_MAP[char]
  if (mapped && G[mapped]) return scaleGlyphY(G[mapped]!, 0.72, -2)
  if (char.toUpperCase() !== char) {
    const upper = char.toUpperCase()
    if (G[upper]) return scaleGlyphY(G[upper]!, 0.72, -2)
  }
  return G['?'] ?? []
}

function scaleGlyphY(glyph: HersheyGlyph, factor: number, offset: number): HersheyGlyph {
  return glyph.map((stroke) => stroke.map(([x, y]) => [x, y * factor + offset] as const))
}

export function glyphAdvance(char: string, scale: number): number {
  const base = ADVANCE[char] ?? 14
  return base * scale
}

export interface GlyphBounds {
  minX: number
  maxX: number
  minY: number
  maxY: number
}

export function glyphBoundingBox(glyph: HersheyGlyph): GlyphBounds | null {
  let minX = Infinity
  let maxX = -Infinity
  let minY = Infinity
  let maxY = -Infinity

  for (const stroke of glyph) {
    for (const [x, y] of stroke) {
      minX = Math.min(minX, x)
      maxX = Math.max(maxX, x)
      minY = Math.min(minY, y)
      maxY = Math.max(maxY, y)
    }
  }

  if (!Number.isFinite(minX)) return null
  return { minX, maxX, minY, maxY }
}

export function measureTextBounds(text: string, height: number): GlyphBounds | null {
  const scale = height / HERSHEY_CAP_HEIGHT
  let minX = Infinity
  let maxX = -Infinity
  let minY = Infinity
  let maxY = -Infinity
  let cursorX = 0

  for (const char of text) {
    const glyph = resolveGlyph(char)
    const box = glyphBoundingBox(glyph)
    if (box) {
      minX = Math.min(minX, cursorX + box.minX * scale)
      maxX = Math.max(maxX, cursorX + box.maxX * scale)
      minY = Math.min(minY, box.minY * scale)
      maxY = Math.max(maxY, box.maxY * scale)
    }
    cursorX += glyphAdvance(char, scale)
  }

  if (!Number.isFinite(minX)) return null
  return { minX, maxX, minY, maxY }
}

export function measureText(text: string, height: number): number {
  const bounds = measureTextBounds(text, height)
  if (bounds) return bounds.maxX - bounds.minX
  const scale = height / HERSHEY_CAP_HEIGHT
  let width = 0
  for (const char of text) {
    width += glyphAdvance(char, scale)
  }
  return width
}
