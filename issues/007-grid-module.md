# 007 — Módulo `grid`: render completo + generación algorítmica de valores

## What to build

Implementar el módulo `grid` completo. Este es el módulo principal de la aplicación y establece el contrato que todos los módulos de dibujo siguen:

```ts
interface Module {
  id: string
  render: (document: Document, layer: Layer) => SVGElement[]
}
```

El módulo `grid`:
1. Lee `layer.moduleConfig` como `GridConfig`
2. Llama a `calculateGrid(config, paperDimensions)` para obtener los bounds
3. Para cada celda, llama a `collection.render(cell.primaryValue, cellBounds)`
4. Monta todos los SVGElements resultantes bajo el `<g>` de la capa

El panel de configuración del módulo expone los parámetros de la grilla: márgenes, gutter, filas, columnas, pesos de filas y columnas.

**Generación algorítmica de valores:** un botón "Generar" permite poblar todas las celdas con valores usando uno de tres algoritmos: `random`, `gradient`, `perlin`. El algoritmo y sus parámetros son configurables en el panel.

La previsualización en el lienzo se actualiza en tiempo real al modificar cualquier parámetro.

## Acceptance criteria

- [ ] El módulo `grid` implementa la interfaz `Module` (id + render)
- [ ] El lienzo SVG muestra la grilla calculada con la colección asignada a la capa
- [ ] Cambiar filas, columnas, márgenes o gutter actualiza el render en tiempo real
- [ ] Cambiar pesos de filas o columnas produce una grilla irregular correcta
- [ ] El botón "Generar" con modo `random` puebla todas las celdas con valores aleatorios
- [ ] El botón "Generar" con modo `gradient` produce un gradiente suave de valores
- [ ] El botón "Generar" con modo `perlin` produce valores con ruido coherente
- [ ] Celdas con `primaryValue === 0` no renderizan geometría

## Blocked by

- #004
- #005
- #006
