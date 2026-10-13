import { describe, expect, it } from 'vitest'
import { toIsoDate, firstDayOfMonthIso, lastDayOfMonthIso, formatPercent } from './format'

describe('date helpers', () => {
  it('formats a date to ISO without timezone drift', () => {
    expect(toIsoDate(new Date(2025, 0, 5))).toBe('2025-01-05')
  })

  it('computes the first day of the month', () => {
    expect(firstDayOfMonthIso(new Date(2025, 5, 18))).toBe('2025-06-01')
  })

  it('computes the last day of the month', () => {
    expect(lastDayOfMonthIso(new Date(2025, 1, 3))).toBe('2025-02-28')
  })
})

describe('formatPercent', () => {
  it('returns an em dash for nullish values', () => {
    expect(formatPercent(null)).toBe('—')
  })

  it('formats a number with one decimal', () => {
    expect(formatPercent(65)).toBe('65.0%')
  })
})
