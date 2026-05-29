# 003 — Panel de capas: CRUD, reordenar, visibilidad, color, técnica

## What to build

Implementar el panel de capas completo. El usuario puede crear, renombrar, duplicar y eliminar capas. Cada capa tiene nombre, color de pluma (hex), técnica (`draw` | `cut` | `mixed`) y visibilidad. Las capas se pueden reordenar mediante drag-and-drop. El orden de las capas en el panel determina el orden de los `<g>` en el SVG exportado.

Las capas viven en el estado global del documento. Toda operación del panel muta el estado inmutablemente.

## Acceptance criteria

- [ ] El usuario puede crear una nueva capa con nombre por defecto
- [ ] El usuario puede renombrar una capa haciendo doble clic o usando un input inline
- [ ] El usuario puede asignar un color de pluma a una capa mediante un color picker
- [ ] El usuario puede asignar la técnica (`draw` / `cut` / `mixed`) a una capa
- [ ] El usuario puede activar/desactivar la visibilidad de una capa con un toggle
- [ ] El usuario puede reordenar capas arrastrándolas (drag-and-drop)
- [ ] El usuario puede duplicar una capa (copia todos los atributos, genera nuevo `id`)
- [ ] El usuario puede eliminar una capa (con confirmación si tiene contenido)
- [ ] Las capas ocultas no renderizan geometría en el lienzo SVG

## Blocked by

- #002
