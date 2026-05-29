export type ModuleId = 'grid' | 'tictactoe' | 'test-sheet'

interface ModuleDef {
  id: ModuleId | string
  name: string
  icon: string
  soon?: boolean
}

const MODULES: ModuleDef[] = [
  { id: 'grid', name: 'grid', icon: '⊞' },
  { id: 'tictactoe', name: 'tictactoe', icon: '✕○' },
  { id: 'test-sheet', name: 'test-sheet', icon: '⊕' },
  { id: 'p5', name: 'p5', icon: '∿', soon: true },
  { id: 'd3', name: 'd3', icon: '⎇', soon: true },
  { id: 'threejs', name: 'three.js', icon: '◻', soon: true },
]

interface ModulePanelProps {
  activeModule: ModuleId
  onModule: (id: ModuleId) => void
}

export function ModulePanel({ activeModule, onModule }: ModulePanelProps) {
  return (
    <div className="sec">
      <div className="sec__h">
        <span className="sec__t">Módulo</span>
      </div>
      <div className="mods">
        {MODULES.map((m) => (
          <button
            key={m.id}
            type="button"
            className={
              'mod' +
              (activeModule === m.id ? ' is-on' : '') +
              (m.soon ? ' is-soon' : '')
            }
            onClick={() => !m.soon && onModule(m.id as ModuleId)}
            disabled={m.soon}
          >
            <span className="mod-icon" aria-hidden>
              {m.icon}
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{m.name}</span>
            {m.soon && <span className="soon">pronto</span>}
          </button>
        ))}
      </div>
    </div>
  )
}
