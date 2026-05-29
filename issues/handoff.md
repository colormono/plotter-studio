# Handoff — Plotter Studio

## Estado de la sesión

Esta sesión consistió en dos fases:
1. **Interrogatorio de diseño** (`/grill-me`) — se definió la arquitectura, modelo de datos y alcance completo de la aplicación.
2. **Generación de PRD** (`/to-prd`) — se produjo un PRD completo basado en el interrogatorio.

No se escribió código. El trabajo fue puramente de diseño y especificación.

## Artefactos producidos

- **PRD completo:** `/mnt/user-data/outputs/plotter-app-PRD.md`
  — Contiene problem statement, user stories (39), implementation decisions con tipos de datos, decisiones de testing, out of scope y notas.

## Nombre del proyecto

**Plotter Studio**

## Decisiones clave (resumen ejecutivo)

Ver el PRD para el detalle completo. Las decisiones más importantes:

- **SPA sin backend**, todo local, sin cuentas
- **Formato de trabajo:** `.plotter.json` (JSON serializable); SVG es solo output final
- **SVG en el DOM** como fuente de verdad; cada capa es un `<g>`
- **Semántica de plotter desde el origen:** cada capa tiene nombre, color de pluma, técnica (`draw` | `cut` | `mixed`), visibilidad, orden
- **Contrato de módulo:** `render(documento, capa) → SVGElement[]` — todos los módulos de dibujo implementan esta interfaz
- **Sistema de grillas recursivo:** subgrillas anidadas hasta `maxGridDepth` (global por documento), con advertencia de resolución física (umbral default: 2mm)
- **Grillas irregulares** definidas por pesos relativos (`rowWeights`, `colWeights`), no por drag-and-drop
- **Catálogo de colecciones como datos:** `{ id, label, render(value, bounds) → SVGElement[] }` — colecciones iniciales: silence, geometric-shapes, dice, regular-textures, irregular-textures
- **Sanitización SVG** antes de exportar: elimina fills, filtros, degradados
- **P5/D3/Three.js** son fuentes de geometría (etapa posterior), no renderers finales

## Orden de construcción de módulos

1. `grid` — módulo principal, define el contrato
2. `tictactoe` — módulo generativo simple con regeneración
3. `test-sheet` — hoja de prueba según formato de papel
4. `p5`, `d3`, `threejs` — etapa posterior

## Lo que viene a continuación

El siguiente paso natural es `/prd-to-issues` para convertir el PRD en tickets de trabajo, o arrancar directamente a construir el shell + módulo `grid`.

Si se arranca a construir, el orden recomendado es:
1. Shell (documento, capas, panel de colores, lienzo SVG)
2. `calculateGrid()` — función pura, testeable
3. Colección `regular-textures` — la más simple para validar el contrato de render
4. Módulo `grid` completo
5. Export SVG + sanitizador

## Suggested skills

- `/prd-to-issues` — para convertir el PRD en tickets antes de arrancar a codear
- `/write-a-prd` — si se decide expandir algún módulo específico (ej: P5, D3) en su propio PRD
- `/grill-me` — si surgen decisiones de diseño nuevas durante la implementación

## Notas adicionales

- El usuario habla español — continuar en español
- El usuario tiene experiencia con P5.js, D3 y Three.js — puede referirse a conceptos de esas librerías sin explicación
- El proyecto es personal por ahora, pero diseñado para ser portable (compartir `.plotter.json`)
- No hay issue tracker configurado en los skills del usuario — los artefactos se entregan como archivos descargables
