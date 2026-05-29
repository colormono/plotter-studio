# 004 — `calculateGrid()` función pura + tests

## What to build

Implementar la función pura `calculateGrid(config: GridConfig, paper: PaperDimensions): CellBounds[][]` que transforma la configuración geométrica de una grilla en los bounds absolutos de cada celda (en mm). Esta función es el núcleo del sistema de grillas — todos los módulos de render la usan para saber dónde dibujar cada celda.

La función debe:
- Calcular el área de dibujo restando márgenes al tamaño de papel
- Distribuir filas y columnas respetando los `rowWeights` / `colWeights` (si son `null`, distribución regular)
- Aplicar el `gutter` entre celdas
- Devolver un array bidimensional de `CellBounds` con `{ x, y, width, height }` en mm

Adicionalmente, implementar `checkPhysicalResolution(bounds: CellBounds[][], thresholdMm?: number): boolean` que retorna `true` si alguna celda es más pequeña que el umbral (default: 2mm en cualquier dimensión).

Cubrir con tests unitarios (Vitest):
- Grilla regular 3×3 en A4
- Grilla irregular con pesos `[1, 2, 1]` en filas
- Márgenes extremos (margen > área de papel → error claro)
- Gutter que reduce las celdas proporcionalmente
- `checkPhysicalResolution` retorna `true` cuando una celda es < 2mm

## Acceptance criteria

- [ ] `calculateGrid` es una función pura exportada sin efectos secundarios
- [ ] Produce bounds correctos para grillas regulares e irregulares
- [ ] `rowWeights: null` produce filas de igual altura
- [ ] `colWeights: [1, 2, 1]` produce columnas en proporción 1:2:1
- [ ] El gutter se aplica entre celdas (no en los bordes externos)
- [ ] Si los márgenes superan el tamaño del papel, lanza un error descriptivo
- [ ] `checkPhysicalResolution` detecta celdas menores al umbral
- [ ] Todos los tests pasan con `pnpm test`

## Blocked by

- #001
