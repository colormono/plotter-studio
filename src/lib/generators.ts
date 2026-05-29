import { createNoise2D } from 'simplex-noise'

export type GeneratorMode = 'random' | 'gradient' | 'perlin'

export interface GeneratorOptions {
  mode: GeneratorMode
  /** Maximum value to generate (1..maxValue). 0 is reserved for silence. */
  maxValue: number
  /** 0–1 density: probability a cell is non-zero (random mode only, default 1). */
  density?: number
  /** Noise scale for perlin mode (default 0.3). Lower = smoother. */
  noiseScale?: number
  /** Direction for gradient: 'horizontal' | 'vertical' | 'radial' (default 'horizontal'). */
  gradientDir?: 'horizontal' | 'vertical' | 'radial'
}

/** Fills a rows×cols matrix with values using the chosen algorithm. */
export function generateValues(
  rows: number,
  cols: number,
  options: GeneratorOptions,
): number[][] {
  const { mode, maxValue, density = 1, noiseScale = 0.3, gradientDir = 'horizontal' } = options

  switch (mode) {
    case 'random':
      return generateRandom(rows, cols, maxValue, density)
    case 'gradient':
      return generateGradient(rows, cols, maxValue, gradientDir)
    case 'perlin':
      return generatePerlin(rows, cols, maxValue, noiseScale)
  }
}

function generateRandom(
  rows: number,
  cols: number,
  maxValue: number,
  density: number,
): number[][] {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => {
      if (Math.random() > density) return 0
      return Math.floor(Math.random() * maxValue) + 1
    }),
  )
}

function generateGradient(
  rows: number,
  cols: number,
  maxValue: number,
  dir: 'horizontal' | 'vertical' | 'radial',
): number[][] {
  return Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => {
      let t: number
      if (dir === 'horizontal') {
        t = cols > 1 ? c / (cols - 1) : 0
      } else if (dir === 'vertical') {
        t = rows > 1 ? r / (rows - 1) : 0
      } else {
        // radial: distance from center
        const nr = rows > 1 ? (r / (rows - 1)) * 2 - 1 : 0
        const nc = cols > 1 ? (c / (cols - 1)) * 2 - 1 : 0
        t = Math.min(1, Math.sqrt(nr * nr + nc * nc))
      }
      return Math.max(1, Math.round(t * (maxValue - 1)) + 1)
    }),
  )
}

function generatePerlin(
  rows: number,
  cols: number,
  maxValue: number,
  scale: number,
): number[][] {
  const noise2D = createNoise2D()
  return Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => {
      // noise2D returns -1..1; normalize to 0..1
      const n = (noise2D(c * scale, r * scale) + 1) / 2
      return Math.max(1, Math.round(n * maxValue))
    }),
  )
}
