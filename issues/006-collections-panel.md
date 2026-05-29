# 006 — Panel de colecciones: asignar primaria/secundaria a una capa

## What to build

Implementar el panel de configuración de colecciones en el UI. Cuando el usuario selecciona una capa en el panel de capas, el panel de colecciones muestra las opciones de colección disponibles y permite asignar una primaria y opcionalmente una secundaria.

Para capas de técnica `mixed`, el panel expone dos selectores independientes: uno para la colección de dibujo y otro para la colección de corte (ambos mapean a `primaryCollection` y `secondaryCollection` en el modelo).

El valor asignado se persiste en el estado de la capa (`layer.primaryCollection`, `layer.secondaryCollection`).

## Acceptance criteria

- [ ] El panel muestra todas las colecciones registradas en el catálogo
- [ ] El usuario puede asignar una colección primaria a la capa activa
- [ ] El usuario puede asignar una colección secundaria opcional (con opción de "ninguna")
- [ ] Para técnica `mixed`, el label del selector secundario indica "colección de corte"
- [ ] Cambiar la colección redispara el render del módulo activo en el lienzo
- [ ] El valor `0` (silencio) siempre produce celda vacía visualmente

## Blocked by

- #003
- #005
