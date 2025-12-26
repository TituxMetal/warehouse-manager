import { describe, expect, it } from 'bun:test'

import { PositionValueObject } from './Position.vo'

describe('PositionValueObject', () => {
  describe('constructor', () => {
    it('should create valid positions', () => {
      const minPosition = new PositionValueObject(1)
      const interPosition = new PositionValueObject(50)
      const maxPosition = new PositionValueObject(9999)

      expect(minPosition.value).toBe(1)
      expect(interPosition.value).toBe(50)
      expect(maxPosition.value).toBe(9999)
    })

    it('should throw error for out of range positions', () => {
      expect(() => new PositionValueObject(-10)).toThrow(
        `Invalid position: -10. Position must be at least 1 and at most 4 digits`
      )
      expect(() => new PositionValueObject(0)).toThrow(
        `Invalid position: 0. Position must be at least 1 and at most 4 digits`
      )
      expect(() => new PositionValueObject(10000)).toThrow(
        `Invalid position: 10000. Position must be at least 1 and at most 4 digits`
      )
    })

    it('should throw error for NaN position', () => {
      expect(() => new PositionValueObject(undefined as unknown as number)).toThrow(
        'Position must be a number'
      )
      expect(() => new PositionValueObject(null as unknown as number)).toThrow(
        'Position must be a number'
      )
      expect(() => new PositionValueObject('20' as unknown as number)).toThrow(
        'Position must be a number'
      )
    })
  })

  describe('equals', () => {
    it('should return true for identical positions', () => {
      const position1 = new PositionValueObject(205)
      const position2 = new PositionValueObject(205)

      expect(position1.equals(position2)).toBe(true)
    })

    it('should return false for different positions', () => {
      const position1 = new PositionValueObject(165)
      const position2 = new PositionValueObject(201)

      expect(position1.equals(position2)).toBe(false)
    })
  })

  describe('toString', () => {
    it('should return the string padded position', () => {
      const position1 = new PositionValueObject(1)
      const position2 = new PositionValueObject(25)
      const position3 = new PositionValueObject(125)

      expect(position1.toString()).toBe('0001')
      expect(position2.toString()).toBe('0025')
      expect(position3.toString()).toBe('0125')
    })
  })
})
