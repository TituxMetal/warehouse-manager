import { describe, expect, it } from 'bun:test'

import {
  AisleValueObject,
  CellValueObject,
  LevelValueObject,
  PositionValueObject
} from '../value-objects'

import { LocationAddressParser } from './LocationAddressParser.service'

describe('LocationAddressParser', () => {
  describe('parse', () => {
    it('should parse a valid address into value objects', () => {
      const parser = new LocationAddressParser()

      const result = parser.parse('4-016-0026-30')

      expect(result).toEqual({
        cell: new CellValueObject(4),
        aisle: new AisleValueObject(16),
        position: new PositionValueObject(26),
        level: new LevelValueObject(30)
      })
    })

    it('should throw on invalid format (missing parts)', () => {
      const parser = new LocationAddressParser()

      const result = () => parser.parse('4-016-0026')

      expect(result).toThrow('Invalid location address format: 4-016-0026')
    })

    it('should throw on invalid format (wrong digit count)', () => {
      const parser = new LocationAddressParser()

      const result = () => parser.parse('4-16-0026-30')

      expect(result).toThrow('Invalid location address format: 4-16-0026-30')
    })

    it('should throw when cell value is out of range', () => {
      const parser = new LocationAddressParser()

      const result = () => parser.parse('0-016-0026-30')

      expect(result).toThrow('Invalid cell: 0. Cell must be 1 positive digit')
    })

    it('should throw when level value is out of range', () => {
      const parser = new LocationAddressParser()

      const result = () => parser.parse('4-016-0026-99')

      const message =
        'Invalid level: 99. Level must be between 0 and 90 (inclusive) and divisible by 10'
      expect(result).toThrow(message)
    })
  })

  describe('format', () => {
    it('should format value objects into address string', () => {
      const parser = new LocationAddressParser()
      const cell = new CellValueObject(4)
      const aisle = new AisleValueObject(16)
      const position = new PositionValueObject(26)
      const level = new LevelValueObject(30)

      const result = parser.format(cell, aisle, position, level)

      expect(result).toBe('4-016-0026-30')
    })

    it('should pad single-digit values correctly', () => {
      const parser = new LocationAddressParser()
      const cell = new CellValueObject(1)
      const aisle = new AisleValueObject(1)
      const position = new PositionValueObject(1)
      const level = new LevelValueObject(0)

      const result = parser.format(cell, aisle, position, level)

      expect(result).toBe('1-001-0001-00')
    })
  })

  describe('isValid', () => {
    it('should return true for valid address', () => {
      const parser = new LocationAddressParser()

      const result = parser.isValid('4-016-0026-30')

      expect(result).toBe(true)
    })

    it('should return false for invalid format', () => {
      const parser = new LocationAddressParser()

      const result = parser.isValid('invalid')

      expect(result).toBe(false)
    })

    it('should return false for out-of-range values', () => {
      const parser = new LocationAddressParser()

      const result = parser.isValid('4-016-0026-99')

      expect(result).toBe(false)
    })
  })
})
