import { describe, expect, it } from 'bun:test'

import { BayEntity } from './Bay.entity'

const createBay = (
  overrides: {
    number?: number
    width?: number
  } = {}
) => new BayEntity(1, overrides.number ?? 1, overrides.width ?? 4, 1, new Date(), new Date())

describe('BayEntity', () => {
  describe('getPositions', () => {
    describe('for odd aisles', () => {
      it('should return odd positions for bay 1', () => {
        const bay = createBay({ number: 1, width: 4 })

        expect(bay.getPositions(true)).toEqual([1, 3, 5, 7])
      })

      it('should return odd positions for bay 2', () => {
        const bay = createBay({ number: 2, width: 4 })

        expect(bay.getPositions(true)).toEqual([9, 11, 13, 15])
      })

      it('should return odd positions for bay 3', () => {
        const bay = createBay({ number: 3, width: 4 })

        expect(bay.getPositions(true)).toEqual([17, 19, 21, 23])
      })
    })

    describe('for even aisles', () => {
      it('should return even positions for bay 1', () => {
        const bay = createBay({ number: 1, width: 4 })

        expect(bay.getPositions(false)).toEqual([2, 4, 6, 8])
      })

      it('should return even positions for bay 2', () => {
        const bay = createBay({ number: 2, width: 4 })

        expect(bay.getPositions(false)).toEqual([10, 12, 14, 16])
      })

      it('should return even positions for bay 3', () => {
        const bay = createBay({ number: 3, width: 4 })

        expect(bay.getPositions(false)).toEqual([18, 20, 22, 24])
      })
    })

    describe('with different widths', () => {
      it('should handle width of 3', () => {
        const bay = createBay({ number: 1, width: 3 })

        expect(bay.getPositions(true)).toEqual([1, 3, 5])
        expect(bay.getPositions(false)).toEqual([2, 4, 6])
      })

      it('should handle width of 2', () => {
        const bay = createBay({ number: 1, width: 2 })

        expect(bay.getPositions(true)).toEqual([1, 3])
        expect(bay.getPositions(false)).toEqual([2, 4])
      })
    })
  })
})
