import { describe, expect, it } from 'vitest'
import { formatCOP } from './formatPrices.ts'

describe('formatCOP', () => {
  it('formatea precios en pesos colombianos sin decimales', () => {
    expect(formatCOP(3350000)).toMatch(/3\.350\.000/)
    expect(formatCOP(90000)).toMatch(/90\.000/)
    expect(formatCOP(105000)).toMatch(/105\.000/)
  })

  it('formatea cero y valores bajos', () => {
    expect(formatCOP(0)).toMatch(/0/)
    expect(formatCOP(135000)).toMatch(/135\.000/)
  })
})