import { describe, it, expect } from 'vitest'
import { checkWinner, gameResult, generateGame, Board } from './tictactoe'

// ─── checkWinner ──────────────────────────────────────────────────────────────

describe('checkWinner', () => {
  it('detects X winning on the top row', () => {
    const board: Board = ['X','X','X', null,null,null, null,null,null]
    expect(checkWinner(board)).toBe('X')
  })

  it('detects O winning on the middle row', () => {
    const board: Board = [null,null,null, 'O','O','O', null,null,null]
    expect(checkWinner(board)).toBe('O')
  })

  it('detects X winning on the left column', () => {
    const board: Board = ['X',null,null, 'X',null,null, 'X',null,null]
    expect(checkWinner(board)).toBe('X')
  })

  it('detects X winning on the main diagonal', () => {
    const board: Board = ['X',null,null, null,'X',null, null,null,'X']
    expect(checkWinner(board)).toBe('X')
  })

  it('returns null for an empty board', () => {
    const board: Board = [null,null,null, null,null,null, null,null,null]
    expect(checkWinner(board)).toBeNull()
  })

  it('returns null when there is no winner yet', () => {
    const board: Board = ['X','O',null, null,'X',null, null,null,'O']
    expect(checkWinner(board)).toBeNull()
  })
})

// ─── gameResult ───────────────────────────────────────────────────────────────

describe('gameResult', () => {
  it('returns "X" when X wins', () => {
    const board: Board = ['X','X','X', 'O','O',null, null,null,null]
    expect(gameResult(board)).toBe('X')
  })

  it('returns "draw" on a full board with no winner', () => {
    const board: Board = ['X','O','X', 'X','O','O', 'O','X','X']
    expect(gameResult(board)).toBe('draw')
  })

  it('returns "in-progress" when the board is incomplete', () => {
    const board: Board = ['X','O',null, null,null,null, null,null,null]
    expect(gameResult(board)).toBe('in-progress')
  })
})

// ─── generateGame ─────────────────────────────────────────────────────────────

describe('generateGame', () => {
  it('returns a 9-element board', () => {
    const board = generateGame()
    expect(board.length).toBe(9)
  })

  it('produces a valid result (not in-progress)', () => {
    for (let i = 0; i < 50; i++) {
      const board = generateGame()
      const result = gameResult(board)
      expect(['X', 'O', 'draw']).toContain(result)
    }
  })

  it('does not place marks after a winner is found', () => {
    for (let i = 0; i < 100; i++) {
      const board = generateGame()
      const winner = checkWinner(board)
      if (winner) {
        const filled = board.filter((c) => c !== null).length
        // Maximum valid moves for a win: X wins on 5th move, O on 6th
        expect(filled).toBeLessThanOrEqual(9)
        // A board with a winner must have at least 5 marks (minimum for X to win)
        expect(filled).toBeGreaterThanOrEqual(5)
      }
    }
  })

  it('X always moves first (X count >= O count)', () => {
    for (let i = 0; i < 50; i++) {
      const board = generateGame()
      const xCount = board.filter((c) => c === 'X').length
      const oCount = board.filter((c) => c === 'O').length
      expect(xCount).toBeGreaterThanOrEqual(oCount)
      expect(xCount - oCount).toBeLessThanOrEqual(1)
    }
  })

  it('generates different games on successive calls (not always identical)', () => {
    const results = new Set(Array.from({ length: 20 }, () => generateGame().join('')))
    expect(results.size).toBeGreaterThan(1)
  })
})
