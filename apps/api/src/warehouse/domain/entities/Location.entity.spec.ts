import { describe, expect, it } from 'bun:test'

import { AisleValueObject } from '../value-objects/Aisle.vo'
import { CellValueObject } from '../value-objects/Cell.vo'
import { LevelValueObject } from '../value-objects/Level.vo'
import { PositionValueObject } from '../value-objects/Position.vo'

import { LocationEntity } from './Location.entity'

const createLocation = (
  overrides: {
    position?: number
    level?: number
    status?: 'available' | 'occupied' | 'blocked'
    blockReasonId?: number | null
  } = {}
) => {
  const level = new LevelValueObject(overrides.level ?? 0)
  const position = new PositionValueObject(overrides.position ?? 1)

  return new LocationEntity(
    1,
    position,
    level,
    overrides.status ?? 'available',
    1,
    1,
    overrides.blockReasonId ?? null,
    new Date(),
    new Date()
  )
}

describe('LocationEntity', () => {
  describe('isPicking', () => {
    it('should return true for level 0', () => {
      const location = createLocation({ level: 0 })

      expect(location.isPicking()).toBe(true)
    })

    it('should return false for reserve levels', () => {
      const location = createLocation({ level: 30 })

      expect(location.isPicking()).toBe(false)
    })
  })

  describe('isBlocked', () => {
    it('should return false when blockReasonId is null', () => {
      const location = createLocation({ blockReasonId: null })

      expect(location.isBlocked()).toBe(false)
    })

    it('should return true when blockReasonId is set', () => {
      const location = createLocation({ blockReasonId: 42 })

      expect(location.isBlocked()).toBe(true)
    })
  })

  describe('isAvailable', () => {
    it('should return true when status is available and not blocked', () => {
      const location = createLocation({ status: 'available', blockReasonId: null })

      expect(location.isAvailable()).toBe(true)
    })

    it('should return false when status is occupied', () => {
      const location = createLocation({ status: 'occupied', blockReasonId: null })

      expect(location.isAvailable()).toBe(false)
    })

    it('should return false when blocked even if status is available', () => {
      const location = createLocation({ status: 'available', blockReasonId: 1 })

      expect(location.isAvailable()).toBe(false)
    })
  })

  describe('block', () => {
    it('should set blockReasonId and change status to blocked', () => {
      const location = createLocation({ blockReasonId: null, status: 'available' })

      location.block(42)

      expect(location.isBlocked()).toBe(true)
      expect(location.status).toBe('blocked')
    })

    it('should throw error if already blocked', () => {
      const blockedLocation = createLocation({ blockReasonId: 42, status: 'blocked' })

      expect(() => blockedLocation.block(42)).toThrow('Location is already blocked')
    })
  })

  describe('unblock', () => {
    it('should clear blockReasonId and change status to available', () => {
      const location = createLocation({ blockReasonId: 42, status: 'blocked' })

      location.unblock()

      expect(location.isBlocked()).toBe(false)
      expect(location.status).toBe('available')
    })

    it('should throw error if not blocked', () => {
      const unblockedLocation = createLocation({ blockReasonId: null, status: 'available' })

      expect(() => unblockedLocation.unblock()).toThrow('Location is not blocked')
    })
  })

  describe('formatFullAddress', () => {
    it('should format address correctly', () => {
      const location = createLocation({ position: 26, level: 30 })
      const cellNumber = new CellValueObject(4)
      const aisleNumber = new AisleValueObject(16)

      expect(location.formatFullAddress(cellNumber, aisleNumber)).toBe('4-016-0026-30')
    })

    it('should pad all parts correctly', () => {
      const location = createLocation({ position: 1, level: 0 })
      const cellNumber = new CellValueObject(1)
      const aisleNumber = new AisleValueObject(1)

      expect(location.formatFullAddress(cellNumber, aisleNumber)).toBe('1-001-0001-00')
    })
  })
})
