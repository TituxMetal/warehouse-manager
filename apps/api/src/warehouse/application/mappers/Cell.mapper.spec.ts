import { describe, expect, it } from 'bun:test'

import { CellEntity } from '~/warehouse/domain/entities'
import { CellValueObject } from '~/warehouse/domain/value-objects'

import { CellResponseDto } from '../dtos'

import { CellMapper } from './Cell.mapper'

const createTestCellEntity = (overrides?: {
  id?: number
  number?: number
  aislesCount?: number
  locationsPerAisle?: number
  levelsPerLocation?: number
  createdAt?: Date
  updatedAt?: Date
}): CellEntity =>
  new CellEntity(
    overrides?.id ?? 1,
    new CellValueObject(overrides?.number ?? 4),
    overrides?.aislesCount ?? 10,
    overrides?.locationsPerAisle ?? 100,
    overrides?.levelsPerLocation ?? 6,
    overrides?.createdAt ?? new Date('2026-01-01T00:00:00Z'),
    overrides?.updatedAt ?? new Date('2026-01-02T00:00:00Z')
  )

describe('CellMapper', () => {
  describe('toResponseDto', () => {
    it('should map CellEntity to CellResponseDto with all fields', () => {
      const cellEntity = createTestCellEntity({
        id: 42,
        number: 7,
        aislesCount: 5,
        locationsPerAisle: 50,
        levelsPerLocation: 4,
        createdAt: new Date('2025-12-31T12:00:00Z'),
        updatedAt: new Date('2026-01-01T12:00:00Z')
      })

      const cellDto = CellMapper.toResponseDto(cellEntity)

      expect(cellDto).toBeInstanceOf(CellResponseDto)
      expect(cellDto.id).toBe(42)
      expect(cellDto.number).toBe(7)
      expect(cellDto.aislesCount).toBe(5)
      expect(cellDto.locationsPerAisle).toBe(50)
      expect(cellDto.levelsPerLocation).toBe(4)
      expect(cellDto.createdAt.toISOString()).toBe('2025-12-31T12:00:00.000Z')
      expect(cellDto.updatedAt.toISOString()).toBe('2026-01-01T12:00:00.000Z')
      expect(cellDto.totalLocations).toBe(5 * 50 * 4) // 1000
    })

    it('should compute totalLocations correctly', () => {
      const cellEntity = createTestCellEntity({
        aislesCount: 3,
        locationsPerAisle: 20,
        levelsPerLocation: 2
      })

      const cellDto = CellMapper.toResponseDto(cellEntity)

      expect(cellDto.totalLocations).toBe(3 * 20 * 2) // 120
    })
  })
})
