import { describe, expect, it } from 'bun:test'

import { CellValueObject } from './Cell.vo'

describe('CellValueObject', () => {
  describe('constructor', () => {
    it('should create valid cell', () => {
      const minCell = new CellValueObject(1)
      const interCell = new CellValueObject(5)
      const maxCell = new CellValueObject(9)

      expect(minCell.value).toBe(1)
      expect(interCell.value).toBe(5)
      expect(maxCell.value).toBe(9)
    })

    it('should throw error for out of range cells', () => {
      expect(() => new CellValueObject(-1)).toThrow(
        `Invalid cell: -1. Cell must be 1 positive digit`
      )
      expect(() => new CellValueObject(0)).toThrow(`Invalid cell: 0. Cell must be 1 positive digit`)
      expect(() => new CellValueObject(10)).toThrow(
        `Invalid cell: 10. Cell must be 1 positive digit`
      )
    })

    it('should throw error for NaN cell', () => {
      expect(() => new CellValueObject(undefined as unknown as number)).toThrow(
        'Cell must be a number'
      )
      expect(() => new CellValueObject(null as unknown as number)).toThrow('Cell must be a number')
      expect(() => new CellValueObject('20' as unknown as number)).toThrow('Cell must be a number')
    })
  })

  describe('equals', () => {
    it('should return true for identical cells', () => {
      const cell1 = new CellValueObject(3)
      const cell2 = new CellValueObject(3)

      expect(cell1.equals(cell2)).toBe(true)
    })

    it('should return false for different cells', () => {
      const cell1 = new CellValueObject(6)
      const cell2 = new CellValueObject(2)

      expect(cell1.equals(cell2)).toBe(false)
    })
  })

  describe('toString', () => {
    it('should return the string cell', () => {
      const cell = new CellValueObject(1)

      expect(cell.toString()).toBe('1')
    })
  })
})
