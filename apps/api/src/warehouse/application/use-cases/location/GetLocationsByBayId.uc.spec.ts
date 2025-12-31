import type { Mock } from 'bun:test'
import { beforeEach, describe, expect, it, mock } from 'bun:test'

import { LocationEntity } from '~/warehouse/domain/entities'
import type { ILocationRepository } from '~/warehouse/domain/repositories'
import { LevelValueObject, PositionValueObject } from '~/warehouse/domain/value-objects'

import { GetLocationsByBayIdUseCase } from './GetLocationsByBayId.uc'

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

describe('GetLocationsByBayIdUseCase', () => {
  let useCase: GetLocationsByBayIdUseCase
  let mockLocationRepository: {
    findById: Mock<ILocationRepository['findById']>
    findByBayId: Mock<ILocationRepository['findByBayId']>
    findByAisleId: Mock<ILocationRepository['findByAisleId']>
    findPickingLocations: Mock<ILocationRepository['findPickingLocations']>
    findAvailableLocations: Mock<ILocationRepository['findAvailableLocations']>
    findBlockedLocations: Mock<ILocationRepository['findBlockedLocations']>
    create: Mock<ILocationRepository['create']>
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
      update: mock(() => {}) as unknown as Mock<ILocationRepository['update']>,
      delete: mock(() => {}) as unknown as Mock<ILocationRepository['delete']>
    }
    useCase = new GetLocationsByBayIdUseCase(
      mockLocationRepository as unknown as ILocationRepository
    )
  })

  describe('execute', () => {
    it('should return locations for a bay', async () => {
      const bayId = 1
      const location1 = createTestLocationEntity({ id: 1, bayId })
      const location2 = createTestLocationEntity({ id: 2, bayId })
      mockLocationRepository.findByBayId.mockResolvedValueOnce([location1, location2])

      const result = await useCase.execute(bayId)

      expect(mockLocationRepository.findByBayId).toHaveBeenCalledWith(bayId)
      expect(result).toHaveLength(2)
    })

    it('should return empty array when no locations exist', async () => {
      mockLocationRepository.findByBayId.mockResolvedValueOnce([])

      const result = await useCase.execute(999)

      expect(result).toEqual([])
    })

    it('should handle repository errors', async () => {
      const error = new Error('Database error')
      mockLocationRepository.findByBayId.mockRejectedValueOnce(error)

      await expect(useCase.execute(1)).rejects.toThrow(error)
    })
  })
})
