import { Dices } from 'lucide-react'
import { useDocumentStore } from '../store/document'
import { gameResult } from '../lib/tictactoe'
import { getTicTacToeConfig } from '../lib/module-layers'
import { Icon } from './Icon'

const RESULT_LABELS: Record<string, string> = {
  X: 'Gana X',
  O: 'Gana O',
  draw: 'Empate',
  'in-progress': 'En curso',
}

export function TicTacToePanel() {
  const document = useDocumentStore((s) => s.document)
  const regenerateTicTacToe = useDocumentStore((s) => s.regenerateTicTacToe)

  if (!document || document.moduleId !== 'tictactoe') return null

  const boardLayer = document.layers.find((l) => l.layerRole === 'board')
  const config = boardLayer ? getTicTacToeConfig(boardLayer) : null
  if (!config) return null

  const result = gameResult(config.board)
  const resultKey = result.replace('-', '')

  return (
    <div className="sec">
      <div className="sec__h">
        <span className="sec__t">tictactoe</span>
      </div>

      <div className="ctl-h">
        <span className="lbl">Resultado</span>
        <span
          className="num"
          style={{
            color:
              resultKey === 'X' ? '#2563eb' : resultKey === 'O' ? '#ea580c' : 'var(--ink)',
          }}
        >
          {RESULT_LABELS[result]}
        </span>
      </div>

      <div className="ttt-board" aria-label="Vista previa del tablero">
        {config.board.map((cell, i) => (
          <div key={i} className="ttt-cell" aria-label={`Celda ${i + 1}: ${cell ?? 'vacía'}`}>
            {cell}
          </div>
        ))}
      </div>

      <button
        type="button"
        className="btn btn--primary"
        style={{ alignSelf: 'flex-start' }}
        onClick={() => boardLayer && regenerateTicTacToe(boardLayer.id)}
      >
        <Icon icon={Dices} size={14} strokeWidth={1.75} />
        Regenerar
      </button>
    </div>
  )
}
