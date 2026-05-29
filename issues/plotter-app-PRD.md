# PRD: Aplicación web de dibujo SVG para plotters

## Problem Statement

Un artista / diseñador que trabaja con plotters (de dibujo y de corte) no tiene una herramienta web que le permita componer dibujos SVG multi-capa con semántica de plotter desde el origen — donde cada capa representa una pasada de pluma, cada celda de una grilla tiene un valor vinculado a un catálogo visual, y el archivo exportado es directamente ejecutable por la máquina sin post-procesamiento manual.

Las herramientas existentes (Inkscape, Illustrator) son de propósito general y no modelan el flujo de trabajo de un plotter: cambio de plumas por capa, técnicas mixtas (dibujo + corte), límites de resolución física, ni sistemas de notación visual basados en grillas.

---

## Solution

Una SPA web sin backend que funciona como entorno de composición de dibujos SVG orientado a plotters. El shell de la aplicación gestiona capas con semántica de plotter, colecciones de formas, y exportación SVG sanitizado. Los módulos de dibujo (grilla, tic-tac-toe, P5.js, D3, Three.js) se montan en el lienzo y producen geometría SVG bajo un contrato común. El documento de trabajo se serializa como JSON (`.plotter.json`) y el SVG es únicamente el output final para la máquina.

---

## User Stories

### Shell y documento

1. Como usuario, quiero crear un documento nuevo eligiendo un formato de papel estándar (A4, A3, Letter, etc.), para que el lienzo tenga las proporciones físicas correctas del papel que voy a usar en el plotter.
2. Como usuario, quiero guardar mi documento como un archivo `.plotter.json`, para poder cerrarlo y retomarlo sin perder la información paramétrica.
3. Como usuario, quiero abrir un archivo `.plotter.json` existente, para continuar editando un dibujo en progreso.
4. Como usuario, quiero exportar el dibujo como SVG sanitizado, para enviarlo directamente al plotter sin post-procesamiento.
5. Como usuario, quiero que la aplicación me advierta cuando una subgrilla supera la resolución física mínima del plotter, para evitar paths que la máquina no puede ejecutar.
6. Como usuario, quiero definir una profundidad máxima global de subgrillas por documento, para controlar la complejidad de ejecución en el plotter.

### Panel de capas

7. Como usuario, quiero crear múltiples capas en un documento, para organizar el dibujo en pasadas de pluma independientes.
8. Como usuario, quiero asignar un nombre a cada capa, para identificarlas fácilmente en el panel.
9. Como usuario, quiero asignar un color de pluma a cada capa, para que el SVG exportado refleje el cambio de pluma en el plotter.
10. Como usuario, quiero asignar una técnica a cada capa (plotter de dibujo, plotter de corte, mixta), para que el render y el export respeten las restricciones de cada técnica.
11. Como usuario, quiero reordenar las capas arrastrándolas, para controlar el orden de apilamiento visual y de ejecución en el plotter.
12. Como usuario, quiero activar o desactivar la visibilidad de una capa, para revisar el dibujo con o sin esa pasada.
13. Como usuario, quiero duplicar una capa, para iterar sobre variaciones sin rehacer la configuración.
14. Como usuario, quiero eliminar una capa, para limpiar el documento de capas que ya no necesito.

### Panel de colecciones

15. Como usuario, quiero asignar una colección primaria a una capa (figuras geométricas, dados, texturas regulares, texturas irregulares), para que cada celda de la grilla renderice formas de esa colección según su valor.
16. Como usuario, quiero asignar una colección secundaria opcional a una capa, para agregar acentos visuales en celdas marcadas explícitamente.
17. Como usuario, quiero que el valor 0 de cualquier colección siempre represente silencio (celda vacía), para poder componer espacios negativos en el dibujo.
18. Como usuario, en una capa de técnica mixta, quiero asignar una colección de dibujo y una colección de corte independientes, para que cada celda pueda tener dos valores combinados.

### Sistema de grillas

