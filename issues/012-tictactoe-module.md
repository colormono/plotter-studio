# 012 — Módulo `tictactoe`: tablero aleatorio + regenerar + 2 capas

## What to build

Implementar el módulo `tictactoe`. Al activarlo, crea automáticamente dos capas en el documento:
- **Capa "tablero"** — renderiza las líneas del tablero 3×3
- **Capa "marcas"** — renderiza las X y O del resultado de la partida

El módulo genera un resultado de partida aleatoria válida (secuencia de movimientos que respeta las reglas del tic-tac-toe: no movimientos post-victoria, no tableros imposibles). El resultado puede ser victoria de X, victoria de O, o empate.

Un botón "Regenerar" en el panel del módulo genera una nueva partida aleatoria sin reconfigurar nada.

Las X se dibujan como dos líneas diagonales cruzadas. Las O se dibujan como círculos. Ambas formas son paths SVG sin fill.

El módulo implementa la misma interfaz `Module`:
```ts
render: (document: Document, layer: Layer) => SVGElement[]
```

Cada capa del módulo tiene su propio `penColor` configurable desde el panel de capas estándar.

## Acceptance criteria

- [ ] Al activar el módulo, se crean dos capas: "tablero" y "marcas"
- [ ] El tablero renderiza las 4 líneas del grid 3×3 dentro del área de dibujo
- [ ] Las marcas renderizan X (dos diagonales) y O (círculo) sin fill
- [ ] La partida generada es válida según las reglas del tic-tac-toe
- [ ] El botón "Regenerar" produce una nueva partida válida y actualiza el lienzo
- [ ] Las dos capas son independientes (se pueden ocultar, cambiar color, reordenar)
- [ ] El módulo escala al tamaño del papel activo

## Blocked by

- #003
