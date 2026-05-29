# 014 — Guardar / abrir `.plotter.json` + autosave en localStorage

## What to build

Implementar el ciclo completo de persistencia del documento:

**Guardar:** `serialize(document: Document): string` — `JSON.stringify` del documento con todos sus datos paramétricos. La descarga usa `Blob` + `URL.createObjectURL`. El nombre del archivo es `{document.name}.plotter.json`.

**Abrir:** un input `<input type="file" accept=".plotter.json">` lee el archivo con `FileReader`, llama a `JSON.parse` y carga el documento en el estado global. Si el JSON no es un documento válido (campos requeridos faltantes, versión incompatible), mostrar un error claro.

**Autosave:** cada vez que el estado del documento cambia, guardarlo en `localStorage` bajo la clave `plotter-studio:autosave`. Al iniciar la app, si existe un autosave, ofrecer al usuario la opción de restaurarlo o descartar.

El campo `version` en el documento debe ser `"1"` en este slice. En el futuro, una función `migrate(json, fromVersion)` manejará versiones anteriores.

Implementar tests de serialización:
- `serialize(doc)` seguido de `deserialize(serialize(doc))` produce un documento idéntico
- Documentos con subgrillas anidadas, capas múltiples y técnicas mixtas se serializan y deserializan correctamente
- `deserialize` de un JSON inválido lanza un error descriptivo

## Acceptance criteria

- [ ] El botón "Guardar" descarga `{name}.plotter.json` con el documento completo
- [ ] El botón "Abrir" carga un `.plotter.json` y restaura el estado completo de la app
- [ ] El documento incluye campo `version: "1"`
- [ ] Si el archivo cargado tiene campos requeridos faltantes, se muestra mensaje de error
- [ ] El autosave se activa automáticamente en cada cambio de estado
- [ ] Al iniciar la app con autosave disponible, se ofrece opción de restaurar o descartar
- [ ] `serialize` + `deserialize` es una operación inversa exacta (tests pasan)

## Blocked by

- #002
