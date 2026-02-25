import type { Mock } from 'bun:test'
import { beforeEach, describe, expect, it, mock } from 'bun:test'

import { LocationEntity } from '~/warehouse/domain/entities'
import type { ILocationRepository } from '~/warehouse/domain/repositories'
import { LevelValueObject, PositionValueObject } from '~/warehouse/domain/value-objects'

import { GetPickingLocationsUseCase } from './GetPickingLocations.uc'

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

describe('GetPickingLocationsUseCase', () => {
  let useCase: GetPickingLocationsUseCase
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
    useCase = new GetPickingLocationsUseCase(
      mockLocationRepository as unknown as ILocationRepository
    )
  })

  describe('execute', () => {
    it('should return picking locations (level 0)', async () => {
      const location1 = createTestLocationEntity({ id: 1, level: 0 })
      const location2 = createTestLocationEntity({ id: 2, level: 0 })
      mockLocationRepository.findPickingLocations.mockResolvedValueOnce([location1, location2])

      const result = await useCase.execute()

      expect(mockLocationRepository.findPickingLocations).toHaveBeenCalled()
      expect(result).toHaveLength(2)
    })

    it('should return empty array when no picking locations exist', async () => {
      mockLocationRepository.findPickingLocations.mockResolvedValueOnce([])

      const result = await useCase.execute()

      expect(result).toEqual([])
    })

    it('should handle repository errors', async () => {
      const error = new Error('Database error')
      mockLocationRepository.findPickingLocations.mockRejectedValueOnce(error)

      await expect(useCase.execute()).rejects.toThrow(error)
    })
  })
})
