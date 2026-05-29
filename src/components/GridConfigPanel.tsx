import { useDocumentStore } from '../store/document'
import { GeneratedArt } from '../lib/art-engine'

interface GridConfigPanelProps {
  art: GeneratedArt | null
}

function Stepper({
  value,
  min,
  max,
  onChange,
}: {
  value: number
  min: number
  max: number
  onChange: (v: number) => void
}) {
  return (
    <div className="stepper">
      <button type="button" onClick={() => onChange(Math.max(min, value - 1))} aria-label="Menos">
        −
      </button>
      <span className="v">{value}</span>
      <button type="button" onClick={() => onChange(Math.min(max, value + 1))} aria-label="Más">
        +
      </button>
    </div>
  )
}

function SwitchT({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      className={'sw-t' + (on ? '' : ' off')}
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
    />
  )
}

export function GridConfigPanel({ art }: GridConfigPanelProps) {
  const document = useDocumentStore((s) => s.document)
  const updateGrid = useDocumentStore((s) => s.updateGrid)
  const updateStructure = useDocumentStore((s) => s.updateStructure)
  const regenerate = useDocumentStore((s) => s.regenerate)

  if (!document) return null

  const g = document.grid
  const minMM = art?.stats.minCell ?? 0
  const tooSmall = minMM > 0 && minMM < g.threshold

  return (
    <>
      <div className="sec">
        <div className="ctl-h">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: 'var(--accent)' }}>⊞</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 500 }}>grid</span>
          </div>
          <button
            type="button"
            className="btn btn--ghost btn--icon"
            title="Regenerar (R)"
            onClick={regenerate}
            aria-label="Regenerar"
          >
            ↻
          </button>
        </div>
        <p className="help">
          Módulo principal — subdivide el lienzo y delega cada celda a una colección.
        </p>
      </div>

      <div className="sec">
        <div className="sec__h">
          <span className="sec__t">Grilla</span>
        </div>
        <div className="row2">
          <div className="field">
            <div className="ctl-h">
              <span className="lbl">Filas</span>
            </div>
            <Stepper
              value={g.rows}
              min={1}
              max={16}
              onChange={(v) => updateGrid({ rows: v })}
            />
          </div>
          <div className="field">
            <div className="ctl-h">
              <span className="lbl">Columnas</span>
            </div>
            <Stepper
              value={g.cols}
              min={1}
              max={16}
              onChange={(v) => updateGrid({ cols: v })}
            />
          </div>
        </div>

        <div className="field">
          <div className="ctl-h">
            <span className="lbl">Profundidad de subgrillas</span>
            <span className="num">{g.depth}</span>
          </div>
          <input
            className="rg"
            type="range"
            min={0}
            max={4}
            step={1}
            value={g.depth}
            onChange={(e) => updateGrid({ depth: +e.target.value })}
          />
        </div>

        <div className="field">
          <div className="ctl-h">
            <span className="lbl">Prob. de subdivisión</span>
            <span className="num">{Math.round(g.splitProb * 100)}%</span>
          </div>
          <input
            className="rg"
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={g.splitProb}
            onChange={(e) => updateGrid({ splitProb: +e.target.value })}
          />
        </div>

        <div className="ctl-h">
          <span className="lbl">Grilla irregular (pesos)</span>
          <SwitchT on={g.irregular} onChange={(v) => updateGrid({ irregular: v })} />
        </div>
        <div className="ctl-h">
          <span className="lbl">Mostrar estructura</span>
          <SwitchT on={document.structure} onChange={updateStructure} />
        </div>
      </div>

      <div className="sec">
        <div className="sec__h">
          <span className="sec__t">Resolución física</span>
        </div>
        <div className="field">
          <div className="ctl-h">
            <span className="lbl">Umbral mínimo</span>
            <span className="num">{g.threshold.toFixed(1)} mm</span>
          </div>
          <input
            className="rg"
            type="range"
            min={0.5}
            max={5}
            step={0.5}
            value={g.threshold}
            onChange={(e) => updateGrid({ threshold: +e.target.value })}
          />
        </div>
        {art &&
          (tooSmall ? (
            <div className="callout warn" role="alert">
              <span>
                Celda más chica <b>{minMM.toFixed(1)} mm</b> &lt; umbral{' '}
                <b>{g.threshold} mm</b>. Reduce profundidad o filas.
              </span>
            </div>
          ) : (
            <div className="callout ok" role="status">
              <span>
                Celda más chica <b>{minMM.toFixed(1)} mm</b> — {art.stats.cellCount} celdas.
              </span>
            </div>
          ))}
      </div>
    </>
  )
}
