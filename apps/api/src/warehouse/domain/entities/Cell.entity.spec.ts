import { describe, expect, it } from 'bun:test'

import { CellValueObject } from '../value-objects/Cell.vo'

import { CellEntity } from './Cell.entity'

const createCell = (
  overrides: {
    aislesCount?: number
    locationsPerAisle?: number
    levelsPerLocation?: number
  } = {}
) => {
  const number = new CellValueObject(1)

  return new CellEntity(
    1,
    number,
    overrides.aislesCount ?? 10,
    overrides.locationsPerAisle ?? 100,
    overrides.levelsPerLocation ?? 6,
    new Date(),
    new Date()
  )
}

describe('CellEntity', () => {
  describe('getTotalLocations', () => {
    it('should calculate total locations correctly', () => {
      const cell = createCell({
        aislesCount: 10,
        locationsPerAisle: 100,
        levelsPerLocation: 6
      })

      expect(cell.getTotalLocations()).toBe(6000)
    })

    it('should return 0 when any dimension is 0', () => {
      const cell = createCell({ aislesCount: 0 })

      expect(cell.getTotalLocations()).toBe(0)
    })
  })

  describe('getAisleCount', () => {
    it('should return the aisles count', () => {
      const cell = createCell({ aislesCount: 20 })

      expect(cell.getAisleCount()).toBe(20)
    })
  })

  describe('getValidLevels', () => {
    it('should return correct levels for 6 levels', () => {
      const cell = createCell({ levelsPerLocation: 6 })

      expect(cell.getValidLevels()).toEqual([0, 10, 20, 30, 40, 50])
    })

    it('should return correct levels for 4 levels', () => {
      const cell = createCell({ levelsPerLocation: 4 })

      expect(cell.getValidLevels()).toEqual([0, 10, 20, 30])
    })

    it('should return only level 0 for single level', () => {
      const cell = createCell({ levelsPerLocation: 1 })

      expect(cell.getValidLevels()).toEqual([0])
    })
  })
})
