import { describe, expect, it } from 'bun:test'

import { AisleEntity } from '~/warehouse/domain/entities'
import { AisleValueObject } from '~/warehouse/domain/value-objects'

import { AisleResponseDto } from '../dtos'

import { AisleMapper } from './Aisle.mapper'

const createTestAisleEntity = (overrides?: {
  id?: number
  number?: number
  isOdd?: boolean
  cellId?: number
  createdAt?: Date
  updatedAt?: Date
}): AisleEntity =>
  new AisleEntity(
    overrides?.id ?? 1,
    new AisleValueObject(overrides?.number ?? 2),
    overrides?.isOdd ?? true,
    overrides?.cellId ?? 3,
    overrides?.createdAt ?? new Date(),
    overrides?.updatedAt ?? new Date()
  )

// TODO(human): Implement tests
//
// Create a factory: createTestAisleEntity()
// Test cases:
// 1. Map AisleEntity to AisleResponseDto with all fields
// 2. Verify label is computed correctly for odd aisle
// 3. (Optional) Verify label for even aisle
describe('AisleMapper', () => {
  describe('toResponseDto', () => {
    it('should map AisleEntity to AisleResponseDto with all fields', () => {
      const AisleEntity = createTestAisleEntity({
        id: 10,
        number: 5,
        isOdd: false,
        cellId: 20,
        createdAt: new Date('2025-11-30T10:00:00Z'),
        updatedAt: new Date('2025-12-01T10:00:00Z')
      })

      const aisleDto = AisleMapper.toResponseDto(AisleEntity)

      expect(aisleDto).toBeInstanceOf(AisleResponseDto)
      expect(aisleDto.id).toBe(10)
      expect(aisleDto.number).toBe(5)
      expect(aisleDto.isOdd).toBe(false)
      expect(aisleDto.cellId).toBe(20)
      expect(aisleDto.label).toBe('Aisle 005 (Even)')
      expect(aisleDto.createdAt.toISOString()).toBe('2025-11-30T10:00:00.000Z')
      expect(aisleDto.updatedAt.toISOString()).toBe('2025-12-01T10:00:00.000Z')
    })

    it('should compute label correctly for odd aisle', () => {
      const aisleEntity = createTestAisleEntity({
        number: 16,
        isOdd: true
      })

      const aisleDto = AisleMapper.toResponseDto(aisleEntity)

      expect(aisleDto.label).toBe('Aisle 016 (Odd)')
      expect(aisleDto.isOdd).toBe(true)
    })

    it('should compute label correctly for even aisle', () => {
      const aisleEntity = createTestAisleEntity({
        number: 3,
        isOdd: false
      })

      const aisleDto = AisleMapper.toResponseDto(aisleEntity)

      expect(aisleDto.label).toBe('Aisle 003 (Even)')
      expect(aisleDto.isOdd).toBe(false)
    })
  })
})
