# 013 — Módulo `test-sheet`: hoja de calibración por formato de papel

## What to build

Implementar el módulo `test-sheet`. Genera una hoja de calibración para el plotter según el formato de papel activo en el documento. La hoja de prueba sirve para verificar que el plotter está alineado correctamente antes de ejecutar un dibujo real.

Contenido de la hoja de prueba:
- Borde exterior del área de dibujo (márgenes estándar: 10mm todos los lados)
- Líneas de esquina en las cuatro esquinas (marcas en L de 5mm)
- Una grilla regular de referencia (por ejemplo, 10×10 celdas) dentro del área
- El nombre del formato de papel (ej: "A4 — 210×297mm") como texto dentro del área, en una posición que no interfiera con la grilla
- Marcas de registro en los bordes (cruces centradas en cada lado)

El módulo crea una sola capa "test-sheet" en el documento. Todos los elementos son paths SVG sin fill.

El módulo implementa la interfaz `Module` estándar.

## Acceptance criteria

- [ ] El módulo genera una sola capa "test-sheet" con todos los elementos de calibración
- [ ] El borde y las marcas corresponden a las dimensiones físicas del paper format activo
- [ ] La grilla de referencia cubre el área de dibujo con celdas de igual tamaño
- [ ] El texto del formato es legible y no se superpone con los elementos de la grilla
- [ ] Ningún elemento tiene fill distinto de none
- [ ] Al cambiar el formato de papel del documento, el módulo regenera la hoja correctamente

## Blocked by

- #002
