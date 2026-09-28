import { useCallback, useRef, useState } from 'react'
import { Image, Minus, Plus, RotateCcw, RotateCw, Upload } from 'lucide-react'
import { useDocumentStore } from '../store/document'
import { getLoadedSvgConfig } from '../lib/module-layers'
import { defaultPlacement, drawingSizeMm, getConfigStrokeCount } from '../lib/loaded-svg'
import { formatPaperLabel, getPaperDimensions } from '../lib/paper'
import { Icon } from './Icon'

export function LoadedSvgPanel() {
  const document = useDocumentStore((s) => s.document)
  const loadSvgFile = useDocumentStore((s) => s.loadSvgFile)
  const updateLoadedSvgPlacement = useDocumentStore((s) => s.updateLoadedSvgPlacement)
  const rotateLoadedSvg = useDocumentStore((s) => s.rotateLoadedSvg)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleImportClick = useCallback(() => {
    setError(null)
    fileInputRef.current?.click()
  }, [])

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return
      setLoading(true)
      setError(null)
      try {
        await loadSvgFile(file)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudo importar el SVG.')
      } finally {
        setLoading(false)
        e.target.value = ''
      }
    },
    [loadSvgFile],
  )

  if (!document || document.moduleId !== 'loaded-svg') return null

  const contentLayer = document.layers.find(
    (l) => l.module === 'loaded-svg' && l.layerRole === 'content',
  )
  const config = contentLayer ? getLoadedSvgConfig(contentLayer) : null
  const paper = getPaperDimensions(document)

  const size = config ? drawingSizeMm(config.viewBox, config.placement) : null
  const fitScale = config
    ? defaultPlacement(config.viewBox, paper, document.margin).scale
    : 1
  const scaleMin = fitScale * 0.05
  const scaleMax = fitScale * 5

  return (
    <div className="sec">
      <div className="sec__h">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Icon icon={Image} size={16} strokeWidth={1.75} style={{ color: 'var(--accent)' }} />
          <span className="sec__t">loaded-svg</span>
        </div>
      </div>

      <p className="help">
        Importa un SVG a un lienzo vacío con el formato y orientación del documento. Ajusta posición,
        rotación y escala manteniendo la proporción.
      </p>

      <button
        type="button"
        className="btn btn--primary"
        style={{ width: '100%', height: 34 }}
        onClick={handleImportClick}
        disabled={loading}
      >
        <Icon icon={Upload} size={15} strokeWidth={1.75} />
        {loading ? 'Importando…' : config ? 'Reemplazar SVG' : 'Importar SVG'}
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept=".svg,image/svg+xml"
        onChange={handleFileChange}
        aria-hidden="true"
        style={{ display: 'none' }}
      />

      {error && (
        <div className="callout warn" role="alert" style={{ marginTop: 8 }}>
          <span>{error}</span>
        </div>
      )}

      <div className="kv" style={{ marginTop: 12 }}>
        <span className="k">papel</span>
        <span className="v">{formatPaperLabel(document)}</span>
      </div>

      {config ? (
        <>
          <div className="kv">
            <span className="k">archivo</span>
            <span className="v" title={config.sourceFileName}>
              {config.sourceFileName}
            </span>
          </div>

          <div className="kv">
            <span className="k">origen (viewBox)</span>
            <span className="v">
              {config.viewBox.width.toFixed(1)} × {config.viewBox.height.toFixed(1)} u
            </span>
          </div>

          <div className="kv">
            <span className="k">tamaño en papel</span>
            <span className="v">
              {size!.width.toFixed(1)} × {size!.height.toFixed(1)} mm
            </span>
          </div>

          <div className="kv">
            <span className="k">trazos</span>
            <span className="v">{getConfigStrokeCount(config)}</span>
          </div>

          <div className="field" style={{ marginTop: 12 }}>
            <div className="ctl-h">
              <span className="lbl">Posición X</span>
              <span className="num">{config.placement.x.toFixed(1)} mm</span>
            </div>
            <input
              className="rg"
              type="range"
              min={0}
              max={paper.width}
              step={0.5}
              value={config.placement.x}
              onChange={(e) => updateLoadedSvgPlacement({ x: +e.target.value })}
              aria-label="Posición horizontal"
            />
          </div>

          <div className="field">
            <div className="ctl-h">
              <span className="lbl">Posición Y</span>
              <span className="num">{config.placement.y.toFixed(1)} mm</span>
            </div>
            <input
              className="rg"
              type="range"
              min={0}
              max={paper.height}
              step={0.5}
              value={config.placement.y}
              onChange={(e) => updateLoadedSvgPlacement({ y: +e.target.value })}
              aria-label="Posición vertical"
            />
          </div>

          <div className="field">
            <div className="ctl-h">
              <span className="lbl">Escala</span>
              <span className="num">{(config.placement.scale * 100).toFixed(0)}%</span>
            </div>
            <input
              className="rg"
              type="range"
              min={scaleMin}
              max={scaleMax}
              step={(scaleMax - scaleMin) / 200}
              value={config.placement.scale}
              onChange={(e) => updateLoadedSvgPlacement({ scale: +e.target.value })}
              aria-label="Escala del dibujo"
            />
          </div>

          <div className="field">
            <div className="ctl-h">
              <span className="lbl">Rotación</span>
              <span className="num">{config.placement.rotation}°</span>
            </div>
            <div className="row2">
              <button
                type="button"
                className="btn"
                style={{ flex: 1, height: 30 }}
                onClick={() => rotateLoadedSvg(-90)}
                aria-label="Rotar 90 grados en sentido antihorario"
              >
                <Icon icon={RotateCcw} size={14} strokeWidth={1.75} />
                −90°
              </button>
              <button
                type="button"
                className="btn"
                style={{ flex: 1, height: 30 }}
                onClick={() => rotateLoadedSvg(90)}
                aria-label="Rotar 90 grados en sentido horario"
              >
                <Icon icon={RotateCw} size={14} strokeWidth={1.75} />
                +90°
              </button>
            </div>
          </div>

          <div className="row2" style={{ marginTop: 8 }}>
            <button
              type="button"
              className="btn"
              style={{ flex: 1, height: 30 }}
              onClick={() =>
                updateLoadedSvgPlacement({
                  x: Math.max(0, config.placement.x - 5),
                })
              }
              aria-label="Mover 5 mm a la izquierda"
            >
              <Icon icon={Minus} size={13} strokeWidth={1.75} /> X
            </button>
            <button
              type="button"
              className="btn"
              style={{ flex: 1, height: 30 }}
              onClick={() =>
                updateLoadedSvgPlacement({
                  x: Math.min(paper.width, config.placement.x + 5),
                })
              }
              aria-label="Mover 5 mm a la derecha"
            >
              <Icon icon={Plus} size={13} strokeWidth={1.75} /> X
            </button>
          </div>
        </>
      ) : (
        <p className="help" style={{ marginTop: 12 }}>
          Sin dibujo cargado. Elige un archivo SVG con trazos (path, line, rect, etc.).
        </p>
      )}
    </div>
  )
}
