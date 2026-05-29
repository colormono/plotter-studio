# 008 — Edición manual de celdas + tooltip de valor al hover

## What to build

Agregar interactividad directa sobre el lienzo SVG para editar celdas individualmente. Al hacer clic en una celda, el usuario puede cambiar su `primaryValue` (y `secondaryValue` si la técnica es `mixed`). Al pasar el cursor sobre una celda, se muestra un tooltip con el valor numérico actual.

La celda clickeada puede mostrar un input numérico inline o un pequeño popover flotante — lo que sea más ergonómico sobre el SVG. El cambio de valor redispara el render de esa celda en tiempo real.

## Acceptance criteria

- [ ] Hover sobre una celda muestra un tooltip con `primaryValue` (y `secondaryValue` si aplica)
- [ ] Click sobre una celda abre un editor de valor inline o popover
- [ ] Cambiar el valor en el editor actualiza la celda en el estado y redibuja solo esa celda
- [ ] El valor mínimo editable es `0` (silencio), el máximo depende de la colección activa
- [ ] Para técnica `mixed`, el editor expone dos campos: primario y secundario
- [ ] El editor se cierra al hacer clic fuera o presionar Escape

## Blocked by

- #007
