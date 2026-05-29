import { describe, it, expect } from 'vitest'
import { PAPER_DIMENSIONS } from './types'

describe('PAPER_DIMENSIONS', () => {
  it('A4 has correct dimensions in mm', () => {
    expect(PAPER_DIMENSIONS.A4).toEqual({ width: 210, height: 297 })
  })

  it('A3 has correct dimensions in mm', () => {
    expect(PAPER_DIMENSIONS.A3).toEqual({ width: 297, height: 420 })
  })

  it('Letter has correct dimensions in mm', () => {
    expect(PAPER_DIMENSIONS.Letter).toEqual({ width: 216, height: 279 })
  })

  it('Legal has correct dimensions in mm', () => {
    expect(PAPER_DIMENSIONS.Legal).toEqual({ width: 216, height: 356 })
  })
})
