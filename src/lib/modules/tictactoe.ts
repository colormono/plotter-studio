import { PlotterDocument, Layer } from '../../types'
import { getPaperDimensions } from '../paper'
import { Board } from '../tictactoe'
import { svgEl } from '../svg'
import { Module } from '../../types'
import { renderRegistrationMarks } from '../registration-marks'
import { getTicTacToeConfig } from '../module-layers'

export interface TicTacToeConfig {
  board: Board
  groupId: string
}

const SW = '0.5'

function boardLayout(doc: PlotterDocument) {
  const { width, height } = getPaperDimensions(doc)
  const size = Math.min(width, height) * 0.65
  const x = (width - size) / 2
  const y = (height - size) / 2
  const cell = size / 3
  return { x, y, size, cell }
}

function renderBoard(doc: PlotterDocument): SVGElement[] {
  const { x, y, size, cell } = boardLayout(doc)
  return [
    svgEl('line', { x1: x + cell, y1: y, x2: x + cell, y2: y + size, 'stroke-width': SW }),
    svgEl('line', { x1: x + cell * 2, y1: y, x2: x + cell * 2, y2: y + size, 'stroke-width': SW }),
    svgEl('line', { x1: x, y1: y + cell, x2: x + size, y2: y + cell, 'stroke-width': SW }),
    svgEl('line', { x1: x, y1: y + cell * 2, x2: x + size, y2: y + cell * 2, 'stroke-width': SW }),
  ]
}

function renderMarks(doc: PlotterDocument, board: Board, mark: 'X' | 'O'): SVGElement[] {
  const { x, y, cell } = boardLayout(doc)
  const padding = cell * 0.18
  const r = cell / 2 - padding
  const elements: SVGElement[] = []

  for (let i = 0; i < 9; i++) {
    const cellMark = board[i]
    if (cellMark !== mark) continue

    const col = i % 3
    const row = Math.floor(i / 3)
    const cx = x + col * cell + cell / 2
    const cy = y + row * cell + cell / 2

    if (mark === 'O') {
      elements.push(svgEl('circle', { cx, cy, r, 'stroke-width': SW }))
    } else {
      elements.push(
        svgEl('line', { x1: cx - r, y1: cy - r, x2: cx + r, y2: cy + r, 'stroke-width': SW }),
        svgEl('line', { x1: cx + r, y1: cy - r, x2: cx - r, y2: cy + r, 'stroke-width': SW }),
      )
    }
  }

  return elements
}

export const ticTacToeModule: Module = {
  id: 'tictactoe',

  render(doc: PlotterDocument, layer: Layer): SVGElement[] {
    if (layer.layerRole === 'registration') {
      return renderRegistrationMarks(doc)
    }

    const config = getTicTacToeConfig(layer)
    if (!config) return []

    if (layer.layerRole === 'board') return renderBoard(doc)
    if (layer.layerRole === 'player-x') return renderMarks(doc, config.board, 'X')
    if (layer.layerRole === 'player-o') return renderMarks(doc, config.board, 'O')
    return []
  },
}
