import { useEffect, useState } from 'react'
import { Link2, Minus, Plus } from 'lucide-react'
import { useDocumentStore } from '../store/document'
import { getChainConfig } from '../lib/module-layers'
import { computeChainLayout } from '../lib/chain-calendar'
import { getPaperDimensions } from '../lib/paper'
import { Icon } from './Icon'

const DAY_PRESETS = [30, 66, 100, 365] as const

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

export function ChainPanel() {
  const document = useDocumentStore((s) => s.document)
  const updateChainConfig = useDocumentStore((s) => s.updateChainConfig)
  const [daysDraft, setDaysDraft] = useState('')

  const refLayer =
    document?.moduleId === 'chain'
      ? document.layers.find((l) => l.module === 'chain' && l.layerRole === 'calendar')
      : undefined
  const config = refLayer ? getChainConfig(refLayer) : null

  useEffect(() => {
    if (config) setDaysDraft(String(config.days))
  }, [config?.days])

  if (!document || document.moduleId !== 'chain' || !config) return null

  const paper = getPaperDimensions(document)
  const layout = computeChainLayout(paper, document.margin, config)

  function commitDays() {
    const parsed = parseInt(daysDraft, 10)
    if (!Number.isNaN(parsed)) updateChainConfig({ days: parsed })
    else setDaysDraft(String(config!.days))
  }

  return (
    <div className="sec">
      <div className="sec__h">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Icon icon={Link2} size={16} strokeWidth={1.75} style={{ color: 'var(--accent)' }} />
          <span className="sec__t">chain</span>
        </div>
      </div>

      <p className="help">
        Calendario de hábitos &quot;Don&apos;t Break the Chain&quot;: marca cada día cumplido para no
        romper la racha.
      </p>

      <div className="field">
        <div className="ctl-h">
          <span className="lbl">Objetivo / hábito</span>
        </div>
        <input
          className="new-input"
          type="text"
          value={config.goalTitle}
          onChange={(e) => updateChainConfig({ goalTitle: e.target.value })}
          aria-label="Título del objetivo"
          style={{ width: '100%', height: 32 }}
        />
      </div>

      <div className="field">
        <div className="ctl-h">
          <span className="lbl">Días del objetivo</span>
        </div>
        <div className="stepper">
          <button
            type="button"
            onClick={() => updateChainConfig({ days: config.days - 1 })}
            aria-label="Menos"
          >
            <Icon icon={Minus} size={13} strokeWidth={1.75} />
          </button>
          <input
            className="v"
            type="number"
            min={7}
            max={365}
            value={daysDraft}
            onChange={(e) => setDaysDraft(e.target.value)}
            onBlur={commitDays}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.currentTarget.blur()
              }
            }}
            aria-label="Cantidad de días"
            style={{
              width: 52,
              textAlign: 'center',
              border: 'none',
              background: 'transparent',
              fontFamily: 'var(--font-mono)',
              fontSize: 13,
              padding: 0,
            }}
          />
          <button
            type="button"
            onClick={() => updateChainConfig({ days: config.days + 1 })}
            aria-label="Más"
          >
            <Icon icon={Plus} size={13} strokeWidth={1.75} />
          </button>
        </div>
        <div className="row2" style={{ marginTop: 8 }}>
          {DAY_PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              className={'btn' + (config.days === preset ? ' btn--primary' : '')}
              style={{ flex: 1, height: 28, fontSize: 11 }}
              onClick={() => updateChainConfig({ days: preset })}
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      <div className="field">
        <div className="ctl-h">
          <span className="lbl">Forma de celda</span>
        </div>
        <div className="row2">
          <button
            type="button"
            className={'btn' + (config.cellShape === 'square' ? ' btn--primary' : '')}
            style={{ flex: 1, height: 30 }}
            onClick={() => updateChainConfig({ cellShape: 'square' })}
          >
            Cuadrados
          </button>
          <button
            type="button"
            className={'btn' + (config.cellShape === 'circle' ? ' btn--primary' : '')}
            style={{ flex: 1, height: 30 }}
            onClick={() => updateChainConfig({ cellShape: 'circle' })}
          >
            Círculos
          </button>
        </div>
      </div>

      <div className="field">
        <div className="ctl-h">
          <span className="lbl">Recorrido</span>
        </div>
        <div className="row2">
          <button
            type="button"
            className={'btn' + (config.pathOrder === 'row' ? ' btn--primary' : '')}
            style={{ flex: 1, height: 30 }}
            onClick={() => updateChainConfig({ pathOrder: 'row' })}
          >
            Filas →
          </button>
          <button
            type="button"
            className={'btn' + (config.pathOrder === 'snake' ? ' btn--primary' : '')}
            style={{ flex: 1, height: 30 }}
            onClick={() => updateChainConfig({ pathOrder: 'snake' })}
          >
            Víborita
          </button>
        </div>
      </div>

      <div className="ctl-h">
        <span className="lbl">Numerar celdas</span>
        <SwitchT
          on={config.showDayNumbers}
          onChange={(showDayNumbers) => updateChainConfig({ showDayNumbers })}
        />
      </div>

      <div className="sec" style={{ marginTop: 4 }}>
        <div className="sec__h">
          <span className="sec__t">Layout</span>
        </div>
        <div className="kv">
          <span className="k">grilla</span>
          <span className="v">
            {layout.cols} × {layout.rows}
          </span>
        </div>
        <div className="kv">
          <span className="k">celda</span>
          <span className="v">{layout.cellSize.toFixed(1)} mm</span>
        </div>
        <div className="kv">
          <span className="k">subtítulo</span>
          <span className="v">{layout.subtitle}</span>
        </div>
      </div>
    </div>
  )
}
