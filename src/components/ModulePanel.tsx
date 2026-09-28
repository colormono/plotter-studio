import type { LucideIcon } from 'lucide-react'
import {
  Box,
  FileText,
  GitFork,
  Grid3x3,
  Hash,
  Image,
  Link2,
  Spline,
} from 'lucide-react'
import { Icon } from './Icon'

export type ModuleId = 'grid' | 'tictactoe' | 'test-sheet' | 'loaded-svg' | 'chain'

interface ModuleDef {
  id: ModuleId | string
  name: string
  icon: LucideIcon
  soon?: boolean
}

const MODULES: ModuleDef[] = [
  { id: 'grid', name: 'grid', icon: Grid3x3 },
  { id: 'tictactoe', name: 'tictactoe', icon: Hash },
  { id: 'test-sheet', name: 'test-sheet', icon: FileText },
  { id: 'loaded-svg', name: 'loaded-svg', icon: Image },
  { id: 'chain', name: 'chain', icon: Link2 },
  { id: 'p5', name: 'p5', icon: Spline, soon: true },
  { id: 'd3', name: 'd3', icon: GitFork, soon: true },
  { id: 'threejs', name: 'three.js', icon: Box, soon: true },
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
              <Icon icon={m.icon} size={15} strokeWidth={1.75} />
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{m.name}</span>
            {m.soon && <span className="soon">pronto</span>}
          </button>
        ))}
      </div>
    </div>
  )
}
