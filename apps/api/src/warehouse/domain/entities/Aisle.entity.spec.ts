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
    it('should return correct range for odd aisle with 10 locations', () => {
      const aisle = createAisle({ isOdd: true })

      expect(aisle.getPositionRange(10)).toEqual({
        start: 1,
        end: 9,
        count: 5
      })
    })

    it('should return correct range for even aisle with 10 locations', () => {
      const aisle = createAisle({ isOdd: false })

      expect(aisle.getPositionRange(10)).toEqual({
        start: 2,
        end: 10,
        count: 5
      })
    })

    it('should handle odd locationsPerAisle correctly', () => {
      const oddAisle = createAisle({ isOdd: true })
      const evenAisle = createAisle({ isOdd: false })

      expect(oddAisle.getPositionRange(9).count).toBe(5)
      expect(evenAisle.getPositionRange(9).count).toBe(4)
    })
  })
})
