# 011 — Sanitizador SVG + export final con `<g>` por capa

## What to build

Implementar la función pura `sanitize(svg: SVGElement): SVGElement` y el flujo completo de exportación SVG.

**El sanitizador elimina:**
- Atributos `fill` con valor distinto de `none` (los reemplaza por `fill="none"`)
- Elementos `<filter>` y referencias a filtros (`filter="url(...)"`)
- Elementos `<linearGradient>`, `<radialGradient>` y referencias a degradados
- Grupos `<g>` anidados vacíos (sin hijos)

**El SVG exportado:**
- Tiene `viewBox` y `width`/`height` en mm con unidades físicas
- Contiene una `<g>` por capa (en orden de `layer.order`), con atributo `id` igual al nombre de la capa y `stroke` igual al `penColor` de la capa
- Las capas con `visible: false` se omiten del export (o se incluyen con una opción toggle)
- No contiene atributos ni metadata de edición (solo geometría)
- Pasa por el sanitizador antes de descargarse

La descarga se dispara con `URL.createObjectURL(new Blob([svgString], { type: 'image/svg+xml' }))`.

**Tests unitarios para `sanitize`:**
- Elimina `fill="red"` pero conserva `fill="none"`
- Elimina `<filter>` y su referencia
- Elimina `<linearGradient>` y su referencia
- Elimina `<g>` vacíos pero conserva `<g>` con hijos

## Acceptance criteria

- [ ] El botón "Exportar SVG" descarga el archivo con nombre `{documentName}.svg`
- [ ] El SVG tiene una `<g>` por capa visible con `id` y `stroke` correctos
- [ ] El SVG no contiene fills distintos de `none`
- [ ] El SVG no contiene filtros ni degradados
- [ ] El SVG no contiene `<g>` vacíos
- [ ] El `viewBox` corresponde a las dimensiones físicas del papel en mm
- [ ] Todos los tests de `sanitize` pasan

## Blocked by

- #007
