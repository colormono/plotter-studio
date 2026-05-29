export type Cell = 'X' | 'O' | null
export type Board = [Cell, Cell, Cell, Cell, Cell, Cell, Cell, Cell, Cell]
export type GameResult = 'X' | 'O' | 'draw' | 'in-progress'

const WIN_LINES: [number, number, number][] = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
]

export function checkWinner(board: Board): 'X' | 'O' | null {
  for (const [a, b, c] of WIN_LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a]!
    }
  }
  return null
}

export function gameResult(board: Board): GameResult {
  const winner = checkWinner(board)
  if (winner) return winner
  if (board.every((c) => c !== null)) return 'draw'
  return 'in-progress'
}

/**
 * Generates a random valid tic-tac-toe game.
 * X moves first. The game stops as soon as a winner is found or all 9 cells are filled.
 * Returns a 9-element board — no moves are placed after a win.
 */
export function generateGame(): Board {
  const positions = [0, 1, 2, 3, 4, 5, 6, 7, 8]

  for (let i = positions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[positions[i], positions[j]] = [positions[j]!, positions[i]!]
  }

  const board: Board = [null, null, null, null, null, null, null, null, null]

  for (let move = 0; move < positions.length; move++) {
    board[positions[move]!] = move % 2 === 0 ? 'X' : 'O'
    if (checkWinner(board)) break
  }

  return board
}
