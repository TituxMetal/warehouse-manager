import type { Mock } from 'bun:test'
import { beforeEach, describe, expect, it, mock } from 'bun:test'

import { LocationMapper } from '~/warehouse/application/mappers'
import { LocationEntity } from '~/warehouse/domain/entities'
import { LocationNotFoundException } from '~/warehouse/domain/exceptions'
import type { ILocationRepository } from '~/warehouse/domain/repositories'
import { LevelValueObject, PositionValueObject } from '~/warehouse/domain/value-objects'

import { GetLocationByIdUseCase } from './GetLocationById.uc'

const createTestLocationEntity = (overrides?: {
  id?: number
  position?: number
  level?: number
  status?: 'available' | 'occupied' | 'blocked'
  aisleId?: number
  bayId?: number
  blockReasonId?: number | null
}) =>
  new LocationEntity(
    overrides?.id ?? 1,
    new PositionValueObject(overrides?.position ?? 1),
    new LevelValueObject(overrides?.level ?? 0),
    overrides?.status ?? 'available',
    overrides?.aisleId ?? 1,
    overrides?.bayId ?? 1,
    overrides?.blockReasonId ?? null,
    new Date('2025-01-01'),
    new Date('2025-01-02')
  )

describe('GetLocationByIdUseCase', () => {
  let useCase: GetLocationByIdUseCase
  let mockLocationRepository: {
    findById: Mock<ILocationRepository['findById']>
    findByBayId: Mock<ILocationRepository['findByBayId']>
    findByAisleId: Mock<ILocationRepository['findByAisleId']>
    findPickingLocations: Mock<ILocationRepository['findPickingLocations']>
    findAvailableLocations: Mock<ILocationRepository['findAvailableLocations']>
    findBlockedLocations: Mock<ILocationRepository['findBlockedLocations']>
    create: Mock<ILocationRepository['create']>
    createMany: Mock<ILocationRepository['createMany']>
    update: Mock<ILocationRepository['update']>
    delete: Mock<ILocationRepository['delete']>
  }

  beforeEach(() => {
    mockLocationRepository = {
      findById: mock(() => {}) as unknown as Mock<ILocationRepository['findById']>,
      findByBayId: mock(() => {}) as unknown as Mock<ILocationRepository['findByBayId']>,
      findByAisleId: mock(() => {}) as unknown as Mock<ILocationRepository['findByAisleId']>,
      findPickingLocations: mock(() => {}) as unknown as Mock<
        ILocationRepository['findPickingLocations']
      >,
      findAvailableLocations: mock(() => {}) as unknown as Mock<
        ILocationRepository['findAvailableLocations']
      >,
      findBlockedLocations: mock(() => {}) as unknown as Mock<
        ILocationRepository['findBlockedLocations']
      >,
      create: mock(() => {}) as unknown as Mock<ILocationRepository['create']>,
      createMany: mock(() => {}) as unknown as Mock<ILocationRepository['createMany']>,
      update: mock(() => {}) as unknown as Mock<ILocationRepository['update']>,
      delete: mock(() => {}) as unknown as Mock<ILocationRepository['delete']>
    }
    useCase = new GetLocationByIdUseCase(mockLocationRepository as unknown as ILocationRepository)
  })

  describe('execute', () => {
    it('should return location when found', async () => {
      const location = createTestLocationEntity({ id: 42 })
      mockLocationRepository.findById.mockResolvedValueOnce(location)

      const result = await useCase.execute(42)

      expect(mockLocationRepository.findById).toHaveBeenCalledWith(42)
      expect(result).toEqual(LocationMapper.toResponseDto(location))
    })

    it('should throw LocationNotFoundException when not found', async () => {
      mockLocationRepository.findById.mockResolvedValueOnce(null)

      await expect(useCase.execute(999)).rejects.toThrow(LocationNotFoundException)
    })

    it('should handle repository errors', async () => {
      const error = new Error('Database error')
      mockLocationRepository.findById.mockRejectedValueOnce(error)

      await expect(useCase.execute(1)).rejects.toThrow(error)
    })
  })
})
