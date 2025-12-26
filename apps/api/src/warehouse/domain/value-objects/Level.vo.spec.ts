import { describe, expect, it } from 'bun:test'

import { LevelValueObject } from './Level.vo'

describe('LevelValueObject', () => {
  describe('constructor', () => {
    it('should create valid levels', () => {
      const minLevel = new LevelValueObject(0)
      const interLevel = new LevelValueObject(40)
      const maxLevel = new LevelValueObject(90)

      expect(minLevel.value).toBe(0)
      expect(interLevel.value).toBe(40)
      expect(maxLevel.value).toBe(90)
    })

    it('should throw error for out of range levels', () => {
      expect(() => new LevelValueObject(-10)).toThrow(
        `Invalid level: -10. Level must be between 0 and 90 (inclusive) and divisible by 10`
      )
      expect(() => new LevelValueObject(25)).toThrow(
        `Invalid level: 25. Level must be between 0 and 90 (inclusive) and divisible by 10`
      )
      expect(() => new LevelValueObject(100)).toThrow(
        `Invalid level: 100. Level must be between 0 and 90 (inclusive) and divisible by 10`
      )
    })

    it('should throw error for NaN level', () => {
      expect(() => new LevelValueObject(undefined as unknown as number)).toThrow(
        'Level must be a number'
      )
      expect(() => new LevelValueObject(null as unknown as number)).toThrow(
        'Level must be a number'
      )
      expect(() => new LevelValueObject('20' as unknown as number)).toThrow(
        'Level must be a number'
      )
    })
  })

  describe('equals', () => {
    it('should return true for identical levels', () => {
      const level1 = new LevelValueObject(20)
      const level2 = new LevelValueObject(20)

      expect(level1.equals(level2)).toBe(true)
    })

    it('should return false for different levels', () => {
      const level1 = new LevelValueObject(20)
      const level2 = new LevelValueObject(30)

      expect(level1.equals(level2)).toBe(false)
    })
  })

  describe('toString', () => {
    it('should return the string padded level', () => {
      const level = new LevelValueObject(0)

      expect(level.toString()).toBe('00')
    })
  })

  describe('isPicking', () => {
    it('should return true when level is a picking', () => {
      const level = new LevelValueObject(0)

      expect(level.isPicking()).toBe(true)
    })

    it('should return false when level is not a picking', () => {
      const level = new LevelValueObject(10)

      expect(level.isPicking()).toBe(false)
    })
  })

  describe('isReserve', () => {
    it('should return true when level is a reserve', () => {
      const level = new LevelValueObject(20)

      expect(level.isReserve()).toBe(true)
    })

    it('should return false when level is a not reserve', () => {
      const level = new LevelValueObject(0)

      expect(level.isReserve()).toBe(false)
    })
  })
})
