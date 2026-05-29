# 001 — Scaffold: Vite + React + TypeScript + tipos del dominio

## What to build

Inicializar la aplicación con Vite + React + TypeScript. Definir todos los tipos e interfaces del dominio en un módulo central (`src/types.ts` o `src/domain/types.ts`). No hay UI en este slice — solo la base técnica y el contrato de tipos que todos los slices posteriores importan.

Tipos a definir:

```ts
type PaperFormat = 'A4' | 'A3' | 'Letter' | 'Legal'

interface Document {
  id: string
  name: string
  version: string
  paperFormat: PaperFormat
  maxGridDepth: number
  layers: Layer[]
}

type Technique = 'draw' | 'cut' | 'mixed'

interface Layer {
  id: string
  name: string
  penColor: string          // hex
  technique: Technique
  visible: boolean
  order: number
  primaryCollection: string
  secondaryCollection: string | null
  module: string
  moduleConfig: object
}

interface GridConfig {
  margins: { top: number; right: number; bottom: number; left: number }
  gutter: number
  rows: number
  cols: number
  rowWeights: number[] | null
  colWeights: number[] | null
  cells: Cell[][]
}

interface Cell {
  primaryValue: number
  secondaryValue: number | null
  subgrid: GridConfig | null
}

interface Rect {
  x: number
  y: number
  width: number
  height: number
}

interface Collection {
  id: string
  label: string
  render: (value: number, bounds: Rect) => SVGElement[]
}
```

## Acceptance criteria

- [ ] `pnpm create vite` con template `react-ts` ejecuta y levanta sin errores
- [ ] `src/types.ts` exporta todos los tipos del dominio listados arriba
- [ ] El módulo de tipos no tiene dependencias externas (solo tipos)
- [ ] ESLint + Prettier configurados y pasan sin errores sobre el código inicial
- [ ] `pnpm test` corre (Vitest configurado, aunque sin tests todavía)

## Blocked by

None — can start immediately
