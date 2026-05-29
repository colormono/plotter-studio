# 009 — Subgrillas recursivas + advertencia de resolución física

## What to build

Extender el módulo `grid` para soportar subgrillas recursivas. Cualquier celda puede convertirse en una subgrilla con su propia configuración (`GridConfig`). La recursión se detiene al alcanzar `document.maxGridDepth`.

Las subgrillas heredan la colección primaria de su capa padre, pero tienen configuración geométrica propia (filas, columnas, márgenes interiores, pesos). La función `calculateGrid` ya soporta esto; este slice agrega el soporte en el render del módulo y en la UI.

**UI para subgrillas:**
- Al activar subgrilla, la celda muestra el panel de configuración de grilla en lugar del editor de valor

**Advertencia de resolución física:**
- Calcular el tamaño mínimo de celda en todo el documento (incluyendo subgrillas)
- Si alguna celda es menor al umbral (default 2mm), mostrar un banner de advertencia con el tamaño mínimo detectado en mm

## Acceptance criteria

- [ ] Cada celda puede tener una subgrilla de forma aleatoria
- [ ] La subgrilla renderiza dentro del bounds de la celda padre
- [ ] La recursión se detiene en `document.maxGridDepth` (subgrillas más profundas se ignoran)
- [ ] Las subgrillas usan la colección de su capa padre
- [ ] El usuario puede configurar filas, columnas y pesos de la subgrilla
- [ ] El usuario puede quitar la subgrilla y restaurar la celda simple
- [ ] Si alguna celda (en cualquier nivel) tiene width o height < 2mm, se muestra advertencia con el tamaño exacto
- [ ] `maxGridDepth` es configurable por documento en el panel de propiedades

## Blocked by

- #007
