import { useDocumentStore } from '../store/document'
import { TicTacToeConfig } from '../lib/modules/tictactoe'
import { gameResult } from '../lib/tictactoe'

const RESULT_LABELS: Record<string, string> = {
  X: 'Gana X',
  O: 'Gana O',
  draw: 'Empate',
  'in-progress': 'En curso',
}

export function TicTacToePanel() {
  const document = useDocumentStore((s) => s.document)
  const activeLayerId = useDocumentStore((s) => s.activeLayerId)
  const regenerateTicTacToe = useDocumentStore((s) => s.regenerateTicTacToe)

  if (!document || !activeLayerId) return null
  const activeLayer = document.layers.find((l) => l.id === activeLayerId)
  if (!activeLayer || activeLayer.module !== 'tictactoe') {
    return (
      <div className="sec">
        <div className="sec__h">
          <span className="sec__t">tictactoe</span>
        </div>
        <p className="help">Selecciona una capa tictactoe o añade el módulo desde el panel de capas.</p>
      </div>
    )
  }

  const config = activeLayer.moduleConfig as unknown as TicTacToeConfig
  const result = gameResult(config.board)
  const resultKey = result.replace('-', '')

  return (
    <div className="sec">
      <div className="sec__h">
        <span className="sec__t">tictactoe</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--mute)' }}>
          {activeLayer.name}
        </span>
      </div>

      <div className="ctl-h">
        <span className="lbl">Resultado</span>
        <span
          className="num"
          style={{
            color:
              resultKey === 'X'
                ? '#2563eb'
                : resultKey === 'O'
                  ? '#ea580c'
                  : 'var(--ink)',
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
        onClick={() => regenerateTicTacToe(activeLayerId)}
      >
        Regenerar
      </button>
    </div>
  )
}
