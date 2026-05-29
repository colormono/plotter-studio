# 002 — Shell: nuevo documento + lienzo SVG con proporciones de papel

## What to build

Implementar el shell mínimo de la aplicación: un formulario para crear un documento nuevo eligiendo el formato de papel, y un lienzo SVG que refleje las proporciones físicas del formato elegido. El documento recién creado se almacena en el estado global de la app (Zustand o Context). El lienzo SVG es el área central donde todos los módulos renderizarán geometría.

Los formatos de papel y sus dimensiones en mm:

| Format | Width | Height |
|--------|-------|--------|
| A4     | 210   | 297    |
| A3     | 297   | 420    |
| Letter | 216   | 279    |
| Legal  | 216   | 356    |

El lienzo SVG debe tener un `viewBox` que corresponda a las dimensiones en mm del papel y escalar para ocupar el espacio disponible en pantalla.

## Acceptance criteria

- [ ] El usuario puede crear un documento nuevo eligiendo nombre y formato de papel
- [ ] El lienzo SVG tiene el `viewBox` correcto para el formato elegido (en mm)
- [ ] El lienzo escala correctamente al redimensionar la ventana sin perder proporciones
- [ ] El estado del documento (id, name, paperFormat, maxGridDepth, layers) es accesible globalmente
- [ ] La pantalla principal muestra el lienzo como área central con layout de paneles laterales (aunque vacíos por ahora)

## Blocked by

- #001
