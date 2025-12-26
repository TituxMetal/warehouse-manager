import { describe, expect, it } from 'bun:test'

import { AisleValueObject } from './Aisle.vo'

describe('AisleValueObject', () => {
  describe('constructor', () => {
    it('should create valid aisle', () => {
      const minAisle = new AisleValueObject(1)
      const interAisle = new AisleValueObject(50)
      const maxAisle = new AisleValueObject(999)

      expect(minAisle.value).toBe(1)
      expect(interAisle.value).toBe(50)
      expect(maxAisle.value).toBe(999)
    })

    it('should throw error for out of range aisles', () => {
      expect(() => new AisleValueObject(-10)).toThrow(
        `Invalid aisle: -10. Aisle must be at least 1 and at most 3 digits`
      )
      expect(() => new AisleValueObject(0)).toThrow(
        `Invalid aisle: 0. Aisle must be at least 1 and at most 3 digits`
      )
      expect(() => new AisleValueObject(1000)).toThrow(
        `Invalid aisle: 1000. Aisle must be at least 1 and at most 3 digits`
      )
    })

    it('should throw error for NaN aisle', () => {
      expect(() => new AisleValueObject(undefined as unknown as number)).toThrow(
        'Aisle must be a number'
      )
      expect(() => new AisleValueObject(null as unknown as number)).toThrow(
        'Aisle must be a number'
      )
      expect(() => new AisleValueObject('20' as unknown as number)).toThrow(
        'Aisle must be a number'
      )
    })
  })

  describe('equals', () => {
    it('should return true for identical aisles', () => {
      const aisle1 = new AisleValueObject(13)
      const aisle2 = new AisleValueObject(13)

      expect(aisle1.equals(aisle2)).toBe(true)
    })

    it('should return false for different aisles', () => {
      const aisle1 = new AisleValueObject(16)
      const aisle2 = new AisleValueObject(20)

      expect(aisle1.equals(aisle2)).toBe(false)
    })
  })

  describe('toString', () => {
    it('should return the string padded aisle', () => {
      const aisle1 = new AisleValueObject(1)
      const aisle2 = new AisleValueObject(25)
      const aisle3 = new AisleValueObject(125)

      expect(aisle1.toString()).toBe('001')
      expect(aisle2.toString()).toBe('025')
      expect(aisle3.toString()).toBe('125')
    })
  })
})
