import { PAPER_DIMENSIONS, PaperFormat, Layer } from '../types'
import styles from './PlotterCanvas.module.css'

interface PlotterCanvasProps {
  paperFormat: PaperFormat
  layers: Layer[]
}

export function PlotterCanvas({ paperFormat, layers }: PlotterCanvasProps) {
  const { width, height } = PAPER_DIMENSIONS[paperFormat]
  const viewBox = `0 0 ${width} ${height}`

  return (
    <div className={styles.wrapper}>
      <svg
        className={styles.canvas}
        viewBox={viewBox}
        xmlns="http://www.w3.org/2000/svg"
        style={{ aspectRatio: `${width} / ${height}` }}
        aria-label={`${paperFormat} canvas (${width}×${height}mm)`}
      >
        {layers.map((layer) => (
          <g
            key={layer.id}
            id={layer.id}
            data-layer-name={layer.name}
            stroke={layer.penColor}
            fill="none"
          >
            {/* Module output for layer "{layer.name}" will be rendered here */}
          </g>
        ))}
      </svg>
    </div>
  )
}
