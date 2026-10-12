import { describe, expect, it } from 'bun:test'

import { AisleValueObject } from '../value-objects/Aisle.vo'

import { AisleEntity } from './Aisle.entity'

const createAisle = (overrides: { number?: number; isOdd?: boolean } = {}) => {
  const number = new AisleValueObject(overrides.number ?? 16)

  return new AisleEntity(1, number, overrides.isOdd ?? true, 1, new Date(), new Date())
}

describe('AisleEntity', () => {
  describe('getLabel', () => {
    it('should return label with Odd suffix for odd aisle', () => {
      const aisle = createAisle({ number: 16, isOdd: true })

      expect(aisle.getLabel()).toBe('Aisle 016 (Odd)')
    })

    it('should return label with Even suffix for even aisle', () => {
      const aisle = createAisle({ number: 3, isOdd: false })

      expect(aisle.getLabel()).toBe('Aisle 003 (Even)')
    })
  })

  describe('getPositionRange', () => {
    it('should return correct range for an odd side of 10 positions', () => {
      const aisle = createAisle({ isOdd: true })

      expect(aisle.getPositionRange(10)).toEqual({
        start: 1,
        end: 19,
        count: 10
      })
    })

    it('should return correct range for an even side of 10 positions', () => {
      const aisle = createAisle({ isOdd: false })

      expect(aisle.getPositionRange(10)).toEqual({
        start: 2,
        end: 20,
        count: 10
      })
    })

    it('should treat its argument as one side of length 9 and give both sides 9 positions', () => {
      const oddAisle = createAisle({ isOdd: true })
      const evenAisle = createAisle({ isOdd: false })

      // Decision 005: `getPositionRange` takes the per-side count, the unit stored in
      // `CellEntity.locationsPerAisle`, and does not divide. A side of 9 positions has
      // 9 positions of that side's parity, so both sides report a count of 9.
      expect(oddAisle.getPositionRange(9)).toEqual({ start: 1, end: 17, count: 9 })
      expect(evenAisle.getPositionRange(9)).toEqual({ start: 2, end: 18, count: 9 })
    })
  })
})