19. Como usuario, quiero definir los márgenes del área de dibujo dentro del lienzo, para respetar los límites físicos del papel y las pinzas del plotter.
20. Como usuario, quiero definir el espaciado entre celdas (gutter), para controlar el ritmo visual de la grilla.
21. Como usuario, quiero definir la cantidad de filas y columnas de la grilla, para establecer la resolución de la composición.
22. Como usuario, quiero generar una grilla regular (celdas de igual tamaño) con un solo gesto, para empezar a trabajar rápidamente.
23. Como usuario, quiero generar una grilla irregular definiendo pesos relativos por fila y por columna (ej: `[1, 2, 1.5, 1]`), para crear ritmos visuales no uniformes.
24. Como usuario, quiero que cualquier celda pueda convertirse en una subgrilla con su propia configuración geométrica, para agregar niveles de detalle dentro de la composición.
25. Como usuario, quiero que las subgrillas sean recursivas hasta el límite de profundidad global del documento, para explorar composiciones de múltiples escalas.
26. Como usuario, quiero que las subgrillas hereden la colección de su capa padre pero puedan tener su propia configuración de filas, columnas, márgenes y pesos, para mantener coherencia visual con variedad geométrica.

### Valores de celdas

27. Como usuario, quiero generar valores para todas las celdas de forma algorítmica (aleatoria, gradiente, ruido Perlin), para explorar composiciones rápidamente.
28. Como usuario, quiero editar el valor de una celda individual haciendo clic sobre ella, para ajustar la composición manualmente después de la generación.
29. Como usuario, quiero que cada celda almacene un valor primario y opcionalmente un valor secundario, para soportar técnicas mixtas y acentos.
30. Como usuario, quiero ver el valor numérico de una celda al pasar el cursor sobre ella, para entender la notación de la composición.

### Módulo: Grilla con texturas

31. Como usuario, quiero seleccionar el módulo "Grilla" para el lienzo activo, para componer dibujos basados en el sistema de grillas y catálogo.
32. Como usuario, quiero previsualizar en tiempo real cómo cambia el render al modificar parámetros de la grilla, para iterar visualmente sin exportar.

### Módulo: Tic-tac-toe

33. Como usuario, quiero seleccionar el módulo "Tic-tac-toe" para generar un tablero y un resultado de partida aleatoria, para tener un dibujo generativo simple listo para plotear.
34. Como usuario, quiero regenerar el resultado del tic-tac-toe con un botón, para explorar variaciones sin reconfigurar el módulo.
35. Como usuario, quiero que el tablero y las marcas (X y O) estén en capas separadas, para poder plotear con plumas diferentes.

### Módulo: Hoja de prueba

36. Como usuario, quiero generar una hoja de prueba según el tamaño de papel activo, para calibrar el plotter antes de ejecutar un dibujo real.

### Exportación SVG

37. Como usuario, quiero que el SVG exportado tenga una `<g>` por capa con el color de pluma como atributo de stroke, para que el operador del plotter identifique cada pasada.
38. Como usuario, quiero que el SVG exportado pase por una capa de sanitización que elimine rellenos, degradados y efectos no compatibles con plotters, para que el archivo sea directamente ejecutable.
39. Como usuario, quiero que el SVG exportado no contenga información de edición (solo geometría final), para que el archivo sea limpio y liviano.

---

## Implementation Decisions

### Arquitectura general

- **SPA sin backend.** Todo corre en el browser. No hay servidor, no hay base de datos, no hay cuentas.
- **Formato de trabajo: `.plotter.json`.** El documento es un objeto serializable que contiene toda la información paramétrica. El SVG es solo output.
- **Contrato de módulo:** cada módulo de dibujo implementa `render(documento, capa) → SVGElement[]`. El shell llama a este contrato sin conocer los detalles del módulo.

### Modelo de datos del documento

```
Document {
  id: string
  name: string
  paperFormat: PaperFormat         // A4, A3, Letter, etc.
  maxGridDepth: number             // límite global de profundidad de subgrillas
  layers: Layer[]
}

Layer {
  id: string
  name: string
  penColor: string                 // hex
  technique: 'draw' | 'cut' | 'mixed'
  visible: boolean
  order: number
  primaryCollection: CollectionId
  secondaryCollection: CollectionId | null
  module: ModuleId                 // 'grid' | 'tictactoe' | 'test-sheet' | ...
  moduleConfig: object             // configuración específica del módulo
}

GridConfig {
  margins: { top, right, bottom, left }   // en mm
  gutter: number                           // en mm
  rows: number
  cols: number
  rowWeights: number[]             // pesos relativos; null = regular
  colWeights: number[]
  cells: Cell[][]
}

Cell {
  primaryValue: number             // 0 = silencio
  secondaryValue: number | null
  subgrid: GridConfig | null       // null = celda simple
}
```

