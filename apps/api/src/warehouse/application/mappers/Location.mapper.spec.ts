import { describe, expect, it } from 'bun:test'

import type { LocationStatus } from '~/warehouse/domain/entities'
import { LocationEntity } from '~/warehouse/domain/entities'
import { LevelValueObject, PositionValueObject } from '~/warehouse/domain/value-objects'

import { LocationResponseDto } from '../dtos'

import { LocationMapper } from './Location.mapper'

const createTestLocationEntity = (overrides?: {
  id?: number
  position?: number
  level?: number
  status?: string
  aisleId?: number
  bayId?: number
  blockReasonId?: number
  createdAt?: Date
  updatedAt?: Date
}): LocationEntity =>
  new LocationEntity(
    overrides?.id ?? 42,
    new PositionValueObject(overrides?.position ?? 7),
    new LevelValueObject(overrides?.level ?? 10),
    (overrides?.status as LocationStatus) ?? 'available',
    overrides?.aisleId ?? 5,
    overrides?.bayId ?? 20,
    overrides?.blockReasonId ?? null,
    overrides?.createdAt ?? new Date('2025-12-31T12:00:00Z'),
    overrides?.updatedAt ?? new Date('2026-01-01T12:00:00Z')
  )

describe('LocationMapper', () => {
  describe('toResponseDto', () => {
    it('should map LocationEntity to LocationResponseDto with all fields', () => {
      const locationEntity = createTestLocationEntity()

      const locationDto = LocationMapper.toResponseDto(locationEntity)

      expect(locationDto).toBeInstanceOf(LocationResponseDto)
      expect(locationDto.id).toBe(42)
      expect(locationDto.position).toBe(7)
      expect(locationDto.level).toBe(10)
      expect(locationDto.status).toBe('available')
      expect(locationDto.aisleId).toBe(5)
      expect(locationDto.bayId).toBe(20)
      expect(locationDto.blockReasonId).toBeNull()
      expect(locationDto.isPicking).toBe(false)
      expect(locationDto.isBlocked).toBe(false)
      expect(locationDto.isAvailable).toBe(true)
      expect(locationDto.createdAt.toISOString()).toBe('2025-12-31T12:00:00.000Z')
      expect(locationDto.updatedAt.toISOString()).toBe('2026-01-01T12:00:00.000Z')
    })

    it('should map blocked location with isBlocked to true and isAvailable to false', () => {
      const locationEntity = createTestLocationEntity({
        status: 'blocked',
        blockReasonId: 3
      })

      const locationDto = LocationMapper.toResponseDto(locationEntity)

      expect(locationDto.status).toBe('blocked')
      expect(locationDto.blockReasonId).toBe(3)
      expect(locationDto.isBlocked).toBe(true)
      expect(locationDto.isAvailable).toBe(false)
    })

    it('should map picking location with isPicking to true and level 0', () => {
      const locationEntity = createTestLocationEntity({ level: 0 })

      const locationDto = LocationMapper.toResponseDto(locationEntity)

      expect(locationDto.level).toBe(0)
      expect(locationDto.isPicking).toBe(true)
    })
  })
})
