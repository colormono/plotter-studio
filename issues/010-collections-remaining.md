# 010 — Colecciones: `geometric-shapes`, `dice`, `irregular-textures`

## What to build

Implementar las tres colecciones restantes del catálogo inicial. Cada una se registra en el array central de colecciones y es accesible automáticamente en el panel de colecciones sin modificar lógica existente.

**`geometric-shapes`** — dado un valor `1..N`, renderiza una forma geométrica dentro del bounds:
- 1: círculo inscrito
- 2: triángulo equilátero
- 3: cuadrado rotado 45°
- 4: cruz
- 5: hexágono
- (valores mayores pueden reutilizar o extender la secuencia)

**`dice`** — dado un valor `1..6`, renderiza la cara de un dado con los puntos correspondientes en posiciones canónicas dentro del bounds.

**`irregular-textures`** — dado un valor `1..N`, renderiza una textura orgánica/irregular dentro del bounds:
- 1: líneas onduladas horizontales
- 2: líneas onduladas verticales
- 3: puntos dispersos (distribución aleatoria seeded por posición)
- 4: trazos cortos en ángulos aleatorios (seeded)

Para las texturas con aleatoriedad, el seed debe derivar de la posición de la celda (row, col) para que el resultado sea reproducible y no cambie en cada render.

## Acceptance criteria

- [ ] Las tres colecciones están registradas en `COLLECTIONS` y aparecen en el panel
- [ ] `geometric-shapes` renderiza 5 formas distintas para valores 1–5
- [ ] `dice` renderiza los 6 valores canónicos de un dado
- [ ] `irregular-textures` renderiza al menos 4 texturas distintas
- [ ] Ninguna colección produce elementos con `fill` distinto de `none`
- [ ] Las texturas con aleatoriedad son reproducibles (mismo seed → mismo resultado)
- [ ] Valor `0` en cualquier colección retorna `[]`
- [ ] Tests unitarios para al menos un valor de cada colección nueva

## Blocked by

- #005
