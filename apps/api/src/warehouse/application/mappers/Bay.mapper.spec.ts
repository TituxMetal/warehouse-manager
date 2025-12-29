import { describe, expect, it } from 'bun:test'

import { BayEntity } from '~/warehouse/domain/entities'

import { BayResponseDto } from '../dtos'

import { BayMapper } from './Bay.mapper'

describe('BayMapper', () => {
  describe('toResponseDto', () => {
    it('should map BayEntity to BayResponseDto with all fields', () => {
      const bayEntity = new BayEntity(
        15,
        3,
        120,
        7,
        new Date('2025-10-15T08:00:00Z'),
        new Date('2025-10-16T08:00:00Z')
      )

      const bayDto = BayMapper.toResponseDto(bayEntity)

      expect(bayDto).toBeInstanceOf(BayResponseDto)
      expect(bayDto.id).toBe(15)
      expect(bayDto.number).toBe(3)
      expect(bayDto.width).toBe(120)
      expect(bayDto.aisleId).toBe(7)
      expect(bayDto.createdAt.toISOString()).toBe('2025-10-15T08:00:00.000Z')
      expect(bayDto.updatedAt.toISOString()).toBe('2025-10-16T08:00:00.000Z')
    })
  })
})
