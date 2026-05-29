import { useRef, useEffect, useState, useCallback } from 'react'
import { Maximize, Minus, Plus } from 'lucide-react'
import { Layer, PlotterDocument } from '../types'
import { MODULES } from '../lib/modules'
import { Icon } from './Icon'

interface LayerGroupProps {
  document: PlotterDocument
  layer: Layer
}

function LayerGroup({ document, layer }: LayerGroupProps) {
  const ref = useRef<SVGGElement>(null)

  useEffect(() => {
    const g = ref.current
    if (!g) return
    while (g.firstChild) g.removeChild(g.firstChild)
    const mod = MODULES[layer.module]
    if (!mod) return
    for (const el of mod.render(document, layer)) g.appendChild(el)
  }, [document, layer])

  return (
    <g
      ref={ref}
      id={layer.id}
      data-layer-name={layer.name}
      stroke={layer.penColor}
      fill="none"
      strokeWidth={0.32}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  )
}

interface PlotterCanvasProps {
  document: PlotterDocument
  layers: Layer[]
  paperWidth: number
  paperHeight: number
  moduleLabel: string
}

export function PlotterCanvas({
  document,
  layers,
  paperWidth,
  paperHeight,
  moduleLabel,
}: PlotterCanvasProps) {
  const vpRef = useRef<HTMLDivElement>(null)
  const [vp, setVp] = useState({ w: 800, h: 600 })
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const el = vpRef.current
    if (!el) return
    const ro = new ResizeObserver(() =>
      setVp({ w: el.clientWidth, h: el.clientHeight }),
    )
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const fit = Math.min((vp.w * 0.82) / paperWidth, (vp.h * 0.82) / paperHeight)
  const scale = fit * zoom

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (e.button !== 0) return
      const base = { ...pan }
      const sx = e.clientX
      const sy = e.clientY
      const mv = (ev: PointerEvent) =>
        setPan({ x: base.x + (ev.clientX - sx), y: base.y + (ev.clientY - sy) })
      const up = () => {
        window.removeEventListener('pointermove', mv)
        window.removeEventListener('pointerup', up)
      }
      window.addEventListener('pointermove', mv)
      window.addEventListener('pointerup', up)
    },
    [pan],
  )

  const resetView = () => {
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }

  return (
    <>
      <div
        className="viewport"
        ref={vpRef}
        onPointerDown={onPointerDown}
        style={{ cursor: 'grab' }}
      >
        <div
          className="paper-wrap"
          style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})` }}
        >
          <svg
            className="paper"
            width={paperWidth}
            height={paperHeight}
            viewBox={`0 0 ${paperWidth} ${paperHeight}`}
            xmlns="http://www.w3.org/2000/svg"
            aria-label={`${document.paperFormat} canvas (${paperWidth}×${paperHeight}mm)`}
          >
            {layers.map((layer) => (
              <LayerGroup key={layer.id} document={document} layer={layer} />
            ))}
          </svg>
        </div>
      </div>

      <div className="stage__bar">
        <div className="z">
          <button
            type="button"
            className="zbtn"
            onClick={() => setZoom((z) => Math.max(0.3, +(z - 0.15).toFixed(2)))}
            aria-label="Alejar"
          >
            <Icon icon={Minus} size={13} strokeWidth={1.75} />
          </button>
          <span className="zval">{Math.round(scale * 100)}%</span>
          <button
            type="button"
            className="zbtn"
            onClick={() => setZoom((z) => Math.min(4, +(z + 0.15).toFixed(2)))}
            aria-label="Acercar"
          >
            <Icon icon={Plus} size={13} strokeWidth={1.75} />
          </button>
          <button type="button" className="zbtn" onClick={resetView} title="Ajustar" aria-label="Ajustar vista">
            <Icon icon={Maximize} size={13} strokeWidth={1.75} />
          </button>
        </div>
        <div className="sp" />
        <span className="hint">
          {document.paperFormat} · {paperWidth} × {paperHeight} mm · módulo {moduleLabel}
        </span>
        <div className="sp" />
        <span className="hint">arrastra para mover · R regenera</span>
      </div>
    </>
  )
}
