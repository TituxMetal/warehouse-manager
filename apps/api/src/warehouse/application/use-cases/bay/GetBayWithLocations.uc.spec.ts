import type { Mock } from 'bun:test'
import { beforeEach, describe, expect, it, mock } from 'bun:test'

import { BayEntity, LocationEntity } from '~/warehouse/domain/entities'
import type { IBayRepository } from '~/warehouse/domain/repositories'
import { LevelValueObject, PositionValueObject } from '~/warehouse/domain/value-objects'

import { GetBayWithLocationsUseCase } from './GetBayWithLocations.uc'

const createTestBayEntity = (overrides?: Partial<BayEntity>) =>
  Object.assign(
    new BayEntity(
      overrides?.id ?? 1,
      overrides?.number ?? 1,
      overrides?.width ?? 4,
      overrides?.startPosition ?? 0,
      overrides?.aisleId ?? 1,
      overrides?.createdAt ?? new Date('2025-01-01'),
      overrides?.updatedAt ?? new Date('2025-01-02')
    ),
    overrides
  )

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

describe('GetBayWithLocationsUseCase', () => {
  let useCase: GetBayWithLocationsUseCase
  let mockBayRepository: {
    findById: Mock<IBayRepository['findById']>
    findByAisleId: Mock<IBayRepository['findByAisleId']>
    findWithLocations: Mock<IBayRepository['findWithLocations']>
    create: Mock<IBayRepository['create']>
    createMany: Mock<IBayRepository['createMany']>
    update: Mock<IBayRepository['update']>
    delete: Mock<IBayRepository['delete']>
  }

  beforeEach(() => {
    mockBayRepository = {
      findById: mock(() => {}) as unknown as Mock<IBayRepository['findById']>,
      findByAisleId: mock(() => {}) as unknown as Mock<IBayRepository['findByAisleId']>,
      findWithLocations: mock(() => {}) as unknown as Mock<IBayRepository['findWithLocations']>,
      create: mock(() => {}) as unknown as Mock<IBayRepository['create']>,
      createMany: mock(() => {}) as unknown as Mock<IBayRepository['createMany']>,
      update: mock(() => {}) as unknown as Mock<IBayRepository['update']>,
      delete: mock(() => {}) as unknown as Mock<IBayRepository['delete']>
    }
    useCase = new GetBayWithLocationsUseCase(mockBayRepository as unknown as IBayRepository)
  })

  describe('execute', () => {
    it('should return bay with its locations', async () => {
      const bay = createTestBayEntity({ id: 1 })
      const location1 = createTestLocationEntity({ id: 1, bayId: 1 })
      const location2 = createTestLocationEntity({ id: 2, bayId: 1 })
      const bayWithLocations = Object.assign(bay, { locations: [location1, location2] })

      mockBayRepository.findWithLocations.mockResolvedValueOnce(bayWithLocations)

      const result = await useCase.execute(1)

      expect(result).toHaveProperty('id', bay.id)
      expect(result).toHaveProperty('number', bay.number)
      expect(result).toHaveProperty('width', bay.width)
      expect(result).toHaveProperty('startPosition', bay.startPosition)
      expect(result).toHaveProperty('aisleId', bay.aisleId)
      expect(result).toHaveProperty('locations')
      expect(result.locations).toHaveLength(2)
      expect(result.locations[0]).toHaveProperty('id', location1.id)
      expect(result.locations[1]).toHaveProperty('id', location2.id)
    })

    it('should return bay with empty locations array', async () => {
      const bay = createTestBayEntity({ id: 2 })
      const bayWithLocations = Object.assign(bay, { locations: [] })

      mockBayRepository.findWithLocations.mockResolvedValueOnce(bayWithLocations)

      const result = await useCase.execute(2)

      expect(result).toHaveProperty('id', bay.id)
      expect(result).toHaveProperty('number', bay.number)
      expect(result).toHaveProperty('width', bay.width)
      expect(result).toHaveProperty('startPosition', bay.startPosition)
      expect(result).toHaveProperty('locations')
      expect(result.locations).toHaveLength(0)
    })

    it('should throw BayNotFoundException when not found', async () => {
      const baysId = 999

      mockBayRepository.findWithLocations.mockResolvedValueOnce(null)

      await expect(useCase.execute(baysId)).rejects.toThrow(`Bay not found: ${baysId}`)
    })

    it('should handle repository errors', async () => {
      const bayId = 1
      const error = new Error('Database error')

      mockBayRepository.findWithLocations.mockRejectedValueOnce(error)

      await expect(useCase.execute(bayId)).rejects.toThrow(error)
    })
  })
})