### Catálogo de colecciones

- Cada colección es un objeto `{ id, label, render(value: number, bounds: Rect) → SVGElement[] }`.
- Las colecciones son datos, no código: se registran en un array central; agregar una nueva no modifica lógica existente.
- Colecciones iniciales: `silence`, `geometric-shapes`, `dice`, `regular-textures`, `irregular-textures`.
- El valor `0` siempre produce silencio en cualquier colección, independientemente de la implementación del `render`.

### Sistema de grillas

- La grilla se calcula a partir del tamaño de papel, márgenes, gutter, filas, columnas y pesos. Es una función pura: `calculateGrid(config, paperDimensions) → CellBounds[][]`.
- Las subgrillas son recursivas: una celda con `subgrid !== null` reemplaza su render simple por el render de su subgrilla hija.
- El límite de profundidad se controla pasando el nivel actual en la recursión. Al alcanzar `maxGridDepth`, se ignoran subgrillas más profundas.
- La advertencia de resolución física se calcula comparando el tamaño mínimo de celda resultante contra un umbral configurable (default: 2mm).

### Sanitización SVG

- Antes de exportar, todos los paths pasan por un sanitizador que: elimina `fill` distinto de `none`, elimina filtros, elimina degradados, simplifica grupos anidados vacíos.
- El sanitizador es una función pura `sanitize(svgElement) → svgElement`.

### Módulos de dibujo — orden de construcción

1. `grid` — módulo principal, define el contrato
2. `tictactoe` — módulo generativo simple
3. `test-sheet` — hoja de prueba según papel
4. `p5`, `d3`, `threejs` — etapa posterior

### Persistencia

- Guardar: `JSON.stringify(document)` → descarga como `.plotter.json`
- Abrir: `FileReader` → `JSON.parse` → hidrata el estado de la app
- Adicionalmente: autosave en `localStorage` como respaldo de sesión

---

## Testing Decisions

Un buen test verifica comportamiento observable desde afuera del módulo, no detalles de implementación interna.

**Módulos a testear:**

- `calculateGrid(config, paperDimensions)` — función pura, fácil de testear con casos de grillas regulares, irregulares, con márgenes extremos, y con profundidad máxima alcanzada.
- `sanitize(svgElement)` — función pura; verificar que rellenos, filtros y degradados sean eliminados correctamente.
- `render` de cada colección — dado un valor y un bounds, verificar que el output sea un array de SVGElements sin fills, con stroke definido.
- Serialización del documento — `serialize(doc)` y `deserialize(json)` son inversas; testear con documentos complejos (subgrillas anidadas, capas múltiples, técnicas mixtas).

**Módulos que no requieren tests unitarios en esta etapa:**

- Shell / UI (comportamiento de drag-and-drop, paneles) — mejor cubierto con tests de integración o e2e si se agregan en el futuro.
- Módulos P5/D3/Three — dependen de librerías externas con su propio testing.

---

## Out of Scope

- Backend, autenticación, cuentas de usuario, sync en la nube
- Colaboración en tiempo real
- UI para editar o agregar colecciones al catálogo (las colecciones son código, no configuración de usuario)
- Editor de grilla con drag-and-drop de bordes (las grillas irregulares se definen por pesos, no por arrastre)
- Módulos P5.js, D3, Three.js (etapa posterior)
- Conversión de canvas a SVG para los módulos P5/Three (etapa posterior)
- Soporte para múltiples documentos abiertos simultáneamente
- Historial de deshacer/rehacer (undo/redo)
- Preview de simulación del plotter (animación del recorrido de la pluma)

---

## Further Notes

- El nombre de trabajo del proyecto es **Plotter Studio**.
- El flujo de trabajo esperado es: crear documento → configurar capas → elegir módulo → generar valores algorítmicamente → editar manualmente → exportar SVG.
- La advertencia de resolución física debería mostrar el tamaño en mm de la celda más pequeña del documento, para que el usuario pueda compararlo con las especificaciones de su plotter.
- El formato `.plotter.json` debería incluir un campo `version` para permitir migraciones futuras del schema.
- A futuro, una celda de grilla podría delegar su render a un módulo P5 — el contrato de módulo `render(documento, capa) → SVGElement[]` fue diseñado para soportar esto sin cambios en el shell.
