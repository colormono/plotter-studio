import { Dices, Grid3x3, Minus, Plus } from 'lucide-react'
import { useDocumentStore } from '../store/document'
import { GeneratedArt } from '../lib/art-engine'
import { Icon } from './Icon'

interface GridConfigPanelProps {
  art: GeneratedArt | null
}

function Stepper({
  value,
  min,
  max,
  label,
  onChange,
}: {
  value: number
  min: number
  max: number
  label: string
  onChange: (v: number) => void
}) {
  return (
    <div className="stepper is-wide">
      <button
        type="button"
        onClick={() => onChange(value - 1)}
        disabled={value <= min}
        aria-label={`Menos ${label}`}
      >
        <Icon icon={Minus} size={13} strokeWidth={1.75} />
      </button>
      <span className="v">{value}</span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        disabled={value >= max}
        aria-label={`Más ${label}`}
      >
        <Icon icon={Plus} size={13} strokeWidth={1.75} />
      </button>
    </div>
  )
}

function SwitchT({
  label,
  on,
  onChange,
}: {
  label: string
  on: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <button
      type="button"
      className={'sw-t' + (on ? '' : ' off')}
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange(!on)}
    />
  )
}

export function GridConfigPanel({ art }: GridConfigPanelProps) {
  const document = useDocumentStore((s) => s.document)
  const updateGrid = useDocumentStore((s) => s.updateGrid)
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
            <Icon icon={Grid3x3} size={16} strokeWidth={1.75} style={{ color: 'var(--accent)' }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 500 }}>grid</span>
          </div>
          <button
            type="button"
            className="btn btn--ghost btn--icon"
            title="Regenerar (R)"
            onClick={regenerate}
            aria-label="Regenerar"
          >
            <Icon icon={Dices} size={15} strokeWidth={1.75} />
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
              label="filas"
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
              label="columnas"
              value={g.cols}
              min={1}
              max={16}
              onChange={(v) => updateGrid({ cols: v })}
            />
          </div>
        </div>

        <div className="field">
          <div className="ctl-h">
            <span className="lbl">Profundidad</span>
          </div>
          <div className="seg" role="group" aria-label="Profundidad de subgrillas">
            {[0, 1, 2, 3, 4].map((level) => (
              <button
                key={level}
                type="button"
                className={g.depth === level ? 'is-on' : ''}
                aria-pressed={g.depth === level}
                onClick={() => updateGrid({ depth: level })}
              >
                {level}
              </button>
            ))}
          </div>
          <p className="help">0 es la grilla base. Cada nivel puede partir una celda.</p>
        </div>

        <div className="field">
          <div className="ctl-h">
            <span className="lbl">Grilla irregular</span>
            <SwitchT
              label="Grilla irregular"
              on={g.irregular}
              onChange={(v) => updateGrid({ irregular: v })}
            />
          </div>
          <p className="help">Reparte la base con anchos distintos.</p>
        </div>

        <div className="field">
          <div className="ctl-h">
            <span className="lbl">Llenar la celda</span>
            <SwitchT
              label="Llenar la celda"
              on={g.scaleMode === 'fit'}
              onChange={(fill) => updateGrid({ scaleMode: fill ? 'fit' : 'proportional' })}
            />
          </div>
          <p className="help">
            {g.scaleMode === 'fit'
              ? 'El dibujo ocupa el rectángulo de la celda.'
              : 'El dibujo cabe en un cuadrado dentro de la celda.'}
          </p>
        </div>

        <div className="field">
          <div className={'ctl-h' + (g.depth === 0 ? ' is-quiet' : '')}>
            <span className="lbl">Probabilidad</span>
            <span className="num">{Math.round(g.splitProb * 100)}%</span>
          </div>
          <input
            className="rg"
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={g.splitProb}
            disabled={g.depth === 0}
            onChange={(e) => updateGrid({ splitProb: +e.target.value })}
            aria-label="Probabilidad de partir celdas"
          />
          {g.depth === 0 && <p className="help">Con profundidad 0 no se parten celdas.</p>}
        </div>

        <div className="field">
          <div className="ctl-h">
            <span className="lbl">Margen interno</span>
            <span className="num">{Math.round(g.cellPadding * 100)}%</span>
          </div>
          <input
            className="rg"
            type="range"
            min={0}
            max={0.35}
            step={0.01}
            value={g.cellPadding}
            onChange={(e) => updateGrid({ cellPadding: +e.target.value })}
            aria-label="Margen interno de celda"
          />
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
        {art && (
          <p className={'help' + (tooSmall ? ' is-low' : '')} role="status">
            {tooSmall
              ? `Celda más chica ${minMM.toFixed(1)} mm, bajo el umbral de ${g.threshold.toFixed(1)} mm.`
              : `Celda más chica ${minMM.toFixed(1)} mm, en ${art.stats.cellCount} celdas.`}
          </p>
        )}
      </div>
    </>
  )
}
