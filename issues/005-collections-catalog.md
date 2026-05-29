# 005 — Catálogo de colecciones: interfaz + `silence` + `regular-textures`

## What to build

Implementar el sistema de catálogo de colecciones. Una colección es un objeto que implementa la interfaz `Collection` y se registra en un array central. Agregar una nueva colección no modifica lógica existente — solo se añade al array.

El contrato de render:

```ts
interface Collection {
  id: string
  label: string
  render: (value: number, bounds: Rect) => SVGElement[]
}
```

Regla invariante: si `value === 0`, cualquier colección devuelve `[]` (silencio), independientemente de su implementación.

**Colecciones a implementar en este slice:**

- `silence` — siempre devuelve `[]` sin importar el valor. Colección especial que representa "celda siempre vacía".
- `regular-textures` — dado un valor `1..N`, renderiza una textura regular dentro del bounds (líneas horizontales, verticales, cruzadas, punteado, etc. — una textura por valor numérico).

Implementar también `getCollection(id: string): Collection` como helper de acceso al catálogo.

## Acceptance criteria

- [ ] `COLLECTIONS` es un array exportado de objetos `Collection`
- [ ] `getCollection(id)` retorna la colección correspondiente o lanza error si no existe
- [ ] `silence.render(anyValue, bounds)` siempre retorna `[]`
- [ ] Cualquier colección: `render(0, bounds)` retorna `[]`
- [ ] `regular-textures` renderiza al menos 4 texturas distintas (valores 1–4)
- [ ] Los SVGElements producidos no tienen `fill` ni `filter` (solo `stroke`)
- [ ] Tests unitarios para `silence` y al menos 2 valores de `regular-textures`

## Blocked by

- #001
