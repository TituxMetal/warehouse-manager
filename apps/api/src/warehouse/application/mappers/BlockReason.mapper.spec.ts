import { describe, expect, it } from 'bun:test'

import { BlockReasonEntity } from '~/warehouse/domain/entities'

import { BlockReasonResponseDto } from '../dtos'

import { BlockReasonMapper } from './BlockReason.mapper'

// TODO(human): Implement tests
//
// BlockReasonEntity constructor: (id, code, name, description, permanent, createdAt, updatedAt)
// Test cases:
// 1. Map permanent block reason — displayName should end with "(Permanent)"
// 2. Map temporary block reason — displayName should end with "(Temporary)"
const createTestBlockReasonEntity = (overrides?: {
  id?: number
  code?: string
  name?: string
  description?: string
  permanent?: boolean
  createdAt?: Date
  updatedAt?: Date
}) =>
  new BlockReasonEntity(
    overrides?.id ?? 1,
    overrides?.code ?? 'BR001',
    overrides?.name ?? 'Test Block Reason',
    overrides?.description ?? 'This is a test block reason.',
    overrides?.permanent ?? false,
    overrides?.createdAt ?? new Date('2025-12-31T12:00:00Z'),
    overrides?.updatedAt ?? new Date('2026-01-01T12:00:00Z')
  )

describe('BlockReasonMapper', () => {
  describe('toResponseDto', () => {
    it('should map BlockReasonEntity to BlockReasonResponseDto with all fields', () => {
      const blockReasonEntity = createTestBlockReasonEntity()

      const blockReasonDto = BlockReasonMapper.toResponseDto(blockReasonEntity)

      expect(blockReasonDto).toBeInstanceOf(BlockReasonResponseDto)
      expect(blockReasonDto.id).toBe(1)
      expect(blockReasonDto.code).toBe('BR001')
      expect(blockReasonDto.name).toBe('Test Block Reason')
      expect(blockReasonDto.description).toBe('This is a test block reason.')
      expect(blockReasonDto.permanent).toBe(false)
      expect(blockReasonDto.displayName).toBe('Test Block Reason (Temporary)')
      expect(blockReasonDto.createdAt.toISOString()).toBe('2025-12-31T12:00:00.000Z')
      expect(blockReasonDto.updatedAt.toISOString()).toBe('2026-01-01T12:00:00.000Z')
    })

    it('should map permanent block reason with correct displayName', () => {
      const blockReasonEntity = createTestBlockReasonEntity({
        permanent: true,
        code: 'BR001',
        name: 'Fire hose',
        description: 'Fire hose.'
      })

      const blockReasonDto = BlockReasonMapper.toResponseDto(blockReasonEntity)

      expect(blockReasonDto).toBeInstanceOf(BlockReasonResponseDto)
      expect(blockReasonDto.code).toBe('BR001')
      expect(blockReasonDto.name).toBe('Fire hose')
      expect(blockReasonDto.description).toBe('Fire hose.')
      expect(blockReasonDto.permanent).toBe(true)
      expect(blockReasonDto.displayName).toBe('Fire hose (Permanent)')
    })

    it('should map temporary block reason with correct displayName', () => {
      const blockReasonEntity = createTestBlockReasonEntity({
        permanent: false,
        code: 'BR002',
        name: 'Damaged Beam',
        description: 'Beam is damaged and will be replaced soon.'
      })

      const blockReasonDto = BlockReasonMapper.toResponseDto(blockReasonEntity)

      expect(blockReasonDto).toBeInstanceOf(BlockReasonResponseDto)
      expect(blockReasonDto.code).toBe('BR002')
      expect(blockReasonDto.name).toBe('Damaged Beam')
      expect(blockReasonDto.description).toBe('Beam is damaged and will be replaced soon.')
      expect(blockReasonDto.permanent).toBe(false)
      expect(blockReasonDto.displayName).toBe('Damaged Beam (Temporary)')
    })
  })
})
