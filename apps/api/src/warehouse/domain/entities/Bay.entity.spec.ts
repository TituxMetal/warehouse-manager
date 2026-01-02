import { describe, expect, it } from 'bun:test'

import { BayEntity } from './Bay.entity'

const createBay = (
  overrides: {
    number?: number
    width?: number
    startPosition?: number
  } = {}
) =>
  new BayEntity(
    1, // id
    overrides.number ?? 1,
    overrides.width ?? 4,
    overrides.startPosition ?? 0,
    1, // aisleId
    new Date(),
    new Date()
  )

describe('BayEntity', () => {
  describe('getPositions', () => {
    describe('for odd aisles (isOdd=true)', () => {
      it('should return [1, 3, 5, 7] for startPosition=0, width=4', () => {
        const bay = createBay({ startPosition: 0, width: 4 })

        expect(bay.getPositions(true)).toEqual([1, 3, 5, 7])
      })

      it('should return [9, 11, 13, 15] for startPosition=4, width=4', () => {
        const bay = createBay({ startPosition: 4, width: 4 })

        expect(bay.getPositions(true)).toEqual([9, 11, 13, 15])
      })

      it('should return [9, 11, 13] for startPosition=4, width=3', () => {
        const bay = createBay({ startPosition: 4, width: 3 })

        expect(bay.getPositions(true)).toEqual([9, 11, 13])
      })

      it('should return [15, 17, 19, 21] for startPosition=7, width=4', () => {
        const bay = createBay({ startPosition: 7, width: 4 })

        expect(bay.getPositions(true)).toEqual([15, 17, 19, 21])
      })
    })

    describe('for even aisles (isOdd=false)', () => {
      it('should return [2, 4, 6, 8] for startPosition=0, width=4', () => {
        const bay = createBay({ startPosition: 0, width: 4 })

        expect(bay.getPositions(false)).toEqual([2, 4, 6, 8])
      })

      it('should return [10, 12, 14, 16] for startPosition=4, width=4', () => {
        const bay = createBay({ startPosition: 4, width: 4 })

        expect(bay.getPositions(false)).toEqual([10, 12, 14, 16])
      })

      it('should return [10, 12, 14] for startPosition=4, width=3', () => {
        const bay = createBay({ startPosition: 4, width: 3 })

        expect(bay.getPositions(false)).toEqual([10, 12, 14])
      })

      it('should return [16, 18, 20, 22] for startPosition=7, width=4', () => {
        const bay = createBay({ startPosition: 7, width: 4 })

        expect(bay.getPositions(false)).toEqual([16, 18, 20, 22])
      })
    })

    describe('realistic aisle scenario', () => {
      it('should handle consecutive bays with different widths', () => {
        // Bay 1: positions 1,3,5,7 (width=4, startPosition=0)
        const bay1 = createBay({ number: 1, startPosition: 0, width: 4 })
        // Bay 2: positions 9,11,13 (width=3, startPosition=4)
        const bay2 = createBay({ number: 2, startPosition: 4, width: 3 })
        // Bay 3: positions 15,17,19,21 (width=4, startPosition=7)
        const bay3 = createBay({ number: 3, startPosition: 7, width: 4 })

        expect(bay1.getPositions(true)).toEqual([1, 3, 5, 7])
        expect(bay2.getPositions(true)).toEqual([9, 11, 13])
        expect(bay3.getPositions(true)).toEqual([15, 17, 19, 21])
      })
    })
  })
})
