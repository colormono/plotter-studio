import { useRef, useEffect } from 'react'
import { PAPER_DIMENSIONS, Layer, PlotterDocument } from '../types'
import { gridModule } from '../lib/modules/grid'
import styles from './PlotterCanvas.module.css'

const MODULES: Record<string, { render: (doc: PlotterDocument, layer: Layer) => SVGElement[] }> = {
  grid: gridModule,
}

interface LayerGroupProps {
  document: PlotterDocument
  layer: Layer
}

function LayerGroup({ document, layer }: LayerGroupProps) {
  const ref = useRef<SVGGElement>(null)

  useEffect(() => {
    const g = ref.current
    if (!g) return

    // Clear previous render
    while (g.firstChild) g.removeChild(g.firstChild)

    const mod = MODULES[layer.module]
    if (!mod) return

    const elements = mod.render(document, layer)
    for (const el of elements) g.appendChild(el)
  })

  return (
    <g
      ref={ref}
      id={layer.id}
      data-layer-name={layer.name}
      stroke={layer.penColor}
      fill="none"
    />
  )
}

interface PlotterCanvasProps {
  document: PlotterDocument
  layers: Layer[]
}

export function PlotterCanvas({ document, layers }: PlotterCanvasProps) {
  const { width, height } = PAPER_DIMENSIONS[document.paperFormat]
  const viewBox = `0 0 ${width} ${height}`

  return (
    <div className={styles.wrapper}>
      <svg
        className={styles.canvas}
        viewBox={viewBox}
        xmlns="http://www.w3.org/2000/svg"
        style={{ aspectRatio: `${width} / ${height}` }}
        aria-label={`${document.paperFormat} canvas (${width}×${height}mm)`}
      >
        {layers.map((layer) => (
          <LayerGroup key={layer.id} document={document} layer={layer} />
        ))}
      </svg>
    </div>
  )
}
