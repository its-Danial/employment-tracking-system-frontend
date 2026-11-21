import { describe, expect, it } from 'vitest'
import { parsePickedDate, toApiDate } from '@/lib/utils'

describe('picked dates', () => {
  it('reads a typed dd/mm/yyyy date and a picked Date the same way', () => {
    expect(toApiDate(parsePickedDate('12/04/1995')!)).toBe('1995-04-12')
    expect(toApiDate(parsePickedDate(new Date(1995, 3, 12))!)).toBe('1995-04-12')
  })

  it('refuses text that is not a real day', () => {
    expect(parsePickedDate('31/02/2020')).toBeNull()
    expect(parsePickedDate('12/04')).toBeNull()
    expect(parsePickedDate('')).toBeNull()
    expect(parsePickedDate(null)).toBeNull()
  })
})
