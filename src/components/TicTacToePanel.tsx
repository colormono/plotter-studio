import { useDocumentStore } from '../store/document'
import { TicTacToeConfig } from '../lib/modules/tictactoe'
import { gameResult } from '../lib/tictactoe'
import styles from './TicTacToePanel.module.css'

const RESULT_LABELS: Record<string, string> = {
  X: 'X wins',
  O: 'O wins',
  draw: 'Draw',
  'in-progress': 'In progress',
}

export function TicTacToePanel() {
  const document = useDocumentStore((s) => s.document)
  const activeLayerId = useDocumentStore((s) => s.activeLayerId)
  const regenerateTicTacToe = useDocumentStore((s) => s.regenerateTicTacToe)

  if (!document || !activeLayerId) return null
  const activeLayer = document.layers.find((l) => l.id === activeLayerId)
  if (!activeLayer || activeLayer.module !== 'tictactoe') return null

  const config = activeLayer.moduleConfig as unknown as TicTacToeConfig
  const result = gameResult(config.board)

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <span className={styles.label}>Tictactoe</span>
        <span className={styles.layerName}>{activeLayer.name}</span>
      </div>

      <div className={styles.body}>
        <div className={styles.info}>
          <span className={styles.infoLabel}>Result</span>
          <span className={`${styles.result} ${styles[result.replace('-', '')]}`}>
            {RESULT_LABELS[result]}
          </span>
        </div>

        <div className={styles.board} aria-label="Game board preview">
          {config.board.map((cell, i) => (
            <div key={i} className={styles.cell} aria-label={`Cell ${i + 1}: ${cell ?? 'empty'}`}>
              {cell}
            </div>
          ))}
        </div>

        <button
          className={styles.regenBtn}
          onClick={() => regenerateTicTacToe(activeLayerId)}
        >
          Regenerar
        </button>
      </div>
    </div>
  )
}
