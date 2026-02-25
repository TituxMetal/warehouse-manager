import type { Mock } from 'bun:test'
import { beforeEach, describe, expect, it, mock } from 'bun:test'

import { LocationEntity } from '~/warehouse/domain/entities'
import type { ILocationRepository } from '~/warehouse/domain/repositories'
import { LevelValueObject, PositionValueObject } from '~/warehouse/domain/value-objects'

import { UnblockLocationUseCase } from './UnblockLocation.uc'

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

describe('UnblockLocationUseCase', () => {
  let useCase: UnblockLocationUseCase
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
    useCase = new UnblockLocationUseCase(mockLocationRepository as unknown as ILocationRepository)
  })

  describe('execute', () => {
    it('should unblock a blocked location', async () => {
      const location = createTestLocationEntity({ id: 1, status: 'blocked', blockReasonId: 5 })

      mockLocationRepository.findById.mockResolvedValueOnce(location)
      mockLocationRepository.update.mockResolvedValueOnce(location)

      const result = await useCase.execute(1)

      expect(mockLocationRepository.findById).toHaveBeenCalledWith(1)
      expect(mockLocationRepository.update).toHaveBeenCalled()
      expect(result.isBlocked).toBe(false)
      expect(result.status).toBe('available')
    })

    it('should throw LocationNotFoundException when location not found', async () => {
      const locationId = 999

      mockLocationRepository.findById.mockResolvedValueOnce(null)

      await expect(useCase.execute(locationId)).rejects.toThrow(`Location not found: ${locationId}`)

      expect(mockLocationRepository.findById).toHaveBeenCalledWith(locationId)
    })

    it('should throw LocationNotBlockedException when location is not blocked', async () => {
      const location = createTestLocationEntity({ id: 1, status: 'available' })

      mockLocationRepository.findById.mockResolvedValueOnce(location)

      await expect(useCase.execute(1)).rejects.toThrow(`Location ${location.id} is not blocked`)

      expect(mockLocationRepository.findById).toHaveBeenCalledWith(1)
    })

    it('should handle repository errors', async () => {
      const locationId = 1
      const error = new Error('Database error')

      mockLocationRepository.findById.mockRejectedValueOnce(error)

      await expect(useCase.execute(locationId)).rejects.toThrow(error)

      expect(mockLocationRepository.findById).toHaveBeenCalledWith(locationId)
    })
  })
})
