import type { LucideIcon } from 'lucide-react'
import { RectangleHorizontal, RectangleVertical } from 'lucide-react'
import { useDocumentStore } from '../store/document'
import { PaperFormat } from '../types'
import { PAPER_FORMAT_OPTIONS, formatPaperLabel, isSquareFormat } from '../lib/paper'
import { Icon } from './Icon'

function Seg<T extends string>({
  value,
  options,
  onChange,
  disabled,
}: {
  value: T
  options: { value: T; label?: string; icon?: LucideIcon }[]
  onChange: (v: T) => void
  disabled?: boolean
}) {
  return (
    <div className="seg" style={disabled ? { opacity: 0.45, pointerEvents: 'none' } : undefined}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          className={value === o.value ? 'is-on' : ''}
          onClick={() => onChange(o.value)}
          disabled={disabled}
          aria-label={o.label ?? o.value}
        >
          {o.icon ? <Icon icon={o.icon} size={12} strokeWidth={1.75} /> : o.label}
        </button>
      ))}
    </div>
  )
}

export function PaperPanel() {
  const document = useDocumentStore((s) => s.document)
  const updatePaperFormat = useDocumentStore((s) => s.updatePaperFormat)
  const updateLandscape = useDocumentStore((s) => s.updateLandscape)
  const updateMargin = useDocumentStore((s) => s.updateMargin)

  if (!document) return null

  const square = isSquareFormat(document.paperFormat)

  return (
    <div className="sec">
      <div className="sec__h">
        <span className="sec__t">Papel</span>
      </div>

      <div className="field">
        <label>Formato</label>
        <Seg
          value={document.paperFormat}
          options={PAPER_FORMAT_OPTIONS}
          onChange={(v) => updatePaperFormat(v as PaperFormat)}
        />
      </div>

      <div className="row2">
        <div className="field">
          <label>Orientación</label>
          <Seg
            value={document.landscape ? 'l' : 'p'}
            options={[
              { value: 'p', icon: RectangleVertical, label: 'Vertical' },
              { value: 'l', icon: RectangleHorizontal, label: 'Apaisado' },
            ]}
            onChange={(v) => updateLandscape(v === 'l')}
            disabled={square}
          />
        </div>
        <div className="field">
          <label>Tamaño</label>
          <span className="num" style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>
            {formatPaperLabel(document).split(' · ').pop()}
          </span>
        </div>
      </div>

      <div className="field">
        <div className="ctl-h">
          <span className="lbl">Margen</span>
          <span className="num">{document.margin} mm</span>
        </div>
        <input
          className="rg"
          type="range"
          min={4}
          max={40}
          step={1}
          value={document.margin}
          onChange={(e) => updateMargin(+e.target.value)}
          aria-label="Margen del papel"
        />
      </div>
    </div>
  )
}
